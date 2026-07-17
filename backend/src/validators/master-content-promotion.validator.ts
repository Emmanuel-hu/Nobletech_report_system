import { z } from 'zod';

const uuid = z.string().uuid();
const nonEmpty = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).optional();

export const promotionStatusSchema = z.enum([
  'DRAFT',
  'READY_FOR_REVIEW',
  'UNDER_REVIEW',
  'REVISION_REQUIRED',
  'APPROVED',
  'REJECTED',
  'COMPLETED',
  'ARCHIVED',
]);

export const promotionRecordTypeSchema = z.enum([
  'UNIT',
  'TOPIC',
  'CONCEPT',
  'SKILL',
  'LEARNING_OUTCOME',
  'ACTIVITY',
  'PROJECT',
  'PROJECT_IMPLEMENTATION',
  'RESOURCE',
  'ASSESSMENT_REFERENCE',
  'OTHER',
]);

export const promotionTargetTypeSchema = z.enum([
  'CURRICULUM_UNIT',
  'TOPIC',
  'CONCEPT',
  'SKILL',
  'LEARNING_OUTCOME',
  'ACTIVITY',
  'PROJECT',
  'PROJECT_IMPLEMENTATION',
  'RESOURCE',
  'ASSESSMENT_TEMPLATE',
]);

export const promotionActionSchema = z.enum(['CREATE_DRAFT', 'LINK_EXISTING', 'SKIP', 'MARK_DUPLICATE', 'ADAPT']);

export const duplicateDecisionSchema = z.enum(['CREATE_NEW', 'LINK_EXISTING', 'REVISE_MAPPING', 'SKIP', 'MARK_DUPLICATE']);

export const promotionIdParamSchema = z.object({ promotionId: uuid });
export const promotionItemIdParamSchema = z.object({ promotionId: uuid, itemId: uuid });

export const listPromotionsQuerySchema = z.object({
  status: promotionStatusSchema.optional(),
  processingSessionId: uuid.optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export const createPromotionSchema = z.object({
  processingSessionId: uuid,
  adaptationNote: optionalText(4000),
  metadata: z.record(z.unknown()).optional(),
  reviewNote: optionalText(4000),
});

export const updatePromotionSchema = z.object({
  adaptationNote: optionalText(4000),
  reviewNote: optionalText(4000),
  duplicateDecision: duplicateDecisionSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  reviewerId: uuid.nullable().optional(),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const promotionLifecycleSchema = z.object({
  comment: optionalText(4000),
  requestedChanges: optionalText(4000),
  reason: optionalText(4000),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const addPromotionItemSchema = z.object({
  sourceContentId: uuid,
  targetMasterContentType: promotionTargetTypeSchema,
  sourceRecordType: promotionRecordTypeSchema.optional(),
  action: promotionActionSchema.optional(),
  mappedFields: z.record(z.unknown()).optional(),
  transformationData: z.record(z.unknown()).optional(),
  adaptationNote: optionalText(4000),
  attribution: optionalText(4000),
});

export const updatePromotionItemSchema = z.object({
  targetMasterContentType: promotionTargetTypeSchema.optional(),
  action: promotionActionSchema.optional(),
  mappedFields: z.record(z.unknown()).optional(),
  transformationData: z.record(z.unknown()).optional(),
  duplicateDecision: duplicateDecisionSchema.optional(),
  adaptationNote: optionalText(4000),
  attribution: optionalText(4000),
  lastKnownUpdatedAt: z.string().datetime(),
});

export const reorderPromotionItemsSchema = z.object({
  orderedItemIds: z.array(uuid).min(1),
  lastKnownPromotionUpdatedAt: z.string().datetime(),
});

export const linkExistingItemSchema = z.object({
  targetMasterContentId: uuid,
  lastKnownUpdatedAt: z.string().datetime(),
});

export const createDraftItemSchema = z.object({
  isGlobal: z.boolean().optional(),
  lastKnownUpdatedAt: z.string().datetime(),
});