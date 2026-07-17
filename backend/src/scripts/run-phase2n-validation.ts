import { spawn } from 'node:child_process';

const commands: Array<{ label: string; command: string; args: string[] }> = [
  { label: 'phase2n:db:verify', command: 'npm', args: ['run', 'phase2n:db:verify'] },
  { label: 'phase2n:constraints', command: 'npm', args: ['run', 'phase2n:constraints'] },
  { label: 'phase2n:rbac:audit', command: 'npm', args: ['run', 'phase2n:rbac:audit'] },
  { label: 'phase2n:rbac:verify', command: 'npm', args: ['run', 'phase2n:rbac:verify'] },
];

const run = async (label: string, command: string, args: string[]): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${label} exited with code ${code ?? 'unknown'}`));
    });
  });
};

const main = async (): Promise<void> => {
  for (const step of commands) {
    process.stdout.write(`\n[phase2n-validation] running ${step.label}\n`);
    await run(step.label, step.command, step.args);
  }

  process.stdout.write('\n[phase2n-validation] all checks passed.\n');
};

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[phase2n-validation] fatal: ${message}\n`);
  process.exitCode = 1;
});