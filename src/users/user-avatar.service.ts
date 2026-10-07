import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { basename } from 'node:path';
import { DataSource } from 'typeorm';
import { AttachmentStorageService } from '../attachments/attachment-storage.service';
import { AttachmentEntity } from '../attachments/attachment.entity';
import { detectImage } from '../attachments/image-signature';
import type { AuthenticatedUser } from '../auth/auth.types';
import { createCustomError } from '../common/errors/custom-error';
import { UserPresenter } from './user.presenter';
import { UserEntity } from './user.entity';
import type { UserResponse } from './user.types';
import { UsersRepository } from './users.repository';

const AVATAR_DIRECTORY = 'avatars';
const MAX_FILE_NAME_LENGTH = 255;

type NewAvatar = Pick<
  AttachmentEntity,
  'fileName' | 'storagePath' | 'url' | 'fileType' | 'fileSize'
>;

@Injectable()
export class UserAvatarService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userPresenter: UserPresenter,
    private readonly attachmentStorageService: AttachmentStorageService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async updateAvatar(
    authenticatedUser: AuthenticatedUser,
    file: Express.Multer.File | undefined,
  ): Promise<UserResponse> {
    if (!file) {
      throw new UnprocessableEntityException(
        createCustomError('avatar is required'),
      );
    }

    const image = detectImage(file.buffer);

    if (!image) {
      throw new UnprocessableEntityException(
        createCustomError('avatar must be a JPG/JPEG, PNG or WebP image'),
      );
    }

    const userId = authenticatedUser.user.id;
    const storedFile = await this.attachmentStorageService.save(
      AVATAR_DIRECTORY,
      image.extension,
      file.buffer,
    );

    let previousAvatar: AttachmentEntity | null;

    try {
      previousAvatar = await this.replaceAvatar(userId, {
        fileName: this.normalizeFileName(file.originalname),
        storagePath: storedFile.storagePath,
        url: storedFile.url,
        fileType: image.mimeType,
        fileSize: file.size,
      });
    } catch (error) {
      await this.attachmentStorageService.remove(storedFile.storagePath);
      throw error;
    }

    if (previousAvatar) {
      await this.attachmentStorageService.remove(previousAvatar.storagePath);
    }

    return this.findUserResponse(userId);
  }

  async removeAvatar(
    authenticatedUser: AuthenticatedUser,
  ): Promise<UserResponse> {
    const userId = authenticatedUser.user.id;
    const previousAvatar = await this.replaceAvatar(userId, null);

    if (previousAvatar) {
      await this.attachmentStorageService.remove(previousAvatar.storagePath);
    }

    return this.findUserResponse(userId);
  }

  // Swaps the user's avatar inside one transaction and returns the replaced
  // attachment so its file can be deleted once the change is committed.
  private replaceAvatar(
    userId: string,
    newAvatar: NewAvatar | null,
  ): Promise<AttachmentEntity | null> {
    return this.dataSource.transaction(async (manager) => {
      // Lock the user row so concurrent avatar changes cannot both read the
      // same previous avatar.
      const user = await manager
        .createQueryBuilder(UserEntity, 'user')
        .setLock('pessimistic_write')
        .where('user.id = :userId', { userId })
        .getOne();

      if (!user) {
        throw new NotFoundException(createCustomError('user not found'));
      }

      let newAvatarId: string | null = null;

      if (newAvatar) {
        const attachment = await manager.save(
          manager.create(AttachmentEntity, {
            ...newAvatar,
            attachableType: 'user',
            attachableId: userId,
            purpose: 'avatar',
            visibility: 'public',
          }),
        );
        newAvatarId = attachment.id;
      }

      if (!user.avatarId) {
        if (newAvatarId) {
          await manager.update(
            UserEntity,
            { id: userId },
            { avatarId: newAvatarId },
          );
        }

        return null;
      }

      await manager.update(
        UserEntity,
        { id: userId },
        { avatarId: newAvatarId },
      );

      const previousAvatar = await manager.findOneBy(AttachmentEntity, {
        id: user.avatarId,
      });

      if (previousAvatar) {
        await manager.delete(AttachmentEntity, { id: previousAvatar.id });
      }

      return previousAvatar;
    });
  }

  private async findUserResponse(userId: string): Promise<UserResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(createCustomError('user not found'));
    }

    return this.userPresenter.toUserResponse(user);
  }

  // Multer decodes multipart file names as latin1; restore UTF-8 names and
  // keep only the base name since it is stored for display purposes only.
  private normalizeFileName(originalName: string): string {
    const fileName = basename(
      Buffer.from(originalName, 'latin1').toString('utf8'),
    );

    return fileName.slice(0, MAX_FILE_NAME_LENGTH) || 'avatar';
  }
}
