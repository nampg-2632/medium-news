import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { CommentEntity } from '../comments/comment.entity';
import { FavoriteEntity } from '../favorites/favorite.entity';
import { UserEntity } from '../users/user.entity';

@Entity({ name: 'articles' })
@Index('articles_created_at_idx', { synchronize: false })
@Index('articles_author_created_at_idx', { synchronize: false })
export class ArticleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => UserEntity, (user) => user.articles, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'author_id' })
  author!: Relation<UserEntity>;

  @OneToMany(() => CommentEntity, (comment) => comment.article)
  comments!: Relation<CommentEntity[]>;

  @OneToMany(() => FavoriteEntity, (favorite) => favorite.article)
  favorites!: Relation<FavoriteEntity[]>;
}
