import { UserRecord } from '../users/user.types';

export type JwtPayload = {
  sub: string;
  username: string;
};

export type AuthenticatedUser = {
  user: UserRecord;
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
