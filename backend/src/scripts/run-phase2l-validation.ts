import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

import { env } from '../config/env';

type ValidationStep = {
  id: string;
  label: string;
  cwd: string;
  command: string;
  args: string[];
};

type ValidationResult = {
  id: string;
  label: string;
  command: string;
  cwd: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  exitCode: number;
  passed: boolean;
  warningCount: number;
  testSummary: {
    tests: number | null;
    passed: number | null;
    failed: number | null;
  };
  stdoutLog: string;
  stderrLog: string;
};

type ValidationSummary = {
  startedAt: string;
  endedAt: string;
  durationMs: number;
  passed: boolean;
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  runDirectory: string;
  results: ValidationResult[];
};

const repoRoot = path.resolve(__dirname, '../../..');
const backendRoot = path.resolve(__dirname, '../..');
const frontendRoot = path.resolve(repoRoot, 'frontend');
const artifactsRoot = path.resolve(repoRoot, 'artifacts');

void env;

const npmCli = path.resolve(process.execPath, '../node_modules/npm/bin/npm-cli.js');

const countWarnings = (output: string): number => {
  return output
    .split(/\r?\n/)
    .filter((line) => {
      const lower = line.toLowerCase();
      if (lower.includes('--max-warnings')) {
        return false;
      }
      return /\bwarning\b/i.test(line);
    }).length;
};

const parseVitestSummary = (output: string): { tests: number | null; passed: number | null; failed: number | null } => {
  const summaryMatch = output.match(/Tests\s+([\d,]+)\s+passed(?:\s+\|\s+([\d,]+)\s+failed)?/i);
  if (!summaryMatch) {
    return { tests: null, passed: null, failed: null };
  }

  const passedText = summaryMatch[1];
  if (!passedText) {
    return { tests: null, passed: null, failed: null };
  }

  const passed = Number(passedText.replaceAll(',', ''));
  const failed = summaryMatch[2] ? Number(summaryMatch[2].replaceAll(',', '')) : 0;
  return {
    tests: passed + failed,
    passed,
    failed,
  };
};

const buildSummary = (
  startedAt: Date,
  endedAt: Date,
  runDir: string,
  results: ValidationResult[],
  totalSteps: number,
): ValidationSummary => {
  const passedSteps = results.filter((item) => item.passed).length;
  const failedSteps = results.length - passedSteps;

  return {
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    durationMs: endedAt.getTime() - startedAt.getTime(),
    passed: failedSteps === 0 && results.length === totalSteps,
    totalSteps,
    passedSteps,
    failedSteps,
    runDirectory: runDir,
    results,
  };
};

const writeSummaries = async (summary: ValidationSummary, repoRootPath: string): Promise<void> => {
  const summaryPath = path.join(summary.runDirectory, 'summary.json');
  const markdownPath = path.join(summary.runDirectory, 'summary.md');

  await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  const lines = [
    '# Phase 2L Validation Summary',
    '',
    `- Started: ${summary.startedAt}`,
    `- Ended: ${summary.endedAt}`,
    `- Duration ms: ${summary.durationMs}`,
    `- Passed: ${summary.passed}`,
    `- Passed steps: ${summary.passedSteps}/${summary.totalSteps}`,
    '',
    '| Step | Exit | Duration ms | Warnings | Stdout log | Stderr log |',
    '|---|---:|---:|---:|---|---|',
    ...summary.results.map(
      (item) =>
        `| ${item.id} | ${item.exitCode} | ${item.durationMs} | ${item.warningCount} | ${path.relative(repoRootPath, item.stdoutLog)} | ${path.relative(repoRootPath, item.stderrLog)} |`,
    ),
  ];

  await fs.writeFile(markdownPath, `${lines.join('\n')}\n`, 'utf8');
};

