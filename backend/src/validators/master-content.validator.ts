import { z } from 'zod';

const uuid = z.string().uuid();
const nonEmpty = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).optional();

export const masterEntityTypeSchema = z.enum([
  'units',
  'topics',
  'concepts',
  'skills',
  'outcomes',
  'activities',
  'projects',
  'project-implementations',
  'resources',
  'assessments',
  'rubrics',
  'rubric-criteria',
  'rubric-levels',
]);

export const lifecycleActionSchema = z.enum(['submit-review', 'request-revision', 'approve', 'archive']);

export const mappingTypeSchema = z.enum([
  'unit-subject',
  'unit-integration-domain',
  'unit-programme-component',
  'topic-subject',
  'topic-integration-domain',
  'topic-concept',
  'topic-skill',
  'topic-outcome',
  'topic-activity',
  'topic-project',
  'activity-resource',
  'project-resource',
  'project-skill',
  'project-outcome',
  'assessment-outcome',
  'assessment-rubric',
]);

export const lineageEntityTypeSchema = z.enum([
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

export const masterEntityTypeParamSchema = z.object({ entityType: masterEntityTypeSchema });
export const masterEntityIdParamSchema = z.object({ entityType: masterEntityTypeSchema, entityId: uuid });
export const lifecycleActionParamSchema = z.object({ action: lifecycleActionSchema });
export const mappingTypeParamSchema = z.object({ mappingType: mappingTypeSchema });
export const mappingIdParamSchema = z.object({ mappingType: mappingTypeSchema, mappingId: uuid });
export const lineageEntityParamSchema = z.object({ entityType: lineageEntityTypeSchema, entityId: uuid });
export const lineageIdParamSchema = z.object({ lineageId: uuid });

export const listMasterEntitiesQuerySchema = z.object({
  q: nonEmpty(120).optional(),
  status: z.enum(['DRAFT', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'APPROVED', 'ARCHIVED']).optional(),
  ownership: z.enum(['all', 'school', 'global']).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export const createMasterEntitySchema = z.object({
  isGlobal: z.boolean().optional(),
  data: z.record(z.unknown()),
});

export const updateMasterEntitySchema = z.object({
  data: z.record(z.unknown()),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const lifecycleActionBodySchema = z.object({
  comment: optionalText(4000),
  requestedChanges: optionalText(4000),
  reason: optionalText(4000),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const createMappingSchema = z.object({
  leftId: uuid,
  rightId: uuid,
  sequenceOrder: z.number().int().positive().optional(),
  isPrimary: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  proficiencyTarget: nonEmpty(50).optional(),
  importanceLevel: nonEmpty(50).optional(),
  expectedDepth: nonEmpty(50).optional(),
  instructionalEmphasis: nonEmpty(100).optional(),
  assessmentRelevance: nonEmpty(100).optional(),
  teacherNote: optionalText(2000),
  purpose: nonEmpty(150).optional(),
  isActive: z.boolean().optional(),
});

export const updateMappingSchema = z.object({
  sequenceOrder: z.number().int().positive().optional(),
  isPrimary: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  proficiencyTarget: nonEmpty(50).optional(),
  importanceLevel: nonEmpty(50).optional(),
  expectedDepth: nonEmpty(50).optional(),
  instructionalEmphasis: nonEmpty(100).optional(),
  assessmentRelevance: nonEmpty(100).optional(),
  teacherNote: optionalText(2000),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const createLineageSchema = z.object({
  sourceId: uuid,
  sourceVersionLabel: nonEmpty(50).optional(),
  sourcePage: nonEmpty(50).optional(),
  sourceSection: nonEmpty(150).optional(),
  extractionNote: optionalText(4000),
  adaptationNote: optionalText(4000),
  attribution: optionalText(4000),
  usageRestriction: nonEmpty(150).optional(),
});

export const updateLineageSchema = z.object({
  sourceVersionLabel: nonEmpty(50).optional(),
  sourcePage: nonEmpty(50).optional(),
  sourceSection: nonEmpty(150).optional(),
  extractionNote: optionalText(4000),
  adaptationNote: optionalText(4000),
  attribution: optionalText(4000),
  usageRestriction: nonEmpty(150).optional(),
  lastKnownUpdatedAt: z.string().datetime(),
});
