export type UserRecord = {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  bio: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserInput = {
  email: string;
  username: string;
  passwordHash: string;
};

export type UniqueUserField = 'email' | 'username';
