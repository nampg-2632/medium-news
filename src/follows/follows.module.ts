import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowEntity } from './follow.entity';
import { FollowsRepository } from './follows.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FollowEntity])],
  providers: [FollowsRepository],
  exports: [FollowsRepository],
})
export class FollowsModule {}
