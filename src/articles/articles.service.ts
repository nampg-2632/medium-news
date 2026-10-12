import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { createCustomError } from '../common/errors/custom-error';
import { FavoritesRepository } from '../favorites/favorites.repository';
import { FollowsRepository } from '../follows/follows.repository';
import { ArticleEntity } from './article.entity';
import { ArticlePresenter, ArticleViewerState } from './article.presenter';
import { slugify, withRandomSuffix } from './article-slug';
import type {
  ArticleFilters,
  ArticleResponse,
  MultipleArticlesResponse,
  Pagination,
  UpdateArticleInput,
} from './article.types';
import { ArticleSlugTakenError } from './articles.errors';
import { ArticlesRepository } from './articles.repository';
import { CreateArticleDto } from './dto/create-article.dto';
import {
  FeedArticlesQueryDto,
  ListArticlesQueryDto,
} from './dto/list-articles-query.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

// Retries after a concurrent request claims the same slug first.
const MAX_SLUG_ATTEMPTS = 3;

@Injectable()
export class ArticlesService {
  constructor(
    private readonly articlesRepository: ArticlesRepository,
    private readonly favoritesRepository: FavoritesRepository,
    private readonly followsRepository: FollowsRepository,
    private readonly articlePresenter: ArticlePresenter,
  ) {}

  listArticles(
    query: ListArticlesQueryDto,
    viewer: AuthenticatedUser | undefined,
  ): Promise<MultipleArticlesResponse> {
    const { tag, author, favorited, limit, offset } = query;

    return this.findArticles(
      { tag, author, favorited },
      { limit, offset },
      viewer,
    );
  }

  feedArticles(
    query: FeedArticlesQueryDto,
    viewer: AuthenticatedUser,
  ): Promise<MultipleArticlesResponse> {
    const { limit, offset } = query;

    return this.findArticles(
      { followerId: viewer.user.id },
      { limit, offset },
      viewer,
    );
  }

  async getArticle(
    slug: string,
    viewer: AuthenticatedUser | undefined,
  ): Promise<ArticleResponse> {
    const article = await this.findArticle(slug);

    return this.toArticleResponse(article, viewer);
  }

  async createArticle(
    dto: CreateArticleDto,
    viewer: AuthenticatedUser,
  ): Promise<ArticleResponse> {
    const { title, description, body, tagList } = dto.article;

    const slug = await this.writeWithUniqueSlug(title, async (candidate) => {
      await this.articlesRepository.create(
        { slug: candidate, title, description, body, authorId: viewer.user.id },
        this.normalizeTagList(tagList),
      );
    });

    return this.getArticle(slug, viewer);
  }

  async updateArticle(
    slug: string,
    dto: UpdateArticleDto,
    viewer: AuthenticatedUser,
  ): Promise<ArticleResponse> {
    const article = await this.findArticle(slug);
    this.assertAuthor(article, viewer, 'update');

    const { title, description, body, tagList } = dto.article;
    const input: UpdateArticleInput = {};

    if (description !== undefined) {
      input.description = description;
    }
    if (body !== undefined) {
      input.body = body;
    }

    const tagNames =
      tagList !== undefined ? this.normalizeTagList(tagList) : undefined;
    let newSlug = article.slug;

    if (title !== undefined && title !== article.title) {
      newSlug = await this.writeWithUniqueSlug(
        title,
        (candidate) =>
          this.articlesRepository.update(
            article.id,
            { ...input, title, slug: candidate },
            tagNames,
          ),
        article.slug,
      );
    } else {
      await this.articlesRepository.update(article.id, input, tagNames);
    }

    return this.getArticle(newSlug, viewer);
  }

  async deleteArticle(slug: string, viewer: AuthenticatedUser): Promise<void> {
    const article = await this.findArticle(slug);
    this.assertAuthor(article, viewer, 'delete');

    await this.articlesRepository.delete(article.id);
  }

  private async findArticles(
    filters: ArticleFilters,
    pagination: Pagination,
    viewer: AuthenticatedUser | undefined,
  ): Promise<MultipleArticlesResponse> {
    const [articles, articlesCount] = await this.articlesRepository.findPage(
      filters,
      pagination,
    );
    const states = await this.loadViewerStates(articles, viewer);

    return {
      articles: articles.map((article, index) =>
        this.articlePresenter.toArticleListItem(article, states[index]),
      ),
      articlesCount,
    };
  }

  private async toArticleResponse(
    article: ArticleEntity,
    viewer: AuthenticatedUser | undefined,
  ): Promise<ArticleResponse> {
    const [state] = await this.loadViewerStates([article], viewer);

    return { article: this.articlePresenter.toArticle(article, state) };
  }

  // Loads tags, favorite counts and the viewer's favorite/follow state for a
  // page of articles with one query each instead of one per article.
  private async loadViewerStates(
    articles: ArticleEntity[],
    viewer: AuthenticatedUser | undefined,
  ): Promise<ArticleViewerState[]> {
    const articleIds = articles.map((article) => article.id);
    const authorIds = [...new Set(articles.map((article) => article.authorId))];
    const viewerId = viewer?.user.id;

    const [tagNames, favoritesCounts, favoritedIds, followingIds] =
      await Promise.all([
        this.articlesRepository.findTagNamesByArticleIds(articleIds),
        this.favoritesRepository.countByArticleIds(articleIds),
        viewerId
          ? this.favoritesRepository.findFavoritedArticleIds(
              viewerId,
              articleIds,
            )
          : new Set<string>(),
        viewerId
          ? this.followsRepository.findFollowingIds(viewerId, authorIds)
          : new Set<string>(),
      ]);

    return articles.map((article) => ({
      tagList: tagNames.get(article.id) ?? [],
      favorited: favoritedIds.has(article.id),
      favoritesCount: favoritesCounts.get(article.id) ?? 0,
      following: followingIds.has(article.authorId),
    }));
  }

  private async findArticle(slug: string): Promise<ArticleEntity> {
    const article = await this.articlesRepository.findBySlug(slug);

    if (!article) {
      throw new NotFoundException(createCustomError('article not found'));
    }

    return article;
  }

  private assertAuthor(
    article: ArticleEntity,
    viewer: AuthenticatedUser,
    action: 'update' | 'delete',
  ): void {
    if (article.authorId !== viewer.user.id) {
      throw new ForbiddenException(
        createCustomError(`you are not allowed to ${action} this article`),
      );
    }
  }

  // Uses the plain title slug when it is free (or already owned by the
  // article), otherwise a random suffix, and retries when a concurrent write
  // claims the slug first. Returns the slug that was written.
  private async writeWithUniqueSlug(
    title: string,
    write: (slug: string) => Promise<void>,
    currentSlug?: string,
  ): Promise<string> {
    const baseSlug = slugify(title);
    let slug =
      baseSlug === currentSlug ||
      !(await this.articlesRepository.slugExists(baseSlug))
        ? baseSlug
        : withRandomSuffix(baseSlug);

    for (let attempt = 1; ; attempt++) {
      try {
        await write(slug);
        return slug;
      } catch (error) {
        if (
          !(error instanceof ArticleSlugTakenError) ||
          attempt >= MAX_SLUG_ATTEMPTS
        ) {
          throw error;
        }

        slug = withRandomSuffix(baseSlug);
      }
    }
  }

  private normalizeTagList(tagList: string[] | undefined): string[] {
    return [...new Set(tagList ?? [])];
  }
}
