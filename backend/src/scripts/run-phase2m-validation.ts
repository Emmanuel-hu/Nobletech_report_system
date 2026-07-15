import { spawn } from 'node:child_process';

import { env } from '../config/env';

type Step = {
  id: string;
  command: string;
  args: string[];
};

void env;

const npmCommand = 'npm';

const steps: Step[] = [
  { id: 'prisma:validate', command: npmCommand, args: ['run', 'prisma:validate'] },
  { id: 'typecheck', command: npmCommand, args: ['run', 'typecheck'] },
  { id: 'test', command: npmCommand, args: ['run', 'test'] },
  { id: 'phase2m:db:verify', command: npmCommand, args: ['run', 'phase2m:db:verify'] },
  { id: 'phase2m:constraints', command: npmCommand, args: ['run', 'phase2m:constraints'] },
];

const run = async (step: Step): Promise<number> => {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'cmd.exe' : step.command;
    const args = isWindows ? ['/d', '/s', '/c', `${step.command} ${step.args.join(' ')}`] : step.args;

    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: env.DATABASE_URL,
      },
      stdio: 'inherit',
      shell: false,
      windowsHide: true,
    });

    child.on('error', reject);
    child.on('close', (code) => resolve(code ?? 1));
  });
};

const main = async (): Promise<void> => {
  for (const step of steps) {
    process.stdout.write(`[phase2m-validation] running ${step.id}\n`);
    const exitCode = await run(step);
    if (exitCode !== 0) {
      process.stderr.write(`[phase2m-validation] ${step.id} failed with exit code ${exitCode}\n`);
      process.exitCode = exitCode;
      return;
    }
  }

  process.stdout.write('[phase2m-validation] all steps passed\n');
};

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[phase2m-validation] fatal: ${message}\n`);
  process.exitCode = 1;
});
