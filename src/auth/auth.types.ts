import { UserEntity } from '../users/user.entity';

export type JwtPayload = {
  sub: string;
  username: string;
};

export type AuthenticatedUser = {
  user: UserEntity;
  token: string;
};

export type UserResponse = {
  user: {
    email: string;
    token: string;
    username: string;
    bio: string | null;
    image: string | null;
  };
};
