import { Prisma, type ContentReviewStatus, type CurriculumSourceContentType, type CurriculumSourceProcessingStatus } from '@prisma/client';

import { prisma } from '../config/prisma';
import { curriculumRepository } from '../repositories/curriculum.repository';
import type { AuthContext } from '../types/auth.types';
import {
  badRequest,
  forbidden,
  lifecycleConflict,
  notFound,
  tenantScopeViolation,
  versionConflict,
} from '../utils/app-error';

const readableScanStatuses = new Set(['CLEAN', 'NOT_CONFIGURED']);
const editableProcessingStatuses = new Set<CurriculumSourceProcessingStatus>(['DRAFT', 'IN_PROGRESS', 'REVISION_REQUIRED']);
const pendingReviewStatus: CurriculumSourceProcessingStatus = 'PENDING_REVIEW';

type AuditPayload = {
  action: string;
  entityType: string;
  entityId: string;
  schoolId: string | null;
  actorUserId: string;
  oldValues?: Prisma.InputJsonValue;
  newValues?: Prisma.InputJsonValue;
  reason?: string;
  requestId?: string;
};

const sectionTypeToContentType: Record<string, CurriculumSourceContentType> = {
  UNIT: 'UNIT',
  TOPIC: 'TOPIC',
  CONCEPT: 'CONCEPT',
  SKILL: 'SKILL',
  LEARNING_OUTCOME: 'LEARNING_OUTCOME',
  ACTIVITY: 'ACTIVITY',
  PROJECT: 'PROJECT',
  RESOURCE: 'RESOURCE',
  ASSESSMENT: 'ASSESSMENT',
  DOCUMENT_HEADING: 'SECTION',
  INTRODUCTION: 'SECTION',
  CLASS_LEVEL: 'SECTION',
  TERM: 'SECTION',
  SUBJECT: 'SECTION',
  NOTE: 'SECTION',
  OTHER: 'OTHER',
};

const stableSectionKey = (section: {
  sectionType: string;
  heading: string;
  sequenceOrder: number;
  parentSectionId: string | null;
  rawText: string;
  sourceSectionReference: string | null;
  pageStart: number | null;
  pageEnd: number | null;
}) => {
  return JSON.stringify([
    section.sectionType,
    section.heading,
    section.sequenceOrder,
    section.parentSectionId,
    section.rawText,
    section.sourceSectionReference,
    section.pageStart,
    section.pageEnd,
  ]);
};

export class SourceProcessingService {
  async listProcessingSessions(auth: AuthContext, sourceId: string) {
    const source = await this.requireSourceInScope(sourceId, auth);

    return prisma.curriculumSourceProcessingSession.findMany({
      where: { curriculumSourceId: source.id },
      orderBy: [{ revisionNumber: 'desc' }, { createdAt: 'desc' }],
      include: {
        sections: { where: { archivedAt: null }, orderBy: [{ parentSectionId: 'asc' }, { sequenceOrder: 'asc' }] },
        sourceContents: { where: { archivedAt: null }, orderBy: { sequenceOrder: 'asc' } },
      },
    });
  }

