import {
  Check,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Entity({ name: 'follows' })
@Check('follows_cannot_follow_self', '"follower_id" <> "following_id"')
@Index('follows_following_id_idx', { synchronize: false })
export class FollowEntity {
  @PrimaryColumn({ name: 'follower_id', type: 'uuid' })
  followerId!: string;

  @PrimaryColumn({ name: 'following_id', type: 'uuid' })
  followingId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => UserEntity, (user) => user.following, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'follower_id' })
  follower!: Relation<UserEntity>;

  @ManyToOne(() => UserEntity, (user) => user.followers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'following_id' })
  following!: Relation<UserEntity>;
}
