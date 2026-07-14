import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import { Prisma } from '@prisma/client';

import { prisma } from '../config/prisma';

type MigrationRow = {
  migration_name: string;
  checksum: string;
  finished_at: Date | null;
  rolled_back_at: Date | null;
  applied_steps_count: string | number;
};

type AuditRow = {
  migrationName: string;
  dbChecksum: string;
  fileChecksum: string | null;
  status: 'MATCH' | 'MISSING_FILE' | 'CHECKSUM_MISMATCH';
};

const repoRoot = path.resolve(__dirname, '../../..');
const migrationsRoot = path.join(repoRoot, 'backend', 'prisma', 'migrations');

const scope = process.argv[2] === '--scope' ? process.argv[3] ?? 'all' : 'all';

const shouldAuditMigration = (migrationName: string): boolean => {
  if (scope === 'phase2l') {
    return migrationName.startsWith('20260715102000_phase2l_') || migrationName.startsWith('20260715132000_phase2l_');
  }

  return true;
};

const sha256File = async (filePath: string): Promise<string> => {
  const fileBuffer = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};

const main = async (): Promise<void> => {
  const rows = await prisma.$queryRaw<MigrationRow[]>(Prisma.sql`
    SELECT migration_name, checksum, finished_at, rolled_back_at, applied_steps_count
    FROM _prisma_migrations
    WHERE finished_at IS NOT NULL
      AND rolled_back_at IS NULL
    ORDER BY finished_at ASC
  `);

  const audits: AuditRow[] = [];

  for (const row of rows) {
    if (!shouldAuditMigration(row.migration_name)) {
      continue;
    }

    const migrationFile = path.join(migrationsRoot, row.migration_name, 'migration.sql');
    let fileChecksum: string | null = null;

    try {
      fileChecksum = await sha256File(migrationFile);
    } catch {
      audits.push({
        migrationName: row.migration_name,
        dbChecksum: row.checksum,
        fileChecksum: null,
        status: 'MISSING_FILE',
      });
      continue;
    }

    audits.push({
      migrationName: row.migration_name,
      dbChecksum: row.checksum,
      fileChecksum,
      status: fileChecksum === row.checksum ? 'MATCH' : 'CHECKSUM_MISMATCH',
    });
  }

  const mismatches = audits.filter((item) => item.status !== 'MATCH');

  const summary = {
    totalAppliedMigrations: audits.length,
    matched: audits.filter((item) => item.status === 'MATCH').length,
    mismatched: mismatches.length,
    rows: audits,
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);

  if (mismatches.length > 0) {
    process.exitCode = 1;
  }
};

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[prisma-migration-checksum-audit] fatal: ${message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
