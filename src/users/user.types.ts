import type { AttachmentEntity } from '../attachments/attachment.entity';

export type CreateUserInput = {
  email: string;
  username: string;
  passwordHash: string;
};

export type UpdateUserInput = {
  email?: string;
  username?: string;
  passwordHash?: string;
  bio?: string | null;
};

export type NewAvatar = Pick<
  AttachmentEntity,
  'fileName' | 'storagePath' | 'url' | 'fileType' | 'fileSize'
>;

export type UniqueUserField = 'email' | 'username';

export type UserResponse = {
  user: {
    email: string;
    username: string;
    bio: string | null;
    image: string | null;
  };
};
