import path from 'node:path';

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const repoRoot = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.join(repoRoot, '.env') });

const prisma = new PrismaClient();

const expectedTables = [
  'academic_sessions',
  'terms',
  'academic_classes',
  'student_enrolments',
  'academic_class_teacher_assignments',
];

const expectedIndexes = [
  'academic_sessions_one_current_active_per_school_idx',
  'terms_one_current_active_per_school_idx',
  'student_enrolments_active_unique_idx',
  'class_teacher_assignments_active_scoped_unique_idx',
  'class_teacher_assignments_active_global_unique_idx',
  'students_school_id_student_number_key',
];

const expectedConstraints = [
  'academic_sessions_date_range_chk',
  'terms_date_range_chk',
  'terms_sequence_order_chk',
  'academic_classes_age_range_chk',
  'student_enrolments_completion_date_chk',
  'student_enrolments_withdrawal_date_chk',
  'student_enrolments_transfer_date_chk',
  'academic_class_teacher_assignments_date_range_chk',
  'student_enrolments_student_id_school_id_fkey',
  'student_enrolments_academic_session_id_school_id_fkey',
  'student_enrolments_academic_class_id_school_id_fkey',
  'academic_class_teacher_assignments_user_id_school_id_fkey',
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

  const tableSet = new Set(tableRows.map((r) => r.table_name));
  const indexSet = new Set(indexRows.map((r) => r.indexname));
  const constraintSet = new Set(constraintRows.map((r) => r.conname));

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
    console.error(`[academic-db-verify] fatal: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
