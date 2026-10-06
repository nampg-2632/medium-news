import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFollows1760000000005 implements MigrationInterface {
  name = 'CreateFollows1760000000005';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS follows (
        follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (follower_id, following_id),
        CONSTRAINT follows_cannot_follow_self
          CHECK (follower_id <> following_id)
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS follows_following_id_idx
      ON follows (following_id)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS follows');
  }
}
