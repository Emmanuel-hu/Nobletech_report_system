-- AlterEnum
ALTER TYPE "CurriculumSourceContentType" ADD VALUE IF NOT EXISTS 'UNIT';

-- CreateEnum
CREATE TYPE "CurriculumSourceProcessingStatus" AS ENUM (
	'DRAFT',
	'IN_PROGRESS',
	'PENDING_REVIEW',
	'REVISION_REQUIRED',
	'APPROVED',
	'REJECTED',
	'COMPLETED',
	'ARCHIVED'
);

-- CreateEnum
CREATE TYPE "CurriculumSourceProcessingMethod" AS ENUM (
	'MANUAL',
	'OCR',
	'AI_ASSISTED',
	'IMPORTED',
	'HYBRID'
);

-- CreateEnum
CREATE TYPE "CurriculumSourceSectionType" AS ENUM (
	'DOCUMENT_HEADING',
	'INTRODUCTION',
	'CLASS_LEVEL',
	'TERM',
	'SUBJECT',
	'UNIT',
	'TOPIC',
	'CONCEPT',
	'SKILL',
	'LEARNING_OUTCOME',
	'ACTIVITY',
	'PROJECT',
	'RESOURCE',
	'ASSESSMENT',
	'NOTE',
	'OTHER'
);

-- CreateEnum
CREATE TYPE "CurriculumSourceSectionReviewStatus" AS ENUM (
	'DRAFT',
	'PENDING_REVIEW',
	'REVISION_REQUIRED',
	'APPROVED',
	'REJECTED',
	'ARCHIVED'
);

-- CreateTable
CREATE TABLE "curriculum_source_processing_sessions" (
	"processing_session_id" UUID NOT NULL,
	"school_id" UUID,
	"curriculum_source_id" UUID NOT NULL,
	"curriculum_source_file_id" UUID NOT NULL,
	"source_file_version" VARCHAR(50),
	"status" "CurriculumSourceProcessingStatus" NOT NULL DEFAULT 'DRAFT',
	"processing_method" "CurriculumSourceProcessingMethod" NOT NULL DEFAULT 'MANUAL',
	"started_by_id" UUID NOT NULL,
	"assigned_reviewer_id" UUID,
	"started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"submitted_at" TIMESTAMP(3),
	"reviewed_at" TIMESTAMP(3),
	"approved_at" TIMESTAMP(3),
	"completed_at" TIMESTAMP(3),
	"archived_at" TIMESTAMP(3),
	"revision_number" INTEGER NOT NULL DEFAULT 1,
	"last_known_source_checksum" VARCHAR(128) NOT NULL,
	"notes" TEXT,
	"metadata" JSONB,
	"revision_reason" TEXT,
	"archive_reason" TEXT,
	"previous_session_id" UUID,
	"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "curriculum_source_processing_sessions_pkey" PRIMARY KEY ("processing_session_id")
);

-- CreateTable
CREATE TABLE "curriculum_source_sections" (
	"source_section_id" UUID NOT NULL,
	"processing_session_id" UUID NOT NULL,
	"parent_section_id" UUID,
	"section_type" "CurriculumSourceSectionType" NOT NULL,
	"heading" VARCHAR(255) NOT NULL,
	"raw_text" TEXT NOT NULL,
	"structured_data" JSONB,
	"page_start" INTEGER,
	"page_end" INTEGER,
	"source_section_reference" VARCHAR(150),
	"sequence_order" INTEGER NOT NULL,
	"review_status" "CurriculumSourceSectionReviewStatus" NOT NULL DEFAULT 'DRAFT',
	"review_note" TEXT,
	"created_by_id" UUID NOT NULL,
	"updated_by_id" UUID,
	"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP(3) NOT NULL,
	"archived_at" TIMESTAMP(3),
	CONSTRAINT "curriculum_source_sections_pkey" PRIMARY KEY ("source_section_id")
);

-- AlterTable
ALTER TABLE "curriculum_source_contents"
ADD COLUMN "review_status" "ContentReviewStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "created_by_id" UUID,
ADD COLUMN "processing_session_id" UUID,
ADD COLUMN "section_id" UUID,
ADD COLUMN "source_file_id" UUID,
ADD COLUMN "source_file_version" VARCHAR(50),
ADD COLUMN "source_file_checksum" VARCHAR(128),
ADD COLUMN "adaptation_note" TEXT,
ADD COLUMN "archived_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_source_processing_sessions_curriculum_source_id_revision_number_key"
ON "curriculum_source_processing_sessions"("curriculum_source_id", "revision_number");

-- CreateIndex
CREATE INDEX "curriculum_source_processing_sessions_school_id_status_idx"
ON "curriculum_source_processing_sessions"("school_id", "status");

-- CreateIndex
CREATE INDEX "curriculum_source_processing_sessions_curriculum_source_id_status_revision_number_idx"
ON "curriculum_source_processing_sessions"("curriculum_source_id", "status", "revision_number");

