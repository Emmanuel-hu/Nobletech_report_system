import { z } from 'zod';

const uuid = z.string().uuid();
const nonEmpty = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).optional();
const positiveInt = z.number().int().positive();

const curriculumStatusSchema = z.enum([
  'GENERATED_DRAFT',
  'DRAFT',
  'UNDER_REVIEW',
  'REVISION_REQUIRED',
  'APPROVED',
  'PUBLISHED',
  'ARCHIVED',
]);

const assignmentStatusSchema = z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'SUSPENDED', 'ARCHIVED']);

export const curriculumIdParamSchema = z.object({ curriculumId: uuid });
export const curriculumUnitIdParamSchema = z.object({ curriculumId: uuid, unitId: uuid });
export const unitTopicIdParamSchema = z.object({ unitId: uuid, topicId: uuid });
export const unitIdParamSchema = z.object({ unitId: uuid });
export const topicIdParamSchema = z.object({ topicId: uuid });
export const projectIdParamSchema = z.object({ projectId: uuid });
export const implementationIdParamSchema = z.object({ implementationId: uuid });
export const outcomeIdParamSchema = z.object({ outcomeId: uuid });
export const resourceIdParamSchema = z.object({ resourceId: uuid });
export const conceptIdParamSchema = z.object({ conceptId: uuid });
export const assignmentIdParamSchema = z.object({ assignmentId: uuid });
export const versionIdParamSchema = z.object({ curriculumId: uuid, versionId: uuid });
export const conceptMappingIdParamSchema = z.object({ mappingId: uuid });
export const topicProjectLinkIdParamSchema = z.object({ linkId: uuid });
export const topicOutcomeLinkIdParamSchema = z.object({ linkId: uuid });
export const projectOutcomeLinkIdParamSchema = z.object({ linkId: uuid });

export const listCurriculaQuerySchema = z.object({
  status: curriculumStatusSchema.optional(),
  schoolProgrammeComponentId: uuid.optional(),
  createdById: uuid.optional(),
  includeArchived: z.enum(['true', 'false']).optional(),
  isPublished: z.enum(['true', 'false']).optional(),
});

export const createCurriculumSchema = z.object({
  schoolProgrammeComponentId: uuid,
  title: nonEmpty(200),
  code: nonEmpty(100),
  description: optionalText(4000),
  creationMethod: z.enum(['MANUAL', 'MASTER_CONTENT_ADAPTATION', 'SOURCE_ADAPTATION']).optional(),
});

