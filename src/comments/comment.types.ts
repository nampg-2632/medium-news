import type { ProfileResponse } from '../profiles/profile.types';

export type CreateCommentInput = {
  body: string;
  articleId: string;
  authorId: string;
};

export type CommentData = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  body: string;
  author: ProfileResponse['profile'];
};

export type CommentResponse = {
  comment: CommentData;
};
