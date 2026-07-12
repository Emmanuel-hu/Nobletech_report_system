import path from 'node:path';

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const repoRoot = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.join(repoRoot, '.env') });

const prisma = new PrismaClient();

const expectedTables = [
  'subjects',
  'school_subjects',
  'integration_domains',
  'subject_integration_domains',
  'programme_components',
  'programme_component_subjects',
  'programme_component_integration_domains',
  'school_programme_components',
  'term_programme_components',
  'class_programme_components',
  'programme_component_settings',
  'programme_component_status_history',
];

const expectedIndexes = [
  'subjects_subject_code_key',
  'integration_domains_domain_code_key',
  'programme_components_component_code_key',
  'school_subjects_one_active_per_school_subject_idx',
  'school_subjects_local_code_active_unique_idx',
  'school_programme_components_one_active_per_school_component_idx',
  'school_programme_components_local_code_active_unique_idx',
  'term_programme_components_active_unique_idx',
  'class_programme_components_active_scoped_unique_idx',
  'class_programme_components_active_global_unique_idx',
];

const expectedConstraints = [
  'school_subjects_date_range_chk',
  'school_programme_components_date_range_chk',
  'school_programme_components_frequency_chk',
  'school_programme_components_duration_chk',
  'term_programme_components_date_range_chk',
  'term_programme_components_frequency_chk',
  'term_programme_components_duration_chk',
  'class_programme_components_frequency_chk',
  'class_programme_components_duration_chk',
  'term_programme_components_term_id_school_id_fkey',
  'term_programme_components_school_programme_component_id_sc_fkey',
  'class_programme_components_academic_class_id_school_id_fkey',
  'class_programme_components_academic_session_id_school_id_fkey',
  'class_programme_components_school_programme_component_id_s_fkey',
  'programme_component_settings_school_programme_component_id_fkey',
];

const run = async (): Promise<void> => {
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

  const constraintRows = await prisma.$queryRaw<Array<{ conname: string }>>`
    SELECT conname
    FROM pg_constraint
    WHERE conname = ANY(${expectedConstraints})
    ORDER BY conname
  `;

  const tableSet = new Set(tableRows.map((row) => row.table_name));
  const indexSet = new Set(indexRows.map((row) => row.indexname));
  const constraintSet = new Set(constraintRows.map((row) => row.conname));

  const missingTables = expectedTables.filter((name) => !tableSet.has(name));
  const missingIndexes = expectedIndexes.filter((name) => !indexSet.has(name));
  const missingConstraints = expectedConstraints.filter((name) => !constraintSet.has(name));

  const summary = {
    missingTables,
    missingIndexes,
    missingConstraints,
    allExpectedTablesPresent: missingTables.length === 0,
    allExpectedIndexesPresent: missingIndexes.length === 0,
    allExpectedConstraintsPresent: missingConstraints.length === 0,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (!summary.allExpectedTablesPresent || !summary.allExpectedIndexesPresent || !summary.allExpectedConstraintsPresent) {
    process.exitCode = 1;
  }
};

run()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[programme-component-db-verify] fatal: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
