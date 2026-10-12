import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type {
  AttachableType,
  AttachmentPurpose,
  AttachmentVisibility,
} from './attachment.types';

// Polymorphic: attachable_type + attachable_id point to the owning record, so
// the database cannot enforce this reference with a foreign key.
@Entity({ name: 'attachments' })
@Index('attachments_attachable_idx', { synchronize: false })
export class AttachmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'attachable_type', type: 'varchar', length: 50 })
  attachableType!: AttachableType;

  @Column({ name: 'attachable_id', type: 'uuid' })
  attachableId!: string;

  @Column({ type: 'varchar', length: 50 })
  purpose!: AttachmentPurpose;

  @Column({ type: 'varchar', length: 10, default: 'public' })
  visibility!: AttachmentVisibility;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName!: string;

  @Column({ name: 'storage_path', type: 'text' })
  storagePath!: string;

  @Column({ type: 'text' })
  url!: string;

  @Column({ name: 'file_type', type: 'varchar', length: 100 })
  fileType!: string;

  // pg returns BIGINT as a string to avoid precision loss; file sizes fit
  // safely in a JavaScript number.
  @Column({
    name: 'file_size',
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  fileSize!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
