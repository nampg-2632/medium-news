import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { createCustomError } from '../common/errors/custom-error';
import { UserPresenter } from '../users/user.presenter';
import { UserEntity } from '../users/user.entity';
import { UserAlreadyExistsError } from '../users/users.errors';
import { UsersRepository } from '../users/users.repository';
import { AuthenticatedUser, AuthResponse, JwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userPresenter: UserPresenter,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponse> {
    const email = dto.user.email.trim().toLowerCase();
    const username = dto.user.username.trim();
    const passwordHash = await hash(dto.user.password);

    try {
      const user = await this.usersRepository.create({
        email,
        username,
        passwordHash,
      });
      return this.createAuthResponse(user);
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw new UnprocessableEntityException(
          createCustomError(`${error.field} has already been taken`),
        );
      }

      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = dto.user.email.trim().toLowerCase();
    const user = await this.usersRepository.findByEmail(email);

    if (!user || !(await verify(user.passwordHash, dto.user.password))) {
      throw new UnauthorizedException(
        createCustomError('email or password is invalid'),
      );
    }

    return this.createAuthResponse(user);
  }

  async logout(authenticatedUser: AuthenticatedUser): Promise<void> {
    await this.tokenBlacklistService.revoke(
      authenticatedUser.token,
      authenticatedUser.tokenExpiresAt,
    );
  }

  private async createAuthResponse(user: UserEntity): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
    };
    const token = await this.jwtService.signAsync(payload);

    return this.mapAuthResponse(user, token);
  }

  private mapAuthResponse(user: UserEntity, token: string): AuthResponse {
    return {
      user: {
        email: user.email,
        token,
        username: user.username,
        bio: user.bio,
        image: this.userPresenter.getImageUrl(user),
      },
    };
  }
}
