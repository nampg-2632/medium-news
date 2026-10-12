import { Injectable } from '@nestjs/common';
import { AttachmentStorageService } from '../attachments/attachment-storage.service';
import { UserEntity } from './user.entity';
import type { UserResponse } from './user.types';

// Shapes users for API responses. The image URL is derived from the avatar
// attachment, so the user must be loaded with its avatar relation.
@Injectable()
export class UserPresenter {
  constructor(
    private readonly attachmentStorageService: AttachmentStorageService,
  ) {}

  getImageUrl(user: UserEntity): string | null {
    return this.attachmentStorageService.toPublicUrl(user.avatar);
  }

  toUserResponse(user: UserEntity): UserResponse {
    return {
      user: {
        email: user.email,
        username: user.username,
        bio: user.bio,
        image: this.getImageUrl(user),
      },
    };
  }
}
