import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { seconds, ThrottlerModule } from '@nestjs/throttler';
import { RedisModule } from '../redis/redis.module';
import { UsersModule } from '../users/users.module';
import { AuthConfigurationError } from './auth.errors';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenBlacklistService } from './token-blacklist.service';

@Module({
  imports: [
    UsersModule,
    RedisModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ThrottlerModule.forRoot([
      {
        ttl: seconds(60),
        limit: 5,
        blockDuration: seconds(60),
      },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const expiresIn = Number(
          configService.get<string>('JWT_EXPIRES_IN_SECONDS') ?? 86400,
        );

        if (!Number.isInteger(expiresIn) || expiresIn < 1) {
          throw new AuthConfigurationError(
            'JWT_EXPIRES_IN_SECONDS must be a positive integer',
          );
        }

        return {
          secret: configService.getOrThrow<string>('JWT_SECRET'),
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TokenBlacklistService],
})
export class AuthModule {}
