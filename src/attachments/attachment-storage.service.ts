import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import type { StoredFile } from './attachment.types';

export const PUBLIC_UPLOADS_PREFIX = '/uploads';

@Injectable()
export class AttachmentStorageService {
  private readonly logger = new Logger(AttachmentStorageService.name);
  readonly rootDir: string;
  private readonly baseUrl: string;

  constructor(configService: ConfigService) {
    this.rootDir = resolve(
      configService.get<string>('UPLOAD_DIR') ?? 'storage/uploads',
    );
    this.baseUrl = (
      configService.get<string>('APP_URL') ??
      `http://localhost:${configService.get<string>('PORT') ?? 3000}`
    ).replace(/\/+$/, '');
  }

  // File names are generated server-side (uuid) so they cannot be guessed or
  // used for path traversal, and every upload gets a new URL (no stale cache).
  async save(
    directory: string,
    extension: string,
    content: Buffer,
  ): Promise<StoredFile> {
    const storagePath = `${directory}/${randomUUID()}.${extension}`;
    const absolutePath = this.resolvePath(storagePath);

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content, { flag: 'wx' });

    return { storagePath, url: `${PUBLIC_UPLOADS_PREFIX}/${storagePath}` };
  }

  // Removal runs after the database change has been committed, so a failure
  // here only leaves an unreferenced file behind and must not fail the request.
  async remove(storagePath: string): Promise<void> {
    try {
      await rm(this.resolvePath(storagePath), { force: true });
    } catch (error) {
      this.logger.warn(
        `Failed to remove stored file ${storagePath}: ${String(error)}`,
      );
    }
  }

  toPublicUrl(attachment: { url: string } | null | undefined): string | null {
    return attachment ? `${this.baseUrl}${attachment.url}` : null;
  }

  private resolvePath(storagePath: string): string {
    const absolutePath = resolve(this.rootDir, storagePath);

    if (!absolutePath.startsWith(`${this.rootDir}${sep}`)) {
      throw new Error('Storage path escapes the upload directory');
    }

    return absolutePath;
  }
}
