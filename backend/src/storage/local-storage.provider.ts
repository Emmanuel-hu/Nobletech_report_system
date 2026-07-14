import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import type { CurriculumStorageProvider } from '@prisma/client';

import { env } from '../config/env';

import type { FileDescriptor, StorageProvider, StoreFileInput, StoredFileRecord } from './storage-provider';

const unsafeFileChars = /[^a-zA-Z0-9._-]+/g;

const sanitizeFileName = (name: string): string => {
  const normalized = name.trim().replaceAll(' ', '_').replace(unsafeFileChars, '_');
  if (!normalized) {
    return 'source_file';
  }

  return normalized.slice(0, 180);
};

const extensionFromName = (name: string): string => {
  const ext = path.extname(name).toLowerCase();
  if (!ext || ext.length > 10) {
    return '';
  }

  return ext;
};

const previewableExtensions = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.txt', '.csv']);

export class LocalStorageProvider implements StorageProvider {
  readonly provider: CurriculumStorageProvider = 'LOCAL';

  private readonly rootPath: string;

  constructor(rootPath: string = env.STORAGE_LOCAL_ROOT) {
    this.rootPath = rootPath;
  }

  private resolvePath(storageKey: string): string {
    const normalizedKey = storageKey.replaceAll('\\', '/').replace(/^\/+/, '');
    const resolved = path.resolve(this.rootPath, normalizedKey);
    const rootResolved = path.resolve(this.rootPath);
    const prefix = `${rootResolved}${path.sep}`;
    if (!(resolved === rootResolved || resolved.startsWith(prefix))) {
      throw new Error('Invalid storage key path.');
    }

    return resolved;
  }

  async storeFile(input: StoreFileInput): Promise<StoredFileRecord> {
    const extension = extensionFromName(input.originalFileName);
    const safeBase = sanitizeFileName(input.originalFileName.replace(extension, ''));
    const safeFileName = `${safeBase}${extension}`;
    const folder = path.join('curriculum-sources', input.schoolId, input.sourceId);
    const key = path.join(folder, `${Date.now()}-${crypto.randomUUID()}${extension}`).replaceAll('\\', '/');
    const filePath = this.resolvePath(key);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, input.buffer);

    return {
      storageProvider: this.provider,
      storageKey: key,
      originalFileName: input.originalFileName,
      safeFileName,
      mimeType: input.mimeType,
      fileSize: BigInt(input.buffer.length),
      checksum: crypto.createHash('sha256').update(input.buffer).digest('hex'),
      extension,
      isPreviewable: previewableExtensions.has(extension),
    };
  }

  async deleteFile(file: FileDescriptor): Promise<void> {
    const filePath = this.resolvePath(file.storageKey);
    await fs.rm(filePath, { force: true });
  }

  async readFile(file: FileDescriptor): Promise<Buffer> {
    const filePath = this.resolvePath(file.storageKey);
    return fs.readFile(filePath);
  }

  async exists(file: FileDescriptor): Promise<boolean> {
    const filePath = this.resolvePath(file.storageKey);

    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
