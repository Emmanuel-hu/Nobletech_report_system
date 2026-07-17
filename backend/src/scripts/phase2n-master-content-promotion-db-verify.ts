import { env } from '../config/env';
import { prisma } from '../config/prisma';

void env;

const expectedTables = ['master_content_promotions', 'master_content_promotion_items'];

const expectedPromotionColumns = [
  'master_content_promotion_id',
  'school_id',
  'curriculum_source_id',
  'processing_session_id',
  'curriculum_source_file_id',
  'status',
  'requested_by_id',
  'reviewer_id',
  'approved_by_id',
  'completed_by_id',
  'archived_by_id',
  'requested_at',
  'submitted_at',
  'reviewed_at',
  'approved_at',
  'completed_at',
  'archived_at',
  'source_checksum',
  'source_revision_number',
  'duplicate_decision',
  'adaptation_note',
  'review_note',
  'metadata',
  'created_at',
  'updated_at',
];

const expectedItemColumns = [
  'master_content_promotion_item_id',
  'promotion_id',
  'source_content_id',
  'source_section_id',
  'source_record_type',
  'target_master_content_type',
  'action',
  'status',
  'sequence_order',
  'mapped_fields',
  'transformation_data',
  'duplicate_candidates',
  'duplicate_decision',
  'source_page_start',
  'source_page_end',
  'source_section_reference',
  'source_file_version',
  'source_file_checksum',
  'processing_revision_number',
  'adaptation_note',
  'attribution',
  'master_curriculum_unit_id',
  'master_topic_id',
  'master_concept_id',
  'master_skill_id',
  'master_learning_outcome_id',
  'master_activity_id',
  'master_project_id',
  'master_project_implementation_id',
  'master_resource_id',
  'master_assessment_template_id',
  'created_by_id',
  'updated_by_id',
  'created_at',
  'updated_at',
  'archived_at',
];

const expectedIndexes = [
  'master_content_promotions_school_id_status_idx',
  'master_content_promotions_processing_session_id_status_idx',
  'master_content_promotions_curriculum_source_id_created_at_idx',
  'master_content_promotion_items_promotion_id_status_idx',
  'master_content_promotion_items_source_content_id_idx',
  'master_content_promotion_items_target_master_content_type_action_idx',
  'master_content_promotion_items_promotion_id_source_content_id_key',
  'master_content_promotion_items_promotion_id_sequence_order_key',
];

const normalizeIdentifier = (value: string): string => (value.length > 63 ? value.slice(0, 63) : value);

const collectColumns = async (tableName: string): Promise<Set<string>> => {
  const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${tableName}
    ORDER BY ordinal_position
  `;

  return new Set(rows.map((item) => item.column_name));
};

const main = async (): Promise<void> => {
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
      AND tablename = ANY(${expectedTables})
  `;

  const tableSet = new Set(tableRows.map((item) => item.table_name));
  const indexSet = new Set(indexRows.map((item) => item.indexname));

  const promotionColumns = await collectColumns('master_content_promotions');
  const itemColumns = await collectColumns('master_content_promotion_items');

  const missingTables = expectedTables.filter((table) => !tableSet.has(table));
  const missingPromotionColumns = expectedPromotionColumns.filter((column) => !promotionColumns.has(column));
  const missingItemColumns = expectedItemColumns.filter((column) => !itemColumns.has(column));
  const missingIndexes = expectedIndexes.map(normalizeIdentifier).filter((index) => !indexSet.has(index));

  const summary = {
    missingTables,
    missingPromotionColumns,
    missingItemColumns,
    missingIndexes,
    allExpectedTablesPresent: missingTables.length === 0,
    allExpectedPromotionColumnsPresent: missingPromotionColumns.length === 0,
    allExpectedItemColumnsPresent: missingItemColumns.length === 0,
    allExpectedIndexesPresent: missingIndexes.length === 0,
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);

  if (
    !summary.allExpectedTablesPresent ||
    !summary.allExpectedPromotionColumnsPresent ||
    !summary.allExpectedItemColumnsPresent ||
    !summary.allExpectedIndexesPresent
  ) {
    process.exitCode = 1;
  }
};

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[phase2n-master-content-promotion-db-verify] fatal: ${message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });