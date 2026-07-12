-- CreateEnum
CREATE TYPE "CurriculumSourceType" AS ENUM ('GOVERNMENT_CURRICULUM', 'SCHOOL_SCHEME_OF_WORK', 'INTERNATIONAL_FRAMEWORK', 'TEXTBOOK', 'TEACHER_MATERIAL', 'WEBSITE', 'INTERNAL_NOBLETECH_CONTENT', 'UPLOADED_DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "CurriculumSourceFormat" AS ENUM ('PDF', 'DOCX', 'XLSX', 'CSV', 'HTML', 'URL', 'TEXT', 'IMAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "ContentReviewStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'REVISION_REQUIRED', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MasterContentStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'APPROVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CurriculumSourceContentType" AS ENUM ('SECTION', 'TOPIC', 'CONCEPT', 'SKILL', 'LEARNING_OUTCOME', 'ACTIVITY', 'PROJECT', 'RESOURCE', 'ASSESSMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "MasterActivityType" AS ENUM ('DISCUSSION', 'EXPERIMENT', 'CREATIVE_TASK', 'CODING_TASK', 'ROBOTICS_TASK', 'ENGINEERING_CHALLENGE', 'RESEARCH_TASK', 'OTHER');

-- CreateEnum
CREATE TYPE "MasterProjectImplementationType" AS ENUM ('PHYSICAL_ROBOTICS', 'SIMULATION_ONLY', 'LOW_RESOURCE', 'NO_LAPTOP', 'INDIVIDUAL', 'GROUP', 'OTHER');

-- CreateEnum
CREATE TYPE "MasterResourceType" AS ENUM ('SOFTWARE', 'WEBSITE', 'HARDWARE', 'KIT', 'DOCUMENT', 'VIDEO', 'AUDIO', 'IMAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "MasterAssessmentType" AS ENUM ('QUIZ', 'PRACTICAL', 'PROJECT', 'ORAL', 'WRITTEN', 'PERFORMANCE', 'OTHER');

-- CreateTable
CREATE TABLE "curriculum_sources" (
    "curriculum_source_id" UUID NOT NULL,
    "school_id" UUID,
    "source_code" CITEXT,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "source_type" "CurriculumSourceType" NOT NULL,
    "source_format" "CurriculumSourceFormat" NOT NULL,
    "subject_id" UUID,
    "integration_domain_id" UUID,
    "programme_component_id" UUID,
    "class_level" VARCHAR(100),
    "term_label" VARCHAR(100),
    "education_level" VARCHAR(100),
    "curriculum_standard" VARCHAR(150),
    "framework_name" VARCHAR(150),
    "country_code" VARCHAR(10),
    "academic_year" VARCHAR(20),
    "version_label" VARCHAR(50),
    "publisher" VARCHAR(150),
    "author" VARCHAR(150),
    "source_url" TEXT,
    "usage_rights" VARCHAR(150) NOT NULL,
    "copyright_note" TEXT,
    "file_reference" VARCHAR(255),
    "original_file_name" VARCHAR(255),
    "mime_type" VARCHAR(150),
    "file_size" BIGINT,
    "checksum" VARCHAR(128),
    "status" "MasterContentStatus" NOT NULL DEFAULT 'DRAFT',
    "review_status" "ContentReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "uploaded_by_id" UUID,
    "reviewed_by_id" UUID,
    "approved_by_id" UUID,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_sources_pkey" PRIMARY KEY ("curriculum_source_id")
);

-- CreateTable
CREATE TABLE "curriculum_source_contents" (
    "curriculum_source_content_id" UUID NOT NULL,
    "curriculum_source_id" UUID NOT NULL,
    "sequence_order" INTEGER NOT NULL,
    "content_type" "CurriculumSourceContentType" NOT NULL,
    "heading" VARCHAR(200),
    "raw_text" TEXT,
    "structured_data" JSONB,
    "source_page" VARCHAR(50),
    "source_section" VARCHAR(150),
    "confidence_score" DECIMAL(5,2),
    "extraction_method" VARCHAR(100),
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_source_contents_pkey" PRIMARY KEY ("curriculum_source_content_id")
);

-- CreateTable
CREATE TABLE "master_curriculum_units" (
    "master_curriculum_unit_id" UUID NOT NULL,
    "school_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "code" CITEXT,
    "description" TEXT NOT NULL,
    "programme_component_id" UUID,
    "recommended_education_level" VARCHAR(100),
    "minimum_class_level" VARCHAR(100),
    "maximum_class_level" VARCHAR(100),
    "estimated_weeks" INTEGER,
    "status" "MasterContentStatus" NOT NULL DEFAULT 'DRAFT',
    "version_number" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "reviewed_by_id" UUID,
    "approved_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "approved_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "master_curriculum_units_pkey" PRIMARY KEY ("master_curriculum_unit_id")
);

-- CreateTable
CREATE TABLE "master_topics" (
    "master_topic_id" UUID NOT NULL,
    "school_id" UUID,
    "master_curriculum_unit_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "code" CITEXT,
    "description" TEXT NOT NULL,
    "sequence_order" INTEGER NOT NULL,
    "recommended_duration_minutes" INTEGER,
    "difficulty_level" VARCHAR(50),
    "prerequisite_note" TEXT,
    "status" "MasterContentStatus" NOT NULL DEFAULT 'DRAFT',
    "version_number" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "master_topics_pkey" PRIMARY KEY ("master_topic_id")
);

-- CreateTable
CREATE TABLE "master_concepts" (
    "master_concept_id" UUID NOT NULL,
    "school_id" UUID,
    "name" VARCHAR(200) NOT NULL,
    "code" CITEXT,
    "definition" TEXT NOT NULL,
    "explanation" TEXT,
    "category" VARCHAR(100),
    "status" "MasterContentStatus" NOT NULL DEFAULT 'DRAFT',
    "version_number" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "master_concepts_pkey" PRIMARY KEY ("master_concept_id")
);

-- CreateTable
CREATE TABLE "master_skills" (
    "master_skill_id" UUID NOT NULL,
    "school_id" UUID,
    "name" VARCHAR(200) NOT NULL,
    "code" CITEXT,
    "description" TEXT NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "progression_level" VARCHAR(50),
    "status" "MasterContentStatus" NOT NULL DEFAULT 'DRAFT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "master_skills_pkey" PRIMARY KEY ("master_skill_id")
);

-- CreateTable
CREATE TABLE "master_learning_outcomes" (
    "master_learning_outcome_id" UUID NOT NULL,
    "school_id" UUID,
    "statement" TEXT NOT NULL,
    "code" CITEXT,
    "bloom_level" VARCHAR(50),
    "measurable_verb" VARCHAR(100),
    "recommended_class_level" VARCHAR(100),
    "status" "MasterContentStatus" NOT NULL DEFAULT 'DRAFT',
    "version_number" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "master_learning_outcomes_pkey" PRIMARY KEY ("master_learning_outcome_id")
);

-- CreateTable
CREATE TABLE "master_activities" (
    "master_activity_id" UUID NOT NULL,
    "school_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "activity_type" "MasterActivityType" NOT NULL,
    "estimated_duration_minutes" INTEGER,
    "teacher_instructions" TEXT,
    "learner_instructions" TEXT,
    "grouping_type" VARCHAR(50),
    "safety_note" TEXT,
    "difficulty_level" VARCHAR(50),
    "status" "MasterContentStatus" NOT NULL DEFAULT 'DRAFT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "master_activities_pkey" PRIMARY KEY ("master_activity_id")
);

-- CreateTable
CREATE TABLE "master_projects" (
    "master_project_id" UUID NOT NULL,
    "school_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "project_type" VARCHAR(100),
    "difficulty_level" VARCHAR(50),
    "estimated_duration_minutes" INTEGER,
    "recommended_class_level" VARCHAR(100),
    "objective" TEXT,
    "expected_output" TEXT,
    "safety_note" TEXT,
    "status" "MasterContentStatus" NOT NULL DEFAULT 'DRAFT',
    "version_number" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "master_projects_pkey" PRIMARY KEY ("master_project_id")
);

-- CreateTable
CREATE TABLE "master_project_implementations" (
    "master_project_implementation_id" UUID NOT NULL,
    "school_id" UUID,
    "master_project_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "implementation_type" "MasterProjectImplementationType" NOT NULL,
    "description" TEXT NOT NULL,
    "required_device_count" INTEGER,
    "required_internet" BOOLEAN NOT NULL DEFAULT false,
    "estimated_duration_minutes" INTEGER,
    "learner_instructions" TEXT,
    "teacher_instructions" TEXT,
    "safety_instructions" TEXT,
    "sequence_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_project_implementations_pkey" PRIMARY KEY ("master_project_implementation_id")
);

-- CreateTable
CREATE TABLE "master_resources" (
    "master_resource_id" UUID NOT NULL,
    "school_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "resource_type" "MasterResourceType" NOT NULL,
    "resource_category" VARCHAR(100),
    "url" TEXT,
    "file_reference" VARCHAR(255),
    "platform_name" VARCHAR(150),
    "manufacturer" VARCHAR(150),
    "model_name" VARCHAR(150),
    "quantity_guidance" VARCHAR(100),
    "safety_note" TEXT,
    "requires_internet" BOOLEAN NOT NULL DEFAULT false,
    "requires_login" BOOLEAN NOT NULL DEFAULT false,
    "is_reusable" BOOLEAN NOT NULL DEFAULT true,
    "status" "MasterContentStatus" NOT NULL DEFAULT 'DRAFT',
    "review_status" "ContentReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "last_verified_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "master_resources_pkey" PRIMARY KEY ("master_resource_id")
);

-- CreateTable
CREATE TABLE "master_assessment_templates" (
    "master_assessment_template_id" UUID NOT NULL,
    "school_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "assessment_type" "MasterAssessmentType" NOT NULL,
    "instructions" TEXT,
    "maximum_score" DECIMAL(8,2),
    "passing_score" DECIMAL(8,2),
    "duration_minutes" INTEGER,
    "grading_method" VARCHAR(100),
    "template_data" JSONB,
    "status" "MasterContentStatus" NOT NULL DEFAULT 'DRAFT',
    "version_number" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "master_assessment_templates_pkey" PRIMARY KEY ("master_assessment_template_id")
);

-- CreateTable
CREATE TABLE "master_rubrics" (
    "master_rubric_id" UUID NOT NULL,
    "school_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "rubric_type" VARCHAR(100),
    "maximum_score" DECIMAL(8,2),
    "status" "MasterContentStatus" NOT NULL DEFAULT 'DRAFT',
    "version_number" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "master_rubrics_pkey" PRIMARY KEY ("master_rubric_id")
);

-- CreateTable
CREATE TABLE "master_rubric_criteria" (
    "master_rubric_criterion_id" UUID NOT NULL,
    "master_rubric_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "sequence_order" INTEGER NOT NULL,
    "maximum_score" DECIMAL(8,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_rubric_criteria_pkey" PRIMARY KEY ("master_rubric_criterion_id")
);

-- CreateTable
CREATE TABLE "master_rubric_levels" (
    "master_rubric_level_id" UUID NOT NULL,
    "master_rubric_criterion_id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "score_value" DECIMAL(8,2) NOT NULL,
    "sequence_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_rubric_levels_pkey" PRIMARY KEY ("master_rubric_level_id")
);

-- CreateTable
CREATE TABLE "master_curriculum_unit_subjects" (
    "master_curriculum_unit_subject_id" UUID NOT NULL,
    "master_curriculum_unit_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_curriculum_unit_subjects_pkey" PRIMARY KEY ("master_curriculum_unit_subject_id")
);

-- CreateTable
CREATE TABLE "master_curriculum_unit_integration_domains" (
    "master_curriculum_unit_integration_domain_id" UUID NOT NULL,
    "master_curriculum_unit_id" UUID NOT NULL,
    "integration_domain_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_curriculum_unit_integration_domains_pkey" PRIMARY KEY ("master_curriculum_unit_integration_domain_id")
);

-- CreateTable
CREATE TABLE "master_curriculum_unit_programme_components" (
    "master_curriculum_unit_programme_component_id" UUID NOT NULL,
    "master_curriculum_unit_id" UUID NOT NULL,
    "programme_component_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_curriculum_unit_programme_components_pkey" PRIMARY KEY ("master_curriculum_unit_programme_component_id")
);

-- CreateTable
CREATE TABLE "master_topic_subjects" (
    "master_topic_subject_id" UUID NOT NULL,
    "master_topic_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_topic_subjects_pkey" PRIMARY KEY ("master_topic_subject_id")
);

-- CreateTable
CREATE TABLE "master_topic_integration_domains" (
    "master_topic_integration_domain_id" UUID NOT NULL,
    "master_topic_id" UUID NOT NULL,
    "integration_domain_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_topic_integration_domains_pkey" PRIMARY KEY ("master_topic_integration_domain_id")
);

-- CreateTable
CREATE TABLE "master_topic_concepts" (
    "master_topic_concept_id" UUID NOT NULL,
    "master_topic_id" UUID NOT NULL,
    "master_concept_id" UUID NOT NULL,
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

    CONSTRAINT "master_topic_concepts_pkey" PRIMARY KEY ("master_topic_concept_id")
);

-- CreateTable
CREATE TABLE "master_topic_skills" (
    "master_topic_skill_id" UUID NOT NULL,
    "master_topic_id" UUID NOT NULL,
    "master_skill_id" UUID NOT NULL,
    "sequence_order" INTEGER,
    "proficiency_target" VARCHAR(50),
    "is_core" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_topic_skills_pkey" PRIMARY KEY ("master_topic_skill_id")
);

-- CreateTable
CREATE TABLE "master_topic_learning_outcomes" (
    "master_topic_learning_outcome_id" UUID NOT NULL,
    "master_topic_id" UUID NOT NULL,
    "master_learning_outcome_id" UUID NOT NULL,
    "sequence_order" INTEGER,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_topic_learning_outcomes_pkey" PRIMARY KEY ("master_topic_learning_outcome_id")
);

-- CreateTable
CREATE TABLE "master_topic_activities" (
    "master_topic_activity_id" UUID NOT NULL,
    "master_topic_id" UUID NOT NULL,
    "master_activity_id" UUID NOT NULL,
    "sequence_order" INTEGER,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_topic_activities_pkey" PRIMARY KEY ("master_topic_activity_id")
);

-- CreateTable
CREATE TABLE "master_topic_projects" (
    "master_topic_project_id" UUID NOT NULL,
    "master_topic_id" UUID NOT NULL,
    "master_project_id" UUID NOT NULL,
    "sequence_order" INTEGER,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_topic_projects_pkey" PRIMARY KEY ("master_topic_project_id")
);

-- CreateTable
CREATE TABLE "master_activity_resources" (
    "master_activity_resource_id" UUID NOT NULL,
    "master_activity_id" UUID NOT NULL,
    "master_resource_id" UUID NOT NULL,
    "sequence_order" INTEGER,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_activity_resources_pkey" PRIMARY KEY ("master_activity_resource_id")
);

-- CreateTable
CREATE TABLE "master_project_resources" (
    "master_project_resource_id" UUID NOT NULL,
    "master_project_id" UUID NOT NULL,
    "master_resource_id" UUID NOT NULL,
    "sequence_order" INTEGER,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_project_resources_pkey" PRIMARY KEY ("master_project_resource_id")
);

-- CreateTable
CREATE TABLE "master_project_skills" (
    "master_project_skill_id" UUID NOT NULL,
    "master_project_id" UUID NOT NULL,
    "master_skill_id" UUID NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_project_skills_pkey" PRIMARY KEY ("master_project_skill_id")
);

-- CreateTable
CREATE TABLE "master_project_learning_outcomes" (
    "master_project_learning_outcome_id" UUID NOT NULL,
    "master_project_id" UUID NOT NULL,
    "master_learning_outcome_id" UUID NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_project_learning_outcomes_pkey" PRIMARY KEY ("master_project_learning_outcome_id")
);

-- CreateTable
CREATE TABLE "master_assessment_template_learning_outcomes" (
    "master_assessment_template_learning_outcome_id" UUID NOT NULL,
    "master_assessment_template_id" UUID NOT NULL,
    "master_learning_outcome_id" UUID NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_assessment_template_learning_outcomes_pkey" PRIMARY KEY ("master_assessment_template_learning_outcome_id")
);

-- CreateTable
CREATE TABLE "curriculum_source_master_content_links" (
    "curriculum_source_master_content_link_id" UUID NOT NULL,
    "curriculum_source_id" UUID NOT NULL,
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
    "master_rubric_id" UUID,
    "source_version_label" VARCHAR(50),
    "source_page" VARCHAR(50),
    "source_section" VARCHAR(150),
    "extraction_note" TEXT,
    "adaptation_note" TEXT,
    "attribution" TEXT,
    "usage_restriction" VARCHAR(150),
    "review_status" "ContentReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_source_master_content_links_pkey" PRIMARY KEY ("curriculum_source_master_content_link_id")
);

-- CreateIndex
CREATE INDEX "curriculum_sources_school_id_status_idx" ON "curriculum_sources"("school_id", "status");

-- CreateIndex
CREATE INDEX "curriculum_sources_school_id_review_status_idx" ON "curriculum_sources"("school_id", "review_status");

-- CreateIndex
CREATE INDEX "curriculum_sources_school_id_subject_id_idx" ON "curriculum_sources"("school_id", "subject_id");

-- CreateIndex
CREATE INDEX "curriculum_sources_school_id_programme_component_id_idx" ON "curriculum_sources"("school_id", "programme_component_id");

-- CreateIndex
CREATE INDEX "curriculum_sources_review_status_is_active_idx" ON "curriculum_sources"("review_status", "is_active");

-- CreateIndex
CREATE INDEX "curriculum_source_contents_curriculum_source_id_content_typ_idx" ON "curriculum_source_contents"("curriculum_source_id", "content_type");

-- CreateIndex
CREATE INDEX "curriculum_source_contents_reviewed_reviewed_at_idx" ON "curriculum_source_contents"("reviewed", "reviewed_at");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_source_contents_curriculum_source_id_sequence_or_key" ON "curriculum_source_contents"("curriculum_source_id", "sequence_order");

-- CreateIndex
CREATE INDEX "master_curriculum_units_school_id_status_idx" ON "master_curriculum_units"("school_id", "status");

-- CreateIndex
CREATE INDEX "master_curriculum_units_programme_component_id_status_idx" ON "master_curriculum_units"("programme_component_id", "status");

-- CreateIndex
CREATE INDEX "master_curriculum_units_status_is_active_idx" ON "master_curriculum_units"("status", "is_active");

-- CreateIndex
CREATE INDEX "master_topics_master_curriculum_unit_id_status_idx" ON "master_topics"("master_curriculum_unit_id", "status");

-- CreateIndex
CREATE INDEX "master_topics_school_id_status_idx" ON "master_topics"("school_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "master_topics_master_curriculum_unit_id_sequence_order_key" ON "master_topics"("master_curriculum_unit_id", "sequence_order");

-- CreateIndex
CREATE INDEX "master_concepts_code_idx" ON "master_concepts"("code");

-- CreateIndex
CREATE INDEX "master_concepts_status_is_active_idx" ON "master_concepts"("status", "is_active");

-- CreateIndex
CREATE INDEX "master_skills_category_status_idx" ON "master_skills"("category", "status");

-- CreateIndex
CREATE INDEX "master_skills_status_is_active_idx" ON "master_skills"("status", "is_active");

-- CreateIndex
CREATE INDEX "master_learning_outcomes_bloom_level_status_idx" ON "master_learning_outcomes"("bloom_level", "status");

-- CreateIndex
CREATE INDEX "master_learning_outcomes_status_is_active_idx" ON "master_learning_outcomes"("status", "is_active");

-- CreateIndex
CREATE INDEX "master_activities_status_is_active_idx" ON "master_activities"("status", "is_active");

-- CreateIndex
CREATE INDEX "master_projects_difficulty_level_status_idx" ON "master_projects"("difficulty_level", "status");

-- CreateIndex
CREATE INDEX "master_projects_status_is_active_idx" ON "master_projects"("status", "is_active");

-- CreateIndex
CREATE INDEX "master_project_implementations_master_project_id_is_active_idx" ON "master_project_implementations"("master_project_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "master_project_implementations_master_project_id_sequence_o_key" ON "master_project_implementations"("master_project_id", "sequence_order");

-- CreateIndex
CREATE INDEX "master_resources_resource_type_review_status_idx" ON "master_resources"("resource_type", "review_status");

-- CreateIndex
CREATE INDEX "master_resources_status_is_active_idx" ON "master_resources"("status", "is_active");

-- CreateIndex
CREATE INDEX "master_assessment_templates_assessment_type_status_idx" ON "master_assessment_templates"("assessment_type", "status");

-- CreateIndex
CREATE INDEX "master_assessment_templates_status_is_active_idx" ON "master_assessment_templates"("status", "is_active");

-- CreateIndex
CREATE INDEX "master_rubrics_status_is_active_idx" ON "master_rubrics"("status", "is_active");

-- CreateIndex
CREATE INDEX "master_rubric_criteria_master_rubric_id_idx" ON "master_rubric_criteria"("master_rubric_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_rubric_criteria_master_rubric_id_sequence_order_key" ON "master_rubric_criteria"("master_rubric_id", "sequence_order");

-- CreateIndex
CREATE INDEX "master_rubric_levels_master_rubric_criterion_id_idx" ON "master_rubric_levels"("master_rubric_criterion_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_rubric_levels_master_rubric_criterion_id_sequence_or_key" ON "master_rubric_levels"("master_rubric_criterion_id", "sequence_order");

-- CreateIndex
CREATE INDEX "master_curriculum_unit_subjects_subject_id_idx" ON "master_curriculum_unit_subjects"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_curriculum_unit_subjects_master_curriculum_unit_id_s_key" ON "master_curriculum_unit_subjects"("master_curriculum_unit_id", "subject_id");

-- CreateIndex
CREATE INDEX "master_curriculum_unit_integration_domains_integration_doma_idx" ON "master_curriculum_unit_integration_domains"("integration_domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_curriculum_unit_integration_domains_master_curriculu_key" ON "master_curriculum_unit_integration_domains"("master_curriculum_unit_id", "integration_domain_id");

-- CreateIndex
CREATE INDEX "master_curriculum_unit_programme_components_programme_compo_idx" ON "master_curriculum_unit_programme_components"("programme_component_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_curriculum_unit_programme_components_master_curricul_key" ON "master_curriculum_unit_programme_components"("master_curriculum_unit_id", "programme_component_id");

-- CreateIndex
CREATE INDEX "master_topic_subjects_subject_id_idx" ON "master_topic_subjects"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_topic_subjects_master_topic_id_subject_id_key" ON "master_topic_subjects"("master_topic_id", "subject_id");

-- CreateIndex
CREATE INDEX "master_topic_integration_domains_integration_domain_id_idx" ON "master_topic_integration_domains"("integration_domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_topic_integration_domains_master_topic_id_integratio_key" ON "master_topic_integration_domains"("master_topic_id", "integration_domain_id");

-- CreateIndex
CREATE INDEX "master_topic_concepts_master_concept_id_idx" ON "master_topic_concepts"("master_concept_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_topic_concepts_master_topic_id_master_concept_id_key" ON "master_topic_concepts"("master_topic_id", "master_concept_id");

-- CreateIndex
CREATE INDEX "master_topic_skills_master_skill_id_idx" ON "master_topic_skills"("master_skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_topic_skills_master_topic_id_master_skill_id_key" ON "master_topic_skills"("master_topic_id", "master_skill_id");

-- CreateIndex
CREATE INDEX "master_topic_learning_outcomes_master_learning_outcome_id_idx" ON "master_topic_learning_outcomes"("master_learning_outcome_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_topic_learning_outcomes_master_topic_id_master_learn_key" ON "master_topic_learning_outcomes"("master_topic_id", "master_learning_outcome_id");

-- CreateIndex
CREATE INDEX "master_topic_activities_master_activity_id_idx" ON "master_topic_activities"("master_activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_topic_activities_master_topic_id_master_activity_id_key" ON "master_topic_activities"("master_topic_id", "master_activity_id");

-- CreateIndex
CREATE INDEX "master_topic_projects_master_project_id_idx" ON "master_topic_projects"("master_project_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_topic_projects_master_topic_id_master_project_id_key" ON "master_topic_projects"("master_topic_id", "master_project_id");

-- CreateIndex
CREATE INDEX "master_activity_resources_master_resource_id_idx" ON "master_activity_resources"("master_resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_activity_resources_master_activity_id_master_resourc_key" ON "master_activity_resources"("master_activity_id", "master_resource_id");

-- CreateIndex
CREATE INDEX "master_project_resources_master_resource_id_idx" ON "master_project_resources"("master_resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_project_resources_master_project_id_master_resource__key" ON "master_project_resources"("master_project_id", "master_resource_id");

-- CreateIndex
CREATE INDEX "master_project_skills_master_skill_id_idx" ON "master_project_skills"("master_skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_project_skills_master_project_id_master_skill_id_key" ON "master_project_skills"("master_project_id", "master_skill_id");

-- CreateIndex
CREATE INDEX "master_project_learning_outcomes_master_learning_outcome_id_idx" ON "master_project_learning_outcomes"("master_learning_outcome_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_project_learning_outcomes_master_project_id_master_l_key" ON "master_project_learning_outcomes"("master_project_id", "master_learning_outcome_id");

-- CreateIndex
CREATE INDEX "master_assessment_template_learning_outcomes_master_learnin_idx" ON "master_assessment_template_learning_outcomes"("master_learning_outcome_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_assessment_template_learning_outcomes_master_assessm_key" ON "master_assessment_template_learning_outcomes"("master_assessment_template_id", "master_learning_outcome_id");

-- CreateIndex
CREATE INDEX "curriculum_source_master_content_links_curriculum_source_id_idx" ON "curriculum_source_master_content_links"("curriculum_source_id", "review_status");

-- CreateIndex
CREATE INDEX "curriculum_source_master_content_links_review_status_create_idx" ON "curriculum_source_master_content_links"("review_status", "created_at");

-- AddForeignKey
ALTER TABLE "curriculum_source_contents" ADD CONSTRAINT "curriculum_source_contents_curriculum_source_id_fkey" FOREIGN KEY ("curriculum_source_id") REFERENCES "curriculum_sources"("curriculum_source_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topics" ADD CONSTRAINT "master_topics_master_curriculum_unit_id_fkey" FOREIGN KEY ("master_curriculum_unit_id") REFERENCES "master_curriculum_units"("master_curriculum_unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_project_implementations" ADD CONSTRAINT "master_project_implementations_master_project_id_fkey" FOREIGN KEY ("master_project_id") REFERENCES "master_projects"("master_project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_rubric_criteria" ADD CONSTRAINT "master_rubric_criteria_master_rubric_id_fkey" FOREIGN KEY ("master_rubric_id") REFERENCES "master_rubrics"("master_rubric_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_rubric_levels" ADD CONSTRAINT "master_rubric_levels_master_rubric_criterion_id_fkey" FOREIGN KEY ("master_rubric_criterion_id") REFERENCES "master_rubric_criteria"("master_rubric_criterion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_curriculum_unit_subjects" ADD CONSTRAINT "master_curriculum_unit_subjects_master_curriculum_unit_id_fkey" FOREIGN KEY ("master_curriculum_unit_id") REFERENCES "master_curriculum_units"("master_curriculum_unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_curriculum_unit_integration_domains" ADD CONSTRAINT "master_curriculum_unit_integration_domains_master_curricul_fkey" FOREIGN KEY ("master_curriculum_unit_id") REFERENCES "master_curriculum_units"("master_curriculum_unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_curriculum_unit_programme_components" ADD CONSTRAINT "master_curriculum_unit_programme_components_master_curricu_fkey" FOREIGN KEY ("master_curriculum_unit_id") REFERENCES "master_curriculum_units"("master_curriculum_unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_subjects" ADD CONSTRAINT "master_topic_subjects_master_topic_id_fkey" FOREIGN KEY ("master_topic_id") REFERENCES "master_topics"("master_topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_integration_domains" ADD CONSTRAINT "master_topic_integration_domains_master_topic_id_fkey" FOREIGN KEY ("master_topic_id") REFERENCES "master_topics"("master_topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_concepts" ADD CONSTRAINT "master_topic_concepts_master_topic_id_fkey" FOREIGN KEY ("master_topic_id") REFERENCES "master_topics"("master_topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_concepts" ADD CONSTRAINT "master_topic_concepts_master_concept_id_fkey" FOREIGN KEY ("master_concept_id") REFERENCES "master_concepts"("master_concept_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_skills" ADD CONSTRAINT "master_topic_skills_master_topic_id_fkey" FOREIGN KEY ("master_topic_id") REFERENCES "master_topics"("master_topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_skills" ADD CONSTRAINT "master_topic_skills_master_skill_id_fkey" FOREIGN KEY ("master_skill_id") REFERENCES "master_skills"("master_skill_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_learning_outcomes" ADD CONSTRAINT "master_topic_learning_outcomes_master_topic_id_fkey" FOREIGN KEY ("master_topic_id") REFERENCES "master_topics"("master_topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_learning_outcomes" ADD CONSTRAINT "master_topic_learning_outcomes_master_learning_outcome_id_fkey" FOREIGN KEY ("master_learning_outcome_id") REFERENCES "master_learning_outcomes"("master_learning_outcome_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_activities" ADD CONSTRAINT "master_topic_activities_master_topic_id_fkey" FOREIGN KEY ("master_topic_id") REFERENCES "master_topics"("master_topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_activities" ADD CONSTRAINT "master_topic_activities_master_activity_id_fkey" FOREIGN KEY ("master_activity_id") REFERENCES "master_activities"("master_activity_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_projects" ADD CONSTRAINT "master_topic_projects_master_topic_id_fkey" FOREIGN KEY ("master_topic_id") REFERENCES "master_topics"("master_topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_projects" ADD CONSTRAINT "master_topic_projects_master_project_id_fkey" FOREIGN KEY ("master_project_id") REFERENCES "master_projects"("master_project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_activity_resources" ADD CONSTRAINT "master_activity_resources_master_activity_id_fkey" FOREIGN KEY ("master_activity_id") REFERENCES "master_activities"("master_activity_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_activity_resources" ADD CONSTRAINT "master_activity_resources_master_resource_id_fkey" FOREIGN KEY ("master_resource_id") REFERENCES "master_resources"("master_resource_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_project_resources" ADD CONSTRAINT "master_project_resources_master_project_id_fkey" FOREIGN KEY ("master_project_id") REFERENCES "master_projects"("master_project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_project_resources" ADD CONSTRAINT "master_project_resources_master_resource_id_fkey" FOREIGN KEY ("master_resource_id") REFERENCES "master_resources"("master_resource_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_project_skills" ADD CONSTRAINT "master_project_skills_master_project_id_fkey" FOREIGN KEY ("master_project_id") REFERENCES "master_projects"("master_project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_project_skills" ADD CONSTRAINT "master_project_skills_master_skill_id_fkey" FOREIGN KEY ("master_skill_id") REFERENCES "master_skills"("master_skill_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_project_learning_outcomes" ADD CONSTRAINT "master_project_learning_outcomes_master_project_id_fkey" FOREIGN KEY ("master_project_id") REFERENCES "master_projects"("master_project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_project_learning_outcomes" ADD CONSTRAINT "master_project_learning_outcomes_master_learning_outcome_i_fkey" FOREIGN KEY ("master_learning_outcome_id") REFERENCES "master_learning_outcomes"("master_learning_outcome_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_assessment_template_learning_outcomes" ADD CONSTRAINT "master_assessment_template_learning_outcomes_master_assess_fkey" FOREIGN KEY ("master_assessment_template_id") REFERENCES "master_assessment_templates"("master_assessment_template_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_assessment_template_learning_outcomes" ADD CONSTRAINT "master_assessment_template_learning_outcomes_master_learni_fkey" FOREIGN KEY ("master_learning_outcome_id") REFERENCES "master_learning_outcomes"("master_learning_outcome_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_master_content_links" ADD CONSTRAINT "curriculum_source_master_content_links_curriculum_source_i_fkey" FOREIGN KEY ("curriculum_source_id") REFERENCES "curriculum_sources"("curriculum_source_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_master_content_links" ADD CONSTRAINT "curriculum_source_master_content_links_master_curriculum_u_fkey" FOREIGN KEY ("master_curriculum_unit_id") REFERENCES "master_curriculum_units"("master_curriculum_unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_master_content_links" ADD CONSTRAINT "curriculum_source_master_content_links_master_topic_id_fkey" FOREIGN KEY ("master_topic_id") REFERENCES "master_topics"("master_topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_master_content_links" ADD CONSTRAINT "curriculum_source_master_content_links_master_concept_id_fkey" FOREIGN KEY ("master_concept_id") REFERENCES "master_concepts"("master_concept_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_master_content_links" ADD CONSTRAINT "curriculum_source_master_content_links_master_skill_id_fkey" FOREIGN KEY ("master_skill_id") REFERENCES "master_skills"("master_skill_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_master_content_links" ADD CONSTRAINT "curriculum_source_master_content_links_master_learning_out_fkey" FOREIGN KEY ("master_learning_outcome_id") REFERENCES "master_learning_outcomes"("master_learning_outcome_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_master_content_links" ADD CONSTRAINT "curriculum_source_master_content_links_master_activity_id_fkey" FOREIGN KEY ("master_activity_id") REFERENCES "master_activities"("master_activity_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_master_content_links" ADD CONSTRAINT "curriculum_source_master_content_links_master_project_id_fkey" FOREIGN KEY ("master_project_id") REFERENCES "master_projects"("master_project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_master_content_links" ADD CONSTRAINT "curriculum_source_master_content_links_master_project_impl_fkey" FOREIGN KEY ("master_project_implementation_id") REFERENCES "master_project_implementations"("master_project_implementation_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_master_content_links" ADD CONSTRAINT "curriculum_source_master_content_links_master_resource_id_fkey" FOREIGN KEY ("master_resource_id") REFERENCES "master_resources"("master_resource_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_master_content_links" ADD CONSTRAINT "curriculum_source_master_content_links_master_assessment_t_fkey" FOREIGN KEY ("master_assessment_template_id") REFERENCES "master_assessment_templates"("master_assessment_template_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_master_content_links" ADD CONSTRAINT "curriculum_source_master_content_links_master_rubric_id_fkey" FOREIGN KEY ("master_rubric_id") REFERENCES "master_rubrics"("master_rubric_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_sources" ADD CONSTRAINT "curriculum_sources_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_sources" ADD CONSTRAINT "curriculum_sources_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_sources" ADD CONSTRAINT "curriculum_sources_integration_domain_id_fkey" FOREIGN KEY ("integration_domain_id") REFERENCES "integration_domains"("integration_domain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_sources" ADD CONSTRAINT "curriculum_sources_programme_component_id_fkey" FOREIGN KEY ("programme_component_id") REFERENCES "programme_components"("programme_component_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_sources" ADD CONSTRAINT "curriculum_sources_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_sources" ADD CONSTRAINT "curriculum_sources_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_sources" ADD CONSTRAINT "curriculum_sources_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_contents" ADD CONSTRAINT "curriculum_source_contents_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_curriculum_units" ADD CONSTRAINT "master_curriculum_units_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_curriculum_units" ADD CONSTRAINT "master_curriculum_units_programme_component_id_fkey" FOREIGN KEY ("programme_component_id") REFERENCES "programme_components"("programme_component_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_curriculum_units" ADD CONSTRAINT "master_curriculum_units_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_curriculum_units" ADD CONSTRAINT "master_curriculum_units_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_curriculum_units" ADD CONSTRAINT "master_curriculum_units_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topics" ADD CONSTRAINT "master_topics_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topics" ADD CONSTRAINT "master_topics_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_concepts" ADD CONSTRAINT "master_concepts_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_concepts" ADD CONSTRAINT "master_concepts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_skills" ADD CONSTRAINT "master_skills_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_skills" ADD CONSTRAINT "master_skills_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_learning_outcomes" ADD CONSTRAINT "master_learning_outcomes_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_learning_outcomes" ADD CONSTRAINT "master_learning_outcomes_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_activities" ADD CONSTRAINT "master_activities_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_activities" ADD CONSTRAINT "master_activities_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_projects" ADD CONSTRAINT "master_projects_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_projects" ADD CONSTRAINT "master_projects_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_project_implementations" ADD CONSTRAINT "master_project_implementations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_project_implementations" ADD CONSTRAINT "master_project_implementations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_resources" ADD CONSTRAINT "master_resources_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_resources" ADD CONSTRAINT "master_resources_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_assessment_templates" ADD CONSTRAINT "master_assessment_templates_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_assessment_templates" ADD CONSTRAINT "master_assessment_templates_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_rubrics" ADD CONSTRAINT "master_rubrics_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_rubrics" ADD CONSTRAINT "master_rubrics_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_curriculum_unit_subjects" ADD CONSTRAINT "master_curriculum_unit_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_curriculum_unit_subjects" ADD CONSTRAINT "master_curriculum_unit_subjects_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_curriculum_unit_integration_domains" ADD CONSTRAINT "master_curriculum_unit_integration_domains_domain_id_fkey" FOREIGN KEY ("integration_domain_id") REFERENCES "integration_domains"("integration_domain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_curriculum_unit_integration_domains" ADD CONSTRAINT "master_curriculum_unit_integration_domains_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_curriculum_unit_programme_components" ADD CONSTRAINT "master_curriculum_unit_programme_components_component_id_fkey" FOREIGN KEY ("programme_component_id") REFERENCES "programme_components"("programme_component_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_curriculum_unit_programme_components" ADD CONSTRAINT "master_curriculum_unit_programme_components_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_subjects" ADD CONSTRAINT "master_topic_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_subjects" ADD CONSTRAINT "master_topic_subjects_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_integration_domains" ADD CONSTRAINT "master_topic_integration_domains_domain_id_fkey" FOREIGN KEY ("integration_domain_id") REFERENCES "integration_domains"("integration_domain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_integration_domains" ADD CONSTRAINT "master_topic_integration_domains_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_concepts" ADD CONSTRAINT "master_topic_concepts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_skills" ADD CONSTRAINT "master_topic_skills_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_learning_outcomes" ADD CONSTRAINT "master_topic_learning_outcomes_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_activities" ADD CONSTRAINT "master_topic_activities_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_topic_projects" ADD CONSTRAINT "master_topic_projects_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_activity_resources" ADD CONSTRAINT "master_activity_resources_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_project_resources" ADD CONSTRAINT "master_project_resources_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_project_skills" ADD CONSTRAINT "master_project_skills_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_project_learning_outcomes" ADD CONSTRAINT "master_project_learning_outcomes_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_assessment_template_learning_outcomes" ADD CONSTRAINT "master_assessment_template_learning_outcomes_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_source_master_content_links" ADD CONSTRAINT "curriculum_source_master_content_links_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "curriculum_source_contents"
ADD CONSTRAINT "curriculum_source_contents_sequence_positive_chk"
CHECK ("sequence_order" > 0);

-- AddCheckConstraint
ALTER TABLE "curriculum_source_contents"
ADD CONSTRAINT "curriculum_source_contents_confidence_range_chk"
CHECK ("confidence_score" IS NULL OR ("confidence_score" >= 0 AND "confidence_score" <= 100));

-- AddCheckConstraint
ALTER TABLE "master_topics"
ADD CONSTRAINT "master_topics_duration_positive_chk"
CHECK ("recommended_duration_minutes" IS NULL OR "recommended_duration_minutes" > 0);

-- AddCheckConstraint
ALTER TABLE "master_curriculum_units"
ADD CONSTRAINT "master_curriculum_units_weeks_positive_chk"
CHECK ("estimated_weeks" IS NULL OR "estimated_weeks" > 0);

-- AddCheckConstraint
ALTER TABLE "master_projects"
ADD CONSTRAINT "master_projects_duration_positive_chk"
CHECK ("estimated_duration_minutes" IS NULL OR "estimated_duration_minutes" > 0);

-- AddCheckConstraint
ALTER TABLE "master_project_implementations"
ADD CONSTRAINT "master_project_implementations_duration_positive_chk"
CHECK ("estimated_duration_minutes" IS NULL OR "estimated_duration_minutes" > 0);

-- AddCheckConstraint
ALTER TABLE "master_project_implementations"
ADD CONSTRAINT "master_project_implementations_sequence_positive_chk"
CHECK ("sequence_order" > 0);

-- AddCheckConstraint
ALTER TABLE "master_project_implementations"
ADD CONSTRAINT "master_project_implementations_device_count_positive_chk"
CHECK ("required_device_count" IS NULL OR "required_device_count" > 0);

-- AddCheckConstraint
ALTER TABLE "master_assessment_templates"
ADD CONSTRAINT "master_assessment_templates_duration_positive_chk"
CHECK ("duration_minutes" IS NULL OR "duration_minutes" > 0);

-- AddCheckConstraint
ALTER TABLE "master_assessment_templates"
ADD CONSTRAINT "master_assessment_templates_scores_non_negative_chk"
CHECK (
    ("maximum_score" IS NULL OR "maximum_score" >= 0)
    AND ("passing_score" IS NULL OR "passing_score" >= 0)
    AND (
        "maximum_score" IS NULL
        OR "passing_score" IS NULL
        OR "passing_score" <= "maximum_score"
    )
);

-- AddCheckConstraint
ALTER TABLE "master_rubrics"
ADD CONSTRAINT "master_rubrics_maximum_score_non_negative_chk"
CHECK ("maximum_score" IS NULL OR "maximum_score" >= 0);

-- AddCheckConstraint
ALTER TABLE "master_rubric_criteria"
ADD CONSTRAINT "master_rubric_criteria_sequence_positive_chk"
CHECK ("sequence_order" > 0);

-- AddCheckConstraint
ALTER TABLE "master_rubric_levels"
ADD CONSTRAINT "master_rubric_levels_sequence_positive_chk"
CHECK ("sequence_order" > 0);

-- AddCheckConstraint
ALTER TABLE "master_rubric_levels"
ADD CONSTRAINT "master_rubric_levels_score_non_negative_chk"
CHECK ("score_value" >= 0);

-- AddCheckConstraint
ALTER TABLE "curriculum_sources"
ADD CONSTRAINT "curriculum_sources_source_type_scope_chk"
CHECK (
    ("source_type" <> 'SCHOOL_SCHEME_OF_WORK' OR "school_id" IS NOT NULL)
    AND ("source_type" <> 'INTERNAL_NOBLETECH_CONTENT' OR "school_id" IS NULL)
);

-- AddCheckConstraint
ALTER TABLE "curriculum_sources"
ADD CONSTRAINT "curriculum_sources_approval_inactive_archive_chk"
CHECK (NOT ("status" = 'APPROVED' AND "is_active" = false AND "archived_at" IS NULL));

-- AddCheckConstraint
ALTER TABLE "master_curriculum_units"
ADD CONSTRAINT "master_curriculum_units_approval_inactive_archive_chk"
CHECK (NOT ("status" = 'APPROVED' AND "is_active" = false AND "archived_at" IS NULL));

-- AddCheckConstraint
ALTER TABLE "master_topics"
ADD CONSTRAINT "master_topics_approval_inactive_archive_chk"
CHECK (NOT ("status" = 'APPROVED' AND "is_active" = false AND "archived_at" IS NULL));

-- AddCheckConstraint
ALTER TABLE "master_concepts"
ADD CONSTRAINT "master_concepts_approval_inactive_archive_chk"
CHECK (NOT ("status" = 'APPROVED' AND "is_active" = false AND "archived_at" IS NULL));

-- AddCheckConstraint
ALTER TABLE "master_skills"
ADD CONSTRAINT "master_skills_approval_inactive_archive_chk"
CHECK (NOT ("status" = 'APPROVED' AND "is_active" = false AND "archived_at" IS NULL));

-- AddCheckConstraint
ALTER TABLE "master_learning_outcomes"
ADD CONSTRAINT "master_learning_outcomes_approval_inactive_archive_chk"
CHECK (NOT ("status" = 'APPROVED' AND "is_active" = false AND "archived_at" IS NULL));

-- AddCheckConstraint
ALTER TABLE "master_activities"
ADD CONSTRAINT "master_activities_approval_inactive_archive_chk"
CHECK (NOT ("status" = 'APPROVED' AND "is_active" = false AND "archived_at" IS NULL));

-- AddCheckConstraint
ALTER TABLE "master_projects"
ADD CONSTRAINT "master_projects_approval_inactive_archive_chk"
CHECK (NOT ("status" = 'APPROVED' AND "is_active" = false AND "archived_at" IS NULL));

-- AddCheckConstraint
ALTER TABLE "master_resources"
ADD CONSTRAINT "master_resources_approval_inactive_archive_chk"
CHECK (NOT ("status" = 'APPROVED' AND "is_active" = false AND "archived_at" IS NULL));

-- AddCheckConstraint
ALTER TABLE "master_assessment_templates"
ADD CONSTRAINT "master_assessment_templates_approval_inactive_archive_chk"
CHECK (NOT ("status" = 'APPROVED' AND "is_active" = false AND "archived_at" IS NULL));

-- AddCheckConstraint
ALTER TABLE "master_rubrics"
ADD CONSTRAINT "master_rubrics_approval_inactive_archive_chk"
CHECK (NOT ("status" = 'APPROVED' AND "is_active" = false AND "archived_at" IS NULL));

-- AddCheckConstraint
ALTER TABLE "curriculum_source_master_content_links"
ADD CONSTRAINT "curriculum_source_master_content_links_single_target_chk"
CHECK (
    (
        (CASE WHEN "master_curriculum_unit_id" IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN "master_topic_id" IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN "master_concept_id" IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN "master_skill_id" IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN "master_learning_outcome_id" IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN "master_activity_id" IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN "master_project_id" IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN "master_project_implementation_id" IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN "master_resource_id" IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN "master_assessment_template_id" IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN "master_rubric_id" IS NULL THEN 0 ELSE 1 END)
    ) = 1
);

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "curriculum_sources_global_source_code_active_unique_idx"
ON "curriculum_sources"("source_code")
WHERE "school_id" IS NULL
    AND "source_code" IS NOT NULL
    AND "archived_at" IS NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "curriculum_sources_school_source_code_active_unique_idx"
ON "curriculum_sources"("school_id", "source_code")
WHERE "school_id" IS NOT NULL
    AND "source_code" IS NOT NULL
    AND "archived_at" IS NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "master_curriculum_units_global_code_active_unique_idx"
ON "master_curriculum_units"("code")
WHERE "school_id" IS NULL
    AND "code" IS NOT NULL
    AND "archived_at" IS NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "master_curriculum_units_school_code_active_unique_idx"
ON "master_curriculum_units"("school_id", "code")
WHERE "school_id" IS NOT NULL
    AND "code" IS NOT NULL
    AND "archived_at" IS NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "master_concepts_global_code_active_unique_idx"
ON "master_concepts"("code")
WHERE "school_id" IS NULL
    AND "code" IS NOT NULL
    AND "archived_at" IS NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "master_concepts_school_code_active_unique_idx"
ON "master_concepts"("school_id", "code")
WHERE "school_id" IS NOT NULL
    AND "code" IS NOT NULL
    AND "archived_at" IS NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "curriculum_source_master_content_links_unit_unique_idx"
ON "curriculum_source_master_content_links"("curriculum_source_id", "master_curriculum_unit_id")
WHERE "master_curriculum_unit_id" IS NOT NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "curriculum_source_master_content_links_topic_unique_idx"
ON "curriculum_source_master_content_links"("curriculum_source_id", "master_topic_id")
WHERE "master_topic_id" IS NOT NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "curriculum_source_master_content_links_concept_unique_idx"
ON "curriculum_source_master_content_links"("curriculum_source_id", "master_concept_id")
WHERE "master_concept_id" IS NOT NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "curriculum_source_master_content_links_skill_unique_idx"
ON "curriculum_source_master_content_links"("curriculum_source_id", "master_skill_id")
WHERE "master_skill_id" IS NOT NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "curriculum_source_master_content_links_outcome_unique_idx"
ON "curriculum_source_master_content_links"("curriculum_source_id", "master_learning_outcome_id")
WHERE "master_learning_outcome_id" IS NOT NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "curriculum_source_master_content_links_activity_unique_idx"
ON "curriculum_source_master_content_links"("curriculum_source_id", "master_activity_id")
WHERE "master_activity_id" IS NOT NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "curriculum_source_master_content_links_project_unique_idx"
ON "curriculum_source_master_content_links"("curriculum_source_id", "master_project_id")
WHERE "master_project_id" IS NOT NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "curriculum_source_master_content_links_impl_unique_idx"
ON "curriculum_source_master_content_links"("curriculum_source_id", "master_project_implementation_id")
WHERE "master_project_implementation_id" IS NOT NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "curriculum_source_master_content_links_resource_unique_idx"
ON "curriculum_source_master_content_links"("curriculum_source_id", "master_resource_id")
WHERE "master_resource_id" IS NOT NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "curriculum_source_master_content_links_assessment_unique_idx"
ON "curriculum_source_master_content_links"("curriculum_source_id", "master_assessment_template_id")
WHERE "master_assessment_template_id" IS NOT NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "curriculum_source_master_content_links_rubric_unique_idx"
ON "curriculum_source_master_content_links"("curriculum_source_id", "master_rubric_id")
WHERE "master_rubric_id" IS NOT NULL;

-- AddIndex
CREATE INDEX "curriculum_sources_global_vs_school_lookup_idx"
ON "curriculum_sources"("school_id", "is_active", "status", "review_status");

-- AddIndex
CREATE INDEX "master_curriculum_units_archive_filter_idx"
ON "master_curriculum_units"("status", "is_active", "archived_at");

-- AddIndex
CREATE INDEX "master_resources_verification_filter_idx"
ON "master_resources"("review_status", "last_verified_at", "status");

