import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const expectedTables = ['curriculum_source_files'];

const expectedColumns = [
  'curriculum_source_file_id',
  'curriculum_source_id',
  'school_id',
  'storage_provider',
  'storage_key',
  'original_file_name',
  'safe_file_name',
  'file_extension',
  'mime_type',
  'file_size',
  'checksum',
  'checksum_algorithm',
  'file_category',
  'upload_status',
  'scan_status',
  'scan_details',
  'metadata',
  'document_version',
  'effective_date',
  'superseded_file_id',
  'sequence_order',
  'is_primary',
  'is_active',
  'status',
  'uploaded_by_id',
  'uploaded_at',
  'verified_at',
  'archived_at',
  'archived_by_id',
  'unlinked_at',
  'unlinked_by_id',
  'deleted_at',
  'deleted_by_id',
  'created_at',
  'updated_at',
];

const expectedIndexes = [
  'curriculum_source_files_curriculum_source_id_sequence_order_key',
  'curriculum_source_files_curriculum_source_id_status_sequence_order_idx',
  'curriculum_source_files_school_id_status_idx',
  'curriculum_source_files_storage_key_idx',
  'curriculum_source_files_scan_status_status_idx',
  'curriculum_source_files_upload_status_status_idx',
  'curriculum_source_files_superseded_file_id_idx',
];

const expectedConstraints = [
  'curriculum_source_files_pkey',
  'curriculum_source_files_curriculum_source_id_fkey',
  'curriculum_source_files_superseded_file_id_fkey',
];

const main = async (): Promise<void> => {
  const tableRows = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = ANY(${expectedTables})
  `;

  const columnRows = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'curriculum_source_files'
    ORDER BY ordinal_position
  `;

  const indexRows = await prisma.$queryRaw<Array<{ indexname: string }>>`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'curriculum_source_files'
  `;

  const constraintRows = await prisma.$queryRaw<Array<{ conname: string }>>`
    SELECT conname
    FROM pg_constraint
    WHERE conname = ANY(${expectedConstraints})
  `;

  const tableSet = new Set(tableRows.map((row) => row.table_name));
  const columnSet = new Set(columnRows.map((row) => row.column_name));
  const indexSet = new Set(indexRows.map((row) => row.indexname));
  const constraintSet = new Set(constraintRows.map((row) => row.conname));

  const missingTables = expectedTables.filter((name) => !tableSet.has(name));
  const missingColumns = expectedColumns.filter((name) => !columnSet.has(name));
  const missingIndexes = expectedIndexes.filter((name) => !indexSet.has(name));
  const missingConstraints = expectedConstraints.filter((name) => !constraintSet.has(name));

  const summary = {
    missingTables,
    missingColumns,
    missingIndexes,
    missingConstraints,
    allExpectedTablesPresent: missingTables.length === 0,
    allExpectedColumnsPresent: missingColumns.length === 0,
    allExpectedIndexesPresent: missingIndexes.length === 0,
    allExpectedConstraintsPresent: missingConstraints.length === 0,
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);

  if (
    !summary.allExpectedTablesPresent ||
    !summary.allExpectedColumnsPresent ||
    !summary.allExpectedIndexesPresent ||
    !summary.allExpectedConstraintsPresent
  ) {
    process.exitCode = 1;
  }
};

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[phase2l-source-file-db-verify] fatal: ${message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
