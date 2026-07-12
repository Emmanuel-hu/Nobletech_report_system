import path from 'node:path';

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const repoRoot = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.join(repoRoot, '.env') });

const prisma = new PrismaClient();

const expectedTables = [
  'schools',
  'users',
  'roles',
  'permissions',
  'role_permissions',
  'user_roles',
  'students',
  'guardians',
  'student_guardians',
  'audit_logs',
];

const expectedIndexes = [
  'roles_global_role_code_active_key',
  'user_roles_active_scoped_unique_idx',
  'user_roles_active_global_unique_idx',
  'audit_logs_request_id_idx',
];

const run = async (): Promise<void> => {
  const extensionRows = await prisma.$queryRaw<Array<{ extname: string }>>`
    SELECT extname FROM pg_extension WHERE extname = 'citext'
  `;

  const tableRows = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = ANY(${expectedTables})
    ORDER BY table_name
  `;

  const indexRows = await prisma.$queryRaw<Array<{ indexname: string }>>`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = ANY(${expectedIndexes})
    ORDER BY indexname
  `;

  const tableSet = new Set(tableRows.map((r) => r.table_name));
  const indexSet = new Set(indexRows.map((r) => r.indexname));

  const missingTables = expectedTables.filter((name) => !tableSet.has(name));
  const missingIndexes = expectedIndexes.filter((name) => !indexSet.has(name));

  const summary = {
    citextEnabled: extensionRows.length > 0,
    missingTables,
    missingIndexes,
    allExpectedTablesPresent: missingTables.length === 0,
    allExpectedIndexesPresent: missingIndexes.length === 0,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (!summary.citextEnabled || !summary.allExpectedTablesPresent || !summary.allExpectedIndexesPresent) {
    process.exitCode = 1;
  }
};

run()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[foundation-db-verify] fatal: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
