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
