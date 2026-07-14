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
export const sourceIdParamSchema = z.object({ sourceId: uuid });
export const sourceContentIdParamSchema = z.object({ contentId: uuid });
export const sourceMasterLinkIdParamSchema = z.object({ linkId: uuid });
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

const sourceTypeSchema = z.enum([
  'GOVERNMENT_CURRICULUM',
  'SCHOOL_SCHEME_OF_WORK',
  'INTERNATIONAL_FRAMEWORK',
  'TEXTBOOK',
  'TEACHER_MATERIAL',
  'WEBSITE',
  'INTERNAL_NOBLETECH_CONTENT',
  'UPLOADED_DOCUMENT',
  'OTHER',
]);

const sourceFormatSchema = z.enum(['PDF', 'DOCX', 'XLSX', 'CSV', 'HTML', 'URL', 'TEXT', 'IMAGE', 'OTHER']);

const sourceReviewStatusSchema = z.enum([
  'DRAFT',
  'PENDING_REVIEW',
  'REVISION_REQUIRED',
  'APPROVED',
  'REJECTED',
  'ARCHIVED',
]);

const sourceContentTypeSchema = z.enum([
  'SECTION',
  'TOPIC',
  'CONCEPT',
  'SKILL',
  'LEARNING_OUTCOME',
  'ACTIVITY',
  'PROJECT',
  'RESOURCE',
  'ASSESSMENT',
  'OTHER',
]);

const masterCatalogTypeSchema = z.enum([
  'unit',
  'topic',
  'concept',
  'skill',
  'learning_outcome',
  'activity',
  'project',
  'project_implementation',
  'resource',
  'assessment_template',
  'rubric',
]);