export const updateCurriculumSchema = z.object({
  title: nonEmpty(200).optional(),
  code: nonEmpty(100).optional(),
  description: optionalText(4000),
  schoolProgrammeComponentId: uuid.optional(),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const archiveCurriculumSchema = z.object({
  reason: nonEmpty(2000),
});

export const createUnitSchema = z.object({
  title: nonEmpty(200),
  code: nonEmpty(100).optional(),
  description: optionalText(4000),
  sequenceOrder: positiveInt,
  estimatedWeeks: positiveInt.optional(),
  masterCurriculumUnitId: uuid.optional(),
});

export const updateUnitSchema = z.object({
  title: nonEmpty(200).optional(),
  code: nonEmpty(100).optional(),
  description: optionalText(4000),
  sequenceOrder: positiveInt.optional(),
  estimatedWeeks: positiveInt.optional(),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const reorderUnitsSchema = z.object({
  orderedUnitIds: z.array(uuid).min(1),
});

export const createTopicSchema = z.object({
  title: nonEmpty(200),
  code: nonEmpty(100).optional(),
  description: optionalText(4000),
  sequenceOrder: positiveInt,
  weekNumber: positiveInt.optional(),
  recommendedDurationMinutes: positiveInt.optional(),
  difficultyLevel: nonEmpty(50).optional(),
  teacherNote: optionalText(4000),
  masterTopicId: uuid.optional(),
});

export const updateTopicSchema = z.object({
  title: nonEmpty(200).optional(),
  code: nonEmpty(100).optional(),
  description: optionalText(4000),
  sequenceOrder: positiveInt.optional(),
  weekNumber: positiveInt.optional(),
  recommendedDurationMinutes: positiveInt.optional(),
  difficultyLevel: nonEmpty(50).optional(),
  teacherNote: optionalText(4000),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const reorderTopicsSchema = z.object({
  orderedTopicIds: z.array(uuid).min(1),
});

export const addTopicConceptSchema = z
  .object({
    curriculumConceptId: uuid.optional(),
    masterConceptId: uuid.optional(),
    sequenceOrder: positiveInt.optional(),
    teacherNote: optionalText(4000),
    importanceLevel: nonEmpty(50).optional(),
    expectedDepth: nonEmpty(50).optional(),
    instructionalEmphasis: nonEmpty(100).optional(),
    isCore: z.boolean().optional(),
    assessmentRelevance: nonEmpty(100).optional(),
  })
  .refine((value) => Boolean(value.curriculumConceptId || value.masterConceptId), {
    message: 'Either curriculumConceptId or masterConceptId is required.',
  });

export const createConceptSchema = z.object({
  name: nonEmpty(200),
  code: nonEmpty(100).optional(),
  definition: nonEmpty(4000),
  explanation: optionalText(4000),
  masterConceptId: uuid.optional(),
});

export const updateConceptSchema = z.object({
  name: nonEmpty(200).optional(),
  code: nonEmpty(100).optional(),
  definition: nonEmpty(4000).optional(),
  explanation: optionalText(4000),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const reorderTopicConceptsSchema = z.object({
  orderedMappingIds: z.array(uuid).min(1),
  lastKnownTopicUpdatedAt: z.string().datetime(),
});

export const createProjectSchema = z.object({
  title: nonEmpty(200),
  description: nonEmpty(4000),
  sequenceOrder: positiveInt,
  objective: optionalText(4000),
  expectedOutput: optionalText(4000),
  estimatedDurationMinutes: positiveInt.optional(),
  difficultyLevel: nonEmpty(50).optional(),
  safetyNote: optionalText(2000),
  masterProjectId: uuid.optional(),
});

export const updateProjectSchema = z.object({
  title: nonEmpty(200).optional(),
  description: nonEmpty(4000).optional(),
  sequenceOrder: positiveInt.optional(),
  objective: optionalText(4000),
  expectedOutput: optionalText(4000),
  estimatedDurationMinutes: positiveInt.optional(),
  difficultyLevel: nonEmpty(50).optional(),
  safetyNote: optionalText(2000),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const createProjectImplementationSchema = z.object({
  title: nonEmpty(200),
  implementationType: z.enum([
    'PHYSICAL_ROBOTICS',
    'SIMULATION_ONLY',
    'LOW_RESOURCE',
    'NO_LAPTOP',
    'INDIVIDUAL',
    'GROUP',
    'OTHER',
  ]),
  description: optionalText(4000),
  sequenceOrder: positiveInt,
  requiredInternet: z.boolean().optional(),
  requiredDeviceCount: z.number().int().nonnegative().optional(),
  estimatedDurationMinutes: positiveInt.optional(),
  learnerInstructions: optionalText(4000),
  teacherInstructions: optionalText(4000),
  safetyInstructions: optionalText(4000),
  masterProjectImplementationId: uuid.optional(),
});

export const updateProjectImplementationSchema = z.object({
  title: nonEmpty(200).optional(),
  implementationType: z
    .enum(['PHYSICAL_ROBOTICS', 'SIMULATION_ONLY', 'LOW_RESOURCE', 'NO_LAPTOP', 'INDIVIDUAL', 'GROUP', 'OTHER'])
    .optional(),
  description: optionalText(4000),
  sequenceOrder: positiveInt.optional(),
  requiredInternet: z.boolean().optional(),
  requiredDeviceCount: z.number().int().nonnegative().optional(),
  estimatedDurationMinutes: positiveInt.optional(),
  learnerInstructions: optionalText(4000),
  teacherInstructions: optionalText(4000),
  safetyInstructions: optionalText(4000),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const reorderProjectImplementationsSchema = z.object({
  orderedImplementationIds: z.array(uuid).min(1),
  lastKnownProjectUpdatedAt: z.string().datetime(),
});

export const updateTopicConceptSchema = z.object({
  sequenceOrder: positiveInt.optional(),
  teacherNote: optionalText(4000),
  importanceLevel: nonEmpty(50).optional(),
  expectedDepth: nonEmpty(50).optional(),
  instructionalEmphasis: nonEmpty(100).optional(),
  isCore: z.boolean().optional(),
  assessmentRelevance: nonEmpty(100).optional(),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const linkProjectTopicSchema = z.object({
  topicId: uuid,
  sequenceOrder: positiveInt.optional(),
});

export const createLearningOutcomeSchema = z.object({
  statement: nonEmpty(4000),
  code: nonEmpty(100).optional(),
  bloomLevel: nonEmpty(50).optional(),
  measurableVerb: nonEmpty(100).optional(),
  masterLearningOutcomeId: uuid.optional(),
});

export const updateLearningOutcomeSchema = z.object({
  statement: nonEmpty(4000).optional(),
  code: nonEmpty(100).optional(),
  bloomLevel: nonEmpty(50).optional(),
  measurableVerb: nonEmpty(100).optional(),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const mapLearningOutcomeSchema = z.object({
  outcomeId: uuid,
  sequenceOrder: positiveInt.optional(),
});

export const createResourceSchema = z.object({
  curriculumTopicId: uuid,
  title: nonEmpty(200),
  description: optionalText(4000),
  resourceType: z.enum([
    'SOFTWARE',
    'WEBSITE',
    'HARDWARE',
    'KIT',
    'DOCUMENT',
    'VIDEO',
    'AUDIO',
    'IMAGE',
    'OTHER',
  ]),
  quantityRequired: nonEmpty(100).optional(),
  requiresInternet: z.boolean().optional(),
  requiresLogin: z.boolean().optional(),
  safetyNote: optionalText(2000),
  externalUrl: z.string().url().optional(),
  internalFileReference: nonEmpty(255).optional(),
  masterResourceId: uuid.optional(),
});

export const updateResourceSchema = z.object({
  title: nonEmpty(200).optional(),
  description: optionalText(4000),
  quantityRequired: nonEmpty(100).optional(),
  requiresInternet: z.boolean().optional(),
  requiresLogin: z.boolean().optional(),
  safetyNote: optionalText(2000),
  externalUrl: z.string().url().optional(),
  internalFileReference: nonEmpty(255).optional(),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const updateVisibilitySchema = z.object({
  showProgrammeComponents: z.boolean(),
  showTools: z.boolean(),
  showResources: z.boolean(),
  showProjects: z.boolean(),
  showLearningOutcomes: z.boolean(),
  showTeacherNotes: z.boolean(),
  showStudentNotes: z.boolean(),
  visibleToTeachers: z.boolean(),
  visibleToLearners: z.boolean(),
  visibleToGuardians: z.boolean(),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const createVersionSchema = z.object({
  basedOnVersionId: uuid.optional(),
  changeSummary: optionalText(4000),
  majorVersion: z.number().int().nonnegative().optional(),
  minorVersion: z.number().int().nonnegative().optional(),
  patchVersion: z.number().int().nonnegative().optional(),
  versionLabel: nonEmpty(50).optional(),
});

export const submitReviewSchema = z.object({
  comment: optionalText(4000),
});

export const requestRevisionSchema = z.object({
  requestedChanges: nonEmpty(4000),
  comment: optionalText(4000),
});

export const approveSchema = z.object({
  comment: optionalText(4000),
});

export const publishSchema = z.object({
  versionId: uuid.optional(),
  comment: optionalText(4000),
});

export const withdrawReviewSchema = z.object({
  reason: nonEmpty(2000),
});

export const createAssignmentSchema = z.object({
  curriculumVersionId: uuid,
  academicSessionId: uuid,
  termId: uuid,
  academicClassId: uuid,
  schoolProgrammeComponentId: uuid,
  teacherUserId: uuid.optional(),
  effectiveFrom: z.string().date(),
  effectiveTo: z.string().date().optional(),
}).refine((value) => {
  if (!value.effectiveTo) {
    return true;
  }
  return value.effectiveTo >= value.effectiveFrom;
}, {
  message: 'effectiveTo cannot be before effectiveFrom.',
  path: ['effectiveTo'],
});

export const updateAssignmentSchema = z.object({
  teacherUserId: uuid.nullable().optional(),
  effectiveFrom: z.string().date().optional(),
  effectiveTo: z.string().date().nullable().optional(),
  status: assignmentStatusSchema.optional(),
  reason: optionalText(2000),
});

export const versionCompareQuerySchema = z.object({
  leftVersionId: uuid,
  rightVersionId: uuid,
});

export const editorLookupsQuerySchema = z.object({
  sessionId: uuid.optional(),
});
