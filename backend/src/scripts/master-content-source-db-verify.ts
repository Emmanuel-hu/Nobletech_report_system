import path from 'node:path';

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const repoRoot = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.join(repoRoot, '.env') });

const prisma = new PrismaClient();

const expectedTables = [
  'curriculum_sources',
  'curriculum_source_contents',
  'master_curriculum_units',
  'master_topics',
  'master_concepts',
  'master_skills',
  'master_learning_outcomes',
  'master_activities',
  'master_projects',
  'master_project_implementations',
  'master_resources',
  'master_assessment_templates',
  'master_rubrics',
  'master_rubric_criteria',
  'master_rubric_levels',
  'master_curriculum_unit_subjects',
  'master_curriculum_unit_integration_domains',
  'master_curriculum_unit_programme_components',
  'master_topic_subjects',
  'master_topic_integration_domains',
  'master_topic_concepts',
  'master_topic_skills',
  'master_topic_learning_outcomes',
  'master_topic_activities',
  'master_topic_projects',
  'master_activity_resources',
  'master_project_resources',
  'master_project_skills',
  'master_project_learning_outcomes',
  'master_assessment_template_learning_outcomes',
  'curriculum_source_master_content_links',
];

const expectedIndexes = [
  'curriculum_sources_global_source_code_active_unique_idx',
  'curriculum_sources_school_source_code_active_unique_idx',
  'master_curriculum_units_global_code_active_unique_idx',
  'master_curriculum_units_school_code_active_unique_idx',
  'master_concepts_global_code_active_unique_idx',
  'master_concepts_school_code_active_unique_idx',
  'curriculum_source_master_content_links_unit_unique_idx',
  'curriculum_source_master_content_links_topic_unique_idx',
  'curriculum_source_master_content_links_concept_unique_idx',
  'curriculum_source_master_content_links_skill_unique_idx',
  'curriculum_source_master_content_links_outcome_unique_idx',
  'curriculum_source_master_content_links_project_unique_idx',
  'curriculum_source_master_content_links_impl_unique_idx',
  'curriculum_source_master_content_links_resource_unique_idx',
  'curriculum_source_master_content_links_assessment_unique_idx',
  'curriculum_source_master_content_links_rubric_unique_idx',
];

const expectedConstraints = [
  'curriculum_source_contents_sequence_positive_chk',
  'curriculum_source_contents_confidence_range_chk',
  'curriculum_sources_source_type_scope_chk',
  'curriculum_sources_approval_inactive_archive_chk',
  'master_curriculum_units_approval_inactive_archive_chk',
  'master_topics_approval_inactive_archive_chk',
  'master_concepts_approval_inactive_archive_chk',
  'master_skills_approval_inactive_archive_chk',
  'master_learning_outcomes_approval_inactive_archive_chk',
  'master_projects_approval_inactive_archive_chk',
  'master_resources_approval_inactive_archive_chk',
  'master_assessment_templates_approval_inactive_archive_chk',
  'master_rubrics_approval_inactive_archive_chk',
  'curriculum_source_master_content_links_single_target_chk',
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
    console.error(`[master-content-source-db-verify] fatal: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
