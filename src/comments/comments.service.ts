import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ArticlesRepository } from '../articles/articles.repository';
import type { AuthenticatedUser } from '../auth/auth.types';
import { createCustomError } from '../common/errors/custom-error';
import { FollowsRepository } from '../follows/follows.repository';
import { CommentPresenter } from './comment.presenter';
import type {
  CommentResponse,
  MultipleCommentsResponse,
} from './comment.types';
import { CommentsRepository } from './comments.repository';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly articlesRepository: ArticlesRepository,
    private readonly followsRepository: FollowsRepository,
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

  async getComments(
    slug: string,
    viewer: AuthenticatedUser | undefined,
  ): Promise<MultipleCommentsResponse> {
    const articleId = await this.findArticleId(slug);
    const comments = await this.commentsRepository.findByArticleId(articleId);

    const authorIds = [...new Set(comments.map((comment) => comment.authorId))];
    const followingIds = viewer
      ? await this.followsRepository.findFollowingIds(viewer.user.id, authorIds)
      : new Set<string>();

    return {
      comments: comments.map((comment) =>
        this.commentPresenter.toComment(
          comment,
          followingIds.has(comment.authorId),
        ),
      ),
    };
  }

  async deleteComment(
    slug: string,
    id: string,
    viewer: AuthenticatedUser,
  ): Promise<void> {
    const articleId = await this.findArticleId(slug);
    const comment = await this.commentsRepository.findByIdInArticle(
      id,
      articleId,
    );

    if (!comment) {
      throw new NotFoundException(createCustomError('comment not found'));
    }

    if (comment.authorId !== viewer.user.id) {
      throw new ForbiddenException(
        createCustomError('you are not allowed to delete this comment'),
      );
    }

    await this.commentsRepository.delete(comment.id);
  }

  private async findArticleId(slug: string): Promise<string> {
    const articleId = await this.articlesRepository.findIdBySlug(slug);

    if (!articleId) {
      throw new NotFoundException(createCustomError('article not found'));
    }

    return articleId;
  }
}
