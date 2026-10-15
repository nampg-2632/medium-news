import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesModule } from '../articles/articles.module';
import { UsersModule } from '../users/users.module';
import { CommentEntity } from './comment.entity';
import { CommentPresenter } from './comment.presenter';
import { CommentsController } from './comments.controller';
import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity]),
    ArticlesModule,
    UsersModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsRepository, CommentsService, CommentPresenter],
})
export class CommentsModule {}
