import { z } from 'zod';

const uuid = z.string().uuid();

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === undefined || value.length > 0 ? value : undefined));

const requiredText = (max: number) => z.string().trim().min(1).max(max);

const processingStatusSchema = z.enum([
  'DRAFT',
  'IN_PROGRESS',
  'PENDING_REVIEW',
  'REVISION_REQUIRED',
  'APPROVED',
  'REJECTED',
  'COMPLETED',
  'ARCHIVED',
]);

const sectionTypeSchema = z.enum([
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
  'OTHER',
]);

const sectionReviewStatusSchema = z.enum(['DRAFT', 'PENDING_REVIEW', 'REVISION_REQUIRED', 'APPROVED', 'REJECTED', 'ARCHIVED']);

const sourceContentTypeSchema = z.enum([
  'SECTION',
  'UNIT',
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

const reviewStatusSchema = z.enum(['DRAFT', 'PENDING_REVIEW', 'REVISION_REQUIRED', 'APPROVED', 'REJECTED', 'ARCHIVED']);

export const sourceIdParamSchema = z.object({ sourceId: uuid });
export const processingSessionIdParamSchema = z.object({ sessionId: uuid });
export const sourceAndSessionParamSchema = z.object({ sourceId: uuid, sessionId: uuid });
export const sectionIdParamSchema = z.object({ sectionId: uuid });
export const sessionSectionParamSchema = z.object({ sessionId: uuid, sectionId: uuid });

export const createProcessingSessionSchema = z.object({
  curriculumSourceFileId: uuid,
  notes: optionalText(4000),
  metadata: z.record(z.unknown()).optional(),
  basedOnSessionId: uuid.optional(),
});

export const updateProcessingSessionSchema = z.object({
  notes: optionalText(4000),
  metadata: z.record(z.unknown()).optional(),
  assignedReviewerId: uuid.nullable().optional(),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const sessionLifecycleSchema = z.object({
  comment: optionalText(4000),
  requestedChanges: optionalText(4000),
  rejectionReason: optionalText(4000),
  reason: optionalText(4000),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const createSectionSchema = z
  .object({
    parentSectionId: uuid.optional(),
    sectionType: sectionTypeSchema,
    heading: requiredText(255),
    rawText: requiredText(20000),
    structuredData: z.record(z.unknown()).optional(),
    pageStart: z.number().int().positive().optional(),
    pageEnd: z.number().int().positive().optional(),
    sourceSectionReference: optionalText(150),
    sequenceOrder: z.number().int().positive().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.pageStart !== undefined && value.pageEnd !== undefined && value.pageStart > value.pageEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pageStart'],
        message: 'pageStart cannot be greater than pageEnd.',
      });
    }
  });

export const updateSectionSchema = z
  .object({
    sectionType: sectionTypeSchema.optional(),
    heading: optionalText(255),
    rawText: optionalText(20000),
    structuredData: z.record(z.unknown()).optional(),
    pageStart: z.number().int().positive().optional(),
    pageEnd: z.number().int().positive().optional(),
    sourceSectionReference: optionalText(150),
    reviewStatus: sectionReviewStatusSchema.optional(),
    reviewNote: optionalText(4000),
    lastKnownUpdatedAt: z.string().datetime(),
  })
  .superRefine((value, ctx) => {
    if (value.pageStart !== undefined && value.pageEnd !== undefined && value.pageStart > value.pageEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pageStart'],
        message: 'pageStart cannot be greater than pageEnd.',
      });
    }
  });

export const deleteSectionSchema = z.object({
  lastKnownUpdatedAt: z.string().datetime(),
});

export const archiveSectionSchema = z.object({
  reason: requiredText(2000),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const reorderSectionsSchema = z.object({
  orderedSectionIds: z.array(uuid).min(1),
  parentSectionId: uuid.optional(),
  lastKnownSessionUpdatedAt: z.string().datetime(),
});

export const moveSectionSchema = z.object({
  targetParentSectionId: uuid.optional(),
  targetSequenceOrder: z.number().int().positive().optional(),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const compareRevisionQuerySchema = z.object({
  leftRevisionId: uuid.optional(),
  rightRevisionId: uuid.optional(),
});

export const createStructuredRecordSchema = z.object({
  contentType: sourceContentTypeSchema.optional(),
  heading: optionalText(200),
  rawText: optionalText(10000),
  structuredData: z.record(z.unknown()).optional(),
  adaptationNote: optionalText(4000),
  reviewStatus: reviewStatusSchema.optional(),
  sourcePage: optionalText(50),
  sourceSection: optionalText(150),
  lastKnownSectionUpdatedAt: z.string().datetime(),
});

export const listProcessingSessionsQuerySchema = z.object({
  status: processingStatusSchema.optional(),
});
