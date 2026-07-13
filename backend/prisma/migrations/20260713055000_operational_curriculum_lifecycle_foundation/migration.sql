-- CreateEnum
CREATE TYPE "CurriculumStatus" AS ENUM ('GENERATED_DRAFT', 'DRAFT', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CurriculumCreationMethod" AS ENUM ('MANUAL', 'MASTER_CONTENT_ADAPTATION', 'SOURCE_ADAPTATION', 'AI_ASSISTED');

-- CreateEnum
CREATE TYPE "CurriculumReviewDecision" AS ENUM ('SUBMITTED', 'COMMENTED', 'REVISION_REQUESTED', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "CurriculumAssignmentStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'SUSPENDED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "curricula" (
    "curriculum_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "school_programme_component_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "code" CITEXT NOT NULL,
    "description" TEXT,
    "status" "CurriculumStatus" NOT NULL DEFAULT 'DRAFT',
    "creation_method" "CurriculumCreationMethod" NOT NULL DEFAULT 'MANUAL',
    "current_version_number" VARCHAR(20),
    "current_version_id" UUID,
    "source_curriculum_id" UUID,
    "created_by_id" UUID NOT NULL,
    "submitted_by_id" UUID,
    "submitted_at" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "published_by_id" UUID,
    "published_at" TIMESTAMP(3),
    "archived_by_id" UUID,
    "archived_at" TIMESTAMP(3),
    "archive_reason" TEXT,
    "publication_checksum" VARCHAR(128),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curricula_pkey" PRIMARY KEY ("curriculum_id")
);

-- CreateTable
CREATE TABLE "curriculum_units" (
    "curriculum_unit_id" UUID NOT NULL,
    "curriculum_id" UUID NOT NULL,
    "master_curriculum_unit_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "code" CITEXT,
    "description" TEXT,
    "sequence_order" INTEGER NOT NULL,
    "estimated_weeks" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "updated_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "curriculum_units_pkey" PRIMARY KEY ("curriculum_unit_id")
);

-- CreateTable
CREATE TABLE "curriculum_topics" (
    "curriculum_topic_id" UUID NOT NULL,
    "curriculum_unit_id" UUID NOT NULL,
    "master_topic_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "code" CITEXT,
    "description" TEXT,
    "sequence_order" INTEGER NOT NULL,
    "recommended_duration_minutes" INTEGER,
    "week_number" INTEGER,
    "difficulty_level" VARCHAR(50),
    "teacher_note" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "updated_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "curriculum_topics_pkey" PRIMARY KEY ("curriculum_topic_id")
);

-- CreateTable
CREATE TABLE "curriculum_concepts" (
    "curriculum_concept_id" UUID NOT NULL,
    "curriculum_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "master_concept_id" UUID,
    "name" VARCHAR(200) NOT NULL,
    "code" CITEXT,
    "definition" TEXT NOT NULL,
    "explanation" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "curriculum_concepts_pkey" PRIMARY KEY ("curriculum_concept_id")
);

-- CreateTable
CREATE TABLE "curriculum_topic_concepts" (
    "curriculum_topic_concept_id" UUID NOT NULL,
    "curriculum_topic_id" UUID NOT NULL,
    "curriculum_concept_id" UUID,
    "master_concept_id" UUID,
    "sequence_order" INTEGER,
    "importance_level" VARCHAR(50),
    "expected_depth" VARCHAR(50),
    "instructional_emphasis" VARCHAR(100),
    "is_core" BOOLEAN NOT NULL DEFAULT false,
    "assessment_relevance" VARCHAR(100),
    "teacher_note" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_topic_concepts_pkey" PRIMARY KEY ("curriculum_topic_concept_id")
);

-- CreateTable
CREATE TABLE "curriculum_projects" (
    "curriculum_project_id" UUID NOT NULL,
    "curriculum_unit_id" UUID NOT NULL,
    "master_project_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "sequence_order" INTEGER NOT NULL,
    "objective" TEXT,
    "expected_output" TEXT,
    "estimated_duration_minutes" INTEGER,
    "difficulty_level" VARCHAR(50),
    "safety_note" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "updated_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "curriculum_projects_pkey" PRIMARY KEY ("curriculum_project_id")
);

-- CreateTable
CREATE TABLE "curriculum_topic_projects" (
    "curriculum_topic_project_id" UUID NOT NULL,
    "curriculum_topic_id" UUID NOT NULL,
    "curriculum_project_id" UUID NOT NULL,
    "sequence_order" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_topic_projects_pkey" PRIMARY KEY ("curriculum_topic_project_id")
);

-- CreateTable
CREATE TABLE "curriculum_project_implementations" (
    "curriculum_project_implementation_id" UUID NOT NULL,
    "curriculum_project_id" UUID NOT NULL,
    "master_project_implementation_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "implementation_type" "MasterProjectImplementationType" NOT NULL,
    "description" TEXT NOT NULL,
    "sequence_order" INTEGER NOT NULL,
    "teacher_instructions" TEXT,
    "learner_instructions" TEXT,
    "safety_instructions" TEXT,
    "required_internet" BOOLEAN NOT NULL DEFAULT false,
    "required_device_count" INTEGER,
    "estimated_duration_minutes" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "updated_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_project_implementations_pkey" PRIMARY KEY ("curriculum_project_implementation_id")
);

-- CreateTable
CREATE TABLE "curriculum_learning_outcomes" (
    "curriculum_learning_outcome_id" UUID NOT NULL,
    "curriculum_id" UUID NOT NULL,
    "master_learning_outcome_id" UUID,
    "statement" TEXT NOT NULL,
    "code" CITEXT,
    "bloom_level" VARCHAR(50),
    "measurable_verb" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "updated_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "curriculum_learning_outcomes_pkey" PRIMARY KEY ("curriculum_learning_outcome_id")
);

-- CreateTable
CREATE TABLE "curriculum_topic_learning_outcomes" (
    "curriculum_topic_learning_outcome_id" UUID NOT NULL,
    "curriculum_topic_id" UUID NOT NULL,
    "curriculum_learning_outcome_id" UUID NOT NULL,
    "sequence_order" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_topic_learning_outcomes_pkey" PRIMARY KEY ("curriculum_topic_learning_outcome_id")
);

-- CreateTable
CREATE TABLE "curriculum_project_learning_outcomes" (
    "curriculum_project_learning_outcome_id" UUID NOT NULL,
    "curriculum_project_id" UUID NOT NULL,
    "curriculum_learning_outcome_id" UUID NOT NULL,
    "sequence_order" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_project_learning_outcomes_pkey" PRIMARY KEY ("curriculum_project_learning_outcome_id")
);

-- CreateTable
CREATE TABLE "curriculum_resources" (
    "curriculum_resource_id" UUID NOT NULL,
    "curriculum_topic_id" UUID NOT NULL,
    "curriculum_id" UUID NOT NULL,
    "master_resource_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "resource_type" "MasterResourceType" NOT NULL,
    "quantity_required" VARCHAR(100),
    "requires_internet" BOOLEAN NOT NULL DEFAULT false,
    "requires_login" BOOLEAN NOT NULL DEFAULT false,
    "safety_note" TEXT,
    "internal_file_reference" VARCHAR(255),
    "external_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "updated_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "curriculum_resources_pkey" PRIMARY KEY ("curriculum_resource_id")
);

-- CreateTable
CREATE TABLE "curriculum_visibility_settings" (
    "curriculum_visibility_setting_id" UUID NOT NULL,
    "curriculum_id" UUID NOT NULL,
    "show_programme_components" BOOLEAN NOT NULL DEFAULT true,
    "show_tools" BOOLEAN NOT NULL DEFAULT true,
    "show_resources" BOOLEAN NOT NULL DEFAULT true,
    "show_projects" BOOLEAN NOT NULL DEFAULT true,
    "show_learning_outcomes" BOOLEAN NOT NULL DEFAULT true,
    "show_teacher_notes" BOOLEAN NOT NULL DEFAULT false,
    "show_student_notes" BOOLEAN NOT NULL DEFAULT false,
    "visible_to_teachers" BOOLEAN NOT NULL DEFAULT true,
    "visible_to_learners" BOOLEAN NOT NULL DEFAULT false,
    "visible_to_guardians" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_visibility_settings_pkey" PRIMARY KEY ("curriculum_visibility_setting_id")
);

-- CreateTable
CREATE TABLE "curriculum_versions" (
    "curriculum_version_id" UUID NOT NULL,
    "curriculum_id" UUID NOT NULL,
    "version_number" VARCHAR(20) NOT NULL,
    "major_version" INTEGER NOT NULL,
    "minor_version" INTEGER NOT NULL,
    "patch_version" INTEGER,
    "version_label" VARCHAR(50) NOT NULL,
    "based_on_version_id" UUID,
    "status" "CurriculumStatus" NOT NULL,
    "change_summary" TEXT,
    "snapshot_data" JSONB NOT NULL,
    "snapshot_checksum" VARCHAR(128),
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "published_by_id" UUID,
    "published_at" TIMESTAMP(3),
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "curriculum_versions_pkey" PRIMARY KEY ("curriculum_version_id")
);

-- CreateTable
CREATE TABLE "curriculum_review_actions" (
    "curriculum_review_action_id" UUID NOT NULL,
    "curriculum_id" UUID NOT NULL,
    "curriculum_version_id" UUID,
    "decision" "CurriculumReviewDecision" NOT NULL,
    "comment" TEXT,
    "requested_changes" TEXT,
    "previous_status" "CurriculumStatus" NOT NULL,
    "resulting_status" "CurriculumStatus" NOT NULL,
    "actor_user_id" UUID NOT NULL,
    "assigned_reviewer_id" UUID,
    "acted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "curriculum_review_actions_pkey" PRIMARY KEY ("curriculum_review_action_id")
);

-- CreateTable
CREATE TABLE "curriculum_status_history" (
    "curriculum_status_history_id" UUID NOT NULL,
    "curriculum_id" UUID NOT NULL,
    "curriculum_version_id" UUID,
    "previous_status" "CurriculumStatus" NOT NULL,
    "new_status" "CurriculumStatus" NOT NULL,
    "reason" TEXT,
    "changed_by_id" UUID NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "curriculum_status_history_pkey" PRIMARY KEY ("curriculum_status_history_id")
);

-- CreateTable
CREATE TABLE "curriculum_assignments" (
    "curriculum_assignment_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "curriculum_id" UUID NOT NULL,
    "curriculum_version_id" UUID NOT NULL,
    "academic_session_id" UUID NOT NULL,
    "term_id" UUID NOT NULL,
    "academic_class_id" UUID NOT NULL,
    "school_programme_component_id" UUID NOT NULL,
    "teacher_user_id" UUID,
    "status" "CurriculumAssignmentStatus" NOT NULL DEFAULT 'PLANNED',
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "assigned_by_id" UUID NOT NULL,
    "activated_by_id" UUID,
    "activated_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_assignments_pkey" PRIMARY KEY ("curriculum_assignment_id")
);

-- CreateIndex
CREATE INDEX "curricula_school_id_status_idx" ON "curricula"("school_id", "status");

-- CreateIndex
CREATE INDEX "curricula_school_id_school_programme_component_id_status_idx" ON "curricula"("school_id", "school_programme_component_id", "status");

-- CreateIndex
CREATE INDEX "curricula_school_id_submitted_at_status_idx" ON "curricula"("school_id", "submitted_at", "status");

-- CreateIndex
CREATE INDEX "curricula_status_is_active_archived_at_idx" ON "curricula"("status", "is_active", "archived_at");

-- CreateIndex
CREATE UNIQUE INDEX "curricula_school_id_code_key" ON "curricula"("school_id", "code");

-- CreateIndex
CREATE INDEX "curriculum_units_curriculum_id_is_active_idx" ON "curriculum_units"("curriculum_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_units_curriculum_id_sequence_order_key" ON "curriculum_units"("curriculum_id", "sequence_order");

-- CreateIndex
CREATE INDEX "curriculum_topics_curriculum_unit_id_week_number_idx" ON "curriculum_topics"("curriculum_unit_id", "week_number");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_topics_curriculum_unit_id_sequence_order_key" ON "curriculum_topics"("curriculum_unit_id", "sequence_order");

-- CreateIndex
CREATE INDEX "curriculum_concepts_school_id_is_active_idx" ON "curriculum_concepts"("school_id", "is_active");

-- CreateIndex
CREATE INDEX "curriculum_concepts_curriculum_id_is_active_idx" ON "curriculum_concepts"("curriculum_id", "is_active");

-- CreateIndex
CREATE INDEX "curriculum_concepts_master_concept_id_idx" ON "curriculum_concepts"("master_concept_id");

-- CreateIndex
CREATE INDEX "curriculum_topic_concepts_curriculum_concept_id_idx" ON "curriculum_topic_concepts"("curriculum_concept_id");

-- CreateIndex
CREATE INDEX "curriculum_topic_concepts_master_concept_id_idx" ON "curriculum_topic_concepts"("master_concept_id");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_topic_concepts_curriculum_topic_id_curriculum_co_key" ON "curriculum_topic_concepts"("curriculum_topic_id", "curriculum_concept_id");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_topic_concepts_curriculum_topic_id_master_concep_key" ON "curriculum_topic_concepts"("curriculum_topic_id", "master_concept_id");

-- CreateIndex
CREATE INDEX "curriculum_projects_curriculum_unit_id_is_active_idx" ON "curriculum_projects"("curriculum_unit_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_projects_curriculum_unit_id_sequence_order_key" ON "curriculum_projects"("curriculum_unit_id", "sequence_order");

-- CreateIndex
CREATE INDEX "curriculum_topic_projects_curriculum_project_id_is_active_idx" ON "curriculum_topic_projects"("curriculum_project_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_topic_projects_curriculum_topic_id_curriculum_pr_key" ON "curriculum_topic_projects"("curriculum_topic_id", "curriculum_project_id");

-- CreateIndex
CREATE INDEX "curriculum_project_implementations_curriculum_project_id_is_idx" ON "curriculum_project_implementations"("curriculum_project_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_project_implementations_curriculum_project_id_se_key" ON "curriculum_project_implementations"("curriculum_project_id", "sequence_order");

-- CreateIndex
CREATE INDEX "curriculum_learning_outcomes_curriculum_id_is_active_idx" ON "curriculum_learning_outcomes"("curriculum_id", "is_active");

-- CreateIndex
CREATE INDEX "curriculum_learning_outcomes_master_learning_outcome_id_idx" ON "curriculum_learning_outcomes"("master_learning_outcome_id");

-- CreateIndex
CREATE INDEX "curriculum_topic_learning_outcomes_curriculum_learning_outc_idx" ON "curriculum_topic_learning_outcomes"("curriculum_learning_outcome_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_topic_learning_outcomes_curriculum_topic_id_curr_key" ON "curriculum_topic_learning_outcomes"("curriculum_topic_id", "curriculum_learning_outcome_id");

-- CreateIndex
CREATE INDEX "curriculum_project_learning_outcomes_curriculum_learning_ou_idx" ON "curriculum_project_learning_outcomes"("curriculum_learning_outcome_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_project_learning_outcomes_curriculum_project_id__key" ON "curriculum_project_learning_outcomes"("curriculum_project_id", "curriculum_learning_outcome_id");

-- CreateIndex
CREATE INDEX "curriculum_resources_curriculum_id_is_active_idx" ON "curriculum_resources"("curriculum_id", "is_active");

-- CreateIndex
CREATE INDEX "curriculum_resources_curriculum_topic_id_is_active_idx" ON "curriculum_resources"("curriculum_topic_id", "is_active");

-- CreateIndex
CREATE INDEX "curriculum_resources_master_resource_id_idx" ON "curriculum_resources"("master_resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_visibility_settings_curriculum_id_key" ON "curriculum_visibility_settings"("curriculum_id");

-- CreateIndex
CREATE INDEX "curriculum_versions_curriculum_id_is_current_idx" ON "curriculum_versions"("curriculum_id", "is_current");

-- CreateIndex
CREATE INDEX "curriculum_versions_curriculum_id_is_published_status_idx" ON "curriculum_versions"("curriculum_id", "is_published", "status");

-- CreateIndex
CREATE INDEX "curriculum_versions_status_submitted_at_idx" ON "curriculum_versions"("status", "submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_versions_curriculum_id_version_number_key" ON "curriculum_versions"("curriculum_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_versions_curriculum_version_id_curriculum_id_key" ON "curriculum_versions"("curriculum_version_id", "curriculum_id");

-- CreateIndex
CREATE INDEX "curriculum_review_actions_curriculum_id_acted_at_idx" ON "curriculum_review_actions"("curriculum_id", "acted_at");

-- CreateIndex
CREATE INDEX "curriculum_review_actions_curriculum_version_id_acted_at_idx" ON "curriculum_review_actions"("curriculum_version_id", "acted_at");

-- CreateIndex
CREATE INDEX "curriculum_review_actions_decision_acted_at_idx" ON "curriculum_review_actions"("decision", "acted_at");

-- CreateIndex
CREATE INDEX "curriculum_status_history_curriculum_id_changed_at_idx" ON "curriculum_status_history"("curriculum_id", "changed_at");

-- CreateIndex
CREATE INDEX "curriculum_status_history_curriculum_version_id_changed_at_idx" ON "curriculum_status_history"("curriculum_version_id", "changed_at");

-- CreateIndex
CREATE INDEX "curriculum_assignments_school_id_status_archived_at_idx" ON "curriculum_assignments"("school_id", "status", "archived_at");

-- CreateIndex
CREATE INDEX "curriculum_assignments_school_id_academic_session_id_term_i_idx" ON "curriculum_assignments"("school_id", "academic_session_id", "term_id", "academic_class_id", "school_programme_component_id", "status");

-- CreateIndex
CREATE INDEX "curriculum_assignments_school_id_teacher_user_id_status_idx" ON "curriculum_assignments"("school_id", "teacher_user_id", "status");

-- CreateIndex
CREATE INDEX "curriculum_assignments_curriculum_id_curriculum_version_id_idx" ON "curriculum_assignments"("curriculum_id", "curriculum_version_id");

-- Enforce curriculum lifecycle metadata consistency.
ALTER TABLE "curricula"
    ADD CONSTRAINT "curricula_approved_requires_metadata_chk"
    CHECK (
        status <> 'APPROVED'
        OR (approved_at IS NOT NULL AND approved_by_id IS NOT NULL)
    ),
    ADD CONSTRAINT "curricula_published_requires_metadata_chk"
    CHECK (
        status <> 'PUBLISHED'
        OR (
            approved_at IS NOT NULL
            AND approved_by_id IS NOT NULL
            AND published_at IS NOT NULL
            AND published_by_id IS NOT NULL
            AND publication_checksum IS NOT NULL
            AND current_version_id IS NOT NULL
        )
    ),
    ADD CONSTRAINT "curricula_archived_requires_metadata_chk"
    CHECK (
        status <> 'ARCHIVED'
        OR (archived_at IS NOT NULL AND archived_by_id IS NOT NULL)
    ),
    ADD CONSTRAINT "curricula_publication_after_approval_chk"
    CHECK (
        published_at IS NULL
        OR approved_at IS NULL
        OR published_at >= approved_at
    );

-- Enforce operational ordering and positive durations where provided.
ALTER TABLE "curriculum_units"
    ADD CONSTRAINT "curriculum_units_sequence_positive_chk" CHECK (sequence_order > 0),
    ADD CONSTRAINT "curriculum_units_estimated_weeks_positive_chk" CHECK (estimated_weeks IS NULL OR estimated_weeks > 0);

ALTER TABLE "curriculum_topics"
    ADD CONSTRAINT "curriculum_topics_sequence_positive_chk" CHECK (sequence_order > 0),
    ADD CONSTRAINT "curriculum_topics_duration_positive_chk" CHECK (recommended_duration_minutes IS NULL OR recommended_duration_minutes > 0),
    ADD CONSTRAINT "curriculum_topics_week_positive_chk" CHECK (week_number IS NULL OR week_number > 0);

ALTER TABLE "curriculum_topic_concepts"
    ADD CONSTRAINT "curriculum_topic_concepts_sequence_positive_chk" CHECK (sequence_order IS NULL OR sequence_order > 0);

ALTER TABLE "curriculum_projects"
    ADD CONSTRAINT "curriculum_projects_sequence_positive_chk" CHECK (sequence_order > 0),
    ADD CONSTRAINT "curriculum_projects_duration_positive_chk" CHECK (estimated_duration_minutes IS NULL OR estimated_duration_minutes > 0);

ALTER TABLE "curriculum_project_implementations"
    ADD CONSTRAINT "curriculum_proj_impl_sequence_positive_chk" CHECK (sequence_order > 0),
    ADD CONSTRAINT "curriculum_proj_impl_duration_positive_chk" CHECK (estimated_duration_minutes IS NULL OR estimated_duration_minutes > 0),
    ADD CONSTRAINT "curriculum_proj_impl_device_count_positive_chk" CHECK (required_device_count IS NULL OR required_device_count > 0);

ALTER TABLE "curriculum_topic_projects"
    ADD CONSTRAINT "curriculum_topic_projects_sequence_positive_chk" CHECK (sequence_order IS NULL OR sequence_order > 0);

ALTER TABLE "curriculum_topic_learning_outcomes"
    ADD CONSTRAINT "curriculum_topic_outcomes_sequence_positive_chk" CHECK (sequence_order IS NULL OR sequence_order > 0);

ALTER TABLE "curriculum_project_learning_outcomes"
    ADD CONSTRAINT "curriculum_project_outcomes_sequence_positive_chk" CHECK (sequence_order IS NULL OR sequence_order > 0);

-- Enforce versioning metadata and non-negative semantic version components.
ALTER TABLE "curriculum_versions"
    ADD CONSTRAINT "curriculum_versions_semver_non_negative_chk"
    CHECK (major_version >= 0 AND minor_version >= 0 AND (patch_version IS NULL OR patch_version >= 0)),
    ADD CONSTRAINT "curriculum_versions_published_metadata_chk"
    CHECK (
        status <> 'PUBLISHED'
        OR (
            is_published = true
            AND approved_at IS NOT NULL
            AND approved_by_id IS NOT NULL
            AND published_at IS NOT NULL
            AND published_by_id IS NOT NULL
            AND snapshot_checksum IS NOT NULL
        )
    );

CREATE UNIQUE INDEX "curriculum_versions_one_current_per_curriculum_uq"
ON "curriculum_versions" ("curriculum_id")
WHERE is_current = true AND archived_at IS NULL;

CREATE UNIQUE INDEX "curriculum_versions_one_editable_current_draft_uq"
ON "curriculum_versions" ("curriculum_id")
WHERE is_current = true
    AND archived_at IS NULL
    AND status IN ('GENERATED_DRAFT', 'DRAFT', 'REVISION_REQUIRED');

-- Enforce assignment date and active-scope uniqueness.
ALTER TABLE "curriculum_assignments"
    ADD CONSTRAINT "curriculum_assignments_effective_date_validity_chk"
    CHECK (effective_to IS NULL OR effective_to >= effective_from);

CREATE UNIQUE INDEX "curriculum_assignments_one_active_scope_uq"
ON "curriculum_assignments" (
    "school_id",
    "academic_session_id",
    "term_id",
    "academic_class_id",
    "school_programme_component_id"
)
WHERE status IN ('PLANNED', 'ACTIVE') AND archived_at IS NULL;

-- AddForeignKey
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_school_programme_component_id_school_id_fkey" FOREIGN KEY ("school_programme_component_id", "school_id") REFERENCES "school_programme_components"("school_programme_component_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_source_curriculum_id_fkey" FOREIGN KEY ("source_curriculum_id") REFERENCES "curricula"("curriculum_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_archived_by_id_fkey" FOREIGN KEY ("archived_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_current_version_id_fkey" FOREIGN KEY ("current_version_id") REFERENCES "curriculum_versions"("curriculum_version_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_units" ADD CONSTRAINT "curriculum_units_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curricula"("curriculum_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_units" ADD CONSTRAINT "curriculum_units_master_curriculum_unit_id_fkey" FOREIGN KEY ("master_curriculum_unit_id") REFERENCES "master_curriculum_units"("master_curriculum_unit_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_units" ADD CONSTRAINT "curriculum_units_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_units" ADD CONSTRAINT "curriculum_units_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_topics" ADD CONSTRAINT "curriculum_topics_curriculum_unit_id_fkey" FOREIGN KEY ("curriculum_unit_id") REFERENCES "curriculum_units"("curriculum_unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_topics" ADD CONSTRAINT "curriculum_topics_master_topic_id_fkey" FOREIGN KEY ("master_topic_id") REFERENCES "master_topics"("master_topic_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_topics" ADD CONSTRAINT "curriculum_topics_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_topics" ADD CONSTRAINT "curriculum_topics_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_concepts" ADD CONSTRAINT "curriculum_concepts_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curricula"("curriculum_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_concepts" ADD CONSTRAINT "curriculum_concepts_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_concepts" ADD CONSTRAINT "curriculum_concepts_master_concept_id_fkey" FOREIGN KEY ("master_concept_id") REFERENCES "master_concepts"("master_concept_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_concepts" ADD CONSTRAINT "curriculum_concepts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_topic_concepts" ADD CONSTRAINT "curriculum_topic_concepts_curriculum_topic_id_fkey" FOREIGN KEY ("curriculum_topic_id") REFERENCES "curriculum_topics"("curriculum_topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_topic_concepts" ADD CONSTRAINT "curriculum_topic_concepts_curriculum_concept_id_fkey" FOREIGN KEY ("curriculum_concept_id") REFERENCES "curriculum_concepts"("curriculum_concept_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_topic_concepts" ADD CONSTRAINT "curriculum_topic_concepts_master_concept_id_fkey" FOREIGN KEY ("master_concept_id") REFERENCES "master_concepts"("master_concept_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_topic_concepts" ADD CONSTRAINT "curriculum_topic_concepts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_projects" ADD CONSTRAINT "curriculum_projects_curriculum_unit_id_fkey" FOREIGN KEY ("curriculum_unit_id") REFERENCES "curriculum_units"("curriculum_unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_projects" ADD CONSTRAINT "curriculum_projects_master_project_id_fkey" FOREIGN KEY ("master_project_id") REFERENCES "master_projects"("master_project_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_projects" ADD CONSTRAINT "curriculum_projects_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_projects" ADD CONSTRAINT "curriculum_projects_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_topic_projects" ADD CONSTRAINT "curriculum_topic_projects_curriculum_topic_id_fkey" FOREIGN KEY ("curriculum_topic_id") REFERENCES "curriculum_topics"("curriculum_topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_topic_projects" ADD CONSTRAINT "curriculum_topic_projects_curriculum_project_id_fkey" FOREIGN KEY ("curriculum_project_id") REFERENCES "curriculum_projects"("curriculum_project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_project_implementations" ADD CONSTRAINT "curriculum_project_implementations_curriculum_project_id_fkey" FOREIGN KEY ("curriculum_project_id") REFERENCES "curriculum_projects"("curriculum_project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_project_implementations" ADD CONSTRAINT "curriculum_project_implementations_master_project_implemen_fkey" FOREIGN KEY ("master_project_implementation_id") REFERENCES "master_project_implementations"("master_project_implementation_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_project_implementations" ADD CONSTRAINT "curriculum_project_implementations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_project_implementations" ADD CONSTRAINT "curriculum_project_implementations_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_learning_outcomes" ADD CONSTRAINT "curriculum_learning_outcomes_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curricula"("curriculum_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_learning_outcomes" ADD CONSTRAINT "curriculum_learning_outcomes_master_learning_outcome_id_fkey" FOREIGN KEY ("master_learning_outcome_id") REFERENCES "master_learning_outcomes"("master_learning_outcome_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_learning_outcomes" ADD CONSTRAINT "curriculum_learning_outcomes_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_learning_outcomes" ADD CONSTRAINT "curriculum_learning_outcomes_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_topic_learning_outcomes" ADD CONSTRAINT "curriculum_topic_learning_outcomes_curriculum_topic_id_fkey" FOREIGN KEY ("curriculum_topic_id") REFERENCES "curriculum_topics"("curriculum_topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_topic_learning_outcomes" ADD CONSTRAINT "curriculum_topic_learning_outcomes_curriculum_learning_out_fkey" FOREIGN KEY ("curriculum_learning_outcome_id") REFERENCES "curriculum_learning_outcomes"("curriculum_learning_outcome_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_project_learning_outcomes" ADD CONSTRAINT "curriculum_project_learning_outcomes_curriculum_project_id_fkey" FOREIGN KEY ("curriculum_project_id") REFERENCES "curriculum_projects"("curriculum_project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_project_learning_outcomes" ADD CONSTRAINT "curriculum_project_learning_outcomes_curriculum_learning_o_fkey" FOREIGN KEY ("curriculum_learning_outcome_id") REFERENCES "curriculum_learning_outcomes"("curriculum_learning_outcome_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_resources" ADD CONSTRAINT "curriculum_resources_curriculum_topic_id_fkey" FOREIGN KEY ("curriculum_topic_id") REFERENCES "curriculum_topics"("curriculum_topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_resources" ADD CONSTRAINT "curriculum_resources_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curricula"("curriculum_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_resources" ADD CONSTRAINT "curriculum_resources_master_resource_id_fkey" FOREIGN KEY ("master_resource_id") REFERENCES "master_resources"("master_resource_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_resources" ADD CONSTRAINT "curriculum_resources_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_resources" ADD CONSTRAINT "curriculum_resources_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_visibility_settings" ADD CONSTRAINT "curriculum_visibility_settings_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curricula"("curriculum_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_versions" ADD CONSTRAINT "curriculum_versions_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curricula"("curriculum_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_versions" ADD CONSTRAINT "curriculum_versions_based_on_version_id_fkey" FOREIGN KEY ("based_on_version_id") REFERENCES "curriculum_versions"("curriculum_version_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_versions" ADD CONSTRAINT "curriculum_versions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_versions" ADD CONSTRAINT "curriculum_versions_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_versions" ADD CONSTRAINT "curriculum_versions_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_review_actions" ADD CONSTRAINT "curriculum_review_actions_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curricula"("curriculum_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_review_actions" ADD CONSTRAINT "curriculum_review_actions_curriculum_version_id_fkey" FOREIGN KEY ("curriculum_version_id") REFERENCES "curriculum_versions"("curriculum_version_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_review_actions" ADD CONSTRAINT "curriculum_review_actions_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_review_actions" ADD CONSTRAINT "curriculum_review_actions_assigned_reviewer_id_fkey" FOREIGN KEY ("assigned_reviewer_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_status_history" ADD CONSTRAINT "curriculum_status_history_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curricula"("curriculum_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_status_history" ADD CONSTRAINT "curriculum_status_history_curriculum_version_id_fkey" FOREIGN KEY ("curriculum_version_id") REFERENCES "curriculum_versions"("curriculum_version_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_status_history" ADD CONSTRAINT "curriculum_status_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_assignments" ADD CONSTRAINT "curriculum_assignments_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_assignments" ADD CONSTRAINT "curriculum_assignments_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curricula"("curriculum_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_assignments" ADD CONSTRAINT "curriculum_assignments_curriculum_version_id_curriculum_id_fkey" FOREIGN KEY ("curriculum_version_id", "curriculum_id") REFERENCES "curriculum_versions"("curriculum_version_id", "curriculum_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_assignments" ADD CONSTRAINT "curriculum_assignments_academic_session_id_school_id_fkey" FOREIGN KEY ("academic_session_id", "school_id") REFERENCES "academic_sessions"("academic_session_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_assignments" ADD CONSTRAINT "curriculum_assignments_term_id_school_id_fkey" FOREIGN KEY ("term_id", "school_id") REFERENCES "terms"("term_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_assignments" ADD CONSTRAINT "curriculum_assignments_academic_class_id_school_id_fkey" FOREIGN KEY ("academic_class_id", "school_id") REFERENCES "academic_classes"("academic_class_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_assignments" ADD CONSTRAINT "curriculum_assignments_school_programme_component_id_schoo_fkey" FOREIGN KEY ("school_programme_component_id", "school_id") REFERENCES "school_programme_components"("school_programme_component_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_assignments" ADD CONSTRAINT "curriculum_assignments_teacher_user_id_school_id_fkey" FOREIGN KEY ("teacher_user_id", "school_id") REFERENCES "users"("user_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_assignments" ADD CONSTRAINT "curriculum_assignments_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_assignments" ADD CONSTRAINT "curriculum_assignments_activated_by_id_fkey" FOREIGN KEY ("activated_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

