import { Injectable } from '@nestjs/common';
import { UserPresenter } from '../users/user.presenter';
import { ArticleEntity } from './article.entity';
import type { ArticleData, ArticleListItem } from './article.types';

export type ArticleViewerState = {
  tagList: string[];
  favorited: boolean;
  favoritesCount: number;
  following: boolean;
};

// Shapes articles for API responses. The article must be loaded with its
// author and the author's avatar relation.
@Injectable()
export class ArticlePresenter {
  constructor(private readonly userPresenter: UserPresenter) {}

  toArticle(article: ArticleEntity, state: ArticleViewerState): ArticleData {
    const { slug, title, description, ...rest } = this.toArticleListItem(
      article,
      state,
    );

    // Keeps the field order of the API contract.
    return { slug, title, description, body: article.body, ...rest };
  }

  toArticleListItem(
    article: ArticleEntity,
    state: ArticleViewerState,
  ): ArticleListItem {
    return {
      slug: article.slug,
      title: article.title,
      description: article.description,
      tagList: state.tagList,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      favorited: state.favorited,
      favoritesCount: state.favoritesCount,
      author: {
        username: article.author.username,
        bio: article.author.bio,
        image: this.userPresenter.getImageUrl(article.author),
        following: state.following,
      },
    };
  }
}
