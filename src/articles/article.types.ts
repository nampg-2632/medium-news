import type { ProfileResponse } from '../profiles/profile.types';

export type CreateArticleInput = {
  slug: string;
  title: string;
  description: string;
  body: string;
  authorId: string;
};

export type ArticleData = {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: Date;
  updatedAt: Date;
  favorited: boolean;
  favoritesCount: number;
  author: ProfileResponse['profile'];
};

export type ArticleListItem = Omit<ArticleData, 'body'>;

export type ArticleResponse = {
  article: ArticleData;
};
