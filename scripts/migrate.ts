import 'dotenv/config';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Client } from 'pg';

type AppliedMigration = {
  name: string;
  checksum: string;
};

const migrationsDirectory = resolve(process.cwd(), 'database/migrations');
const migrationLockName = 'medium-news-database-migrations';

function checksum(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

async function migrate(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required to run migrations');
  }

  const client = new Client({
    connectionString,
    application_name: 'medium-news-migrator',
  });

  await client.connect();

  try {
    await client.query('SELECT pg_advisory_lock(hashtext($1))', [
      migrationLockName,
    ]);

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        checksum CHAR(64) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const migrationFiles = (await readdir(migrationsDirectory))
      .filter((name) => name.endsWith('.sql'))
      .sort();
    const result = await client.query<AppliedMigration>(
      'SELECT name, checksum FROM schema_migrations',
    );
    const appliedMigrations = new Map(
      result.rows.map((migration) => [migration.name, migration.checksum]),
    );

    for (const name of migrationFiles) {
      const sql = await readFile(resolve(migrationsDirectory, name), 'utf8');
      const migrationChecksum = checksum(sql);
      const appliedChecksum = appliedMigrations.get(name);

      if (appliedChecksum) {
        if (appliedChecksum !== migrationChecksum) {
          throw new Error(`Applied migration was modified: ${name}`);
        }

        console.log(`Already applied: ${name}`);
        continue;
      }

      await client.query('BEGIN');

      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)',
          [name, migrationChecksum],
        );
        await client.query('COMMIT');
        console.log(`Applied: ${name}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock(hashtext($1))', [
      migrationLockName,
    ]);
    await client.end();
  }
}

void migrate().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Migration failed: ${message}`);
  process.exitCode = 1;
});
