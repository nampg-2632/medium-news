import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FavoriteEntity } from './favorite.entity';

@Injectable()
export class FavoritesRepository {
  constructor(
    @InjectRepository(FavoriteEntity)
    private readonly repository: Repository<FavoriteEntity>,
  ) {}

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
      .getRawMany<{ articleId: string; count: number }>();

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
