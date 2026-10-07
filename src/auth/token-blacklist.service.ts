import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { RedisService } from '../redis/redis.service';

const TOKEN_BLACKLIST_KEY_PREFIX = 'auth:token-blacklist:';

@Injectable()
export class TokenBlacklistService {
  constructor(private readonly redisService: RedisService) {}

  async revoke(token: string, expiresAt: number): Promise<void> {
    const ttlSeconds = expiresAt - Math.floor(Date.now() / 1000);

    if (ttlSeconds < 1) {
      return;
    }

    await this.redisService.setWithExpiration(
      this.createKey(token),
      'revoked',
      ttlSeconds,
    );
  }

  isRevoked(token: string): Promise<boolean> {
    return this.redisService.exists(this.createKey(token));
  }

  private createKey(token: string): string {
    const fingerprint = createHash('sha256').update(token).digest('hex');
    return `${TOKEN_BLACKLIST_KEY_PREFIX}${fingerprint}`;
  }
}