export const listSourcesQuerySchema = z.object({
  reviewStatus: sourceReviewStatusSchema.optional(),
  sourceType: sourceTypeSchema.optional(),
  sourceFormat: sourceFormatSchema.optional(),
  subjectId: uuid.optional(),
  ownership: z.enum(['school', 'global', 'all']).optional(),
  q: nonEmpty(100).optional(),
  includeGlobal: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export const createSourceSchema = z.object({
  isGlobal: z.boolean().optional(),
  sourceCode: nonEmpty(100).optional(),
  title: nonEmpty(200),
  description: optionalText(4000),
  sourceType: sourceTypeSchema,
  sourceFormat: sourceFormatSchema,
  subjectId: uuid.optional(),
  integrationDomainId: uuid.optional(),
  programmeComponentId: uuid.optional(),
  classLevel: nonEmpty(100).optional(),
  termLabel: nonEmpty(100).optional(),
  educationLevel: nonEmpty(100).optional(),
  curriculumStandard: nonEmpty(150).optional(),
  frameworkName: nonEmpty(150).optional(),
  countryCode: nonEmpty(10).optional(),
  academicYear: nonEmpty(20).optional(),
  versionLabel: nonEmpty(50).optional(),
  publisher: nonEmpty(150).optional(),
  author: nonEmpty(150).optional(),
  sourceUrl: z.string().url().optional(),
  usageRights: nonEmpty(150),
  copyrightNote: optionalText(4000),
  fileReference: nonEmpty(255).optional(),
  originalFileName: nonEmpty(255).optional(),
  mimeType: nonEmpty(150).optional(),
  fileSize: z.number().int().positive().optional(),
  checksum: nonEmpty(128).optional(),
});

export const updateSourceSchema = z.object({
  sourceCode: nonEmpty(100).optional(),
  title: nonEmpty(200).optional(),
  description: optionalText(4000),
  sourceType: sourceTypeSchema.optional(),
  sourceFormat: sourceFormatSchema.optional(),
  subjectId: uuid.nullable().optional(),
  integrationDomainId: uuid.nullable().optional(),
  programmeComponentId: uuid.nullable().optional(),
  classLevel: nonEmpty(100).optional(),
  termLabel: nonEmpty(100).optional(),
  educationLevel: nonEmpty(100).optional(),
  curriculumStandard: nonEmpty(150).optional(),
  frameworkName: nonEmpty(150).optional(),
  countryCode: nonEmpty(10).optional(),
  academicYear: nonEmpty(20).optional(),
  versionLabel: nonEmpty(50).optional(),
  publisher: nonEmpty(150).optional(),
  author: nonEmpty(150).optional(),
  sourceUrl: z.string().url().optional(),
  usageRights: nonEmpty(150).optional(),
  copyrightNote: optionalText(4000),
  fileReference: nonEmpty(255).optional(),
  originalFileName: nonEmpty(255).optional(),
  mimeType: nonEmpty(150).optional(),
  fileSize: z.number().int().positive().optional(),
  checksum: nonEmpty(128).optional(),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const createSourceContentSchema = z.object({
  sequenceOrder: positiveInt.optional(),
  contentType: sourceContentTypeSchema,
  heading: nonEmpty(200).optional(),
  rawText: optionalText(20000),
  structuredData: z.record(z.unknown()).optional(),
  sourcePage: nonEmpty(50).optional(),
  sourceSection: nonEmpty(150).optional(),
  confidenceScore: z.number().min(0).max(100).optional(),
  extractionMethod: nonEmpty(100).optional(),
});

export const updateSourceContentSchema = z.object({
  sequenceOrder: positiveInt.optional(),
  contentType: sourceContentTypeSchema.optional(),
  heading: nonEmpty(200).optional(),
  rawText: optionalText(20000),
  structuredData: z.record(z.unknown()).optional(),
  sourcePage: nonEmpty(50).optional(),
  sourceSection: nonEmpty(150).optional(),
  confidenceScore: z.number().min(0).max(100).optional(),
  extractionMethod: nonEmpty(100).optional(),
  reviewed: z.boolean().optional(),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const reorderSourceContentsSchema = z.object({
  orderedContentIds: z.array(uuid).min(1),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const sourceLifecycleActionSchema = z.object({
  comment: optionalText(2000),
  reason: optionalText(2000),
  requestedChanges: optionalText(4000),
  rejectionReason: optionalText(4000),
  lastKnownUpdatedAt: z.string().datetime().optional(),
});

export const sourceRevisionActionSchema = z.object({
  comment: optionalText(2000),
  requestedChanges: nonEmpty(4000),
  lastKnownUpdatedAt: z.string().datetime().optional(),
});

export const sourceRejectActionSchema = z.object({
  comment: optionalText(2000),
  rejectionReason: nonEmpty(4000),
  lastKnownUpdatedAt: z.string().datetime().optional(),
});

export const deleteSourceContentSchema = z.object({
  lastKnownUpdatedAt: z.string().datetime(),
});

export const createSourceMasterLinkSchema = z.object({
  masterContentType: masterCatalogTypeSchema,
  masterContentId: uuid,
  sourceVersionLabel: nonEmpty(50).optional(),
  sourcePage: nonEmpty(50).optional(),
  sourceSection: nonEmpty(150).optional(),
  extractionNote: optionalText(4000),
  adaptationNote: optionalText(4000),
  attribution: optionalText(4000),
  usageRestriction: nonEmpty(150).optional(),
});

export const updateSourceMasterLinkSchema = z.object({
  reviewStatus: sourceReviewStatusSchema.optional(),
  sourceVersionLabel: nonEmpty(50).optional(),
  sourcePage: nonEmpty(50).optional(),
  sourceSection: nonEmpty(150).optional(),
  extractionNote: optionalText(4000),
  adaptationNote: optionalText(4000),
  attribution: optionalText(4000),
  usageRestriction: nonEmpty(150).optional(),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const listMasterCatalogQuerySchema = z.object({
  type: masterCatalogTypeSchema,
  q: nonEmpty(100).optional(),
  includeGlobal: z.enum(['true', 'false']).optional(),
});
