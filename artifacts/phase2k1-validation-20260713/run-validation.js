const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = process.cwd();
const outDir = path.join(repoRoot, 'artifacts', 'phase2k1-validation-20260713');
fs.mkdirSync(outDir, { recursive: true });

const npmCli = 'C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js';

const commands = [
  {
    id: 'frontend_typecheck',
    cmd: 'node',
    args: [npmCli, '-w', 'frontend', 'run', 'typecheck'],
    cwd: repoRoot,
  },
  {
    id: 'frontend_lint',
    cmd: 'node',
    args: [npmCli, '-w', 'frontend', 'run', 'lint'],
    cwd: repoRoot,
  },
  {
    id: 'frontend_structure_editor_run1',
    cmd: 'node',
    args: [npmCli, '-w', 'frontend', 'run', 'test', '--', '--run', 'tests/curriculum-structure-editor.test.tsx', '--reporter=basic'],
    cwd: repoRoot,
  },
  {
    id: 'frontend_structure_editor_run2',
    cmd: 'node',
    args: [npmCli, '-w', 'frontend', 'run', 'test', '--', '--run', 'tests/curriculum-structure-editor.test.tsx', '--reporter=basic'],
    cwd: repoRoot,
  },
  {
    id: 'frontend_test_run1',
    cmd: 'node',
    args: [npmCli, '-w', 'frontend', 'run', 'test', '--', '--run', '--reporter=basic'],
    cwd: repoRoot,
  },
  {
    id: 'frontend_test_run2',
    cmd: 'node',
    args: [npmCli, '-w', 'frontend', 'run', 'test', '--', '--run', '--reporter=basic'],
    cwd: repoRoot,
  },
  {
    id: 'frontend_build',
    cmd: 'node',
    args: [npmCli, '-w', 'frontend', 'run', 'build'],
    cwd: repoRoot,
  },
  {
    id: 'backend_typecheck',
    cmd: 'node',
    args: [npmCli, '-w', 'backend', 'run', 'typecheck'],
    cwd: repoRoot,
  },
  {
    id: 'backend_lint',
    cmd: 'node',
    args: [npmCli, '-w', 'backend', 'run', 'lint'],
    cwd: repoRoot,
  },
  {
    id: 'backend_test',
    cmd: 'node',
    args: [npmCli, '-w', 'backend', 'run', 'test'],
    cwd: repoRoot,
  },
  {
    id: 'backend_build',
    cmd: 'node',
    args: [npmCli, '-w', 'backend', 'run', 'build'],
    cwd: repoRoot,
  },
  {
    id: 'prisma_validate',
    cmd: 'node',
    args: [npmCli, '-w', 'backend', 'run', 'prisma:validate'],
    cwd: repoRoot,
  },
  {
    id: 'prisma_generate',
    cmd: 'node',
    args: [npmCli, '-w', 'backend', 'run', 'prisma:generate'],
    cwd: repoRoot,
  },
  {
    id: 'prisma_migrate_status',
    cmd: 'node',
    args: [npmCli, '-w', 'backend', 'run', 'prisma:migrate:status'],
    cwd: repoRoot,
  },
  {
    id: 'db_health',
    cmd: 'node',
    args: [npmCli, '-w', 'backend', 'run', 'db:health'],
    cwd: repoRoot,
  },
  {
    id: 'git_status',
    cmd: 'git',
    args: ['status', '--porcelain=v1'],
    cwd: repoRoot,
  },
  {
    id: 'git_branch_head_remote',
    cmd: 'git',
    args: ['rev-parse', '--abbrev-ref', 'HEAD'],
    cwd: repoRoot,
  },
  {
    id: 'git_head',
    cmd: 'git',
    args: ['rev-parse', 'HEAD'],
    cwd: repoRoot,
  },
  {
    id: 'git_remote',
    cmd: 'git',
    args: ['remote', '-v'],
    cwd: repoRoot,
  },
  {
    id: 'git_staged_names',
    cmd: 'git',
    args: ['diff', '--cached', '--name-only'],
    cwd: repoRoot,
  },
  {
    id: 'git_staged_diff',
    cmd: 'git',
    args: ['diff', '--cached'],
    cwd: repoRoot,
  },
];

function runOne(entry) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const proc = spawn(entry.cmd, entry.args, {
      cwd: entry.cwd,
      env: process.env,
      shell: false,
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8');
    });

    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8');
    });

    proc.on('error', (error) => {
      stderr += `\n[spawn-error] ${error.message}\n`;
    });

    proc.on('close', (code, signal) => {
      const endedAt = Date.now();
      const durationMs = endedAt - startedAt;
      const logPath = path.join(outDir, `${entry.id}.log`);
      const combined = [`$ ${entry.cmd} ${entry.args.join(' ')}`, '', stdout, stderr].join('\n');
      fs.writeFileSync(logPath, combined, 'utf8');

      resolve({
        id: entry.id,
        command: `${entry.cmd} ${entry.args.join(' ')}`,
        cwd: entry.cwd,
        exitCode: code === null ? -1 : code,
        signal: signal || null,
        durationMs,
        logPath,
      });
    });
  });
}

(async () => {
  const results = [];

  for (const entry of commands) {
    const result = await runOne(entry);
    results.push(result);

    const status = result.exitCode === 0 ? 'PASS' : 'FAIL';
    process.stdout.write(`${result.id}: ${status} (exit ${result.exitCode}, ${result.durationMs}ms)\n`);
  }

  const summaryPath = path.join(outDir, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({ results }, null, 2), 'utf8');
  process.stdout.write(`Summary: ${summaryPath}\n`);
})();
