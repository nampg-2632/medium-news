import { UserEntity } from '../users/user.entity';

export type JwtPayload = {
  sub: string;
  username: string;
};

export type VerifiedJwtPayload = JwtPayload & {
  exp: number;
  iat: number;
};

export type AuthenticatedUser = {
  user: UserEntity;
  token: string;
  tokenExpiresAt: number;
};

export type AuthResponse = {
  user: {
    email: string;
    token: string;
    username: string;
    bio: string | null;
    image: string | null;
  };
};
