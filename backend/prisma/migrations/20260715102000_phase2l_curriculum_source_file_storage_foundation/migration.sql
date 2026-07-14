-- CreateEnum
CREATE TYPE "CurriculumSourceFileStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "CurriculumStorageProvider" AS ENUM ('LOCAL', 'AZURE_BLOB', 'AWS_S3', 'GCP_STORAGE');

-- CreateTable
CREATE TABLE "curriculum_source_files" (
    "curriculum_source_file_id" UUID NOT NULL,
    "curriculum_source_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "storage_provider" "CurriculumStorageProvider" NOT NULL DEFAULT 'LOCAL',
    "storage_key" VARCHAR(500) NOT NULL,
    "original_file_name" VARCHAR(255) NOT NULL,
    "safe_file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(150) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "checksum" VARCHAR(128) NOT NULL,
    "sequence_order" INTEGER NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "status" "CurriculumSourceFileStatus" NOT NULL DEFAULT 'ACTIVE',
    "uploaded_by_id" UUID NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_at" TIMESTAMP(3),
    "archived_by_id" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_source_files_pkey" PRIMARY KEY ("curriculum_source_file_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_source_files_curriculum_source_id_sequence_order_key"
ON "curriculum_source_files"("curriculum_source_id", "sequence_order");

-- CreateIndex
CREATE INDEX "curriculum_source_files_curriculum_source_id_status_sequence_order_idx"
ON "curriculum_source_files"("curriculum_source_id", "status", "sequence_order");

-- CreateIndex
CREATE INDEX "curriculum_source_files_school_id_status_idx"
ON "curriculum_source_files"("school_id", "status");

-- CreateIndex
CREATE INDEX "curriculum_source_files_storage_key_idx"
ON "curriculum_source_files"("storage_key");

-- AddForeignKey
ALTER TABLE "curriculum_source_files"
ADD CONSTRAINT "curriculum_source_files_curriculum_source_id_fkey"
FOREIGN KEY ("curriculum_source_id") REFERENCES "curriculum_sources"("curriculum_source_id")
ON DELETE RESTRICT ON UPDATE CASCADE;
