import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, QueryFailedError, Repository } from 'typeorm';
import { ArticleTagEntity } from '../tags/article-tag.entity';
import { TagEntity } from '../tags/tag.entity';
import { ArticleEntity } from './article.entity';
import type {
  ArticleFilters,
  CreateArticleInput,
  Pagination,
} from './article.types';
import { ArticleSlugTakenError } from './articles.errors';

const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';

type PostgresDriverError = Error & {
  code?: string;
  constraint?: string;
};

// Maps a unique violation on the slug to a domain error so the caller can
// retry with another slug; any other error is returned unchanged.
function toArticleSlugTakenError(error: unknown, slug: string): unknown {
  if (!(error instanceof QueryFailedError)) {
    return error;
  }

  const driverError = error.driverError as PostgresDriverError;

  if (
    driverError.code !== POSTGRES_UNIQUE_VIOLATION_CODE ||
    !driverError.constraint?.includes('slug')
  ) {
    return error;
  }

  return new ArticleSlugTakenError(slug);
}

@Injectable()
export class ArticlesRepository {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly repository: Repository<ArticleEntity>,
  ) {}

  async create(input: CreateArticleInput, tagNames: string[]): Promise<void> {
    try {
      await this.repository.manager.transaction(async (manager) => {
        const article = await manager.save(
          manager.create(ArticleEntity, input),
        );
        await this.attachTags(manager, article.id, tagNames);
      });
    } catch (error) {
      throw toArticleSlugTakenError(error, input.slug);
    }
  }

  slugExists(slug: string): Promise<boolean> {
    return this.repository.existsBy({ slug });
  }

  findBySlug(slug: string): Promise<ArticleEntity | null> {
    return this.repository
      .createQueryBuilder('article')
      .innerJoin('article.author', 'author')
      .addSelect(['author.id', 'author.username', 'author.bio'])
      .leftJoin('author.avatar', 'avatar')
      .addSelect(['avatar.id', 'avatar.url'])
      .where('article.slug = :slug', { slug })
      .getOne();
  }

  // The body is not selected because list responses do not include it.
  async findPage(
    filters: ArticleFilters,
    pagination: Pagination,
  ): Promise<[ArticleEntity[], number]> {
    const query = this.repository
      .createQueryBuilder('article')
      .select([
        'article.id',
        'article.slug',
        'article.title',
        'article.description',
        'article.authorId',
        'article.createdAt',
        'article.updatedAt',
      ])
      .innerJoin('article.author', 'author')
      .addSelect(['author.id', 'author.username', 'author.bio'])
      .leftJoin('author.avatar', 'avatar')
      .addSelect(['avatar.id', 'avatar.url']);

    if (filters.tag !== undefined) {
      query.andWhere(
        `EXISTS (
          SELECT 1 FROM article_tags article_tag
          INNER JOIN tags tag ON tag.id = article_tag.tag_id
          WHERE article_tag.article_id = article.id AND tag.name = :tag
        )`,
        { tag: filters.tag },
      );
    }

    if (filters.author !== undefined) {
      query.andWhere('LOWER(author.username) = LOWER(:author)', {
        author: filters.author,
      });
    }

    if (filters.favorited !== undefined) {
      query.andWhere(
        `EXISTS (
          SELECT 1 FROM favorites favorite
          INNER JOIN users favorited_by ON favorited_by.id = favorite.user_id
          WHERE favorite.article_id = article.id
            AND LOWER(favorited_by.username) = LOWER(:favorited)
        )`,
        { favorited: filters.favorited },
      );
    }

    // Only many-to-one relations are joined, so offset/limit apply to
    // articles directly without duplicating rows.
    return query
      .orderBy('article.createdAt', 'DESC')
      .addOrderBy('article.id', 'DESC')
      .offset(pagination.offset)
      .limit(pagination.limit)
      .getManyAndCount();
  }

  async findTagNamesByArticleIds(
    articleIds: string[],
  ): Promise<Map<string, string[]>> {
    const tagNamesByArticleId = new Map<string, string[]>();

    if (articleIds.length === 0) {
      return tagNamesByArticleId;
    }

    const rows = await this.repository.manager
      .createQueryBuilder(ArticleTagEntity, 'articleTag')
      .innerJoin('articleTag.tag', 'tag')
      .select('articleTag.articleId', 'articleId')
      .addSelect('tag.name', 'name')
      .where('articleTag.articleId IN (:...articleIds)', { articleIds })
      .orderBy('tag.name', 'ASC')
      .getRawMany<{ articleId: string; name: string }>();

    for (const row of rows) {
      const tagNames = tagNamesByArticleId.get(row.articleId) ?? [];
      tagNames.push(row.name);
      tagNamesByArticleId.set(row.articleId, tagNames);
    }

    return tagNamesByArticleId;
  }

  // Tags are shared between articles: missing ones are created (ignoring ones
  // inserted concurrently) and then linked to the article.
  private async attachTags(
    manager: EntityManager,
    articleId: string,
    tagNames: string[],
  ): Promise<void> {
    if (tagNames.length === 0) {
      return;
    }

    await manager
      .createQueryBuilder()
      .insert()
      .into(TagEntity)
      .values(tagNames.map((name) => ({ name })))
      .orIgnore()
      .execute();

    const tags = await manager.find(TagEntity, {
      select: { id: true },
      where: { name: In(tagNames) },
    });

    await manager.insert(
      ArticleTagEntity,
      tags.map((tag) => ({ articleId, tagId: tag.id })),
    );
  }
}
