import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArticles1760000000002 implements MigrationInterface {
  name = 'CreateArticles1760000000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        body TEXT NOT NULL,
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS articles_created_at_idx
      ON articles (created_at DESC, id DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS articles_author_created_at_idx
      ON articles (author_id, created_at DESC, id DESC)
    `);
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS articles_set_updated_at ON articles
    `);
    await queryRunner.query(`
      CREATE TRIGGER articles_set_updated_at
      BEFORE UPDATE ON articles
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at()
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TRIGGER IF EXISTS articles_set_updated_at ON articles',
    );
    await queryRunner.query('DROP TABLE IF EXISTS articles');
  }
}
