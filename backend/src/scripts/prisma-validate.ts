import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { env } from '../config/env';

void env;

const prismaCliEntry = path.resolve(__dirname, '../../../node_modules/prisma/build/index.js');
const result = spawnSync(process.execPath, [prismaCliEntry, 'validate'], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
