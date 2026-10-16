import { Injectable } from '@nestjs/common';
import { UserPresenter } from '../users/user.presenter';
import { CommentEntity } from './comment.entity';
import type { CommentData } from './comment.types';

// Shapes comments for API responses. The comment must be loaded with its
// author and the author's avatar relation.
@Injectable()
export class CommentPresenter {
  constructor(private readonly userPresenter: UserPresenter) {}

  toComment(comment: CommentEntity, following: boolean): CommentData {
    return {
      id: comment.id,
      createdAt: comment.createdAt,
      // Comments cannot be edited, so they are never updated after creation.
      updatedAt: comment.createdAt,
      body: comment.body,
      author: {
        username: comment.author.username,
        bio: comment.author.bio,
        image: this.userPresenter.getImageUrl(comment.author),
        following,
      },
    };
  }
}
