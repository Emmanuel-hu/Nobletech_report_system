import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { env } from '../config/env';

const backendRoot = path.resolve(__dirname, '../..');

let command = process.execPath;
let args = [''];

try {
  const prismaCliPath = require.resolve('prisma/build/index.js', {
    paths: [backendRoot],
  });
  args = [prismaCliPath, 'migrate', 'status', '--schema', 'prisma/schema.prisma'];
} catch {
  command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  args = ['prisma', 'migrate', 'status', '--schema', 'prisma/schema.prisma'];
}

process.stdout.write(
  `[prisma:migrate:status] Running: ${command} ${args.join(' ')}\n`
);

const result = spawnSync(command, args, {
  cwd: backendRoot,
  stdio: 'pipe',
  encoding: 'utf8',
  env: {
    ...process.env,
    DATABASE_URL: env.DATABASE_URL,
  },
});

if (result.stdout) {
  process.stdout.write(result.stdout);
}

if (result.stderr) {
  process.stderr.write(result.stderr);
}

if (result.error) {
  process.stderr.write(
    `[prisma:migrate:status] Spawn error: ${result.error.message}\n`
  );
}

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
