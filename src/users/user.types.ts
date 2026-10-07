export type CreateUserInput = {
  email: string;
  username: string;
  passwordHash: string;
};

export type UniqueUserField = 'email' | 'username';

export type UserResponse = {
  user: {
    email: string;
    username: string;
    bio: string | null;
    image: string | null;
  };
};
