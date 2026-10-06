import 'dotenv/config';
import { DataSource } from 'typeorm';
import { DatabaseConfigurationError } from './database.errors';
import { createTypeOrmOptions, parseDatabasePoolMax } from './typeorm.config';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new DatabaseConfigurationError(
    'DATABASE_URL is required to run database migrations',
  );
}

export default new DataSource(
  createTypeOrmOptions({
    applicationName: 'medium-news-migrator',
    databaseUrl,
    poolMax: parseDatabasePoolMax(process.env.DATABASE_POOL_MAX),
  }),
);
