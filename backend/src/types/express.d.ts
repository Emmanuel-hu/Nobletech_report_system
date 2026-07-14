import type { AuthContext } from './auth.types';

type UploadedFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      auth?: AuthContext;
      file?: UploadedFile;
    }
  }
}

export {};
