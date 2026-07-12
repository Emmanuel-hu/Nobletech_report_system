-- CreateEnum
CREATE TYPE "AcademicSessionStatus" AS ENUM ('PLANNED', 'ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TermStatus" AS ENUM ('PLANNED', 'ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AcademicClassStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EnrolmentStatus" AS ENUM ('PENDING', 'ACTIVE', 'PROMOTED', 'TRANSFERRED', 'WITHDRAWN', 'GRADUATED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AcademicClassTeacherAssignmentType" AS ENUM ('CLASS_TEACHER', 'ASSISTANT_TEACHER', 'SUPERVISOR');

-- DropIndex
DROP INDEX "students_student_number_key";

-- CreateTable
CREATE TABLE "academic_sessions" (
    "academic_session_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "session_name" VARCHAR(100) NOT NULL,
    "session_code" VARCHAR(50) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "AcademicSessionStatus" NOT NULL DEFAULT 'PLANNED',
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_sessions_pkey" PRIMARY KEY ("academic_session_id")
);

-- CreateTable
CREATE TABLE "terms" (
    "term_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "academic_session_id" UUID NOT NULL,
    "term_name" VARCHAR(100) NOT NULL,
    "term_code" VARCHAR(50) NOT NULL,
    "sequence_order" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "TermStatus" NOT NULL DEFAULT 'PLANNED',
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "terms_pkey" PRIMARY KEY ("term_id")
);

-- CreateTable
CREATE TABLE "academic_classes" (
    "academic_class_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "class_name" VARCHAR(100) NOT NULL,
    "class_code" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(120),
    "level_order" INTEGER NOT NULL,
    "education_level" VARCHAR(100),
    "minimum_age" INTEGER,
    "maximum_age" INTEGER,
    "status" "AcademicClassStatus" NOT NULL DEFAULT 'ACTIVE',
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_classes_pkey" PRIMARY KEY ("academic_class_id")
);

-- CreateTable
CREATE TABLE "student_enrolments" (
    "student_enrolment_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "academic_session_id" UUID NOT NULL,
    "term_id" UUID,
    "academic_class_id" UUID NOT NULL,
    "enrolment_status" "EnrolmentStatus" NOT NULL DEFAULT 'PENDING',
    "enrolment_date" DATE NOT NULL,
    "completion_date" DATE,
    "withdrawal_date" DATE,
    "transfer_date" DATE,
    "previous_enrolment_id" UUID,
    "promoted_from_enrolment_id" UUID,
    "notes" TEXT,
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_enrolments_pkey" PRIMARY KEY ("student_enrolment_id")
);

-- CreateTable
CREATE TABLE "academic_class_teacher_assignments" (
    "academic_class_teacher_assignment_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "academic_session_id" UUID NOT NULL,
    "term_id" UUID,
    "academic_class_id" UUID NOT NULL,
    "assignment_type" "AcademicClassTeacherAssignmentType" NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "assigned_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_class_teacher_assignments_pkey" PRIMARY KEY ("academic_class_teacher_assignment_id")
);

-- CreateIndex
CREATE INDEX "academic_sessions_school_id_status_idx" ON "academic_sessions"("school_id", "status");

-- CreateIndex
CREATE INDEX "academic_sessions_school_id_is_current_idx" ON "academic_sessions"("school_id", "is_current");

-- CreateIndex
CREATE UNIQUE INDEX "academic_sessions_school_id_session_name_key" ON "academic_sessions"("school_id", "session_name");

-- CreateIndex
CREATE UNIQUE INDEX "academic_sessions_school_id_session_code_key" ON "academic_sessions"("school_id", "session_code");

-- CreateIndex
CREATE UNIQUE INDEX "academic_sessions_academic_session_id_school_id_key" ON "academic_sessions"("academic_session_id", "school_id");

-- CreateIndex
CREATE INDEX "terms_school_id_status_idx" ON "terms"("school_id", "status");

-- CreateIndex
CREATE INDEX "terms_academic_session_id_sequence_order_idx" ON "terms"("academic_session_id", "sequence_order");

-- CreateIndex
CREATE INDEX "terms_school_id_is_current_idx" ON "terms"("school_id", "is_current");

-- CreateIndex
CREATE UNIQUE INDEX "terms_academic_session_id_term_name_key" ON "terms"("academic_session_id", "term_name");

-- CreateIndex
CREATE UNIQUE INDEX "terms_academic_session_id_term_code_key" ON "terms"("academic_session_id", "term_code");

-- CreateIndex
CREATE UNIQUE INDEX "terms_academic_session_id_sequence_order_key" ON "terms"("academic_session_id", "sequence_order");

-- CreateIndex
CREATE UNIQUE INDEX "terms_term_id_school_id_key" ON "terms"("term_id", "school_id");

-- CreateIndex
CREATE INDEX "academic_classes_school_id_status_idx" ON "academic_classes"("school_id", "status");

-- CreateIndex
CREATE INDEX "academic_classes_school_id_level_order_idx" ON "academic_classes"("school_id", "level_order");

-- CreateIndex
CREATE UNIQUE INDEX "academic_classes_school_id_class_name_key" ON "academic_classes"("school_id", "class_name");

-- CreateIndex
CREATE UNIQUE INDEX "academic_classes_school_id_class_code_key" ON "academic_classes"("school_id", "class_code");

-- CreateIndex
CREATE UNIQUE INDEX "academic_classes_academic_class_id_school_id_key" ON "academic_classes"("academic_class_id", "school_id");

-- CreateIndex
CREATE INDEX "student_enrolments_school_id_enrolment_status_idx" ON "student_enrolments"("school_id", "enrolment_status");

-- CreateIndex
CREATE INDEX "student_enrolments_student_id_academic_session_id_idx" ON "student_enrolments"("student_id", "academic_session_id");

-- CreateIndex
CREATE INDEX "student_enrolments_academic_class_id_academic_session_id_idx" ON "student_enrolments"("academic_class_id", "academic_session_id");

-- CreateIndex
CREATE INDEX "student_enrolments_school_id_academic_session_id_academic_c_idx" ON "student_enrolments"("school_id", "academic_session_id", "academic_class_id");

-- CreateIndex
CREATE INDEX "student_enrolments_term_id_idx" ON "student_enrolments"("term_id");

-- CreateIndex
CREATE INDEX "academic_class_teacher_assignments_school_id_is_active_idx" ON "academic_class_teacher_assignments"("school_id", "is_active");

-- CreateIndex
CREATE INDEX "academic_class_teacher_assignments_user_id_academic_session_idx" ON "academic_class_teacher_assignments"("user_id", "academic_session_id", "is_active");

-- CreateIndex
CREATE INDEX "academic_class_teacher_assignments_academic_class_id_academ_idx" ON "academic_class_teacher_assignments"("academic_class_id", "academic_session_id", "is_active");

-- CreateIndex
CREATE INDEX "academic_class_teacher_assignments_term_id_idx" ON "academic_class_teacher_assignments"("term_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_school_id_student_number_key" ON "students"("school_id", "student_number");

-- CreateIndex
CREATE UNIQUE INDEX "students_student_id_school_id_key" ON "students"("student_id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_id_school_id_key" ON "users"("user_id", "school_id");

-- AddForeignKey
ALTER TABLE "academic_sessions" ADD CONSTRAINT "academic_sessions_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_sessions" ADD CONSTRAINT "academic_sessions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terms" ADD CONSTRAINT "terms_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terms" ADD CONSTRAINT "terms_academic_session_id_school_id_fkey" FOREIGN KEY ("academic_session_id", "school_id") REFERENCES "academic_sessions"("academic_session_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_classes" ADD CONSTRAINT "academic_classes_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrolments" ADD CONSTRAINT "student_enrolments_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrolments" ADD CONSTRAINT "student_enrolments_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("student_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrolments" ADD CONSTRAINT "student_enrolments_academic_session_id_school_id_fkey" FOREIGN KEY ("academic_session_id", "school_id") REFERENCES "academic_sessions"("academic_session_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrolments" ADD CONSTRAINT "student_enrolments_term_id_school_id_fkey" FOREIGN KEY ("term_id", "school_id") REFERENCES "terms"("term_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrolments" ADD CONSTRAINT "student_enrolments_academic_class_id_school_id_fkey" FOREIGN KEY ("academic_class_id", "school_id") REFERENCES "academic_classes"("academic_class_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrolments" ADD CONSTRAINT "student_enrolments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrolments" ADD CONSTRAINT "student_enrolments_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrolments" ADD CONSTRAINT "student_enrolments_previous_enrolment_id_fkey" FOREIGN KEY ("previous_enrolment_id") REFERENCES "student_enrolments"("student_enrolment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrolments" ADD CONSTRAINT "student_enrolments_promoted_from_enrolment_id_fkey" FOREIGN KEY ("promoted_from_enrolment_id") REFERENCES "student_enrolments"("student_enrolment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_class_teacher_assignments" ADD CONSTRAINT "academic_class_teacher_assignments_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_class_teacher_assignments" ADD CONSTRAINT "academic_class_teacher_assignments_user_id_school_id_fkey" FOREIGN KEY ("user_id", "school_id") REFERENCES "users"("user_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_class_teacher_assignments" ADD CONSTRAINT "academic_class_teacher_assignments_academic_session_id_sch_fkey" FOREIGN KEY ("academic_session_id", "school_id") REFERENCES "academic_sessions"("academic_session_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_class_teacher_assignments" ADD CONSTRAINT "academic_class_teacher_assignments_term_id_school_id_fkey" FOREIGN KEY ("term_id", "school_id") REFERENCES "terms"("term_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_class_teacher_assignments" ADD CONSTRAINT "academic_class_teacher_assignments_academic_class_id_schoo_fkey" FOREIGN KEY ("academic_class_id", "school_id") REFERENCES "academic_classes"("academic_class_id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_class_teacher_assignments" ADD CONSTRAINT "academic_class_teacher_assignments_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "academic_sessions"
ADD CONSTRAINT "academic_sessions_date_range_chk"
CHECK ("start_date" < "end_date");

-- AddCheckConstraint
ALTER TABLE "terms"
ADD CONSTRAINT "terms_date_range_chk"
CHECK ("start_date" < "end_date");

-- AddCheckConstraint
ALTER TABLE "terms"
ADD CONSTRAINT "terms_sequence_order_chk"
CHECK ("sequence_order" > 0);

-- AddCheckConstraint
ALTER TABLE "academic_classes"
ADD CONSTRAINT "academic_classes_age_range_chk"
CHECK (
    "minimum_age" IS NULL
    OR "maximum_age" IS NULL
    OR "minimum_age" <= "maximum_age"
);

-- AddCheckConstraint
ALTER TABLE "student_enrolments"
ADD CONSTRAINT "student_enrolments_completion_date_chk"
CHECK ("completion_date" IS NULL OR "completion_date" >= "enrolment_date");

-- AddCheckConstraint
ALTER TABLE "student_enrolments"
ADD CONSTRAINT "student_enrolments_withdrawal_date_chk"
CHECK ("withdrawal_date" IS NULL OR "withdrawal_date" >= "enrolment_date");

-- AddCheckConstraint
ALTER TABLE "student_enrolments"
ADD CONSTRAINT "student_enrolments_transfer_date_chk"
CHECK ("transfer_date" IS NULL OR "transfer_date" >= "enrolment_date");

-- AddCheckConstraint
ALTER TABLE "academic_class_teacher_assignments"
ADD CONSTRAINT "academic_class_teacher_assignments_date_range_chk"
CHECK ("end_date" IS NULL OR "end_date" >= "start_date");

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "academic_sessions_one_current_active_per_school_idx"
ON "academic_sessions"("school_id")
WHERE "is_current" = true
    AND "status" = 'ACTIVE'
    AND "archived_at" IS NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "terms_one_current_active_per_school_idx"
ON "terms"("school_id")
WHERE "is_current" = true
    AND "status" = 'ACTIVE'
    AND "archived_at" IS NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "student_enrolments_active_unique_idx"
ON "student_enrolments"("school_id", "student_id", "academic_session_id")
WHERE "enrolment_status" IN ('PENDING', 'ACTIVE')
    AND "archived_at" IS NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "class_teacher_assignments_active_scoped_unique_idx"
ON "academic_class_teacher_assignments"(
    "school_id",
    "user_id",
    "academic_session_id",
    "term_id",
    "academic_class_id",
    "assignment_type"
)
WHERE "is_active" = true
    AND "term_id" IS NOT NULL;

-- AddPartialUniqueIndex
CREATE UNIQUE INDEX "class_teacher_assignments_active_global_unique_idx"
ON "academic_class_teacher_assignments"(
    "school_id",
    "user_id",
    "academic_session_id",
    "academic_class_id",
    "assignment_type"
)
WHERE "is_active" = true
    AND "term_id" IS NULL;


