import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from './comment.entity';
import type { CreateCommentInput } from './comment.types';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly repository: Repository<CommentEntity>,
  ) {}

  // Returns the saved comment with its generated id and createdAt.
  create(input: CreateCommentInput): Promise<CommentEntity> {
    return this.repository.save(this.repository.create(input));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  findByIdInArticle(
    id: string,
    articleId: string,
  ): Promise<CommentEntity | null> {
    return this.repository.findOne({
      select: { id: true, authorId: true },
      where: { id, articleId },
    });
  }

  // Oldest first, matching the comments_article_created_at_idx index.
  findByArticleId(articleId: string): Promise<CommentEntity[]> {
    return this.repository
      .createQueryBuilder('comment')
      .innerJoin('comment.author', 'author')
      .addSelect(['author.id', 'author.username', 'author.bio'])
      .leftJoin('author.avatar', 'avatar')
      .addSelect(['avatar.id', 'avatar.url'])
      .where('comment.articleId = :articleId', { articleId })
      .orderBy('comment.createdAt', 'ASC')
      .addOrderBy('comment.id', 'ASC')
      .getMany();
  }
}
