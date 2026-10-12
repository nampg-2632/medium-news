import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FollowEntity } from './follow.entity';

@Injectable()
export class FollowsRepository {
  constructor(
    @InjectRepository(FollowEntity)
    private readonly repository: Repository<FollowEntity>,
  ) {}

  // ON CONFLICT DO NOTHING keeps following idempotent under repeated requests.
  async follow(followerId: string, followingId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .insert()
      .into(FollowEntity)
      .values({ followerId, followingId })
      .orIgnore()
      .execute();
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await this.repository.delete({ followerId, followingId });
  }

  isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return this.repository.existsBy({ followerId, followingId });
  }

  async findFollowingIds(
    followerId: string,
    followingIds: string[],
  ): Promise<Set<string>> {
    if (followingIds.length === 0) {
      return new Set();
    }

    const follows = await this.repository.find({
      select: { followingId: true },
      where: { followerId, followingId: In(followingIds) },
    });

    return new Set(follows.map((follow) => follow.followingId));
  }
}