const runStep = async (
  step: ValidationStep,
  runDir: string,
  runEnv: NodeJS.ProcessEnv,
): Promise<ValidationResult> => {
  const started = new Date();
  const stdoutChunks: string[] = [];
  const stderrChunks: string[] = [];

  const commandString = `${step.command} ${step.args.join(' ')}`;

  const child = spawn(step.command, step.args, {
    cwd: step.cwd,
    env: runEnv,
    shell: false,
    windowsHide: true,
  });

  child.stdout.on('data', (chunk: Buffer | string) => {
    const text = chunk.toString();
    stdoutChunks.push(text);
    process.stdout.write(text);
  });

  child.stderr.on('data', (chunk: Buffer | string) => {
    const text = chunk.toString();
    stderrChunks.push(text);
    process.stderr.write(text);
  });

  const heartbeat = setInterval(() => {
    process.stdout.write(`[phase2l] ${step.id} still running...\n`);
  }, 10000);

  const exitCode = await new Promise<number>((resolve, reject) => {
    child.on('error', (error) => {
      clearInterval(heartbeat);
      reject(error);
    });
    child.on('close', (code) => {
      clearInterval(heartbeat);
      resolve(code ?? 1);
    });
  });

  const ended = new Date();
  const stdout = stdoutChunks.join('');
  const stderr = stderrChunks.join('');

  const stepDir = path.join(runDir, step.id);
  await fs.mkdir(stepDir, { recursive: true });
  const stdoutPath = path.join(stepDir, 'stdout.log');
  const stderrPath = path.join(stepDir, 'stderr.log');
  await fs.writeFile(stdoutPath, stdout, 'utf8');
  await fs.writeFile(stderrPath, stderr, 'utf8');

  const combined = `${stdout}\n${stderr}`;
  const warningCount = countWarnings(combined);
  const testSummary = step.id.includes('test') ? parseVitestSummary(combined) : { tests: null, passed: null, failed: null };

  return {
    id: step.id,
    label: step.label,
    command: commandString,
    cwd: step.cwd,
    startedAt: started.toISOString(),
    endedAt: ended.toISOString(),
    durationMs: ended.getTime() - started.getTime(),
    exitCode,
    passed: exitCode === 0,
    warningCount,
    testSummary,
    stdoutLog: stdoutPath,
    stderrLog: stderrPath,
  };
};

