import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentsModule } from '../attachments/attachments.module';
import { UserAvatarService } from './user-avatar.service';
import { UserPresenter } from './user.presenter';
import { UserEntity } from './user.entity';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AttachmentsModule],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService, UserAvatarService, UserPresenter],
  exports: [UsersRepository, UserPresenter],
})
export class UsersModule {}
