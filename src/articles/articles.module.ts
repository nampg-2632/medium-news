import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesModule } from '../favorites/favorites.module';
import { FollowsModule } from '../follows/follows.module';
import { UsersModule } from '../users/users.module';
import { ArticleEntity } from './article.entity';
import { ArticlePresenter } from './article.presenter';
import { ArticlesController } from './articles.controller';
import { ArticlesRepository } from './articles.repository';
import { ArticlesService } from './articles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArticleEntity]),
    UsersModule,
    FollowsModule,
    FavoritesModule,
  ],
  controllers: [ArticlesController],
  providers: [ArticlesRepository, ArticlesService, ArticlePresenter],
  exports: [ArticlesRepository],
})
export class ArticlesModule {}
