import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { UserResponse } from './user.types';

@Injectable()
export class UsersService {
  getCurrentUser(authenticatedUser: AuthenticatedUser): UserResponse {
    const { user } = authenticatedUser;

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
