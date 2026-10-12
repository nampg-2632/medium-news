import type { ProfileResponse } from '../profiles/profile.types';

export type ArticleFilters = {
  tag?: string;
  author?: string;
  favorited?: string;
  // Restricts results to authors followed by this user (feed).
  followerId?: string;
};

export type Pagination = {
  limit: number;
  offset: number;
};

export type CreateArticleInput = {
  slug: string;
  title: string;
  description: string;
  body: string;
  authorId: string;
};

export type UpdateArticleInput = {
  slug?: string;
  title?: string;
  description?: string;
  body?: string;
};

// Per-article data that depends on other tables or on the current viewer.
export type ArticleViewerState = {
  tagList: string[];
  favorited: boolean;
  favoritesCount: number;
  following: boolean;
};

export type ArticleTagNameRow = {
  articleId: string;
  name: string;
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

export type MultipleArticlesResponse = {
  articles: ArticleListItem[];
  articlesCount: number;
};
