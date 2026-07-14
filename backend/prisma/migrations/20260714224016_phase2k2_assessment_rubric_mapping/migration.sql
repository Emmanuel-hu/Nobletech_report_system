-- CreateTable
CREATE TABLE "master_assessment_template_rubrics" (
    "master_assessment_template_rubric_id" UUID NOT NULL,
    "master_assessment_template_id" UUID NOT NULL,
    "master_rubric_id" UUID NOT NULL,
    "sequence_order" INTEGER,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "purpose" VARCHAR(150),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_assessment_template_rubrics_pkey" PRIMARY KEY ("master_assessment_template_rubric_id")
);

-- CreateIndex
CREATE INDEX "master_assessment_template_rubrics_master_rubric_id_idx" ON "master_assessment_template_rubrics"("master_rubric_id");

-- CreateIndex
CREATE INDEX "master_assessment_template_rubrics_master_assessment_template_id_is_active_idx" ON "master_assessment_template_rubrics"("master_assessment_template_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "master_assessment_template_rubrics_template_rubric_unique_idx" ON "master_assessment_template_rubrics"("master_assessment_template_id", "master_rubric_id");

-- AddForeignKey
ALTER TABLE "master_assessment_template_rubrics" ADD CONSTRAINT "master_assessment_template_rubrics_master_assessment_template_id_fkey" FOREIGN KEY ("master_assessment_template_id") REFERENCES "master_assessment_templates"("master_assessment_template_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_assessment_template_rubrics" ADD CONSTRAINT "master_assessment_template_rubrics_master_rubric_id_fkey" FOREIGN KEY ("master_rubric_id") REFERENCES "master_rubrics"("master_rubric_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_assessment_template_rubrics" ADD CONSTRAINT "master_assessment_template_rubrics_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
