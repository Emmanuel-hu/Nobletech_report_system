import { env } from '../config/env';
import { prisma } from '../config/prisma';

const expectedTables = ['curriculum_source_processing_sessions', 'curriculum_source_sections'];

const expectedSessionColumns = [
  'processing_session_id',
  'school_id',
  'curriculum_source_id',
  'curriculum_source_file_id',
  'source_file_version',
  'status',
  'processing_method',
  'started_by_id',
  'assigned_reviewer_id',
  'started_at',
  'submitted_at',
  'reviewed_at',
  'approved_at',
  'completed_at',
  'archived_at',
  'revision_number',
  'last_known_source_checksum',
  'notes',
  'metadata',
  'revision_reason',
  'archive_reason',
  'previous_session_id',
  'created_at',
  'updated_at',
];

const expectedSectionColumns = [
  'source_section_id',
  'processing_session_id',
  'parent_section_id',
  'section_type',
  'heading',
  'raw_text',
  'structured_data',
  'page_start',
  'page_end',
  'source_section_reference',
  'sequence_order',
  'review_status',
  'review_note',
  'created_by_id',
  'updated_by_id',
  'created_at',
  'updated_at',
  'archived_at',
];

const expectedContentColumns = [
  'review_status',
  'created_by_id',
  'processing_session_id',
  'section_id',
  'source_file_id',
  'source_file_version',
  'source_file_checksum',
  'adaptation_note',
  'archived_at',
];

const expectedIndexes = [
  'curriculum_source_processing_sessions_curriculum_source_id_revision_number_key',
  'curriculum_source_processing_sessions_school_id_status_idx',
  'curriculum_source_processing_sessions_curriculum_source_id_status_revision_number_idx',
  'curriculum_source_processing_sessions_curriculum_source_file_id_status_idx',
  'curriculum_source_processing_sessions_assigned_reviewer_id_status_idx',
  'curriculum_source_processing_sessions_previous_session_id_idx',
  'curriculum_source_sections_processing_session_id_parent_section_id_sequence_order_key',
  'curriculum_source_sections_processing_session_id_section_type_idx',
  'curriculum_source_sections_processing_session_id_review_status_idx',
  'curriculum_source_sections_parent_section_id_idx',
  'curriculum_source_sections_page_start_page_end_idx',
  'curriculum_source_contents_processing_session_id_review_status_idx',
  'curriculum_source_contents_section_id_idx',
  'curriculum_source_contents_source_file_id_idx',
];

const expectedConstraints = [
  'curriculum_source_processing_sessions_pkey',
  'curriculum_source_sections_pkey',
  'curriculum_source_processing_sessions_curriculum_source_id_fkey',
  'curriculum_source_processing_sessions_curriculum_source_file_id_fkey',
  'curriculum_source_processing_sessions_started_by_id_fkey',
  'curriculum_source_sections_processing_session_id_fkey',
  'curriculum_source_sections_parent_section_id_fkey',
  'curriculum_source_sections_created_by_id_fkey',
  'curriculum_source_contents_processing_session_id_fkey',
  'curriculum_source_contents_section_id_fkey',
  'curriculum_source_contents_source_file_id_fkey',
];

const normalizePostgresIdentifier = (identifier: string): string => {
  return identifier.length > 63 ? identifier.slice(0, 63) : identifier;
};

const collectColumnNames = async (tableName: string): Promise<Set<string>> => {
  const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${tableName}
    ORDER BY ordinal_position
  `;

  return new Set(rows.map((row) => row.column_name));
};

const main = async (): Promise<void> => {
  void env;

  const tableRows = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = ANY(${expectedTables})
  `;

  const indexRows = await prisma.$queryRaw<Array<{ indexname: string }>>`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = ANY(${['curriculum_source_processing_sessions', 'curriculum_source_sections', 'curriculum_source_contents']})
  `;

  const constraintRows = await prisma.$queryRaw<Array<{ conname: string }>>`
    SELECT conname
    FROM pg_constraint
    WHERE conrelid::regclass::text = ANY(${[
      'curriculum_source_processing_sessions',
      'curriculum_source_sections',
      'curriculum_source_contents',
    ]})
  `;

  const tableSet = new Set(tableRows.map((row) => row.table_name));
  const indexSet = new Set(indexRows.map((row) => row.indexname));
  const constraintSet = new Set(constraintRows.map((row) => row.conname));

  const sessionColumns = await collectColumnNames('curriculum_source_processing_sessions');
  const sectionColumns = await collectColumnNames('curriculum_source_sections');
  const contentColumns = await collectColumnNames('curriculum_source_contents');

  const missingTables = expectedTables.filter((name) => !tableSet.has(name));
  const missingSessionColumns = expectedSessionColumns.filter((name) => !sessionColumns.has(name));
  const missingSectionColumns = expectedSectionColumns.filter((name) => !sectionColumns.has(name));
  const missingContentColumns = expectedContentColumns.filter((name) => !contentColumns.has(name));

  const missingIndexes = expectedIndexes.map(normalizePostgresIdentifier).filter((name) => !indexSet.has(name));
  const missingConstraints = expectedConstraints
    .map(normalizePostgresIdentifier)
    .filter((name) => !constraintSet.has(name));

  const summary = {
    missingTables,
    missingSessionColumns,
    missingSectionColumns,
    missingContentColumns,
    missingIndexes,
    missingConstraints,
    allExpectedTablesPresent: missingTables.length === 0,
    allExpectedSessionColumnsPresent: missingSessionColumns.length === 0,
    allExpectedSectionColumnsPresent: missingSectionColumns.length === 0,
    allExpectedContentColumnsPresent: missingContentColumns.length === 0,
    allExpectedIndexesPresent: missingIndexes.length === 0,
    allExpectedConstraintsPresent: missingConstraints.length === 0,
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);

  if (
    !summary.allExpectedTablesPresent ||
    !summary.allExpectedSessionColumnsPresent ||
    !summary.allExpectedSectionColumnsPresent ||
    !summary.allExpectedContentColumnsPresent ||
    !summary.allExpectedIndexesPresent ||
    !summary.allExpectedConstraintsPresent
  ) {
    process.exitCode = 1;
  }
};

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[phase2m-source-processing-db-verify] fatal: ${message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
