import {
  Prisma,
  type CurriculumSourceContentType,
  type MasterContentPromotionDuplicateDecision,
  type MasterContentPromotionRecordType,
  type MasterContentPromotionStatus,
  type MasterContentPromotionTargetType,
  type MasterContentStatus,
} from '@prisma/client';

import { prisma } from '../config/prisma';
import { masterContentPromotionRepository } from '../repositories/master-content-promotion.repository';
import type { AuthContext } from '../types/auth.types';
import { badRequest, forbidden, lifecycleConflict, notFound, tenantScopeViolation, versionConflict } from '../utils/app-error';
import { masterContentService } from './master-content.service';

type MasterEntityType =
  | 'units'
  | 'topics'
  | 'concepts'
  | 'skills'
  | 'outcomes'
  | 'activities'
  | 'projects'
  | 'project-implementations'
  | 'resources'
  | 'assessments';

type TargetDescriptor = {
  entityType: MasterEntityType;
  linkField:
    | 'masterCurriculumUnitId'
    | 'masterTopicId'
    | 'masterConceptId'
    | 'masterSkillId'
    | 'masterLearningOutcomeId'
    | 'masterActivityId'
    | 'masterProjectId'
    | 'masterProjectImplementationId'
    | 'masterResourceId'
    | 'masterAssessmentTemplateId';
};

type PromotionTransition = {
  nextStatus: MasterContentPromotionStatus;
  allowedFrom: MasterContentPromotionStatus[];
  action: string;
  requestId?: string;
  payload: { comment?: string; requestedChanges?: string; reason?: string; lastKnownUpdatedAt: string };
};

const editablePromotionStatuses = new Set<MasterContentPromotionStatus>(['DRAFT', 'REVISION_REQUIRED']);
const reviewablePromotionStatuses = new Set<MasterContentPromotionStatus>(['READY_FOR_REVIEW', 'UNDER_REVIEW']);
const selectableSessionStatuses = new Set(['APPROVED', 'COMPLETED']);
const targetTypeMap: Record<MasterContentPromotionTargetType, TargetDescriptor> = {
  CURRICULUM_UNIT: { entityType: 'units', linkField: 'masterCurriculumUnitId' },
  TOPIC: { entityType: 'topics', linkField: 'masterTopicId' },
  CONCEPT: { entityType: 'concepts', linkField: 'masterConceptId' },
  SKILL: { entityType: 'skills', linkField: 'masterSkillId' },
  LEARNING_OUTCOME: { entityType: 'outcomes', linkField: 'masterLearningOutcomeId' },
  ACTIVITY: { entityType: 'activities', linkField: 'masterActivityId' },
  PROJECT: { entityType: 'projects', linkField: 'masterProjectId' },
  PROJECT_IMPLEMENTATION: { entityType: 'project-implementations', linkField: 'masterProjectImplementationId' },
  RESOURCE: { entityType: 'resources', linkField: 'masterResourceId' },
  ASSESSMENT_TEMPLATE: { entityType: 'assessments', linkField: 'masterAssessmentTemplateId' },
};

const sourceToRecordType: Record<CurriculumSourceContentType, MasterContentPromotionRecordType | null> = {
  SECTION: null,
  UNIT: 'UNIT',
  TOPIC: 'TOPIC',
  CONCEPT: 'CONCEPT',
  SKILL: 'SKILL',
  LEARNING_OUTCOME: 'LEARNING_OUTCOME',
  ACTIVITY: 'ACTIVITY',
  PROJECT: 'PROJECT',
  RESOURCE: 'RESOURCE',
  ASSESSMENT: 'ASSESSMENT_REFERENCE',
  OTHER: null,
};

const sourceToTargetType: Partial<Record<CurriculumSourceContentType, MasterContentPromotionTargetType>> = {
  UNIT: 'CURRICULUM_UNIT',
  TOPIC: 'TOPIC',
  CONCEPT: 'CONCEPT',
  SKILL: 'SKILL',
  LEARNING_OUTCOME: 'LEARNING_OUTCOME',
  ACTIVITY: 'ACTIVITY',
  PROJECT: 'PROJECT',
  RESOURCE: 'RESOURCE',
  ASSESSMENT: 'ASSESSMENT_TEMPLATE',
};

const normalize = (value: string | null | undefined): string => (value ?? '').trim().toLowerCase();

const safeRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
};

export class MasterContentPromotionService {
  async listPromotions(
    auth: AuthContext,
    query: { status?: MasterContentPromotionStatus; processingSessionId?: string; page?: number; pageSize?: number },
  ) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.MasterContentPromotionWhereInput = {
      archivedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.processingSessionId ? { processingSessionId: query.processingSessionId } : {}),
      ...(auth.isSuperAdmin ? {} : { schoolId: auth.schoolId }),
    };

    const [items, total] = await Promise.all([
      masterContentPromotionRepository.listPromotions({ where, skip, take: pageSize }),
      masterContentPromotionRepository.countPromotions(where),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async createPromotion(
    auth: AuthContext,
    payload: { processingSessionId: string; adaptationNote?: string; reviewNote?: string; metadata?: Prisma.InputJsonValue },
    requestId?: string,
  ) {
    const session = await prisma.curriculumSourceProcessingSession.findUnique({
      where: { id: payload.processingSessionId },
      include: {
        curriculumSource: true,
        curriculumSourceFile: true,
      },
    });

    if (!session || !session.curriculumSource || !session.curriculumSourceFile) {
      throw notFound('Processing session not found.');
    }

    this.assertSessionSelectable(session.status);
    this.assertSourceScope(auth, session.curriculumSource.schoolId);

    const created = await prisma.$transaction(async (tx) => {
      const promotion = await tx.masterContentPromotion.create({
        data: {
          schoolId: session.curriculumSource.schoolId,
          curriculumSourceId: session.curriculumSourceId,
          processingSessionId: session.id,
          curriculumSourceFileId: session.curriculumSourceFileId,
          status: 'DRAFT',
          requestedById: auth.userId,
          sourceChecksum: session.lastKnownSourceChecksum,
          sourceRevisionNumber: session.revisionNumber,
          adaptationNote: payload.adaptationNote,
          reviewNote: payload.reviewNote,
          metadata: payload.metadata,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'master_content.promotion.create',
        entityType: 'master_content_promotion',
        entityId: promotion.id,
        schoolId: promotion.schoolId,
        actorUserId: auth.userId,
        newValues: {
          processingSessionId: promotion.processingSessionId,
          sourceChecksum: promotion.sourceChecksum,
          sourceRevisionNumber: promotion.sourceRevisionNumber,
        },
        requestId,
      });

      return promotion;
    });

    return this.getPromotion(auth, created.id);
  }

  async getPromotion(auth: AuthContext, promotionId: string) {
    const promotion = await this.requirePromotionInScope(auth, promotionId);
    return promotion;
  }

  async updatePromotion(
    auth: AuthContext,
    promotionId: string,
    payload: {
      adaptationNote?: string;
      reviewNote?: string;
      duplicateDecision?: MasterContentPromotionDuplicateDecision;
      metadata?: Prisma.InputJsonValue;
      reviewerId?: string | null;
      lastKnownUpdatedAt: string;
    },
    requestId?: string,
  ) {
    const promotion = await this.requirePromotionInScope(auth, promotionId);
    this.assertPromotionEditable(promotion.status);
    this.assertNoConcurrentModification(promotion.updatedAt, payload.lastKnownUpdatedAt, 'Promotion has changed.');

    await prisma.$transaction(async (tx) => {
      const updated = await tx.masterContentPromotion.update({
        where: { id: promotion.id },
        data: {
          adaptationNote: payload.adaptationNote,
          reviewNote: payload.reviewNote,
          duplicateDecision: payload.duplicateDecision,
          metadata: payload.metadata,
          reviewerId: payload.reviewerId === '' ? null : payload.reviewerId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'master_content.promotion.edit',
        entityType: 'master_content_promotion',
        entityId: promotion.id,
        schoolId: promotion.schoolId,
        actorUserId: auth.userId,
        oldValues: { status: promotion.status, reviewNote: promotion.reviewNote },
        newValues: { status: updated.status, reviewNote: updated.reviewNote },
        requestId,
      });
    });

    return this.getPromotion(auth, promotion.id);
  }

  async listItems(auth: AuthContext, promotionId: string) {
    const promotion = await this.requirePromotionInScope(auth, promotionId);
    return promotion.items;
  }

  async addItem(
    auth: AuthContext,
    promotionId: string,
    payload: {
      sourceContentId: string;
      targetMasterContentType: MasterContentPromotionTargetType;
      sourceRecordType?: MasterContentPromotionRecordType;
      action?: 'CREATE_DRAFT' | 'LINK_EXISTING' | 'SKIP' | 'MARK_DUPLICATE' | 'ADAPT';
      mappedFields?: Prisma.InputJsonValue;
      transformationData?: Prisma.InputJsonValue;
      adaptationNote?: string;
      attribution?: string;
    },
    requestId?: string,
  ) {
    const promotion = await this.requirePromotionInScope(auth, promotionId);
    this.assertPromotionEditable(promotion.status);

    const sourceContent = await prisma.curriculumSourceContent.findUnique({ where: { id: payload.sourceContentId } });
    if (!sourceContent || sourceContent.curriculumSourceId !== promotion.curriculumSourceId) {
      throw notFound('Structured source record not found for this promotion scope.');
    }

    if (sourceContent.processingSessionId !== promotion.processingSessionId) {
      throw badRequest('Source record does not belong to selected processing session.');
    }

    if (sourceContent.reviewStatus !== 'APPROVED') {
      throw lifecycleConflict('Only approved structured source records may be promoted.');
    }

    const inferredRecordType = sourceToRecordType[sourceContent.contentType];
    if (!inferredRecordType && !payload.sourceRecordType) {
      throw badRequest('Unsupported source record type for promotion.');
    }

    const expectedTarget = sourceToTargetType[sourceContent.contentType];
    if (expectedTarget && expectedTarget !== payload.targetMasterContentType) {
      throw badRequest('Target master-content type does not match selected source record type.');
    }

    const nextOrder = (promotion.items[promotion.items.length - 1]?.sequenceOrder ?? 0) + 1;
    const mappedFields = this.defaultMappedFields(sourceContent, payload.targetMasterContentType, payload.mappedFields);

    const item = await prisma.$transaction(async (tx) => {
      const created = await tx.masterContentPromotionItem.create({
        data: {
          promotionId: promotion.id,
          sourceContentId: sourceContent.id,
          sourceSectionId: sourceContent.sectionId,
          sourceRecordType: payload.sourceRecordType ?? inferredRecordType ?? 'OTHER',
          targetMasterContentType: payload.targetMasterContentType,
          action: payload.action ?? 'CREATE_DRAFT',
          status: 'DRAFT',
          sequenceOrder: nextOrder,
          mappedFields,
          transformationData: payload.transformationData,
          sourcePageStart: this.asNumber(sourceContent.sourcePage),
          sourcePageEnd: this.asNumber(sourceContent.sourcePage),
          sourceSectionReference: sourceContent.sourceSection,
          sourceFileVersion: sourceContent.sourceFileVersion,
          sourceFileChecksum: sourceContent.sourceFileChecksum,
          processingRevisionNumber: promotion.sourceRevisionNumber,
          adaptationNote: payload.adaptationNote ?? sourceContent.adaptationNote,
          attribution: payload.attribution,
          createdById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'master_content.promotion.item.add',
        entityType: 'master_content_promotion_item',
        entityId: created.id,
        schoolId: promotion.schoolId,
        actorUserId: auth.userId,
        newValues: {
          promotionId: promotion.id,
          sourceContentId: sourceContent.id,
          targetMasterContentType: created.targetMasterContentType,
        },
        requestId,
      });

      return created;
    });

    return item;
  }

  async updateItem(
    auth: AuthContext,
    promotionId: string,
    itemId: string,
    payload: {
      targetMasterContentType?: MasterContentPromotionTargetType;
      action?: 'CREATE_DRAFT' | 'LINK_EXISTING' | 'SKIP' | 'MARK_DUPLICATE' | 'ADAPT';
      mappedFields?: Prisma.InputJsonValue;
      transformationData?: Prisma.InputJsonValue;
      duplicateDecision?: MasterContentPromotionDuplicateDecision;
      adaptationNote?: string;
      attribution?: string;
      lastKnownUpdatedAt: string;
    },
    requestId?: string,
  ) {
    const promotion = await this.requirePromotionInScope(auth, promotionId);
    this.assertPromotionEditable(promotion.status);

    const item = await this.requirePromotionItem(promotion.id, itemId);
    this.assertNoConcurrentModification(item.updatedAt, payload.lastKnownUpdatedAt, 'Promotion item has changed.');

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.masterContentPromotionItem.update({
        where: { id: item.id },
        data: {
          targetMasterContentType: payload.targetMasterContentType,
          action: payload.action,
          mappedFields: payload.mappedFields,
          transformationData: payload.transformationData,
          duplicateDecision: payload.duplicateDecision,
          adaptationNote: payload.adaptationNote,
          attribution: payload.attribution,
          updatedById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'master_content.promotion.item.edit',
        entityType: 'master_content_promotion_item',
        entityId: item.id,
        schoolId: promotion.schoolId,
        actorUserId: auth.userId,
        oldValues: { action: item.action, targetMasterContentType: item.targetMasterContentType },
        newValues: { action: next.action, targetMasterContentType: next.targetMasterContentType },
        requestId,
      });

      return next;
    });

    return updated;
  }

  async removeItem(auth: AuthContext, promotionId: string, itemId: string, requestId?: string) {
    const promotion = await this.requirePromotionInScope(auth, promotionId);
    this.assertPromotionEditable(promotion.status);

    const item = await this.requirePromotionItem(promotion.id, itemId);

    await prisma.$transaction(async (tx) => {
      await tx.masterContentPromotionItem.update({
        where: { id: item.id },
        data: { archivedAt: new Date(), updatedById: auth.userId },
      });

      await this.createAuditLogTx(tx, {
        action: 'master_content.promotion.item.remove',
        entityType: 'master_content_promotion_item',
        entityId: item.id,
        schoolId: promotion.schoolId,
        actorUserId: auth.userId,
        oldValues: { archivedAt: null },
        newValues: { archivedAt: new Date().toISOString() },
        requestId,
      });
    });

    return { removed: true };
  }

  async reorderItems(
    auth: AuthContext,
    promotionId: string,
    payload: { orderedItemIds: string[]; lastKnownPromotionUpdatedAt: string },
    requestId?: string,
  ) {
    const promotion = await this.requirePromotionInScope(auth, promotionId);
    this.assertPromotionEditable(promotion.status);
    this.assertNoConcurrentModification(promotion.updatedAt, payload.lastKnownPromotionUpdatedAt, 'Promotion has changed.');

    const activeItems = promotion.items.filter((item) => !item.archivedAt);
    const activeIds = new Set(activeItems.map((item) => item.id));

    if (payload.orderedItemIds.length !== activeItems.length) {
      throw badRequest('orderedItemIds must include all active promotion items exactly once.');
    }

    const seen = new Set<string>();
    for (const id of payload.orderedItemIds) {
      if (!activeIds.has(id) || seen.has(id)) {
        throw badRequest('orderedItemIds contains invalid or duplicate item id.');
      }
      seen.add(id);
    }

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < payload.orderedItemIds.length; i += 1) {
        await tx.masterContentPromotionItem.update({
          where: { id: payload.orderedItemIds[i] },
          data: { sequenceOrder: i + 1, updatedById: auth.userId },
        });
      }

      await this.createAuditLogTx(tx, {
        action: 'master_content.promotion.item.reorder',
        entityType: 'master_content_promotion',
        entityId: promotion.id,
        schoolId: promotion.schoolId,
        actorUserId: auth.userId,
        newValues: { orderedItemIds: payload.orderedItemIds },
        requestId,
      });
    });

    return this.getPromotion(auth, promotion.id);
  }

  async checkDuplicates(auth: AuthContext, promotionId: string, itemId: string, requestId?: string) {
    const promotion = await this.requirePromotionInScope(auth, promotionId);
    const item = await this.requirePromotionItem(promotion.id, itemId);

    const candidates = await this.findDuplicateCandidates(promotion.schoolId, item.targetMasterContentType, safeRecord(item.mappedFields));

    await prisma.$transaction(async (tx) => {
      await tx.masterContentPromotionItem.update({
        where: { id: item.id },
        data: {
          duplicateCandidates: candidates as Prisma.InputJsonValue,
          updatedById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'master_content.promotion.item.check_duplicates',
        entityType: 'master_content_promotion_item',
        entityId: item.id,
        schoolId: promotion.schoolId,
        actorUserId: auth.userId,
        newValues: { duplicateCount: candidates.length },
        requestId,
      });
    });

    return { duplicateCandidates: candidates };
  }

  async linkExisting(
    auth: AuthContext,
    promotionId: string,
    itemId: string,
    payload: { targetMasterContentId: string; lastKnownUpdatedAt: string },
    requestId?: string,
  ) {
    const promotion = await this.requirePromotionInScope(auth, promotionId);
    this.assertPromotionEditable(promotion.status);

    const item = await this.requirePromotionItem(promotion.id, itemId);
    this.assertNoConcurrentModification(item.updatedAt, payload.lastKnownUpdatedAt, 'Promotion item has changed.');

    const descriptor = targetTypeMap[item.targetMasterContentType];
    const entity = (await masterContentService.getEntity(auth, descriptor.entityType, payload.targetMasterContentId)) as Record<string, unknown>;

    this.assertTargetCompatibility(promotion.schoolId, entity);

    const status = String(entity.status ?? '');
    const isActive = Boolean(entity.isActive ?? true);
    if (status === 'ARCHIVED' || !isActive) {
      throw lifecycleConflict('Linked master content must be active and not archived.');
    }

    const data: Prisma.MasterContentPromotionItemUpdateInput = {
      action: 'LINK_EXISTING',
      duplicateDecision: 'LINK_EXISTING',
      status: 'APPROVED',
      updatedById: auth.userId,
      [descriptor.linkField]: payload.targetMasterContentId,
    } as Prisma.MasterContentPromotionItemUpdateInput;

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.masterContentPromotionItem.update({ where: { id: item.id }, data });

      await this.createAuditLogTx(tx, {
        action: 'master_content.promotion.item.link_existing',
        entityType: 'master_content_promotion_item',
        entityId: item.id,
        schoolId: promotion.schoolId,
        actorUserId: auth.userId,
        newValues: { targetMasterContentId: payload.targetMasterContentId, targetMasterContentType: item.targetMasterContentType },
        requestId,
      });

      return next;
    });

    return updated;
  }

  async createDraft(
    auth: AuthContext,
    promotionId: string,
    itemId: string,
    payload: { isGlobal?: boolean; lastKnownUpdatedAt: string },
    requestId?: string,
  ) {
    const promotion = await this.requirePromotionInScope(auth, promotionId);
    this.assertPromotionEditable(promotion.status);

    const item = await this.requirePromotionItem(promotion.id, itemId);
    this.assertNoConcurrentModification(item.updatedAt, payload.lastKnownUpdatedAt, 'Promotion item has changed.');

    const descriptor = targetTypeMap[item.targetMasterContentType];
    const mapped = safeRecord(item.mappedFields);

    if (promotion.schoolId !== null && payload.isGlobal) {
      throw forbidden('School-scoped sources cannot create global master-content drafts.');
    }

    // NOTE: createEntity and createLineage are called outside a shared Prisma transaction because
    // masterContentService does not currently expose a transactional interface.
    // If createLineage or the item-update transaction fails after createEntity succeeds, an orphaned
    // DRAFT master-content record may remain. The promotion item stays DRAFT so the operator can retry.
    // A future architectural improvement should pass a transaction client through the service layer.
    let created: unknown = null;

    try {
      created = await masterContentService.createEntity(
        auth,
        descriptor.entityType,
        {
          isGlobal: payload.isGlobal ?? promotion.schoolId === null,
          data: mapped,
        },
        requestId,
      );

      await masterContentService.createLineage(
        auth,
        this.entityTypeToLineageType(descriptor.entityType),
        String((created as Record<string, unknown>).id),
        {
          sourceId: promotion.curriculumSourceId,
          sourceVersionLabel: item.sourceFileVersion ?? undefined,
          sourcePage: this.pageLabel(item.sourcePageStart, item.sourcePageEnd),
          sourceSection: item.sourceSectionReference ?? undefined,
          extractionNote: undefined,
          adaptationNote: item.adaptationNote ?? promotion.adaptationNote ?? undefined,
          attribution: item.attribution ?? undefined,
          usageRestriction: undefined,
        },
        requestId,
      );

      const updated = await prisma.$transaction(async (tx) => {
        const data: Prisma.MasterContentPromotionItemUpdateInput = {
          action: 'CREATE_DRAFT',
          status: 'APPROVED',
          duplicateDecision: 'CREATE_NEW',
          updatedById: auth.userId,
          [descriptor.linkField]: String((created as Record<string, unknown>).id),
        } as Prisma.MasterContentPromotionItemUpdateInput;

        const next = await tx.masterContentPromotionItem.update({ where: { id: item.id }, data });

        await this.createAuditLogTx(tx, {
          action: 'master_content.promotion.item.create_draft',
          entityType: 'master_content_promotion_item',
          entityId: item.id,
          schoolId: promotion.schoolId,
          actorUserId: auth.userId,
          newValues: { draftId: String((created as Record<string, unknown>).id), targetMasterContentType: item.targetMasterContentType },
          requestId,
        });

        return next;
      });

      return updated;
    } catch (err) {
      // If master content was created but a subsequent step failed, attempt to archive the orphan
      // directly via Prisma to avoid needing lastKnownUpdatedAt from transitionLifecycle.
      if (created !== null) {
        try {
          const createdId = String((created as Record<string, unknown>).id);
          const model = this.entityModel(descriptor.entityType);
          await model.update({
            where: { id: createdId },
            data: { status: 'ARCHIVED', isActive: false, archivedAt: new Date() },
          });
        } catch {
          // Best-effort cleanup; do not mask the original error.
        }
      }
      throw err;
    }
  }

  async submitReview(
    auth: AuthContext,
    promotionId: string,
    payload: { comment?: string; requestedChanges?: string; reason?: string; lastKnownUpdatedAt: string },
    requestId?: string,
  ) {
    return this.transition(auth, promotionId, {
      nextStatus: 'READY_FOR_REVIEW',
      allowedFrom: ['DRAFT', 'REVISION_REQUIRED'],
      action: 'master_content.promotion.submit_review',
      payload,
      requestId,
    });
  }

  async requestRevision(
    auth: AuthContext,
    promotionId: string,
    payload: { comment?: string; requestedChanges?: string; reason?: string; lastKnownUpdatedAt: string },
    requestId?: string,
  ) {
    if (!payload.requestedChanges?.trim()) {
      throw badRequest('requestedChanges is required.');
    }

    return this.transition(auth, promotionId, {
      nextStatus: 'REVISION_REQUIRED',
      allowedFrom: ['READY_FOR_REVIEW', 'UNDER_REVIEW'],
      action: 'master_content.promotion.request_revision',
      payload,
      requestId,
    });
  }

  async approve(
    auth: AuthContext,
    promotionId: string,
    payload: { comment?: string; requestedChanges?: string; reason?: string; lastKnownUpdatedAt: string },
    requestId?: string,
  ) {
    const updated = await this.transition(auth, promotionId, {
      nextStatus: 'APPROVED',
      allowedFrom: ['READY_FOR_REVIEW', 'UNDER_REVIEW'],
      action: 'master_content.promotion.approve',
      payload,
      requestId,
    });

    return updated;
  }

  async reject(
    auth: AuthContext,
    promotionId: string,
    payload: { comment?: string; requestedChanges?: string; reason?: string; lastKnownUpdatedAt: string },
    requestId?: string,
  ) {
    if (!payload.reason?.trim()) {
      throw badRequest('reason is required.');
    }

    return this.transition(auth, promotionId, {
      nextStatus: 'REJECTED',
      allowedFrom: ['READY_FOR_REVIEW', 'UNDER_REVIEW'],
      action: 'master_content.promotion.reject',
      payload,
      requestId,
    });
  }

  async complete(
    auth: AuthContext,
    promotionId: string,
    payload: { comment?: string; requestedChanges?: string; reason?: string; lastKnownUpdatedAt: string },
    requestId?: string,
  ) {
    const promotion = await this.requirePromotionInScope(auth, promotionId);

    if (promotion.status !== 'APPROVED') {
      throw lifecycleConflict('Only approved promotions can be completed.');
    }

    this.assertNoConcurrentModification(promotion.updatedAt, payload.lastKnownUpdatedAt, 'Promotion has changed.');

    const incompleteItems = promotion.items.filter((item) => {
      if (item.archivedAt) {
        return false;
      }

      if (item.action === 'SKIP' || item.action === 'MARK_DUPLICATE') {
        return false;
      }

      return !this.resolveLinkedMasterId(item);
    });

    if (incompleteItems.length > 0) {
      throw lifecycleConflict('All non-skipped promotion items must be linked or drafted before completion.');
    }

    await prisma.$transaction(async (tx) => {
      await tx.masterContentPromotion.update({
        where: { id: promotion.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          completedById: auth.userId,
          reviewNote: payload.comment ?? promotion.reviewNote,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'master_content.promotion.complete',
        entityType: 'master_content_promotion',
        entityId: promotion.id,
        schoolId: promotion.schoolId,
        actorUserId: auth.userId,
        oldValues: { status: promotion.status },
        newValues: { status: 'COMPLETED' },
        reason: payload.reason ?? payload.comment,
        requestId,
      });
    });

    return this.getPromotion(auth, promotion.id);
  }

  async archive(
    auth: AuthContext,
    promotionId: string,
    payload: { comment?: string; requestedChanges?: string; reason?: string; lastKnownUpdatedAt: string },
    requestId?: string,
  ) {
    if (!payload.reason?.trim()) {
      throw badRequest('reason is required.');
    }

    const promotion = await this.requirePromotionInScope(auth, promotionId);
    this.assertNoConcurrentModification(promotion.updatedAt, payload.lastKnownUpdatedAt, 'Promotion has changed.');

    if (promotion.status === 'ARCHIVED') {
      return promotion;
    }

    await prisma.$transaction(async (tx) => {
      await tx.masterContentPromotion.update({
        where: { id: promotion.id },
        data: {
          status: 'ARCHIVED',
          archivedAt: new Date(),
          archivedById: auth.userId,
          reviewNote: payload.comment ?? promotion.reviewNote,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'master_content.promotion.archive',
        entityType: 'master_content_promotion',
        entityId: promotion.id,
        schoolId: promotion.schoolId,
        actorUserId: auth.userId,
        oldValues: { status: promotion.status },
        newValues: { status: 'ARCHIVED' },
        reason: payload.reason,
        requestId,
      });
    });

    return this.getPromotion(auth, promotion.id);
  }

  async history(auth: AuthContext, promotionId: string) {
    const promotion = await this.requirePromotionInScope(auth, promotionId);

    return prisma.auditLog.findMany({
      where: {
        schoolId: promotion.schoolId,
        OR: [
          { entityId: promotion.id, entityType: 'master_content_promotion' },
          { entityType: 'master_content_promotion_item', newValues: { path: ['promotionId'], equals: promotion.id } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async compare(auth: AuthContext, promotionId: string) {
    const promotion = await this.requirePromotionInScope(auth, promotionId);

    const itemSummary = promotion.items.map((item) => ({
      id: item.id,
      sequenceOrder: item.sequenceOrder,
      sourceContentId: item.sourceContentId,
      targetMasterContentType: item.targetMasterContentType,
      action: item.action,
      linkedMasterId: this.resolveLinkedMasterId(item),
      duplicateDecision: item.duplicateDecision,
      updatedAt: item.updatedAt,
    }));

    return {
      promotion: {
        id: promotion.id,
        status: promotion.status,
        sourceRevisionNumber: promotion.sourceRevisionNumber,
        sourceChecksum: promotion.sourceChecksum,
        updatedAt: promotion.updatedAt,
      },
      itemSummary,
    };
  }

  async audit(auth: AuthContext, promotionId: string) {
    const promotion = await this.requirePromotionInScope(auth, promotionId);
    const itemIds = promotion.items.map((item) => item.id);

    return prisma.auditLog.findMany({
      where: {
        schoolId: promotion.schoolId,
        OR: [
          { entityType: 'master_content_promotion', entityId: promotion.id },
          { entityType: 'master_content_promotion_item', entityId: { in: itemIds } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  private async transition(auth: AuthContext, promotionId: string, transition: PromotionTransition) {
    const promotion = await this.requirePromotionInScope(auth, promotionId);

    this.assertNoConcurrentModification(promotion.updatedAt, transition.payload.lastKnownUpdatedAt, 'Promotion has changed.');

    if (!transition.allowedFrom.includes(promotion.status)) {
      throw lifecycleConflict(`Promotion cannot move from ${promotion.status} to ${transition.nextStatus}.`);
    }

    if (transition.nextStatus === 'READY_FOR_REVIEW' && promotion.items.filter((item) => !item.archivedAt).length === 0) {
      throw lifecycleConflict('At least one promotion item is required before submit for review.');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const data: Prisma.MasterContentPromotionUpdateInput = {
        status: transition.nextStatus,
        reviewNote: transition.payload.comment ?? promotion.reviewNote,
      };

      if (transition.nextStatus === 'READY_FOR_REVIEW') {
        data.submittedAt = new Date();
      }

      if (reviewablePromotionStatuses.has(transition.nextStatus)) {
        data.reviewedAt = new Date();
      }

      if (transition.nextStatus === 'APPROVED') {
        data.approvedAt = new Date();
        data.approvedByUser = { connect: { id: auth.userId } };
      }

      const next = await tx.masterContentPromotion.update({ where: { id: promotion.id }, data });

      await this.createAuditLogTx(tx, {
        action: transition.action,
        entityType: 'master_content_promotion',
        entityId: promotion.id,
        schoolId: promotion.schoolId,
        actorUserId: auth.userId,
        oldValues: { status: promotion.status },
        newValues: { status: next.status },
        reason: transition.payload.reason ?? transition.payload.comment ?? transition.payload.requestedChanges,
        requestId: transition.requestId,
      });

      return next;
    });

    return this.getPromotion(auth, updated.id);
  }

  private async requirePromotionInScope(auth: AuthContext, promotionId: string) {
    const promotion = await masterContentPromotionRepository.findPromotionById(promotionId);
    if (!promotion) {
      throw notFound('Promotion request not found.');
    }

    this.assertSourceScope(auth, promotion.schoolId);
    return promotion;
  }

  private async requirePromotionItem(promotionId: string, itemId: string) {
    const item = await masterContentPromotionRepository.findPromotionItemById(itemId);
    if (!item || item.promotionId !== promotionId || item.archivedAt) {
      throw notFound('Promotion item not found.');
    }
    return item;
  }

  private assertSourceScope(auth: AuthContext, sourceSchoolId: string | null): void {
    if (sourceSchoolId === null && !auth.isSuperAdmin) {
      throw forbidden('Global source promotion is restricted to global administrators.');
    }

    if (sourceSchoolId !== null && !auth.isSuperAdmin && auth.schoolId !== sourceSchoolId) {
      throw tenantScopeViolation('Source promotion outside authenticated school scope is prohibited.');
    }
  }

  private assertSessionSelectable(status: string): void {
    if (!selectableSessionStatuses.has(status)) {
      throw lifecycleConflict('Only approved or completed processing sessions may be promoted.');
    }
  }

  private assertPromotionEditable(status: MasterContentPromotionStatus): void {
    if (!editablePromotionStatuses.has(status)) {
      throw lifecycleConflict('Promotion is locked and cannot be edited in the current status.');
    }
  }

  private assertNoConcurrentModification(current: Date, incomingIso: string, message: string): void {
    const incoming = new Date(incomingIso);
    if (Number.isNaN(incoming.getTime())) {
      throw badRequest('Invalid lastKnownUpdatedAt value.');
    }

    if (current.getTime() !== incoming.getTime()) {
      throw versionConflict(message);
    }
  }

  private defaultMappedFields(
    sourceContent: {
      heading: string | null;
      rawText: string | null;
      structuredData: Prisma.JsonValue;
      contentType: CurriculumSourceContentType;
      sourceSection: string | null;
      sourcePage: string | null;
    },
    targetType: MasterContentPromotionTargetType,
    mappedFields?: Prisma.InputJsonValue,
  ): Prisma.InputJsonValue {
    const override = safeRecord(mappedFields);
    if (Object.keys(override).length > 0) {
      return override as Prisma.InputJsonValue;
    }

    const structured = safeRecord(sourceContent.structuredData);
    const heading = sourceContent.heading ?? 'Untitled';
    const rawText = sourceContent.rawText ?? '';

    if (targetType === 'CURRICULUM_UNIT') {
      return {
        title: String(structured.title ?? heading),
        code: structured.code,
        description: String(structured.description ?? rawText),
        estimatedWeeks: structured.estimatedWeeks,
      } as Prisma.InputJsonValue;
    }

    if (targetType === 'TOPIC') {
      return {
        title: String(structured.title ?? heading),
        code: structured.code,
        description: String(structured.description ?? rawText),
        sequenceOrder: structured.sequenceOrder ?? 1,
      } as Prisma.InputJsonValue;
    }

    if (targetType === 'CONCEPT') {
      return {
        name: String(structured.name ?? heading),
        code: structured.code,
        definition: String(structured.definition ?? rawText),
        explanation: structured.explanation,
      } as Prisma.InputJsonValue;
    }

    if (targetType === 'SKILL') {
      return {
        name: String(structured.name ?? heading),
        code: structured.code,
        description: String(structured.description ?? rawText),
      } as Prisma.InputJsonValue;
    }

    if (targetType === 'LEARNING_OUTCOME') {
      return {
        statement: String((structured.statement ?? rawText) || heading),
        code: structured.code,
        bloomLevel: structured.bloomLevel,
        measurableVerb: structured.measurableVerb,
      } as Prisma.InputJsonValue;
    }

    if (targetType === 'ACTIVITY') {
      return {
        title: String(structured.title ?? heading),
        description: String(structured.description ?? rawText),
        activityType: structured.activityType ?? 'OTHER',
      } as Prisma.InputJsonValue;
    }

    if (targetType === 'PROJECT') {
      return {
        title: String(structured.title ?? heading),
        description: String(structured.description ?? rawText),
        objective: structured.objective,
      } as Prisma.InputJsonValue;
    }

    if (targetType === 'PROJECT_IMPLEMENTATION') {
      return {
        title: String(structured.title ?? heading),
        description: String(structured.description ?? rawText),
        implementationType: structured.implementationType ?? 'OTHER',
      } as Prisma.InputJsonValue;
    }

    if (targetType === 'RESOURCE') {
      return {
        title: String(structured.title ?? heading),
        description: String(structured.description ?? rawText),
        resourceType: structured.resourceType ?? 'OTHER',
      } as Prisma.InputJsonValue;
    }

    return {
      title: String(structured.title ?? heading),
      description: String(structured.description ?? rawText),
      assessmentType: structured.assessmentType ?? 'OTHER',
    } as Prisma.InputJsonValue;
  }

  private async findDuplicateCandidates(
    schoolId: string | null,
    targetType: MasterContentPromotionTargetType,
    mappedFields: Record<string, unknown>,
  ) {
    const descriptor = targetTypeMap[targetType];
    const model = this.entityModel(descriptor.entityType);

    const normalizedCode = normalize(typeof mappedFields.code === 'string' ? mappedFields.code : undefined);
    const normalizedTitle = normalize(
      (typeof mappedFields.title === 'string' ? mappedFields.title : undefined) ??
        (typeof mappedFields.name === 'string' ? mappedFields.name : undefined) ??
        (typeof mappedFields.statement === 'string' ? mappedFields.statement : undefined),
    );

    const scopeWhere = schoolId === null ? { schoolId: null } : { OR: [{ schoolId }, { schoolId: null }] };

    const rows = await model.findMany({
      where: {
        ...scopeWhere,
        ...(normalizedCode ? { code: { equals: normalizedCode, mode: 'insensitive' } } : {}),
      },
      take: 50,
    });

    const candidates = rows
      .filter((row: Record<string, unknown>) => {
        const code = normalize(typeof row.code === 'string' ? row.code : undefined);
        const title = normalize(
          (typeof row.title === 'string' ? row.title : undefined) ??
            (typeof row.name === 'string' ? row.name : undefined) ??
            (typeof row.statement === 'string' ? row.statement : undefined),
        );

        if (normalizedCode && code && normalizedCode === code) {
          return true;
        }

        if (normalizedTitle && title && normalizedTitle === title) {
          return true;
        }

        return false;
      })
      .map((row: Record<string, unknown>) => ({
        id: String(row.id),
        schoolId: (row.schoolId as string | null) ?? null,
        code: (row.code as string | null) ?? null,
        title: ((row.title as string | null) ?? (row.name as string | null) ?? (row.statement as string | null) ?? null),
        status: (row.status as string | null) ?? null,
      }));

    return candidates;
  }

  private assertTargetCompatibility(sourceSchoolId: string | null, entity: Record<string, unknown>): void {
    const targetSchoolId = (entity.schoolId as string | null) ?? null;

    if (sourceSchoolId === null && targetSchoolId !== null) {
      throw tenantScopeViolation('Global source promotion cannot link to school-owned master content.');
    }

    if (sourceSchoolId !== null && targetSchoolId !== null && sourceSchoolId !== targetSchoolId) {
      throw tenantScopeViolation('Cross-school linking is prohibited.');
    }
  }

  private entityModel(entityType: MasterEntityType): any {
    if (entityType === 'units') return prisma.masterCurriculumUnit;
    if (entityType === 'topics') return prisma.masterTopic;
    if (entityType === 'concepts') return prisma.masterConcept;
    if (entityType === 'skills') return prisma.masterSkill;
    if (entityType === 'outcomes') return prisma.masterLearningOutcome;
    if (entityType === 'activities') return prisma.masterActivity;
    if (entityType === 'projects') return prisma.masterProject;
    if (entityType === 'project-implementations') return prisma.masterProjectImplementation;
    if (entityType === 'resources') return prisma.masterResource;
    return prisma.masterAssessmentTemplate;
  }

  private entityTypeToLineageType(entityType: MasterEntityType):
    | 'unit'
    | 'topic'
    | 'concept'
    | 'skill'
    | 'learning_outcome'
    | 'activity'
    | 'project'
    | 'project_implementation'
    | 'resource'
    | 'assessment_template' {
    if (entityType === 'units') return 'unit';
    if (entityType === 'topics') return 'topic';
    if (entityType === 'concepts') return 'concept';
    if (entityType === 'skills') return 'skill';
    if (entityType === 'outcomes') return 'learning_outcome';
    if (entityType === 'activities') return 'activity';
    if (entityType === 'projects') return 'project';
    if (entityType === 'project-implementations') return 'project_implementation';
    if (entityType === 'resources') return 'resource';
    return 'assessment_template';
  }

  private resolveLinkedMasterId(item: {
    masterCurriculumUnitId: string | null;
    masterTopicId: string | null;
    masterConceptId: string | null;
    masterSkillId: string | null;
    masterLearningOutcomeId: string | null;
    masterActivityId: string | null;
    masterProjectId: string | null;
    masterProjectImplementationId: string | null;
    masterResourceId: string | null;
    masterAssessmentTemplateId: string | null;
  }): string | null {
    return (
      item.masterCurriculumUnitId ??
      item.masterTopicId ??
      item.masterConceptId ??
      item.masterSkillId ??
      item.masterLearningOutcomeId ??
      item.masterActivityId ??
      item.masterProjectId ??
      item.masterProjectImplementationId ??
      item.masterResourceId ??
      item.masterAssessmentTemplateId ??
      null
    );
  }

  private pageLabel(pageStart: number | null, pageEnd: number | null): string | undefined {
    if (pageStart === null && pageEnd === null) {
      return undefined;
    }

    if (pageStart !== null && pageEnd !== null && pageStart !== pageEnd) {
      return `${pageStart}-${pageEnd}`;
    }

    return String(pageStart ?? pageEnd);
  }

  private asNumber(value: string | null): number | null {
    if (!value) {
      return null;
    }

    const match = value.match(/\d+/);
    if (!match) {
      return null;
    }

    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private async createAuditLogTx(
    tx: Prisma.TransactionClient,
    payload: {
      action: string;
      entityType: string;
      entityId: string;
      schoolId: string | null;
      actorUserId: string;
      oldValues?: Prisma.InputJsonValue;
      newValues?: Prisma.InputJsonValue;
      reason?: string;
      requestId?: string;
    },
  ) {
    await tx.auditLog.create({
      data: {
        schoolId: payload.schoolId,
        actorUserId: payload.actorUserId,
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId,
        oldValues: payload.oldValues,
        newValues: payload.newValues,
        reason: payload.reason,
        requestId: payload.requestId,
      },
    });
  }
}

export const masterContentPromotionService = new MasterContentPromotionService();