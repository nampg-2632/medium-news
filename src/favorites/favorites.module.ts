import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteEntity } from './favorite.entity';
import { FavoritesRepository } from './favorites.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteEntity])],
  providers: [FavoritesRepository],
  exports: [FavoritesRepository],
})
export class FavoritesModule {}
