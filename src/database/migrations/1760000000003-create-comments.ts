import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateComments1760000000003 implements MigrationInterface {
  name = 'CreateComments1760000000003';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        body TEXT NOT NULL,
        article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS comments_article_created_at_idx
      ON comments (article_id, created_at, id)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS comments_author_id_idx
      ON comments (author_id)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS comments');
  }
}
