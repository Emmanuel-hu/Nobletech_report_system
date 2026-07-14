import path from 'node:path';

import dotenv from 'dotenv';
import { z } from 'zod';

const repoRoot = path.resolve(__dirname, '../../..');

dotenv.config({ path: path.join(repoRoot, '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_PORT: z.coerce.number().int().positive().default(5000),
  APP_VERSION: z.string().min(1).default('1.0.0'),
  API_VERSION: z
    .string()
    .regex(/^v\d+$/)
    .default('v1'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  STORAGE_PROVIDER: z.enum(['LOCAL', 'AZURE_BLOB', 'AWS_S3', 'GCP_STORAGE']).default('LOCAL'),
  STORAGE_LOCAL_ROOT: z.string().min(1).default(path.join(repoRoot, 'uploads')),
  STORAGE_MAX_FILE_SIZE_BYTES: z.coerce.number().int().positive().default(15 * 1024 * 1024),
  STORAGE_ALLOWED_MIME_TYPES: z
    .string()
    .default('application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,image/png,image/jpeg'),
  STORAGE_ALLOWED_FILE_EXTENSIONS: z.string().default('.pdf,.docx,.csv,.xlsx,.txt,.png,.jpg,.jpeg'),
  STORAGE_BLOCKED_FILE_EXTENSIONS: z.string().default('.exe,.bat,.cmd,.com,.ps1,.js,.jar,.msi,.vbs,.scr,.dll,.html,.htm,.svg,.zip,.7z,.rar,.gz,.tar,.docm,.xlsm,.pptm,.iso'),
  DATABASE_URL: z
    .string()
    .url()
    .regex(/^postgres(?:ql)?:\/\//, 'DATABASE_URL must be a PostgreSQL connection string'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join(', ');

  throw new Error(`Environment validation failed: ${issues}`);
}

export const env = parsedEnv.data;
