-- CreateEnum
CREATE TYPE "CurriculumSourceFileUploadStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "CurriculumSourceFileScanStatus" AS ENUM ('PENDING', 'NOT_CONFIGURED', 'CLEAN', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "CurriculumChecksumAlgorithm" AS ENUM ('SHA256');

-- CreateEnum
CREATE TYPE "CurriculumSourceFileCategory" AS ENUM ('SOURCE_DOCUMENT', 'SUPPLEMENTARY_IMAGE', 'SUPPLEMENTARY_DATA', 'OTHER');

-- AlterTable
ALTER TABLE "curriculum_source_files"
ADD COLUMN "file_extension" VARCHAR(20) NOT NULL DEFAULT '',
ADD COLUMN "checksum_algorithm" "CurriculumChecksumAlgorithm" NOT NULL DEFAULT 'SHA256',
ADD COLUMN "file_category" "CurriculumSourceFileCategory" NOT NULL DEFAULT 'SOURCE_DOCUMENT',
ADD COLUMN "upload_status" "CurriculumSourceFileUploadStatus" NOT NULL DEFAULT 'READY',
ADD COLUMN "scan_status" "CurriculumSourceFileScanStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
ADD COLUMN "scan_details" TEXT,
ADD COLUMN "metadata" JSONB,
ADD COLUMN "document_version" VARCHAR(50),
ADD COLUMN "effective_date" DATE,
ADD COLUMN "superseded_file_id" UUID,
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "verified_at" TIMESTAMP(3),
ADD COLUMN "unlinked_at" TIMESTAMP(3),
ADD COLUMN "unlinked_by_id" UUID;

-- CreateIndex
CREATE INDEX "curriculum_source_files_scan_status_status_idx"
ON "curriculum_source_files"("scan_status", "status");

-- CreateIndex
CREATE INDEX "curriculum_source_files_upload_status_status_idx"
ON "curriculum_source_files"("upload_status", "status");

-- CreateIndex
CREATE INDEX "curriculum_source_files_superseded_file_id_idx"
ON "curriculum_source_files"("superseded_file_id");

-- AddForeignKey
ALTER TABLE "curriculum_source_files"
ADD CONSTRAINT "curriculum_source_files_superseded_file_id_fkey"
FOREIGN KEY ("superseded_file_id") REFERENCES "curriculum_source_files"("curriculum_source_file_id")
ON DELETE SET NULL ON UPDATE CASCADE;