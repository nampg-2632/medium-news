import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { Pool, QueryResult, QueryResultRow, type PoolClient } from 'pg';
import { DATABASE_POOL } from './database.constants';

@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly logger: Logger,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.pool.query('SELECT 1');
    this.logger.log('PostgreSQL connection established', DatabaseService.name);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }

  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values: readonly unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, [...values]);
  }

  connect(): Promise<PoolClient> {
    return this.pool.connect();
  }
}
