import multer from 'multer';
import path from 'node:path';

import { env } from '../config/env';
import { badRequest } from '../utils/app-error';

const allowedMimeTypes = env.STORAGE_ALLOWED_MIME_TYPES.split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

const allowedExtensions = new Set(
  env.STORAGE_ALLOWED_FILE_EXTENSIONS.split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);

const blockedExtensions = new Set(
  env.STORAGE_BLOCKED_FILE_EXTENSIONS.split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);

const suspiciousMimeMarkers = ['application/x-msdownload', 'application/x-executable', 'application/x-dosexec'];

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const mime = file.mimetype.toLowerCase();
  const extension = path.extname(file.originalname).toLowerCase();

  if (!extension || !allowedExtensions.has(extension)) {
    cb(badRequest(`Unsupported file extension: ${extension || 'none'}`));
    return;
  }

  if (blockedExtensions.has(extension)) {
    cb(badRequest(`Blocked file extension: ${extension}`));
    return;
  }

  if (!allowedMimeTypes.includes(mime)) {
    cb(badRequest(`Unsupported file MIME type: ${file.mimetype}`));
    return;
  }

  if (suspiciousMimeMarkers.some((item) => mime.includes(item))) {
    cb(badRequest('Potentially unsafe file type detected.'));
    return;
  }

  cb(null, true);
};

export const sourceFileUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.STORAGE_MAX_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
});
