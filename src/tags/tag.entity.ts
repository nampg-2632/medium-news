import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { ArticleTagEntity } from './article-tag.entity';

@Entity({ name: 'tags' })
export class TagEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => ArticleTagEntity, (articleTag) => articleTag.tag)
  articleTags!: Relation<ArticleTagEntity[]>;
}
