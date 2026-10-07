import { Logger, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Module({
  providers: [Logger, RedisService],
  exports: [RedisService],
})
export class RedisModule {}
