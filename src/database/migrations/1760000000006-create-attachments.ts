import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttachments1760000000006 implements MigrationInterface {
  name = 'CreateAttachments1760000000006';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS attachments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        attachable_type VARCHAR(50) NOT NULL,
        attachable_id UUID NOT NULL,
        purpose VARCHAR(50) NOT NULL,
        visibility VARCHAR(10) NOT NULL DEFAULT 'public',
        file_name VARCHAR(255) NOT NULL,
        storage_path TEXT NOT NULL,
        url TEXT NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        file_size BIGINT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT attachments_visibility_check
          CHECK (visibility IN ('public', 'private')),
        CONSTRAINT attachments_file_size_check CHECK (file_size >= 0)
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS attachments_attachable_idx
      ON attachments (attachable_type, attachable_id, purpose)
    `);
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS avatar_id UUID
        REFERENCES attachments(id) ON DELETE SET NULL
    `);
    await queryRunner.query('ALTER TABLE users DROP COLUMN IF EXISTS image');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT',
    );
    await queryRunner.query(
      'ALTER TABLE users DROP COLUMN IF EXISTS avatar_id',
    );
    await queryRunner.query('DROP TABLE IF EXISTS attachments');
  }
}
