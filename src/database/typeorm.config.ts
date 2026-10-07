import { join } from 'node:path';
import { DataSourceOptions } from 'typeorm';
import { ArticleEntity } from '../articles/article.entity';
import { CommentEntity } from '../comments/comment.entity';
import { FavoriteEntity } from '../favorites/favorite.entity';
import { FollowEntity } from '../follows/follow.entity';
import { UserEntity } from '../users/user.entity';
import { DatabaseConfigurationError } from './database.errors';

type TypeOrmOptionsInput = {
  applicationName: string;
  databaseUrl: string;
  poolMax: number;
};

export function parseDatabasePoolMax(value?: string): number {
  const poolMax = Number(value ?? 10);

  if (!Number.isInteger(poolMax) || poolMax < 1) {
    throw new DatabaseConfigurationError(
      'DATABASE_POOL_MAX must be a positive integer',
    );
  }

  return poolMax;
}

export function createTypeOrmOptions({
  applicationName,
  databaseUrl,
  poolMax,
}: TypeOrmOptionsInput): DataSourceOptions {
  return {
    type: 'postgres',
    url: databaseUrl,
    entities: [
      UserEntity,
      ArticleEntity,
      CommentEntity,
      FavoriteEntity,
      FollowEntity,
    ],
    migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
    migrationsTableName: 'typeorm_migrations',
    migrationsRun: false,
    synchronize: false,
    uuidExtension: 'pgcrypto',
    extra: {
      application_name: applicationName,
      max: poolMax,
    },
  };
}
