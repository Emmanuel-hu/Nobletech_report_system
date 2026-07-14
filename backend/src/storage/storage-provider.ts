import type { CurriculumStorageProvider } from '@prisma/client';

export type StoreFileInput = {
  schoolId: string;
  sourceId: string;
  originalFileName: string;
  mimeType: string;
  buffer: Buffer;
};

export type StoredFileRecord = {
  storageProvider: CurriculumStorageProvider;
  storageKey: string;
  originalFileName: string;
  safeFileName: string;
  mimeType: string;
  fileSize: bigint;
  checksum: string;
  extension: string;
  isPreviewable: boolean;
};

export type FileDescriptor = {
  storageKey: string;
};

export interface StorageProvider {
  readonly provider: CurriculumStorageProvider;
  storeFile(input: StoreFileInput): Promise<StoredFileRecord>;
  deleteFile(file: FileDescriptor): Promise<void>;
  readFile(file: FileDescriptor): Promise<Buffer>;
  exists(file: FileDescriptor): Promise<boolean>;
}
