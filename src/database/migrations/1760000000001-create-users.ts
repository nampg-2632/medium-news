import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1760000000001 implements MigrationInterface {
  name = 'CreateUsers1760000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(320) NOT NULL,
        username VARCHAR(50) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        bio TEXT,
        image TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx
      ON users (LOWER(email))
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique_idx
      ON users (LOWER(username))
    `);
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS users_set_updated_at ON users
    `);
    await queryRunner.query(`
      CREATE TRIGGER users_set_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at()
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TRIGGER IF EXISTS users_set_updated_at ON users',
    );
    await queryRunner.query('DROP TABLE IF EXISTS users');
    await queryRunner.query('DROP FUNCTION IF EXISTS set_updated_at()');
  }
}