-- CreateIndex
CREATE INDEX "curriculum_source_processing_sessions_curriculum_source_file_id_status_idx"
ON "curriculum_source_processing_sessions"("curriculum_source_file_id", "status");

-- CreateIndex
CREATE INDEX "curriculum_source_processing_sessions_assigned_reviewer_id_status_idx"
ON "curriculum_source_processing_sessions"("assigned_reviewer_id", "status");

-- CreateIndex
CREATE INDEX "curriculum_source_processing_sessions_previous_session_id_idx"
ON "curriculum_source_processing_sessions"("previous_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_source_sections_processing_session_id_parent_section_id_sequence_order_key"
ON "curriculum_source_sections"("processing_session_id", "parent_section_id", "sequence_order");

-- CreateIndex
CREATE INDEX "curriculum_source_sections_processing_session_id_section_type_idx"
ON "curriculum_source_sections"("processing_session_id", "section_type");

-- CreateIndex
CREATE INDEX "curriculum_source_sections_processing_session_id_review_status_idx"
ON "curriculum_source_sections"("processing_session_id", "review_status");

-- CreateIndex
CREATE INDEX "curriculum_source_sections_parent_section_id_idx"
ON "curriculum_source_sections"("parent_section_id");

-- CreateIndex
CREATE INDEX "curriculum_source_sections_page_start_page_end_idx"
ON "curriculum_source_sections"("page_start", "page_end");

-- CreateIndex
CREATE INDEX "curriculum_source_contents_processing_session_id_review_status_idx"
ON "curriculum_source_contents"("processing_session_id", "review_status");

-- CreateIndex
CREATE INDEX "curriculum_source_contents_section_id_idx"
ON "curriculum_source_contents"("section_id");

-- CreateIndex
CREATE INDEX "curriculum_source_contents_source_file_id_idx"
ON "curriculum_source_contents"("source_file_id");

-- AddForeignKey
ALTER TABLE "curriculum_source_processing_sessions"
ADD CONSTRAINT "curriculum_source_processing_sessions_school_id_fkey"
FOREIGN KEY ("school_id") REFERENCES "schools"("school_id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_processing_sessions"
ADD CONSTRAINT "curriculum_source_processing_sessions_curriculum_source_id_fkey"
FOREIGN KEY ("curriculum_source_id") REFERENCES "curriculum_sources"("curriculum_source_id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_processing_sessions"
ADD CONSTRAINT "curriculum_source_processing_sessions_curriculum_source_file_id_fkey"
FOREIGN KEY ("curriculum_source_file_id") REFERENCES "curriculum_source_files"("curriculum_source_file_id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_processing_sessions"
ADD CONSTRAINT "curriculum_source_processing_sessions_started_by_id_fkey"
FOREIGN KEY ("started_by_id") REFERENCES "users"("user_id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_processing_sessions"
ADD CONSTRAINT "curriculum_source_processing_sessions_assigned_reviewer_id_fkey"
FOREIGN KEY ("assigned_reviewer_id") REFERENCES "users"("user_id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_processing_sessions"
ADD CONSTRAINT "curriculum_source_processing_sessions_previous_session_id_fkey"
FOREIGN KEY ("previous_session_id") REFERENCES "curriculum_source_processing_sessions"("processing_session_id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_sections"
ADD CONSTRAINT "curriculum_source_sections_processing_session_id_fkey"
FOREIGN KEY ("processing_session_id") REFERENCES "curriculum_source_processing_sessions"("processing_session_id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_sections"
ADD CONSTRAINT "curriculum_source_sections_parent_section_id_fkey"
FOREIGN KEY ("parent_section_id") REFERENCES "curriculum_source_sections"("source_section_id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_sections"
ADD CONSTRAINT "curriculum_source_sections_created_by_id_fkey"
FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_sections"
ADD CONSTRAINT "curriculum_source_sections_updated_by_id_fkey"
FOREIGN KEY ("updated_by_id") REFERENCES "users"("user_id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_contents"
ADD CONSTRAINT "curriculum_source_contents_created_by_id_fkey"
FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_contents"
ADD CONSTRAINT "curriculum_source_contents_processing_session_id_fkey"
FOREIGN KEY ("processing_session_id") REFERENCES "curriculum_source_processing_sessions"("processing_session_id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_contents"
ADD CONSTRAINT "curriculum_source_contents_section_id_fkey"
FOREIGN KEY ("section_id") REFERENCES "curriculum_source_sections"("source_section_id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_contents"
ADD CONSTRAINT "curriculum_source_contents_source_file_id_fkey"
FOREIGN KEY ("source_file_id") REFERENCES "curriculum_source_files"("curriculum_source_file_id")
ON DELETE SET NULL ON UPDATE CASCADE;
