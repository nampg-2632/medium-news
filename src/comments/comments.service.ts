import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticlesRepository } from '../articles/articles.repository';
import type { AuthenticatedUser } from '../auth/auth.types';
import { createCustomError } from '../common/errors/custom-error';
import { CommentPresenter } from './comment.presenter';
import type { CommentResponse } from './comment.types';
import { CommentsRepository } from './comments.repository';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly articlesRepository: ArticlesRepository,
    private readonly commentPresenter: CommentPresenter,
  ) {}

  async addComment(
    slug: string,
    dto: CreateCommentDto,
    viewer: AuthenticatedUser,
  ): Promise<CommentResponse> {
    const articleId = await this.findArticleId(slug);

    const comment = await this.commentsRepository.create({
      body: dto.comment.body,
      articleId,
      authorId: viewer.user.id,
    });
    // The viewer is already loaded with its avatar, so the author does not
    // need to be queried again.
    comment.author = viewer.user;

    // The viewer is the author and cannot follow themselves.
    return { comment: this.commentPresenter.toComment(comment, false) };
  }

  private async findArticleId(slug: string): Promise<string> {
    const articleId = await this.articlesRepository.findIdBySlug(slug);

    if (!articleId) {
      throw new NotFoundException(createCustomError('article not found'));
    }

    return articleId;
  }
}
