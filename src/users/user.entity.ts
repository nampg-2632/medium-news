import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { ArticleEntity } from '../articles/article.entity';
import { AttachmentEntity } from '../attachments/attachment.entity';
import { CommentEntity } from '../comments/comment.entity';
import { FavoriteEntity } from '../favorites/favorite.entity';
import { FollowEntity } from '../follows/follow.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 320 })
  email!: string;

  @Column({ type: 'varchar', length: 50 })
  username!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ name: 'avatar_id', type: 'uuid', nullable: true })
  avatarId!: string | null;

  @ManyToOne(() => AttachmentEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'avatar_id' })
  avatar!: Relation<AttachmentEntity> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => ArticleEntity, (article) => article.author)
  articles!: Relation<ArticleEntity[]>;

  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments!: Relation<CommentEntity[]>;

  @OneToMany(() => FavoriteEntity, (favorite) => favorite.user)
  favorites!: Relation<FavoriteEntity[]>;

  @OneToMany(() => FollowEntity, (follow) => follow.follower)
  following!: Relation<FollowEntity[]>;

  @OneToMany(() => FollowEntity, (follow) => follow.following)
  followers!: Relation<FollowEntity[]>;
}
