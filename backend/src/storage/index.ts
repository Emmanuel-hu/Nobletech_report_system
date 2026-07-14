import { env } from '../config/env';

import { LocalStorageProvider } from './local-storage.provider';
import type { StorageProvider } from './storage-provider';

let provider: StorageProvider | null = null;

const buildProvider = (): StorageProvider => {
  if (env.STORAGE_PROVIDER === 'LOCAL') {
    return new LocalStorageProvider(env.STORAGE_LOCAL_ROOT);
  }

  // Provider abstraction is in place; cloud adapters are intentionally deferred.
  throw new Error(`Unsupported storage provider configuration: ${env.STORAGE_PROVIDER}`);
};

export const getStorageProvider = (): StorageProvider => {
  if (!provider) {
    provider = buildProvider();
  }

  return provider;
};