  async createProcessingSession(
    auth: AuthContext,
    sourceId: string,
    payload: {
      curriculumSourceFileId: string;
      notes?: string;
      metadata?: Prisma.InputJsonValue;
      basedOnSessionId?: string;
    },
    requestId?: string,
  ) {
    const source = await this.requireSourceInScope(sourceId, auth);
    this.assertSourceCreateScope(auth, source.schoolId);

    const sourceFile = await curriculumRepository.findSourceFileById(payload.curriculumSourceFileId);
    if (!sourceFile || sourceFile.curriculumSourceId !== source.id || sourceFile.status !== 'ACTIVE') {
      throw notFound('Active curriculum source file not found for processing.');
    }

    if (sourceFile.uploadStatus !== 'READY') {
      throw lifecycleConflict('Selected source file is not ready for processing.');
    }

    if (!readableScanStatuses.has(sourceFile.scanStatus)) {
      throw lifecycleConflict('Selected source file cannot be processed until scan policy permits access.');
    }

    const maxRevision = await prisma.curriculumSourceProcessingSession.aggregate({
      where: { curriculumSourceId: source.id },
      _max: { revisionNumber: true },
    });

    const revisionNumber = (maxRevision._max.revisionNumber ?? 0) + 1;

    const created = await prisma.$transaction(async (tx) => {
      const next = await tx.curriculumSourceProcessingSession.create({
        data: {
          schoolId: source.schoolId,
          curriculumSourceId: source.id,
          curriculumSourceFileId: sourceFile.id,
          sourceFileVersion: sourceFile.documentVersion,
          status: 'IN_PROGRESS',
          processingMethod: 'MANUAL',
          startedById: auth.userId,
          notes: payload.notes,
          metadata: payload.metadata,
          revisionNumber,
          lastKnownSourceChecksum: sourceFile.checksum,
          previousSessionId: payload.basedOnSessionId,
          revisionReason: payload.basedOnSessionId ? 'Revision created from prior processing session.' : null,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.source.processing.create',
        entityType: 'curriculum_source_processing_session',
        entityId: next.id,
        schoolId: source.schoolId,
        actorUserId: auth.userId,
        newValues: {
          sourceId: source.id,
          sourceFileId: sourceFile.id,
          sourceChecksum: sourceFile.checksum,
          revisionNumber,
          processingMethod: 'MANUAL',
        },
        requestId,
      });

      return next;
    });

    return this.getProcessingSession(auth, sourceId, created.id);
  }

  async getProcessingSession(auth: AuthContext, sourceId: string, sessionId: string) {
    const source = await this.requireSourceInScope(sourceId, auth);

    const session = await prisma.curriculumSourceProcessingSession.findUnique({
      where: { id: sessionId },
      include: {
        sections: { orderBy: [{ parentSectionId: 'asc' }, { sequenceOrder: 'asc' }] },
        sourceContents: { where: { archivedAt: null }, orderBy: { sequenceOrder: 'asc' } },
        curriculumSourceFile: true,
      },
    });

    if (!session || session.curriculumSourceId !== source.id) {
      throw notFound('Processing session not found for this source.');
    }

    return session;
  }

  async updateProcessingSession(
    auth: AuthContext,
    sourceId: string,
    sessionId: string,
    payload: {
      notes?: string;
      metadata?: Prisma.InputJsonValue;
      assignedReviewerId?: string | null;
      lastKnownUpdatedAt: string;
    },
    requestId?: string,
  ) {
    const source = await this.requireSourceInScope(sourceId, auth);
    const session = await this.requireSessionInScope(source.id, sessionId, auth);
    this.assertEditableProcessingSession(session.status);
    this.assertNoConcurrentModification(session.updatedAt, payload.lastKnownUpdatedAt, 'Processing session has changed.');
    await this.assertSessionSourceIntegrity(session);

    const assignedReviewerId = payload.assignedReviewerId === '' ? null : payload.assignedReviewerId;

    await prisma.$transaction(async (tx) => {
      const next = await tx.curriculumSourceProcessingSession.update({
        where: { id: session.id },
        data: {
          notes: payload.notes,
          metadata: payload.metadata,
          assignedReviewerId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.source.processing.update',
        entityType: 'curriculum_source_processing_session',
        entityId: next.id,
        schoolId: source.schoolId,
        actorUserId: auth.userId,
        oldValues: { assignedReviewerId: session.assignedReviewerId },
        newValues: { assignedReviewerId: next.assignedReviewerId },
        requestId,
      });
    });

    return this.getProcessingSession(auth, sourceId, session.id);
  }

  async submitForReview(
    auth: AuthContext,
    sourceId: string,
    sessionId: string,
    payload: { comment?: string; lastKnownUpdatedAt: string },
    requestId?: string,
  ) {
    return this.transitionSessionStatus(auth, sourceId, sessionId, {
      nextStatus: 'PENDING_REVIEW',
      allowedFrom: ['DRAFT', 'IN_PROGRESS', 'REVISION_REQUIRED'],
      payload,
      requestId,
      action: 'curriculum.source.processing.submit_review',
      touchSubmittedAt: true,
    });
  }

  async requestRevision(
    auth: AuthContext,
    sourceId: string,
    sessionId: string,
    payload: { requestedChanges: string; comment?: string; lastKnownUpdatedAt: string },
    requestId?: string,
  ) {
    if (!payload.requestedChanges?.trim()) {
      throw badRequest('requestedChanges is required.');
    }

    return this.transitionSessionStatus(auth, sourceId, sessionId, {
      nextStatus: 'REVISION_REQUIRED',
      allowedFrom: ['PENDING_REVIEW'],
      payload,
      requestId,
      action: 'curriculum.source.processing.request_revision',
      reason: payload.comment ?? payload.requestedChanges,
      revisionReason: payload.requestedChanges,
      touchReviewedAt: true,
    });
  }

  async approve(
    auth: AuthContext,
    sourceId: string,
    sessionId: string,
    payload: { comment?: string; lastKnownUpdatedAt: string },
    requestId?: string,
  ) {
    return this.transitionSessionStatus(auth, sourceId, sessionId, {
      nextStatus: 'APPROVED',
      allowedFrom: ['PENDING_REVIEW'],
      payload,
      requestId,
      action: 'curriculum.source.processing.approve',
      reason: payload.comment,
      touchReviewedAt: true,
      touchApprovedAt: true,
    });
  }

  async reject(
    auth: AuthContext,
    sourceId: string,
    sessionId: string,
    payload: { rejectionReason: string; comment?: string; lastKnownUpdatedAt: string },
    requestId?: string,
  ) {
    if (!payload.rejectionReason?.trim()) {
      throw badRequest('rejectionReason is required.');
    }

    return this.transitionSessionStatus(auth, sourceId, sessionId, {
      nextStatus: 'REJECTED',
      allowedFrom: ['PENDING_REVIEW'],
      payload,
      requestId,
      action: 'curriculum.source.processing.reject',
      reason: payload.comment ?? payload.rejectionReason,
      touchReviewedAt: true,
    });
  }

  async complete(
    auth: AuthContext,
    sourceId: string,
    sessionId: string,
    payload: { comment?: string; lastKnownUpdatedAt: string },
    requestId?: string,
  ) {
    return this.transitionSessionStatus(auth, sourceId, sessionId, {
      nextStatus: 'COMPLETED',
      allowedFrom: ['APPROVED'],
      payload,
      requestId,
      action: 'curriculum.source.processing.complete',
      reason: payload.comment,
      touchCompletedAt: true,
    });
  }

  async archive(
    auth: AuthContext,
    sourceId: string,
    sessionId: string,
    payload: { reason: string; lastKnownUpdatedAt: string },
    requestId?: string,
  ) {
    if (!payload.reason?.trim()) {
      throw badRequest('Archiving a processing session requires a reason.');
    }

    return this.transitionSessionStatus(auth, sourceId, sessionId, {
      nextStatus: 'ARCHIVED',
      allowedFrom: ['DRAFT', 'IN_PROGRESS', 'REVISION_REQUIRED', 'REJECTED', 'COMPLETED'],
      payload,
      requestId,
      action: 'curriculum.source.processing.archive',
      reason: payload.reason,
      archiveReason: payload.reason,
      touchArchivedAt: true,
    });
  }

  async listSections(auth: AuthContext, sessionId: string) {
    const session = await this.requireSessionInScope(undefined, sessionId, auth);

    return prisma.curriculumSourceSection.findMany({
      where: { processingSessionId: session.id },
      orderBy: [{ parentSectionId: 'asc' }, { sequenceOrder: 'asc' }],
    });
  }

  async createSection(
    auth: AuthContext,
    sessionId: string,
    payload: {
      parentSectionId?: string;
      sectionType:
        | 'DOCUMENT_HEADING'
        | 'INTRODUCTION'
        | 'CLASS_LEVEL'
        | 'TERM'
        | 'SUBJECT'
        | 'UNIT'
        | 'TOPIC'
        | 'CONCEPT'
        | 'SKILL'
        | 'LEARNING_OUTCOME'
        | 'ACTIVITY'
        | 'PROJECT'
        | 'RESOURCE'
        | 'ASSESSMENT'
        | 'NOTE'
        | 'OTHER';
      heading: string;
      rawText: string;
      structuredData?: Prisma.InputJsonValue;
      pageStart?: number;
      pageEnd?: number;
      sourceSectionReference?: string;
      sequenceOrder?: number;
    },
    requestId?: string,
  ) {
    const session = await this.requireSessionInScope(undefined, sessionId, auth);
    this.assertEditableProcessingSession(session.status);
    await this.assertSessionSourceIntegrity(session);
    this.validatePageRange(payload.pageStart, payload.pageEnd);

    if (payload.parentSectionId) {
      const parent = await prisma.curriculumSourceSection.findUnique({ where: { id: payload.parentSectionId } });
      if (!parent || parent.processingSessionId !== session.id || parent.archivedAt) {
        throw badRequest('Invalid parent section.');
      }
    }

    const siblingWhere: Prisma.CurriculumSourceSectionWhereInput = {
      processingSessionId: session.id,
      parentSectionId: payload.parentSectionId ?? null,
      archivedAt: null,
    };

    const currentMax = await prisma.curriculumSourceSection.aggregate({
      where: siblingWhere,
      _max: { sequenceOrder: true },
    });

    const nextOrder = payload.sequenceOrder ?? (currentMax._max.sequenceOrder ?? 0) + 1;

    const created = await prisma.$transaction(async (tx) => {
      const section = await tx.curriculumSourceSection.create({
        data: {
          processingSessionId: session.id,
          parentSectionId: payload.parentSectionId ?? null,
          sectionType: payload.sectionType,
          heading: payload.heading,
          rawText: payload.rawText,
          structuredData: payload.structuredData,
          pageStart: payload.pageStart,
          pageEnd: payload.pageEnd,
          sourceSectionReference: payload.sourceSectionReference,
          sequenceOrder: nextOrder,
          createdById: auth.userId,
          updatedById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.source.processing.section.create',
        entityType: 'curriculum_source_section',
        entityId: section.id,
        schoolId: session.schoolId,
        actorUserId: auth.userId,
        newValues: {
          processingSessionId: session.id,
          sectionType: section.sectionType,
          sequenceOrder: section.sequenceOrder,
        },
        requestId,
      });

      return section;
    });

    return this.getSection(auth, session.id, created.id);
  }

  async getSection(auth: AuthContext, sessionId: string, sectionId: string) {
    const session = await this.requireSessionInScope(undefined, sessionId, auth);
    const section = await prisma.curriculumSourceSection.findUnique({
      where: { id: sectionId },
      include: {
        sourceContents: {
          where: { archivedAt: null },
          orderBy: { sequenceOrder: 'asc' },
        },
      },
    });

    if (!section || section.processingSessionId !== session.id) {
      throw notFound('Source section not found.');
    }

    return section;
  }

  async updateSection(
    auth: AuthContext,
    sessionId: string,
    sectionId: string,
    payload: {
      sectionType?:
        | 'DOCUMENT_HEADING'
        | 'INTRODUCTION'
        | 'CLASS_LEVEL'
        | 'TERM'
        | 'SUBJECT'
        | 'UNIT'
        | 'TOPIC'
        | 'CONCEPT'
        | 'SKILL'
        | 'LEARNING_OUTCOME'
        | 'ACTIVITY'
        | 'PROJECT'
        | 'RESOURCE'
        | 'ASSESSMENT'
        | 'NOTE'
        | 'OTHER';
      heading?: string;
      rawText?: string;
      structuredData?: Prisma.InputJsonValue;
      pageStart?: number;
      pageEnd?: number;
      sourceSectionReference?: string;
      reviewStatus?: 'DRAFT' | 'PENDING_REVIEW' | 'REVISION_REQUIRED' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
      reviewNote?: string;
      lastKnownUpdatedAt: string;
    },
    requestId?: string,
  ) {
    const session = await this.requireSessionInScope(undefined, sessionId, auth);
    this.assertEditableProcessingSession(session.status);
    await this.assertSessionSourceIntegrity(session);

    const section = await prisma.curriculumSourceSection.findUnique({ where: { id: sectionId } });
    if (!section || section.processingSessionId !== session.id) {
      throw notFound('Source section not found.');
    }

    this.assertNoConcurrentModification(section.updatedAt, payload.lastKnownUpdatedAt, 'Source section has changed.');
    this.validatePageRange(payload.pageStart, payload.pageEnd);

    await prisma.$transaction(async (tx) => {
      const next = await tx.curriculumSourceSection.update({
        where: { id: section.id },
        data: {
          sectionType: payload.sectionType,
          heading: payload.heading,
          rawText: payload.rawText,
          structuredData: payload.structuredData,
          pageStart: payload.pageStart,
          pageEnd: payload.pageEnd,
          sourceSectionReference: payload.sourceSectionReference,
          reviewStatus: payload.reviewStatus,
          reviewNote: payload.reviewNote,
          updatedById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.source.processing.section.update',
        entityType: 'curriculum_source_section',
        entityId: next.id,
        schoolId: session.schoolId,
        actorUserId: auth.userId,
        oldValues: { reviewStatus: section.reviewStatus, sequenceOrder: section.sequenceOrder },
        newValues: { reviewStatus: next.reviewStatus, sequenceOrder: next.sequenceOrder },
        requestId,
      });
    });

    return this.getSection(auth, session.id, section.id);
  }

  async deleteSection(
    auth: AuthContext,
    sessionId: string,
    sectionId: string,
    payload: { lastKnownUpdatedAt: string },
    requestId?: string,
  ) {
    const session = await this.requireSessionInScope(undefined, sessionId, auth);
    this.assertEditableProcessingSession(session.status);
    await this.assertSessionSourceIntegrity(session);

    const section = await prisma.curriculumSourceSection.findUnique({ where: { id: sectionId } });
    if (!section || section.processingSessionId !== session.id) {
      throw notFound('Source section not found.');
    }

    this.assertNoConcurrentModification(section.updatedAt, payload.lastKnownUpdatedAt, 'Source section has changed.');

    await prisma.$transaction(async (tx) => {
      await tx.curriculumSourceSection.delete({ where: { id: section.id } });

      const remaining = await tx.curriculumSourceSection.findMany({
        where: {
          processingSessionId: session.id,
          parentSectionId: section.parentSectionId,
          archivedAt: null,
        },
        orderBy: { sequenceOrder: 'asc' },
      });

      for (let i = 0; i < remaining.length; i += 1) {
        const expectedOrder = i + 1;
        if (remaining[i]!.sequenceOrder !== expectedOrder) {
          await tx.curriculumSourceSection.update({
            where: { id: remaining[i]!.id },
            data: { sequenceOrder: expectedOrder, updatedById: auth.userId },
          });
        }
      }

      await this.createAuditLogTx(tx, {
        action: 'curriculum.source.processing.section.delete',
        entityType: 'curriculum_source_section',
        entityId: section.id,
        schoolId: session.schoolId,
        actorUserId: auth.userId,
        oldValues: {
          processingSessionId: session.id,
          sectionType: section.sectionType,
          sequenceOrder: section.sequenceOrder,
        },
        requestId,
      });
    });

    return this.listSections(auth, session.id);
  }

  async archiveSection(
    auth: AuthContext,
    sessionId: string,
    sectionId: string,
    payload: { reason: string; lastKnownUpdatedAt: string },
    requestId?: string,
  ) {
    if (!payload.reason.trim()) {
      throw badRequest('Archive reason is required.');
    }

    const session = await this.requireSessionInScope(undefined, sessionId, auth);
    this.assertEditableProcessingSession(session.status);

    const section = await prisma.curriculumSourceSection.findUnique({ where: { id: sectionId } });
    if (!section || section.processingSessionId !== session.id) {
      throw notFound('Source section not found.');
    }

    this.assertNoConcurrentModification(section.updatedAt, payload.lastKnownUpdatedAt, 'Source section has changed.');

    await prisma.$transaction(async (tx) => {
      await tx.curriculumSourceSection.update({
        where: { id: section.id },
        data: {
          archivedAt: new Date(),
          reviewStatus: 'ARCHIVED',
          reviewNote: payload.reason,
          updatedById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.source.processing.section.archive',
        entityType: 'curriculum_source_section',
        entityId: section.id,
        schoolId: session.schoolId,
        actorUserId: auth.userId,
        reason: payload.reason,
        requestId,
      });
    });

    return this.getSection(auth, session.id, section.id);
  }

  async reorderSections(
    auth: AuthContext,
    sessionId: string,
    payload: {
      orderedSectionIds: string[];
      parentSectionId?: string;
      lastKnownSessionUpdatedAt: string;
    },
    requestId?: string,
  ) {
    const session = await this.requireSessionInScope(undefined, sessionId, auth);
    this.assertEditableProcessingSession(session.status);
    this.assertNoConcurrentModification(
      session.updatedAt,
      payload.lastKnownSessionUpdatedAt,
      'Processing session has changed.',
    );

    const siblingWhere: Prisma.CurriculumSourceSectionWhereInput = {
      processingSessionId: session.id,
      parentSectionId: payload.parentSectionId ?? null,
      archivedAt: null,
    };

    const siblings = await prisma.curriculumSourceSection.findMany({
      where: siblingWhere,
      orderBy: { sequenceOrder: 'asc' },
    });

    this.assertFullReorderSet(
      siblings.map((item) => item.id),
      payload.orderedSectionIds,
      'sections',
    );

    await prisma.$transaction(async (tx) => {
      for (let index = 0; index < payload.orderedSectionIds.length; index += 1) {
        await tx.curriculumSourceSection.update({
          where: { id: payload.orderedSectionIds[index]! },
          data: { sequenceOrder: index + 1, updatedById: auth.userId },
        });
      }

      await this.createAuditLogTx(tx, {
        action: 'curriculum.source.processing.section.reorder',
        entityType: 'curriculum_source_processing_session',
        entityId: session.id,
        schoolId: session.schoolId,
        actorUserId: auth.userId,
        newValues: { orderedSectionIds: payload.orderedSectionIds, parentSectionId: payload.parentSectionId ?? null },
        requestId,
      });
    });

    return this.listSections(auth, session.id);
  }

  async moveSection(
    auth: AuthContext,
    sessionId: string,
    sectionId: string,
    payload: {
      targetParentSectionId?: string;
      targetSequenceOrder?: number;
      lastKnownUpdatedAt: string;
    },
    requestId?: string,
  ) {
    const session = await this.requireSessionInScope(undefined, sessionId, auth);
    this.assertEditableProcessingSession(session.status);

    const section = await prisma.curriculumSourceSection.findUnique({ where: { id: sectionId } });
    if (!section || section.processingSessionId !== session.id) {
      throw notFound('Source section not found.');
    }

    this.assertNoConcurrentModification(section.updatedAt, payload.lastKnownUpdatedAt, 'Source section has changed.');

    if (payload.targetParentSectionId) {
      const targetParent = await prisma.curriculumSourceSection.findUnique({ where: { id: payload.targetParentSectionId } });
      if (!targetParent || targetParent.processingSessionId !== session.id || targetParent.archivedAt) {
        throw badRequest('Invalid target parent section.');
      }
      if (targetParent.id === section.id) {
        throw badRequest('A section cannot be moved under itself.');
      }
    }

    await prisma.$transaction(async (tx) => {
      const siblings = await tx.curriculumSourceSection.findMany({
        where: {
          processingSessionId: session.id,
          parentSectionId: payload.targetParentSectionId ?? null,
          archivedAt: null,
        },
        orderBy: { sequenceOrder: 'asc' },
      });

      const targetSequenceOrder = payload.targetSequenceOrder ?? siblings.length + 1;
      if (targetSequenceOrder < 1) {
        throw badRequest('targetSequenceOrder must be positive.');
      }

      await tx.curriculumSourceSection.update({
        where: { id: section.id },
        data: {
          parentSectionId: payload.targetParentSectionId ?? null,
          sequenceOrder: targetSequenceOrder,
          updatedById: auth.userId,
        },
      });

      const targetSiblings = await tx.curriculumSourceSection.findMany({
        where: {
          processingSessionId: session.id,
          parentSectionId: payload.targetParentSectionId ?? null,
          archivedAt: null,
        },
        orderBy: { sequenceOrder: 'asc' },
      });

      for (let index = 0; index < targetSiblings.length; index += 1) {
        const expectedOrder = index + 1;
        if (targetSiblings[index]!.sequenceOrder !== expectedOrder) {
          await tx.curriculumSourceSection.update({
            where: { id: targetSiblings[index]!.id },
            data: { sequenceOrder: expectedOrder, updatedById: auth.userId },
          });
        }
      }

      await this.createAuditLogTx(tx, {
        action: 'curriculum.source.processing.section.move',
        entityType: 'curriculum_source_section',
        entityId: section.id,
        schoolId: session.schoolId,
        actorUserId: auth.userId,
        newValues: {
          targetParentSectionId: payload.targetParentSectionId ?? null,
          targetSequenceOrder,
        },
        requestId,
      });
    });

    return this.getSection(auth, session.id, section.id);
  }

  async listRevisions(auth: AuthContext, sessionId: string) {
    const session = await this.requireSessionInScope(undefined, sessionId, auth);

    return prisma.curriculumSourceProcessingSession.findMany({
      where: { curriculumSourceId: session.curriculumSourceId },
      orderBy: { revisionNumber: 'desc' },
      include: {
        sections: {
          where: { archivedAt: null },
          select: { id: true },
        },
      },
    });
  }

  async compareRevisions(
    auth: AuthContext,
    sessionId: string,
    payload?: { leftRevisionId?: string; rightRevisionId?: string },
  ) {
    const anchor = await this.requireSessionInScope(undefined, sessionId, auth);

    const revisions = await prisma.curriculumSourceProcessingSession.findMany({
      where: { curriculumSourceId: anchor.curriculumSourceId },
      orderBy: { revisionNumber: 'desc' },
      select: { id: true, revisionNumber: true },
    });

    const rightId = payload?.rightRevisionId ?? anchor.id;
    const right = await this.requireSessionInScope(anchor.curriculumSourceId, rightId, auth);

    const leftId = payload?.leftRevisionId ?? right.previousSessionId;
    if (!leftId) {
      return {
        leftRevisionId: null,
        rightRevisionId: right.id,
        addedSections: [],
        removedSections: [],
        changedSections: [],
      };
    }

    const left = await this.requireSessionInScope(anchor.curriculumSourceId, leftId, auth);

    const [leftSections, rightSections] = await Promise.all([
      prisma.curriculumSourceSection.findMany({ where: { processingSessionId: left.id, archivedAt: null } }),
      prisma.curriculumSourceSection.findMany({ where: { processingSessionId: right.id, archivedAt: null } }),
    ]);

    const leftMap = new Map(leftSections.map((item) => [stableSectionKey(item), item]));
    const rightMap = new Map(rightSections.map((item) => [stableSectionKey(item), item]));

    const addedSections = rightSections.filter((item) => !leftMap.has(stableSectionKey(item)));
    const removedSections = leftSections.filter((item) => !rightMap.has(stableSectionKey(item)));

    const changedSections = rightSections
      .map((section) => {
        const maybe = leftSections.find(
          (leftSection) =>
            leftSection.sectionType === section.sectionType &&
            leftSection.heading === section.heading &&
            leftSection.sequenceOrder === section.sequenceOrder &&
            leftSection.parentSectionId === section.parentSectionId,
        );

        if (!maybe) {
          return null;
        }

        if (
          maybe.rawText !== section.rawText ||
          maybe.pageStart !== section.pageStart ||
          maybe.pageEnd !== section.pageEnd ||
          maybe.sourceSectionReference !== section.sourceSectionReference
        ) {
          return {
            before: maybe,
            after: section,
          };
        }

        return null;
      })
      .filter((item) => item !== null);

    return {
      leftRevisionId: left.id,
      rightRevisionId: right.id,
      addedSections,
      removedSections,
      changedSections,
    };
  }

  async getAuditHistory(auth: AuthContext, sessionId: string) {
    const session = await this.requireSessionInScope(undefined, sessionId, auth);

    return prisma.auditLog.findMany({
      where: {
        OR: [
          { entityType: 'curriculum_source_processing_session', entityId: session.id },
          { entityType: 'curriculum_source_section' },
        ],
        schoolId: session.schoolId,
      },
      orderBy: { createdAt: 'desc' },
      take: 300,
    });
  }

  async createStructuredRecordFromSection(
    auth: AuthContext,
    sessionId: string,
    sectionId: string,
    payload: {
      contentType?: CurriculumSourceContentType;
      heading?: string;
      rawText?: string;
      structuredData?: Prisma.InputJsonValue;
      adaptationNote?: string;
      reviewStatus?: ContentReviewStatus;
      sourcePage?: string;
      sourceSection?: string;
      lastKnownSectionUpdatedAt: string;
    },
    requestId?: string,
  ) {
    const session = await this.requireSessionInScope(undefined, sessionId, auth);
    if (session.status !== 'APPROVED' && session.status !== 'COMPLETED') {
      throw lifecycleConflict('Structured records can only be created from APPROVED or COMPLETED sessions.');
    }

    await this.assertSessionSourceIntegrity(session);

    const section = await prisma.curriculumSourceSection.findUnique({ where: { id: sectionId } });
    if (!section || section.processingSessionId !== session.id || section.archivedAt) {
      throw notFound('Source section not found.');
    }

    this.assertNoConcurrentModification(section.updatedAt, payload.lastKnownSectionUpdatedAt, 'Source section has changed.');

    const contentType = payload.contentType ?? sectionTypeToContentType[section.sectionType] ?? 'OTHER';

    const currentMax = await prisma.curriculumSourceContent.aggregate({
      where: { curriculumSourceId: session.curriculumSourceId },
      _max: { sequenceOrder: true },
    });

    const created = await prisma.$transaction(async (tx) => {
      const next = await tx.curriculumSourceContent.create({
        data: {
          curriculumSourceId: session.curriculumSourceId,
          processingSessionId: session.id,
          sectionId: section.id,
          sourceFileId: session.curriculumSourceFileId,
          sourceFileVersion: session.sourceFileVersion,
          sourceFileChecksum: session.lastKnownSourceChecksum,
          sequenceOrder: (currentMax._max.sequenceOrder ?? 0) + 1,
          contentType,
          heading: payload.heading ?? section.heading,
          rawText: payload.rawText ?? section.rawText,
          structuredData:
            payload.structuredData ??
            (section.structuredData === null ? Prisma.JsonNull : (section.structuredData as Prisma.InputJsonValue)),
          sourcePage:
            payload.sourcePage ??
            (section.pageStart && section.pageEnd ? `${section.pageStart}-${section.pageEnd}` : section.pageStart ? String(section.pageStart) : null),
          sourceSection: payload.sourceSection ?? section.sourceSectionReference,
          extractionMethod: 'MANUAL',
          adaptationNote: payload.adaptationNote,
          createdById: auth.userId,
          reviewed: payload.reviewStatus === 'APPROVED',
          reviewStatus: payload.reviewStatus ?? 'PENDING_REVIEW',
          reviewedAt: payload.reviewStatus === 'APPROVED' ? new Date() : null,
          reviewedById: payload.reviewStatus === 'APPROVED' ? auth.userId : null,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.source.processing.typed_record.create',
        entityType: 'curriculum_source_content',
        entityId: next.id,
        schoolId: session.schoolId,
        actorUserId: auth.userId,
        newValues: {
          processingSessionId: session.id,
          sectionId: section.id,
          contentType: next.contentType,
          extractionMethod: 'MANUAL',
        },
        requestId,
      });

      return next;
    });

    return created;
  }

  async listStructuredRecords(auth: AuthContext, sessionId: string) {
    const session = await this.requireSessionInScope(undefined, sessionId, auth);

    return prisma.curriculumSourceContent.findMany({
      where: {
        processingSessionId: session.id,
        archivedAt: null,
      },
      orderBy: { sequenceOrder: 'asc' },
    });
  }

  private async transitionSessionStatus(
    auth: AuthContext,
    sourceId: string,
    sessionId: string,
    input: {
      nextStatus: CurriculumSourceProcessingStatus;
      allowedFrom: CurriculumSourceProcessingStatus[];
      payload: { lastKnownUpdatedAt: string };
      action: string;
      requestId?: string;
      reason?: string;
      revisionReason?: string;
      archiveReason?: string;
      touchSubmittedAt?: boolean;
      touchReviewedAt?: boolean;
      touchApprovedAt?: boolean;
      touchCompletedAt?: boolean;
      touchArchivedAt?: boolean;
    },
  ) {
    const source = await this.requireSourceInScope(sourceId, auth);
    const session = await this.requireSessionInScope(source.id, sessionId, auth);
    this.assertTransitionScope(auth, source.schoolId);
    this.assertNoConcurrentModification(session.updatedAt, input.payload.lastKnownUpdatedAt, 'Processing session has changed.');
    await this.assertSessionSourceIntegrity(session);

    if (!input.allowedFrom.includes(session.status)) {
      throw lifecycleConflict(`Processing session cannot transition from ${session.status} to ${input.nextStatus}.`);
    }

    await prisma.$transaction(async (tx) => {
      const now = new Date();
      const data: Prisma.CurriculumSourceProcessingSessionUpdateInput = {
        status: input.nextStatus,
        revisionReason: input.revisionReason,
        archiveReason: input.archiveReason,
      };

      if (input.touchSubmittedAt) {
        data.submittedAt = now;
      }
      if (input.touchReviewedAt) {
        data.reviewedAt = now;
      }
      if (input.touchApprovedAt) {
        data.approvedAt = now;
      }
      if (input.touchCompletedAt) {
        data.completedAt = now;
      }
      if (input.touchArchivedAt) {
        data.archivedAt = now;
      }

      await tx.curriculumSourceProcessingSession.update({
        where: { id: session.id },
        data,
      });

      await this.createAuditLogTx(tx, {
        action: input.action,
        entityType: 'curriculum_source_processing_session',
        entityId: session.id,
        schoolId: source.schoolId,
        actorUserId: auth.userId,
        oldValues: { status: session.status },
        newValues: { status: input.nextStatus },
        reason: input.reason,
        requestId: input.requestId,
      });
    });

    return this.getProcessingSession(auth, source.id, session.id);
  }

  private async requireSourceInScope(sourceId: string, auth: AuthContext) {
    const source = await curriculumRepository.findSourceRecordById(sourceId);
    if (!source) {
      throw notFound('Curriculum source not found.');
    }

    if (source.schoolId && source.schoolId !== auth.schoolId) {
      throw tenantScopeViolation('Curriculum source does not belong to authenticated school scope.');
    }

    return source;
  }

  private async requireSessionInScope(sourceId: string | undefined, sessionId: string, auth: AuthContext) {
    const session = await prisma.curriculumSourceProcessingSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      throw notFound('Processing session not found.');
    }

    if (sourceId && session.curriculumSourceId !== sourceId) {
      throw notFound('Processing session does not belong to the selected source.');
    }

    if (session.schoolId && session.schoolId !== auth.schoolId) {
      throw tenantScopeViolation('Processing session does not belong to authenticated school scope.');
    }

    return session;
  }

  private async assertSessionSourceIntegrity(session: {
    curriculumSourceFileId: string;
    lastKnownSourceChecksum: string;
    sourceFileVersion: string | null;
  }) {
    const sourceFile = await prisma.curriculumSourceFile.findUnique({ where: { id: session.curriculumSourceFileId } });
    if (!sourceFile || sourceFile.status === 'DELETED') {
      throw lifecycleConflict('Source file linked to processing session is no longer available.');
    }

    if (sourceFile.checksum !== session.lastKnownSourceChecksum) {
      throw versionConflict('Source file checksum changed. Start a new processing revision before continuing.');
    }

    if (!readableScanStatuses.has(sourceFile.scanStatus)) {
      throw lifecycleConflict('Source file is currently blocked by scan policy.');
    }
  }

  private assertSourceCreateScope(auth: AuthContext, sourceSchoolId: string | null): void {
    if (!sourceSchoolId && !auth.isSuperAdmin) {
      throw forbidden('Only super administrators can create processing sessions for global sources.');
    }

    if (sourceSchoolId && sourceSchoolId !== auth.schoolId) {
      throw tenantScopeViolation('Source does not belong to authenticated school scope.');
    }
  }

  private assertTransitionScope(auth: AuthContext, sourceSchoolId: string | null): void {
    if (!sourceSchoolId && !auth.isSuperAdmin) {
      throw forbidden('Only super administrators can perform global processing review actions.');
    }

    if (sourceSchoolId && sourceSchoolId !== auth.schoolId) {
      throw tenantScopeViolation('Source does not belong to authenticated school scope.');
    }
  }

  private assertEditableProcessingSession(status: CurriculumSourceProcessingStatus): void {
    if (!editableProcessingStatuses.has(status)) {
      if (status === pendingReviewStatus) {
        throw lifecycleConflict('Pending-review processing sessions are locked until review decision.');
      }

      throw lifecycleConflict('Approved, completed, rejected, and archived processing sessions are immutable.');
    }
  }

  private validatePageRange(pageStart?: number, pageEnd?: number): void {
    if (pageStart !== undefined && pageStart <= 0) {
      throw badRequest('pageStart must be a positive integer.');
    }

    if (pageEnd !== undefined && pageEnd <= 0) {
      throw badRequest('pageEnd must be a positive integer.');
    }

    if (pageStart !== undefined && pageEnd !== undefined && pageStart > pageEnd) {
      throw badRequest('pageStart cannot be greater than pageEnd.');
    }
  }

  private assertNoConcurrentModification(actualUpdatedAt: Date, lastKnownUpdatedAt: string, message: string): void {
    const known = new Date(lastKnownUpdatedAt);
    if (Number.isNaN(known.getTime())) {
      throw badRequest('Invalid lastKnownUpdatedAt value.');
    }

    if (actualUpdatedAt.getTime() !== known.getTime()) {
      throw versionConflict(message);
    }
  }

  private assertFullReorderSet(existingIds: string[], orderedIds: string[], entityLabel: string): void {
    const existingSet = new Set(existingIds);
    const orderedSet = new Set(orderedIds);

    if (existingSet.size !== orderedSet.size || existingSet.size !== orderedIds.length) {
      throw badRequest(`Invalid ${entityLabel} reorder payload: duplicates or omissions detected.`);
    }

    for (const id of existingSet) {
      if (!orderedSet.has(id)) {
        throw badRequest(`Invalid ${entityLabel} reorder payload: all entities must be included.`);
      }
    }
  }

  private async createAuditLogTx(tx: Prisma.TransactionClient, payload: AuditPayload): Promise<void> {
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

export const sourceProcessingService = new SourceProcessingService();
