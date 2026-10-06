import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;

@Injectable()
export class RedisService implements OnModuleInit, OnApplicationShutdown {
  private readonly client: RedisClient;

  constructor(
    configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.client = createClient({
      url: configService.getOrThrow<string>('REDIS_URL'),
      keyPrefix:
        configService.get<string>('REDIS_KEY_PREFIX') ?? 'medium-news:',
      name: 'medium-news-api',
    });

    this.client.on('error', (error: Error) => {
      this.logger.error(
        `Redis client error: ${error.message}`,
        error.stack,
        RedisService.name,
      );
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
    await this.client.ping();
    this.logger.log('Redis connection established', RedisService.name);
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.close();
    }
  }

  async setWithExpiration(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<void> {
    await this.client.set(key, value, {
      expiration: { type: 'EX', value: ttlSeconds },
    });
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) > 0;
  }
}
