import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { hash } from 'argon2';
import type { AuthenticatedUser } from '../auth/auth.types';
import { createCustomError } from '../common/errors/custom-error';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './user.entity';
import type { UpdateUserInput, UserResponse } from './user.types';
import { UserAlreadyExistsError } from './users.errors';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  getCurrentUser(authenticatedUser: AuthenticatedUser): UserResponse {
    return this.toUserResponse(authenticatedUser.user);
  }

  async updateCurrentUser(
    authenticatedUser: AuthenticatedUser,
    dto: UpdateUserDto,
  ): Promise<UserResponse> {
    const userId = authenticatedUser.user.id;
    const { email, username, password, bio } = dto.user;
    const input: UpdateUserInput = {};

    if (email !== undefined) {
      input.email = email;
    }
    if (username !== undefined) {
      input.username = username;
    }
    if (bio !== undefined) {
      input.bio = bio;
    }
    if (password !== undefined) {
      input.passwordHash = await hash(password);
    }

    try {
      await this.usersRepository.update(userId, input);
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw new UnprocessableEntityException(
          createCustomError(`${error.field} has already been taken`),
        );
      }

      throw error;
    }

    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(createCustomError('user not found'));
    }

    return this.toUserResponse(user);
  }

  private toUserResponse(user: UserEntity): UserResponse {
    return {
      user: {
        email: user.email,
        username: user.username,
        bio: user.bio,
        image: user.image,
      },
    };
  }
}
