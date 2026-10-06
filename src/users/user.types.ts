export type CreateUserInput = {
  email: string;
  username: string;
  passwordHash: string;
};

export type UniqueUserField = 'email' | 'username';
