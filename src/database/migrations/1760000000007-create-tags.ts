import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTags1760000000007 implements MigrationInterface {
  name = 'CreateTags1760000000007';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS article_tags (
        article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (article_id, tag_id)
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS article_tags_tag_id_idx
      ON article_tags (tag_id)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS article_tags');
    await queryRunner.query('DROP TABLE IF EXISTS tags');
  }
}
