import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { ArticleEntity } from '../articles/article.entity';
import { UserEntity } from '../users/user.entity';

@Entity({ name: 'comments' })
@Index('comments_article_created_at_idx', { synchronize: false })
@Index('comments_author_id_idx', { synchronize: false })
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ name: 'article_id', type: 'uuid' })
  articleId!: string;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => ArticleEntity, (article) => article.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'article_id' })
  article!: Relation<ArticleEntity>;

  @ManyToOne(() => UserEntity, (user) => user.comments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'author_id' })
  author!: Relation<UserEntity>;
}
