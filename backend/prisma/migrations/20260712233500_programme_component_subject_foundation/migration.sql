-- CreateEnum
CREATE TYPE "SubjectStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "IntegrationDomainStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProgrammeComponentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "subjects" (
    "subject_id" UUID NOT NULL,
    "subject_code" CITEXT NOT NULL,
    "subject_name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "status" "SubjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_core" BOOLEAN NOT NULL DEFAULT false,
    "country_code" VARCHAR(10),
    "framework_code" VARCHAR(50),
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("subject_id")
);

-- CreateTable
CREATE TABLE "school_subjects" (
    "school_subject_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "display_name" VARCHAR(150),
    "local_code" CITEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_core" BOOLEAN NOT NULL DEFAULT false,
    "start_date" DATE,
    "end_date" DATE,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "school_subjects_pkey" PRIMARY KEY ("school_subject_id")
);

-- CreateTable
CREATE TABLE "integration_domains" (
    "integration_domain_id" UUID NOT NULL,
    "domain_code" CITEXT NOT NULL,
    "domain_name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "status" "IntegrationDomainStatus" NOT NULL DEFAULT 'ACTIVE',
    "category" VARCHAR(100),
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "integration_domains_pkey" PRIMARY KEY ("integration_domain_id")
);

-- CreateTable
CREATE TABLE "subject_integration_domains" (
    "subject_integration_domain_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "integration_domain_id" UUID NOT NULL,
    "relationship_type" VARCHAR(100),
    "relevance_level" INTEGER,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_integration_domains_pkey" PRIMARY KEY ("subject_integration_domain_id")
);

-- CreateTable
CREATE TABLE "programme_components" (
    "programme_component_id" UUID NOT NULL,
    "component_name" VARCHAR(150) NOT NULL,
    "component_code" CITEXT NOT NULL,
    "description" TEXT,
    "status" "ProgrammeComponentStatus" NOT NULL DEFAULT 'DRAFT',
    "category" VARCHAR(100),
    "default_duration_minutes" INTEGER,
    "requires_device" BOOLEAN NOT NULL DEFAULT false,
    "requires_internet" BOOLEAN NOT NULL DEFAULT false,
    "requires_kit" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "programme_components_pkey" PRIMARY KEY ("programme_component_id")
);

-- CreateTable
CREATE TABLE "programme_component_subjects" (
    "programme_component_subject_id" UUID NOT NULL,
    "programme_component_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "sequence_order" INTEGER,
    "integration_purpose" VARCHAR(150),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programme_component_subjects_pkey" PRIMARY KEY ("programme_component_subject_id")
);

-- CreateTable
CREATE TABLE "programme_component_integration_domains" (
    "programme_component_integration_domain_id" UUID NOT NULL,
    "programme_component_id" UUID NOT NULL,
    "integration_domain_id" UUID NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "sequence_order" INTEGER,
    "integration_purpose" VARCHAR(150),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programme_component_integration_domains_pkey" PRIMARY KEY ("programme_component_integration_domain_id")
);

-- CreateTable
CREATE TABLE "school_programme_components" (
    "school_programme_component_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "programme_component_id" UUID NOT NULL,
    "display_name" VARCHAR(150),
    "local_code" CITEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "start_date" DATE,
    "end_date" DATE,
    "default_weekly_frequency" INTEGER,
    "default_lesson_duration_minutes" INTEGER,
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "school_programme_components_pkey" PRIMARY KEY ("school_programme_component_id")
);

-- CreateTable
CREATE TABLE "term_programme_components" (
    "term_programme_component_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "term_id" UUID NOT NULL,
    "school_programme_component_id" UUID NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "start_date" DATE,
    "end_date" DATE,
    "weekly_frequency" INTEGER,
    "lesson_duration_minutes" INTEGER,
    "notes" TEXT,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "term_programme_components_pkey" PRIMARY KEY ("term_programme_component_id")
);

