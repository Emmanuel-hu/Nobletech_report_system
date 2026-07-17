-- CreateEnum
CREATE TYPE "MasterContentPromotionStatus" AS ENUM ('DRAFT', 'READY_FOR_REVIEW', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'APPROVED', 'REJECTED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MasterContentPromotionRecordType" AS ENUM ('UNIT', 'TOPIC', 'CONCEPT', 'SKILL', 'LEARNING_OUTCOME', 'ACTIVITY', 'PROJECT', 'PROJECT_IMPLEMENTATION', 'RESOURCE', 'ASSESSMENT_REFERENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "MasterContentPromotionTargetType" AS ENUM ('CURRICULUM_UNIT', 'TOPIC', 'CONCEPT', 'SKILL', 'LEARNING_OUTCOME', 'ACTIVITY', 'PROJECT', 'PROJECT_IMPLEMENTATION', 'RESOURCE', 'ASSESSMENT_TEMPLATE');

-- CreateEnum
CREATE TYPE "MasterContentPromotionAction" AS ENUM ('CREATE_DRAFT', 'LINK_EXISTING', 'SKIP', 'MARK_DUPLICATE', 'ADAPT');

-- CreateEnum
CREATE TYPE "MasterContentPromotionDuplicateDecision" AS ENUM ('CREATE_NEW', 'LINK_EXISTING', 'REVISE_MAPPING', 'SKIP', 'MARK_DUPLICATE');

-- DropForeignKey
ALTER TABLE "curriculum_source_contents" DROP CONSTRAINT "curriculum_source_contents_reviewed_by_id_fkey";

-- DropForeignKey
ALTER TABLE "curriculum_source_master_content_links" DROP CONSTRAINT "curriculum_source_master_content_links_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "curriculum_sources" DROP CONSTRAINT "curriculum_sources_approved_by_id_fkey";

-- DropForeignKey
ALTER TABLE "curriculum_sources" DROP CONSTRAINT "curriculum_sources_integration_domain_id_fkey";

-- DropForeignKey
ALTER TABLE "curriculum_sources" DROP CONSTRAINT "curriculum_sources_programme_component_id_fkey";

-- DropForeignKey
ALTER TABLE "curriculum_sources" DROP CONSTRAINT "curriculum_sources_reviewed_by_id_fkey";

-- DropForeignKey
ALTER TABLE "curriculum_sources" DROP CONSTRAINT "curriculum_sources_school_id_fkey";

-- DropForeignKey
ALTER TABLE "curriculum_sources" DROP CONSTRAINT "curriculum_sources_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "curriculum_sources" DROP CONSTRAINT "curriculum_sources_uploaded_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_activities" DROP CONSTRAINT "master_activities_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_activities" DROP CONSTRAINT "master_activities_school_id_fkey";

-- DropForeignKey
ALTER TABLE "master_activity_resources" DROP CONSTRAINT "master_activity_resources_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_assessment_template_learning_outcomes" DROP CONSTRAINT "master_assessment_template_learning_outcomes_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_assessment_template_rubrics" DROP CONSTRAINT "master_assessment_template_rubrics_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_assessment_templates" DROP CONSTRAINT "master_assessment_templates_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_assessment_templates" DROP CONSTRAINT "master_assessment_templates_school_id_fkey";

-- DropForeignKey
ALTER TABLE "master_concepts" DROP CONSTRAINT "master_concepts_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_concepts" DROP CONSTRAINT "master_concepts_school_id_fkey";

-- DropForeignKey
ALTER TABLE "master_curriculum_unit_integration_domains" DROP CONSTRAINT "master_curriculum_unit_integration_domains_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_curriculum_unit_integration_domains" DROP CONSTRAINT "master_curriculum_unit_integration_domains_domain_id_fkey";

-- DropForeignKey
ALTER TABLE "master_curriculum_unit_programme_components" DROP CONSTRAINT "master_curriculum_unit_programme_components_component_id_fkey";

-- DropForeignKey
ALTER TABLE "master_curriculum_unit_programme_components" DROP CONSTRAINT "master_curriculum_unit_programme_components_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_curriculum_unit_subjects" DROP CONSTRAINT "master_curriculum_unit_subjects_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_curriculum_unit_subjects" DROP CONSTRAINT "master_curriculum_unit_subjects_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "master_curriculum_units" DROP CONSTRAINT "master_curriculum_units_approved_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_curriculum_units" DROP CONSTRAINT "master_curriculum_units_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_curriculum_units" DROP CONSTRAINT "master_curriculum_units_programme_component_id_fkey";

-- DropForeignKey
ALTER TABLE "master_curriculum_units" DROP CONSTRAINT "master_curriculum_units_reviewed_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_curriculum_units" DROP CONSTRAINT "master_curriculum_units_school_id_fkey";

-- DropForeignKey
ALTER TABLE "master_learning_outcomes" DROP CONSTRAINT "master_learning_outcomes_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_learning_outcomes" DROP CONSTRAINT "master_learning_outcomes_school_id_fkey";

-- DropForeignKey
ALTER TABLE "master_project_implementations" DROP CONSTRAINT "master_project_implementations_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_project_implementations" DROP CONSTRAINT "master_project_implementations_school_id_fkey";

-- DropForeignKey
ALTER TABLE "master_project_learning_outcomes" DROP CONSTRAINT "master_project_learning_outcomes_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_project_resources" DROP CONSTRAINT "master_project_resources_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_project_skills" DROP CONSTRAINT "master_project_skills_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_projects" DROP CONSTRAINT "master_projects_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_projects" DROP CONSTRAINT "master_projects_school_id_fkey";

-- DropForeignKey
ALTER TABLE "master_resources" DROP CONSTRAINT "master_resources_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_resources" DROP CONSTRAINT "master_resources_school_id_fkey";

-- DropForeignKey
ALTER TABLE "master_rubrics" DROP CONSTRAINT "master_rubrics_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_rubrics" DROP CONSTRAINT "master_rubrics_school_id_fkey";

-- DropForeignKey
ALTER TABLE "master_skills" DROP CONSTRAINT "master_skills_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_skills" DROP CONSTRAINT "master_skills_school_id_fkey";

-- DropForeignKey
ALTER TABLE "master_topic_activities" DROP CONSTRAINT "master_topic_activities_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_topic_concepts" DROP CONSTRAINT "master_topic_concepts_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_topic_integration_domains" DROP CONSTRAINT "master_topic_integration_domains_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_topic_integration_domains" DROP CONSTRAINT "master_topic_integration_domains_domain_id_fkey";

-- DropForeignKey
ALTER TABLE "master_topic_learning_outcomes" DROP CONSTRAINT "master_topic_learning_outcomes_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_topic_projects" DROP CONSTRAINT "master_topic_projects_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_topic_skills" DROP CONSTRAINT "master_topic_skills_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_topic_subjects" DROP CONSTRAINT "master_topic_subjects_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_topic_subjects" DROP CONSTRAINT "master_topic_subjects_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "master_topics" DROP CONSTRAINT "master_topics_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "master_topics" DROP CONSTRAINT "master_topics_school_id_fkey";

-- DropIndex
DROP INDEX "curriculum_sources_global_vs_school_lookup_idx";

-- DropIndex
DROP INDEX "master_curriculum_units_archive_filter_idx";

-- DropIndex
DROP INDEX "master_resources_verification_filter_idx";

-- AlterTable
ALTER TABLE "curriculum_source_files" ALTER COLUMN "file_extension" DROP DEFAULT;

-- CreateTable
CREATE TABLE "master_content_promotions" (
    "master_content_promotion_id" UUID NOT NULL,
    "school_id" UUID,
    "curriculum_source_id" UUID NOT NULL,
    "processing_session_id" UUID NOT NULL,
    "curriculum_source_file_id" UUID NOT NULL,
    "status" "MasterContentPromotionStatus" NOT NULL DEFAULT 'DRAFT',
    "requested_by_id" UUID NOT NULL,
    "reviewer_id" UUID,
    "approved_by_id" UUID,
    "completed_by_id" UUID,
    "archived_by_id" UUID,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "source_checksum" VARCHAR(128) NOT NULL,
    "source_revision_number" INTEGER NOT NULL,
    "duplicate_decision" "MasterContentPromotionDuplicateDecision",
    "adaptation_note" TEXT,
    "review_note" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_content_promotions_pkey" PRIMARY KEY ("master_content_promotion_id")
);

-- CreateTable
CREATE TABLE "master_content_promotion_items" (
    "master_content_promotion_item_id" UUID NOT NULL,
    "promotion_id" UUID NOT NULL,
    "source_content_id" UUID NOT NULL,
    "source_section_id" UUID,
    "source_record_type" "MasterContentPromotionRecordType" NOT NULL,
    "target_master_content_type" "MasterContentPromotionTargetType" NOT NULL,
    "action" "MasterContentPromotionAction" NOT NULL DEFAULT 'CREATE_DRAFT',
    "status" "MasterContentPromotionStatus" NOT NULL DEFAULT 'DRAFT',
    "sequence_order" INTEGER NOT NULL,
    "mapped_fields" JSONB,
    "transformation_data" JSONB,
    "duplicate_candidates" JSONB,
    "duplicate_decision" "MasterContentPromotionDuplicateDecision",
    "source_page_start" INTEGER,
    "source_page_end" INTEGER,
    "source_section_reference" VARCHAR(150),
    "source_file_version" VARCHAR(50),
    "source_file_checksum" VARCHAR(128),
    "processing_revision_number" INTEGER NOT NULL,
    "adaptation_note" TEXT,
    "attribution" TEXT,
    "master_curriculum_unit_id" UUID,
    "master_topic_id" UUID,
    "master_concept_id" UUID,
    "master_skill_id" UUID,
    "master_learning_outcome_id" UUID,
    "master_activity_id" UUID,
    "master_project_id" UUID,
    "master_project_implementation_id" UUID,
    "master_resource_id" UUID,
    "master_assessment_template_id" UUID,
    "created_by_id" UUID NOT NULL,
    "updated_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "master_content_promotion_items_pkey" PRIMARY KEY ("master_content_promotion_item_id")
);

-- CreateIndex
CREATE INDEX "master_content_promotions_school_id_status_idx" ON "master_content_promotions"("school_id", "status");

-- CreateIndex
CREATE INDEX "master_content_promotions_processing_session_id_status_idx" ON "master_content_promotions"("processing_session_id", "status");

-- CreateIndex
CREATE INDEX "master_content_promotions_curriculum_source_id_created_at_idx" ON "master_content_promotions"("curriculum_source_id", "created_at");

-- CreateIndex
CREATE INDEX "master_content_promotion_items_promotion_id_status_idx" ON "master_content_promotion_items"("promotion_id", "status");

-- CreateIndex
CREATE INDEX "master_content_promotion_items_source_content_id_idx" ON "master_content_promotion_items"("source_content_id");

-- CreateIndex
CREATE INDEX "master_content_promotion_items_target_master_content_type_a_idx" ON "master_content_promotion_items"("target_master_content_type", "action");

-- CreateIndex
CREATE UNIQUE INDEX "master_content_promotion_items_promotion_id_source_content__key" ON "master_content_promotion_items"("promotion_id", "source_content_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_content_promotion_items_promotion_id_sequence_order_key" ON "master_content_promotion_items"("promotion_id", "sequence_order");

-- RenameForeignKey
ALTER TABLE "curriculum_source_processing_sessions" RENAME CONSTRAINT "curriculum_source_processing_sessions_curriculum_source_file_id" TO "curriculum_source_processing_sessions_curriculum_source_fi_fkey";

-- RenameForeignKey
ALTER TABLE "master_assessment_template_rubrics" RENAME CONSTRAINT "master_assessment_template_rubrics_master_assessment_template_i" TO "master_assessment_template_rubrics_master_assessment_templ_fkey";

-- AddForeignKey
ALTER TABLE "master_content_promotions" ADD CONSTRAINT "master_content_promotions_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotions" ADD CONSTRAINT "master_content_promotions_curriculum_source_id_fkey" FOREIGN KEY ("curriculum_source_id") REFERENCES "curriculum_sources"("curriculum_source_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotions" ADD CONSTRAINT "master_content_promotions_processing_session_id_fkey" FOREIGN KEY ("processing_session_id") REFERENCES "curriculum_source_processing_sessions"("processing_session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotions" ADD CONSTRAINT "master_content_promotions_curriculum_source_file_id_fkey" FOREIGN KEY ("curriculum_source_file_id") REFERENCES "curriculum_source_files"("curriculum_source_file_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotions" ADD CONSTRAINT "master_content_promotions_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotions" ADD CONSTRAINT "master_content_promotions_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotions" ADD CONSTRAINT "master_content_promotions_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotions" ADD CONSTRAINT "master_content_promotions_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotions" ADD CONSTRAINT "master_content_promotions_archived_by_id_fkey" FOREIGN KEY ("archived_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotion_items" ADD CONSTRAINT "master_content_promotion_items_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "master_content_promotions"("master_content_promotion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotion_items" ADD CONSTRAINT "master_content_promotion_items_source_content_id_fkey" FOREIGN KEY ("source_content_id") REFERENCES "curriculum_source_contents"("curriculum_source_content_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotion_items" ADD CONSTRAINT "master_content_promotion_items_source_section_id_fkey" FOREIGN KEY ("source_section_id") REFERENCES "curriculum_source_sections"("source_section_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotion_items" ADD CONSTRAINT "master_content_promotion_items_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotion_items" ADD CONSTRAINT "master_content_promotion_items_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotion_items" ADD CONSTRAINT "master_content_promotion_items_master_curriculum_unit_id_fkey" FOREIGN KEY ("master_curriculum_unit_id") REFERENCES "master_curriculum_units"("master_curriculum_unit_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotion_items" ADD CONSTRAINT "master_content_promotion_items_master_topic_id_fkey" FOREIGN KEY ("master_topic_id") REFERENCES "master_topics"("master_topic_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotion_items" ADD CONSTRAINT "master_content_promotion_items_master_concept_id_fkey" FOREIGN KEY ("master_concept_id") REFERENCES "master_concepts"("master_concept_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotion_items" ADD CONSTRAINT "master_content_promotion_items_master_skill_id_fkey" FOREIGN KEY ("master_skill_id") REFERENCES "master_skills"("master_skill_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotion_items" ADD CONSTRAINT "master_content_promotion_items_master_learning_outcome_id_fkey" FOREIGN KEY ("master_learning_outcome_id") REFERENCES "master_learning_outcomes"("master_learning_outcome_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotion_items" ADD CONSTRAINT "master_content_promotion_items_master_activity_id_fkey" FOREIGN KEY ("master_activity_id") REFERENCES "master_activities"("master_activity_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotion_items" ADD CONSTRAINT "master_content_promotion_items_master_project_id_fkey" FOREIGN KEY ("master_project_id") REFERENCES "master_projects"("master_project_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotion_items" ADD CONSTRAINT "master_content_promotion_items_master_project_implementati_fkey" FOREIGN KEY ("master_project_implementation_id") REFERENCES "master_project_implementations"("master_project_implementation_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotion_items" ADD CONSTRAINT "master_content_promotion_items_master_resource_id_fkey" FOREIGN KEY ("master_resource_id") REFERENCES "master_resources"("master_resource_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_content_promotion_items" ADD CONSTRAINT "master_content_promotion_items_master_assessment_template__fkey" FOREIGN KEY ("master_assessment_template_id") REFERENCES "master_assessment_templates"("master_assessment_template_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "curriculum_source_contents_processing_session_id_review_status_" RENAME TO "curriculum_source_contents_processing_session_id_review_sta_idx";

-- RenameIndex
ALTER INDEX "curriculum_source_files_curriculum_source_id_status_sequence_or" RENAME TO "curriculum_source_files_curriculum_source_id_status_sequenc_idx";

-- RenameIndex
ALTER INDEX "curriculum_source_processing_sessions_assigned_reviewer_id_stat" RENAME TO "curriculum_source_processing_sessions_assigned_reviewer_id__idx";

-- RenameIndex
ALTER INDEX "curriculum_source_processing_sessions_curriculum_source_file_id" RENAME TO "curriculum_source_processing_sessions_curriculum_source_fil_idx";

-- RenameIndex
ALTER INDEX "curriculum_source_processing_sessions_curriculum_source_id_revi" RENAME TO "curriculum_source_processing_sessions_curriculum_source_id__key";

-- RenameIndex
ALTER INDEX "curriculum_source_processing_sessions_curriculum_source_id_stat" RENAME TO "curriculum_source_processing_sessions_curriculum_source_id__idx";

-- RenameIndex
ALTER INDEX "curriculum_source_sections_processing_session_id_parent_section" RENAME TO "curriculum_source_sections_processing_session_id_parent_sec_key";

-- RenameIndex
ALTER INDEX "curriculum_source_sections_processing_session_id_review_status_" RENAME TO "curriculum_source_sections_processing_session_id_review_sta_idx";

-- RenameIndex
ALTER INDEX "curriculum_source_sections_processing_session_id_section_type_i" RENAME TO "curriculum_source_sections_processing_session_id_section_ty_idx";

-- RenameIndex
ALTER INDEX "master_assessment_template_rubrics_master_assessment_template_i" RENAME TO "master_assessment_template_rubrics_master_assessment_templa_idx";

-- RenameIndex
ALTER INDEX "master_assessment_template_rubrics_template_rubric_unique_idx" RENAME TO "master_assessment_template_rubrics_master_assessment_templa_key";
