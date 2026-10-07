import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { createCustomError } from '../common/errors/custom-error';
import { FollowsRepository } from '../follows/follows.repository';
import { UserEntity } from '../users/user.entity';
import { UsersRepository } from '../users/users.repository';
import type { ProfileResponse } from './profile.types';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly followsRepository: FollowsRepository,
  ) {}

  async getProfile(
    username: string,
    authenticatedUser: AuthenticatedUser | undefined,
  ): Promise<ProfileResponse> {
    const profileUser = await this.findProfileUser(username);
    const following = authenticatedUser
      ? await this.followsRepository.isFollowing(
          authenticatedUser.user.id,
          profileUser.id,
        )
      : false;

    return this.toProfileResponse(profileUser, following);
  }

  async follow(
    username: string,
    authenticatedUser: AuthenticatedUser,
  ): Promise<ProfileResponse> {
    const profileUser = await this.findProfileUser(username);

    if (profileUser.id === authenticatedUser.user.id) {
      throw new UnprocessableEntityException(
        createCustomError('you cannot follow yourself'),
      );
    }

    await this.followsRepository.follow(
      authenticatedUser.user.id,
      profileUser.id,
    );

    return this.toProfileResponse(profileUser, true);
  }

  async unfollow(
    username: string,
    authenticatedUser: AuthenticatedUser,
  ): Promise<ProfileResponse> {
    const profileUser = await this.findProfileUser(username);

    await this.followsRepository.unfollow(
      authenticatedUser.user.id,
      profileUser.id,
    );

    return this.toProfileResponse(profileUser, false);
  }

  private async findProfileUser(username: string): Promise<UserEntity> {
    const user = await this.usersRepository.findByUsername(username);

    if (!user) {
      throw new NotFoundException(createCustomError('profile not found'));
    }

    return user;
  }

  private toProfileResponse(
    user: UserEntity,
    following: boolean,
  ): ProfileResponse {
    return {
      profile: {
        username: user.username,
        bio: user.bio,
        image: user.image,
        following,
      },
    };
  }
}
