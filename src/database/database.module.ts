import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { DATABASE_POOL } from './database.constants';
import { DatabaseConfigurationError } from './database.errors';
import { DatabaseService } from './database.service';

@Global()
@Module({
  providers: [
    Logger,
    {
      provide: DATABASE_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Pool => {
        const connectionString =
          configService.getOrThrow<string>('DATABASE_URL');
        const max = Number(
          configService.get<string>('DATABASE_POOL_MAX') ?? 10,
        );

        if (!Number.isInteger(max) || max < 1) {
          throw new DatabaseConfigurationError(
            'DATABASE_POOL_MAX must be a positive integer',
          );
        }

        return new Pool({
          connectionString,
          max,
          application_name: 'medium-news-api',
        });
      },
    },
    DatabaseService,
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}
