import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { createCustomError } from '../../common/errors/custom-error';
import { UsersRepository } from '../../users/users.repository';
import { AuthenticatedUser, JwtPayload } from '../auth.types';
import { TokenBlacklistService } from '../token-blacklist.service';

const tokenExtractor = ExtractJwt.fromAuthHeaderWithScheme('Token');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: tokenExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    payload: JwtPayload & { exp?: unknown; iat?: unknown },
  ): Promise<AuthenticatedUser> {
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.exp !== 'number' ||
      typeof payload.iat !== 'number'
    ) {
      throw new UnauthorizedException(
        createCustomError('authentication token is invalid'),
      );
    }

    const token = tokenExtractor(request);

    if (!token || (await this.tokenBlacklistService.isRevoked(token))) {
      throw new UnauthorizedException(
        createCustomError('authentication token is invalid'),
      );
    }

    const user = await this.usersRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException(
        createCustomError('authentication token is invalid'),
      );
    }

    return { user, token, tokenExpiresAt: payload.exp };
  }
}
