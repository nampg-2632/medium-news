import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { ArticleEntity } from '../articles/article.entity';
import { UserEntity } from '../users/user.entity';

@Entity({ name: 'favorites' })
@Index('favorites_article_id_idx', { synchronize: false })
export class FavoriteEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @PrimaryColumn({ name: 'article_id', type: 'uuid' })
  articleId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => UserEntity, (user) => user.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<UserEntity>;

  @ManyToOne(() => ArticleEntity, (article) => article.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'article_id' })
  article!: Relation<ArticleEntity>;
}