const main = async (): Promise<void> => {
  const runStarted = new Date();
  const runId = `phase2l-validation-${runStarted.toISOString().replace(/[:.]/g, '-')}`;
  const runDir = path.join(artifactsRoot, runId);
  await fs.mkdir(runDir, { recursive: true });

  const steps: ValidationStep[] = [
    { id: 'frontend_typecheck', label: 'Frontend typecheck', cwd: frontendRoot, command: process.execPath, args: [npmCli, 'run', 'typecheck'] },
    { id: 'frontend_lint', label: 'Frontend lint', cwd: frontendRoot, command: process.execPath, args: [npmCli, 'run', 'lint'] },
    { id: 'frontend_test', label: 'Frontend tests', cwd: frontendRoot, command: process.execPath, args: [npmCli, 'run', 'test'] },
    { id: 'frontend_build', label: 'Frontend build', cwd: frontendRoot, command: process.execPath, args: [npmCli, 'run', 'build'] },

    { id: 'backend_typecheck', label: 'Backend typecheck', cwd: backendRoot, command: process.execPath, args: [npmCli, 'run', 'typecheck'] },
    { id: 'backend_lint', label: 'Backend lint', cwd: backendRoot, command: process.execPath, args: [npmCli, 'run', 'lint'] },
    { id: 'backend_test', label: 'Backend tests', cwd: backendRoot, command: process.execPath, args: [npmCli, 'run', 'test'] },
    { id: 'backend_build', label: 'Backend build', cwd: backendRoot, command: process.execPath, args: [npmCli, 'run', 'build'] },

    { id: 'prisma_validate', label: 'Prisma validate', cwd: backendRoot, command: process.execPath, args: [npmCli, 'run', 'prisma:validate'] },
    { id: 'prisma_generate', label: 'Prisma generate', cwd: backendRoot, command: process.execPath, args: [npmCli, 'run', 'prisma:generate'] },
    { id: 'prisma_migrate_deploy', label: 'Prisma migrate deploy', cwd: backendRoot, command: process.execPath, args: [npmCli, 'run', 'prisma:migrate:deploy'] },
    { id: 'prisma_migrate_status', label: 'Prisma migrate status', cwd: backendRoot, command: process.execPath, args: [npmCli, 'run', 'prisma:migrate:status'] },
    { id: 'db_health', label: 'Database health', cwd: backendRoot, command: process.execPath, args: [npmCli, 'run', 'db:health'] },

    { id: 'migration_checksum_audit', label: 'Migration checksum audit', cwd: backendRoot, command: process.execPath, args: [npmCli, 'exec', 'tsx', 'src/scripts/prisma-migration-checksum-audit.ts', '--', '--scope', 'phase2l'] },
    { id: 'phase2l_db_verify', label: 'Phase 2L DB verification', cwd: backendRoot, command: process.execPath, args: [npmCli, 'exec', 'tsx', 'src/scripts/phase2l-source-file-db-verify.ts'] },
    { id: 'phase2l_constraints', label: 'Phase 2L constraint checks', cwd: backendRoot, command: process.execPath, args: [npmCli, 'exec', 'tsx', 'src/scripts/phase2l-source-file-constraints-check.ts'] },

    { id: 'regression_foundation_constraints', label: 'Regression foundation constraints', cwd: backendRoot, command: process.execPath, args: [npmCli, 'exec', 'tsx', 'src/scripts/foundation-constraints-check.ts'] },
    { id: 'regression_academic_constraints', label: 'Regression academic constraints', cwd: backendRoot, command: process.execPath, args: [npmCli, 'exec', 'tsx', 'src/scripts/academic-structure-constraints-check.ts'] },
    { id: 'regression_programme_constraints', label: 'Regression programme constraints', cwd: backendRoot, command: process.execPath, args: [npmCli, 'exec', 'tsx', 'src/scripts/programme-component-constraints-check.ts'] },
    { id: 'regression_master_content_constraints', label: 'Regression master content constraints', cwd: backendRoot, command: process.execPath, args: [npmCli, 'exec', 'tsx', 'src/scripts/master-content-source-constraints-check.ts'] },
    { id: 'regression_phase2g_constraints', label: 'Regression phase2g constraints', cwd: backendRoot, command: process.execPath, args: [npmCli, 'run', 'phase2g:constraints'] },
  ];

  const runEnv = {
    ...process.env,
    DATABASE_URL: env.DATABASE_URL,
  };

  const results: ValidationResult[] = [];
  let finalSummary: ValidationSummary | null = null;

  try {
    for (const step of steps) {
      process.stdout.write(`\n[phase2l] START ${step.id} :: ${step.label}\n`);
      const result = await runStep(step, runDir, runEnv);
      results.push(result);

      process.stdout.write(`[phase2l] END ${step.id} :: exit=${result.exitCode} durationMs=${result.durationMs}\n`);

      const partialSummary = buildSummary(runStarted, new Date(), runDir, results, steps.length);
      await writeSummaries(partialSummary, repoRoot);

      if (result.exitCode !== 0) {
        break;
      }
    }

    finalSummary = buildSummary(runStarted, new Date(), runDir, results, steps.length);
    await writeSummaries(finalSummary, repoRoot);
  } finally {
    if (!finalSummary) {
      finalSummary = buildSummary(runStarted, new Date(), runDir, results, steps.length);
      await writeSummaries(finalSummary, repoRoot);
    }
  }

  process.stdout.write(`\n[phase2l] Summary JSON: ${path.join(runDir, 'summary.json')}\n`);
  process.stdout.write(`[phase2l] Summary Markdown: ${path.join(runDir, 'summary.md')}\n`);

  process.exit(finalSummary.passed ? 0 : 1);
};

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[run-phase2l-validation] fatal: ${message}\n`);
  process.exit(1);
});
