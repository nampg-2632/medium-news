import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createTypeOrmOptions, parseDatabasePoolMax } from './typeorm.config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createTypeOrmOptions({
          applicationName: 'medium-news-api',
          databaseUrl: configService.getOrThrow<string>('DATABASE_URL'),
          poolMax: parseDatabasePoolMax(
            configService.get<string>('DATABASE_POOL_MAX'),
          ),
        }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
