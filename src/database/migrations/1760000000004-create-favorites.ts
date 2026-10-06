import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFavorites1760000000004 implements MigrationInterface {
  name = 'CreateFavorites1760000000004';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, article_id)
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS favorites_article_id_idx
      ON favorites (article_id)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS favorites');
  }
}
