import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FavoriteEntity } from './favorite.entity';
import type { FavoriteCountRow } from './favorite.types';

@Injectable()
export class FavoritesRepository {
  constructor(
    @InjectRepository(FavoriteEntity)
    private readonly repository: Repository<FavoriteEntity>,
  ) {}

  // ON CONFLICT DO NOTHING keeps favoriting idempotent under repeated requests.
  async favorite(userId: string, articleId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .insert()
      .into(FavoriteEntity)
      .values({ userId, articleId })
      .orIgnore()
      .execute();
  }

  async unfavorite(userId: string, articleId: string): Promise<void> {
    await this.repository.delete({ userId, articleId });
  }

  async countByArticleIds(articleIds: string[]): Promise<Map<string, number>> {
    if (articleIds.length === 0) {
      return new Map();
    }

    const rows = await this.repository
      .createQueryBuilder('favorite')
      .select('favorite.articleId', 'articleId')
      .addSelect('COUNT(*)::int', 'count')
      .where('favorite.articleId IN (:...articleIds)', { articleIds })
      .groupBy('favorite.articleId')
      .getRawMany<FavoriteCountRow>();

    return new Map(rows.map((row) => [row.articleId, row.count]));
  }

  async findFavoritedArticleIds(
    userId: string,
    articleIds: string[],
  ): Promise<Set<string>> {
    if (articleIds.length === 0) {
      return new Set();
    }

    const favorites = await this.repository.find({
      select: { articleId: true },
      where: { userId, articleId: In(articleIds) },
    });

    return new Set(favorites.map((favorite) => favorite.articleId));
  }
}