-- CreateTable
CREATE TABLE "class_programme_components" (
    "class_programme_component_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "academic_class_id" UUID NOT NULL,
    "academic_session_id" UUID NOT NULL,
    "term_id" UUID,
    "school_programme_component_id" UUID NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sequence_order" INTEGER,
    "weekly_frequency" INTEGER,
    "lesson_duration_minutes" INTEGER,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "class_programme_components_pkey" PRIMARY KEY ("class_programme_component_id")
);

-- CreateTable
CREATE TABLE "programme_component_settings" (
    "component_setting_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "school_programme_component_id" UUID NOT NULL,
    "setting_key" VARCHAR(100) NOT NULL,
    "setting_value" TEXT NOT NULL,
    "value_type" VARCHAR(50),
    "is_sensitive" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programme_component_settings_pkey" PRIMARY KEY ("component_setting_id")
);

-- CreateTable
CREATE TABLE "programme_component_status_history" (
    "status_history_id" UUID NOT NULL,
    "programme_component_id" UUID NOT NULL,
    "previous_status" "ProgrammeComponentStatus" NOT NULL,
    "new_status" "ProgrammeComponentStatus" NOT NULL,
    "reason" TEXT,
    "changed_by_id" UUID,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "programme_component_status_history_pkey" PRIMARY KEY ("status_history_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subjects_subject_code_key" ON "subjects"("subject_code");

-- CreateIndex
CREATE INDEX "subjects_status_idx" ON "subjects"("status");

-- CreateIndex
CREATE INDEX "subjects_subject_name_idx" ON "subjects"("subject_name");

-- CreateIndex
CREATE INDEX "school_subjects_school_id_is_enabled_idx" ON "school_subjects"("school_id", "is_enabled");

-- CreateIndex
CREATE INDEX "school_subjects_subject_id_idx" ON "school_subjects"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "integration_domains_domain_code_key" ON "integration_domains"("domain_code");

-- CreateIndex
CREATE INDEX "integration_domains_status_idx" ON "integration_domains"("status");

-- CreateIndex
CREATE INDEX "integration_domains_domain_name_idx" ON "integration_domains"("domain_name");

-- CreateIndex
CREATE INDEX "subject_integration_domains_integration_domain_id_idx" ON "subject_integration_domains"("integration_domain_id");

-- CreateIndex
CREATE INDEX "subject_integration_domains_is_active_idx" ON "subject_integration_domains"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "subject_integration_domains_subject_id_integration_domain_i_key" ON "subject_integration_domains"("subject_id", "integration_domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "programme_components_component_code_key" ON "programme_components"("component_code");

-- CreateIndex
CREATE INDEX "programme_components_status_idx" ON "programme_components"("status");

-- CreateIndex
CREATE INDEX "programme_components_component_name_idx" ON "programme_components"("component_name");

-- CreateIndex
CREATE INDEX "programme_component_subjects_subject_id_idx" ON "programme_component_subjects"("subject_id");

-- CreateIndex
CREATE INDEX "programme_component_subjects_is_active_idx" ON "programme_component_subjects"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "programme_component_subjects_programme_component_id_subject_key" ON "programme_component_subjects"("programme_component_id", "subject_id");

-- CreateIndex
CREATE INDEX "programme_component_integration_domains_integration_domain__idx" ON "programme_component_integration_domains"("integration_domain_id");

-- CreateIndex
CREATE INDEX "programme_component_integration_domains_is_active_idx" ON "programme_component_integration_domains"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "programme_component_integration_domains_programme_component_key" ON "programme_component_integration_domains"("programme_component_id", "integration_domain_id");

-- CreateIndex
CREATE INDEX "school_programme_components_school_id_is_enabled_idx" ON "school_programme_components"("school_id", "is_enabled");

-- CreateIndex
CREATE INDEX "school_programme_components_programme_component_id_idx" ON "school_programme_components"("programme_component_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_programme_components_school_programme_component_id_s_key" ON "school_programme_components"("school_programme_component_id", "school_id");

-- CreateIndex
CREATE INDEX "term_programme_components_term_id_school_programme_componen_idx" ON "term_programme_components"("term_id", "school_programme_component_id", "is_enabled");

-- CreateIndex
CREATE INDEX "term_programme_components_school_id_is_enabled_idx" ON "term_programme_components"("school_id", "is_enabled");

-- CreateIndex
CREATE INDEX "class_programme_components_academic_class_id_academic_sessi_idx" ON "class_programme_components"("academic_class_id", "academic_session_id", "term_id", "school_programme_component_id");

-- CreateIndex
CREATE INDEX "class_programme_components_school_id_is_enabled_idx" ON "class_programme_components"("school_id", "is_enabled");

-- CreateIndex
CREATE INDEX "programme_component_settings_school_id_idx" ON "programme_component_settings"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "programme_component_settings_school_programme_component_id__key" ON "programme_component_settings"("school_programme_component_id", "setting_key");

-- CreateIndex
CREATE INDEX "programme_component_status_history_programme_component_id_c_idx" ON "programme_component_status_history"("programme_component_id", "changed_at");

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_subjects" ADD CONSTRAINT "school_subjects_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_subjects" ADD CONSTRAINT "school_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_subjects" ADD CONSTRAINT "school_subjects_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_domains" ADD CONSTRAINT "integration_domains_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_integration_domains" ADD CONSTRAINT "subject_integration_domains_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_integration_domains" ADD CONSTRAINT "subject_integration_domains_integration_domain_id_fkey" FOREIGN KEY ("integration_domain_id") REFERENCES "integration_domains"("integration_domain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_integration_domains" ADD CONSTRAINT "subject_integration_domains_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_components" ADD CONSTRAINT "programme_components_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_components" ADD CONSTRAINT "programme_components_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_component_subjects" ADD CONSTRAINT "programme_component_subjects_programme_component_id_fkey" FOREIGN KEY ("programme_component_id") REFERENCES "programme_components"("programme_component_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_component_subjects" ADD CONSTRAINT "programme_component_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_component_subjects" ADD CONSTRAINT "programme_component_subjects_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_component_integration_domains" ADD CONSTRAINT "programme_component_integration_domains_programme_componen_fkey" FOREIGN KEY ("programme_component_id") REFERENCES "programme_components"("programme_component_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_component_integration_domains" ADD CONSTRAINT "programme_component_integration_domains_integration_domain_fkey" FOREIGN KEY ("integration_domain_id") REFERENCES "integration_domains"("integration_domain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_component_integration_domains" ADD CONSTRAINT "programme_component_integration_domains_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_programme_components" ADD CONSTRAINT "school_programme_components_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_programme_components" ADD CONSTRAINT "school_programme_components_programme_component_id_fkey" FOREIGN KEY ("programme_component_id") REFERENCES "programme_components"("programme_component_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_programme_components" ADD CONSTRAINT "school_programme_components_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_programme_components" ADD CONSTRAINT "school_programme_components_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "term_programme_components" ADD CONSTRAINT "term_programme_components_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "term_programme_components" ADD CONSTRAINT "term_programme_components_term_id_school_id_fkey" FOREIGN KEY ("term_id", "school_id") REFERENCES "terms"("term_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "term_programme_components" ADD CONSTRAINT "term_programme_components_school_programme_component_id_sc_fkey" FOREIGN KEY ("school_programme_component_id", "school_id") REFERENCES "school_programme_components"("school_programme_component_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "term_programme_components" ADD CONSTRAINT "term_programme_components_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_programme_components" ADD CONSTRAINT "class_programme_components_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_programme_components" ADD CONSTRAINT "class_programme_components_academic_class_id_school_id_fkey" FOREIGN KEY ("academic_class_id", "school_id") REFERENCES "academic_classes"("academic_class_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_programme_components" ADD CONSTRAINT "class_programme_components_academic_session_id_school_id_fkey" FOREIGN KEY ("academic_session_id", "school_id") REFERENCES "academic_sessions"("academic_session_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_programme_components" ADD CONSTRAINT "class_programme_components_term_id_school_id_fkey" FOREIGN KEY ("term_id", "school_id") REFERENCES "terms"("term_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_programme_components" ADD CONSTRAINT "class_programme_components_school_programme_component_id_s_fkey" FOREIGN KEY ("school_programme_component_id", "school_id") REFERENCES "school_programme_components"("school_programme_component_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_programme_components" ADD CONSTRAINT "class_programme_components_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_component_settings" ADD CONSTRAINT "programme_component_settings_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_component_settings" ADD CONSTRAINT "programme_component_settings_school_programme_component_id_fkey" FOREIGN KEY ("school_programme_component_id", "school_id") REFERENCES "school_programme_components"("school_programme_component_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_component_settings" ADD CONSTRAINT "programme_component_settings_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_component_settings" ADD CONSTRAINT "programme_component_settings_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_component_status_history" ADD CONSTRAINT "programme_component_status_history_programme_component_id_fkey" FOREIGN KEY ("programme_component_id") REFERENCES "programme_components"("programme_component_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_component_status_history" ADD CONSTRAINT "programme_component_status_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "school_subjects"
ADD CONSTRAINT "school_subjects_date_range_chk"
CHECK ("end_date" IS NULL OR "start_date" IS NULL OR "end_date" >= "start_date");

-- AddCheckConstraint
ALTER TABLE "school_programme_components"
ADD CONSTRAINT "school_programme_components_date_range_chk"
CHECK ("end_date" IS NULL OR "start_date" IS NULL OR "end_date" >= "start_date");

-- AddCheckConstraint
ALTER TABLE "school_programme_components"
ADD CONSTRAINT "school_programme_components_frequency_chk"
CHECK ("default_weekly_frequency" IS NULL OR "default_weekly_frequency" > 0);

-- AddCheckConstraint
ALTER TABLE "school_programme_components"
ADD CONSTRAINT "school_programme_components_duration_chk"
CHECK ("default_lesson_duration_minutes" IS NULL OR "default_lesson_duration_minutes" > 0);

-- AddCheckConstraint
ALTER TABLE "term_programme_components"
ADD CONSTRAINT "term_programme_components_date_range_chk"
CHECK ("end_date" IS NULL OR "start_date" IS NULL OR "end_date" >= "start_date");

-- AddCheckConstraint
ALTER TABLE "term_programme_components"
ADD CONSTRAINT "term_programme_components_frequency_chk"
CHECK ("weekly_frequency" IS NULL OR "weekly_frequency" > 0);

-- AddCheckConstraint
ALTER TABLE "term_programme_components"
ADD CONSTRAINT "term_programme_components_duration_chk"
CHECK ("lesson_duration_minutes" IS NULL OR "lesson_duration_minutes" > 0);

-- AddCheckConstraint
ALTER TABLE "class_programme_components"
ADD CONSTRAINT "class_programme_components_frequency_chk"
CHECK ("weekly_frequency" IS NULL OR "weekly_frequency" > 0);

-- AddCheckConstraint
ALTER TABLE "class_programme_components"
ADD CONSTRAINT "class_programme_components_duration_chk"
CHECK ("lesson_duration_minutes" IS NULL OR "lesson_duration_minutes" > 0);

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "school_subjects_one_active_per_school_subject_idx"
ON "school_subjects"("school_id", "subject_id")
WHERE "archived_at" IS NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "school_subjects_local_code_active_unique_idx"
ON "school_subjects"("school_id", "local_code")
WHERE "local_code" IS NOT NULL
    AND "archived_at" IS NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "school_programme_components_one_active_per_school_component_idx"
ON "school_programme_components"("school_id", "programme_component_id")
WHERE "archived_at" IS NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "school_programme_components_local_code_active_unique_idx"
ON "school_programme_components"("school_id", "local_code")
WHERE "local_code" IS NOT NULL
    AND "archived_at" IS NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "term_programme_components_active_unique_idx"
ON "term_programme_components"("school_id", "term_id", "school_programme_component_id")
WHERE "archived_at" IS NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "class_programme_components_active_scoped_unique_idx"
ON "class_programme_components"(
    "school_id",
    "academic_class_id",
    "academic_session_id",
    "term_id",
    "school_programme_component_id"
)
WHERE "archived_at" IS NULL
    AND "term_id" IS NOT NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "class_programme_components_active_global_unique_idx"
ON "class_programme_components"(
    "school_id",
    "academic_class_id",
    "academic_session_id",
    "school_programme_component_id"
)
WHERE "archived_at" IS NULL
    AND "term_id" IS NULL;

