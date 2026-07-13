import { Prisma } from '@prisma/client';
import type {
  Curriculum,
  CurriculumAssignment,
  CurriculumAssignmentStatus,
  CurriculumReviewDecision,
  CurriculumStatus,
} from '@prisma/client';

import { prisma } from '../config/prisma';
import { requireSchoolScope } from '../middleware/auth.middleware';
import { curriculumRepository, type CurriculumAggregate } from '../repositories/curriculum.repository';
import type { AuthContext } from '../types/auth.types';
import {
  AppError,
  badRequest,
  databaseConflict,
  duplicateAssignment,
  forbidden,
  lifecycleConflict,
  notFound,
  publicationRequirementFailure,
  tenantScopeViolation,
  versionConflict,
} from '../utils/app-error';
import { canTransitionCurriculumStatus, isEditableCurriculumStatus } from '../utils/lifecycle.util';
import { checksumSnapshot, serializeStableSnapshot } from '../utils/snapshot.util';

type CurriculumListFilters = {
  status?: CurriculumStatus;
  schoolProgrammeComponentId?: string;
  createdById?: string;
  includeArchived?: boolean;
  isPublished?: boolean;
};

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

type VersionNumbers = {
  majorVersion: number;
  minorVersion: number;
  patchVersion: number;
};

const toDate = (value: string): Date => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw badRequest('Invalid date value supplied.');
  }
  return date;
};

const makeVersionNumber = ({ majorVersion, minorVersion, patchVersion }: VersionNumbers): string => {
  return `${majorVersion}.${minorVersion}.${patchVersion}`;
};

const parseVersionNumber = (value: string): VersionNumbers => {
  const parts = value.split('.').map((item) => Number(item));
  const [majorVersion, minorVersion, patchVersion] = parts;
  if (
    parts.length !== 3 ||
    [majorVersion, minorVersion, patchVersion].some(
      (part) => part === undefined || Number.isNaN(part) || part < 0,
    )
  ) {
    return { majorVersion: 1, minorVersion: 0, patchVersion: 0 };
  }

  return {
    majorVersion: majorVersion as number,
    minorVersion: minorVersion as number,
    patchVersion: patchVersion as number,
  };
};

export class CurriculumService {
  async createCurriculum(
    auth: AuthContext,
    payload: {
      schoolProgrammeComponentId: string;
      title: string;
      code: string;
      description?: string;
      creationMethod?: 'MANUAL' | 'MASTER_CONTENT_ADAPTATION' | 'SOURCE_ADAPTATION';
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const schoolId = auth.schoolId;
    if (!schoolId) {
      throw forbidden('School-scoped curriculum creation requires school context.');
    }

    const component = await curriculumRepository.findSchoolProgrammeComponent(
      payload.schoolProgrammeComponentId,
      schoolId,
    );
    if (!component) {
      throw tenantScopeViolation('Programme component does not belong to the authenticated school.');
    }

    try {
      const curriculum = await prisma.$transaction(async (tx) => {
        const created = await tx.curriculum.create({
          data: {
            schoolId,
            schoolProgrammeComponentId: payload.schoolProgrammeComponentId,
            title: payload.title,
            code: payload.code,
            description: payload.description,
            status: 'DRAFT',
            creationMethod: payload.creationMethod ?? 'MANUAL',
            createdById: auth.userId,
          },
        });

        const version = await tx.curriculumVersion.create({
          data: {
            curriculumId: created.id,
            versionNumber: '1.0.0',
            majorVersion: 1,
            minorVersion: 0,
            patchVersion: 0,
            versionLabel: 'v1.0.0-draft',
            status: 'DRAFT',
            changeSummary: 'Initial manual curriculum draft.',
            snapshotData: {
              metadata: {
                generatedAt: null,
                source: 'manual',
              },
            },
            createdById: auth.userId,
            isCurrent: true,
            isPublished: false,
          },
        });

        await tx.curriculum.update({
          where: { id: created.id },
          data: {
            currentVersionId: version.id,
            currentVersionNumber: version.versionNumber,
          },
        });

        await tx.curriculumVisibilitySetting.create({
          data: { curriculumId: created.id },
        });

        await this.createAuditLogTx(tx, {
          action: 'curriculum.create',
          entityType: 'curriculum',
          entityId: created.id,
          schoolId,
          actorUserId: auth.userId,
          newValues: {
            status: created.status,
            code: created.code,
            title: created.title,
            versionNumber: version.versionNumber,
          },
          requestId,
        });

        return created;
      });

      const aggregate = await curriculumRepository.findCurriculumById(curriculum.id);
      if (!aggregate) {
        throw notFound('Created curriculum could not be reloaded.');
      }

      return aggregate;
    } catch (error) {
      this.handleKnownPrismaErrors(error);
      throw error;
    }
  }

  async listCurricula(auth: AuthContext, filters: CurriculumListFilters): Promise<CurriculumAggregate[]> {
    const schoolId = requireSchoolScope({ auth } as never);

    const where: Prisma.CurriculumWhereInput = {
      schoolId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.schoolProgrammeComponentId
        ? { schoolProgrammeComponentId: filters.schoolProgrammeComponentId }
        : {}),
      ...(filters.createdById ? { createdById: filters.createdById } : {}),
      ...(filters.includeArchived ? {} : { archivedAt: null }),
      ...(typeof filters.isPublished === 'boolean'
        ? { status: filters.isPublished ? 'PUBLISHED' : { not: 'PUBLISHED' } }
        : {}),
    };

    return curriculumRepository.listCurricula(where);
  }

  async getCurriculum(auth: AuthContext, curriculumId: string): Promise<CurriculumAggregate> {
    const curriculum = await this.requireCurriculumInScope(curriculumId, auth);
    return curriculum;
  }

  async getEditorLookups(auth: AuthContext, curriculumId: string, sessionId?: string) {
    const curriculum = await this.requireCurriculumInScope(curriculumId, auth);

    const [
      sessions,
      terms,
      academicClasses,
      schoolProgrammeComponents,
      teachers,
      masterConcepts,
      masterLearningOutcomes,
      masterResources,
    ] = await Promise.all([
      curriculumRepository.listSessions(curriculum.schoolId),
      curriculumRepository.listTerms(curriculum.schoolId, sessionId),
      curriculumRepository.listAcademicClasses(curriculum.schoolId),
      curriculumRepository.listEnabledSchoolProgrammeComponents(curriculum.schoolId),
      curriculumRepository.listEligibleSchoolUsers(curriculum.schoolId),
      curriculumRepository.listMasterConcepts(curriculum.schoolId),
      curriculumRepository.listMasterLearningOutcomes(curriculum.schoolId),
      curriculumRepository.listMasterResources(curriculum.schoolId),
    ]);

    return {
      sessions,
      terms,
      academicClasses,
      schoolProgrammeComponents,
      teachers,
      publishedVersions: curriculum.versions.filter(
        (version) => version.isPublished && version.status === 'PUBLISHED' && version.archivedAt === null,
      ),
      masterConcepts,
      masterLearningOutcomes,
      masterResources,
      curriculum,
    };
  }

  async updateCurriculum(
    auth: AuthContext,
    curriculumId: string,
    payload: {
      title?: string;
      code?: string;
      description?: string;
      schoolProgrammeComponentId?: string;
      lastKnownUpdatedAt: string;
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const curriculum = await this.requireEditableCurriculum(curriculumId, auth);
    this.assertNoConcurrentModification(curriculum.updatedAt, payload.lastKnownUpdatedAt);

    if (payload.schoolProgrammeComponentId && payload.schoolProgrammeComponentId !== curriculum.schoolProgrammeComponentId) {
      const component = await curriculumRepository.findSchoolProgrammeComponent(
        payload.schoolProgrammeComponentId,
        curriculum.schoolId,
      );
      if (!component) {
        throw tenantScopeViolation('Programme component does not belong to curriculum school scope.');
      }
    }

    await prisma.$transaction(async (tx) => {
      const updated = await tx.curriculum.update({
        where: { id: curriculumId },
        data: {
          title: payload.title,
          code: payload.code,
          description: payload.description,
          schoolProgrammeComponentId: payload.schoolProgrammeComponentId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.edit',
        entityType: 'curriculum',
        entityId: curriculumId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        oldValues: {
          title: curriculum.title,
          code: curriculum.code,
          description: curriculum.description,
          schoolProgrammeComponentId: curriculum.schoolProgrammeComponentId,
        },
        newValues: {
          title: updated.title,
          code: updated.code,
          description: updated.description,
          schoolProgrammeComponentId: updated.schoolProgrammeComponentId,
        },
        requestId,
      });
    });

    const refreshed = await curriculumRepository.findCurriculumById(curriculumId);
    if (!refreshed) {
      throw notFound('Curriculum not found after update.');
    }
    return refreshed;
  }

  async createUnit(
    auth: AuthContext,
    curriculumId: string,
    payload: {
      title: string;
      code?: string;
      description?: string;
      sequenceOrder: number;
      estimatedWeeks?: number;
      masterCurriculumUnitId?: string;
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const curriculum = await this.requireEditableCurriculum(curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      const unit = await tx.curriculumUnit.create({
        data: {
          curriculumId,
          title: payload.title,
          code: payload.code,
          description: payload.description,
          sequenceOrder: payload.sequenceOrder,
          estimatedWeeks: payload.estimatedWeeks,
          masterCurriculumUnitId: payload.masterCurriculumUnitId,
          createdById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.unit.create',
        entityType: 'curriculum_unit',
        entityId: unit.id,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        newValues: {
          curriculumId,
          sequenceOrder: unit.sequenceOrder,
          title: unit.title,
        },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculumId);
  }

  async updateUnit(
    auth: AuthContext,
    curriculumId: string,
    unitId: string,
    payload: {
      title?: string;
      code?: string;
      description?: string;
      sequenceOrder?: number;
      estimatedWeeks?: number;
      lastKnownUpdatedAt: string;
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const curriculum = await this.requireEditableCurriculum(curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      const existing = await tx.curriculumUnit.findFirst({
        where: { id: unitId, curriculumId, archivedAt: null },
      });
      if (!existing) {
        throw notFound('Curriculum unit not found.');
      }

      this.assertNoConcurrentModification(existing.updatedAt, payload.lastKnownUpdatedAt);

      const updated = await tx.curriculumUnit.update({
        where: { id: unitId },
        data: {
          title: payload.title,
          code: payload.code,
          description: payload.description,
          sequenceOrder: payload.sequenceOrder,
          estimatedWeeks: payload.estimatedWeeks,
          updatedById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.unit.edit',
        entityType: 'curriculum_unit',
        entityId: unitId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        oldValues: {
          title: existing.title,
          sequenceOrder: existing.sequenceOrder,
        },
        newValues: {
          title: updated.title,
          sequenceOrder: updated.sequenceOrder,
        },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculumId);
  }

  async deleteUnit(auth: AuthContext, curriculumId: string, unitId: string, requestId?: string): Promise<CurriculumAggregate> {
    const curriculum = await this.requireEditableCurriculum(curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      const unit = await tx.curriculumUnit.findFirst({
        where: { id: unitId, curriculumId, archivedAt: null },
      });
      if (!unit) {
        throw notFound('Curriculum unit not found.');
      }

      await tx.curriculumUnit.update({
        where: { id: unitId },
        data: {
          archivedAt: new Date(),
          updatedById: auth.userId,
          isActive: false,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.unit.delete',
        entityType: 'curriculum_unit',
        entityId: unitId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        oldValues: { title: unit.title, sequenceOrder: unit.sequenceOrder },
        reason: 'Draft-only soft delete',
        requestId,
      });
    });

    return this.reloadCurriculum(curriculumId);
  }

  async reorderUnits(
    auth: AuthContext,
    curriculumId: string,
    orderedUnitIds: string[],
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const curriculum = await this.requireEditableCurriculum(curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      const units = await tx.curriculumUnit.findMany({
        where: { curriculumId, archivedAt: null },
        orderBy: { sequenceOrder: 'asc' },
      });

      this.assertFullReorderSet(
        units.map((unit) => unit.id),
        orderedUnitIds,
        'unit',
      );

      for (let index = 0; index < orderedUnitIds.length; index += 1) {
        await tx.curriculumUnit.update({
          where: { id: orderedUnitIds[index] },
          data: { sequenceOrder: index + 1, updatedById: auth.userId },
        });
      }

      await this.createAuditLogTx(tx, {
        action: 'curriculum.reorder.units',
        entityType: 'curriculum',
        entityId: curriculumId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        newValues: { orderedUnitIds },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculumId);
  }

  async createTopic(
    auth: AuthContext,
    unitId: string,
    payload: {
      title: string;
      code?: string;
      description?: string;
      sequenceOrder: number;
      weekNumber?: number;
      recommendedDurationMinutes?: number;
      difficultyLevel?: string;
      teacherNote?: string;
      masterTopicId?: string;
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const unit = await prisma.curriculumUnit.findUnique({ where: { id: unitId }, include: { curriculum: true } });
    if (!unit || unit.archivedAt) {
      throw notFound('Curriculum unit not found.');
    }

    const curriculum = await this.requireEditableCurriculum(unit.curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      const topic = await tx.curriculumTopic.create({
        data: {
          curriculumUnitId: unitId,
          title: payload.title,
          code: payload.code,
          description: payload.description,
          sequenceOrder: payload.sequenceOrder,
          weekNumber: payload.weekNumber,
          recommendedDurationMinutes: payload.recommendedDurationMinutes,
          difficultyLevel: payload.difficultyLevel,
          teacherNote: payload.teacherNote,
          masterTopicId: payload.masterTopicId,
          createdById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.topic.create',
        entityType: 'curriculum_topic',
        entityId: topic.id,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        newValues: { unitId, sequenceOrder: topic.sequenceOrder, title: topic.title },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async reorderTopics(
    auth: AuthContext,
    unitId: string,
    orderedTopicIds: string[],
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const unit = await prisma.curriculumUnit.findUnique({ where: { id: unitId } });
    if (!unit || unit.archivedAt) {
      throw notFound('Curriculum unit not found.');
    }

    const curriculum = await this.requireEditableCurriculum(unit.curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      const topics = await tx.curriculumTopic.findMany({
        where: { curriculumUnitId: unitId, archivedAt: null },
        orderBy: { sequenceOrder: 'asc' },
      });

      this.assertFullReorderSet(
        topics.map((topic) => topic.id),
        orderedTopicIds,
        'topic',
      );

      for (let index = 0; index < orderedTopicIds.length; index += 1) {
        await tx.curriculumTopic.update({
          where: { id: orderedTopicIds[index] },
          data: { sequenceOrder: index + 1, updatedById: auth.userId },
        });
      }

      await this.createAuditLogTx(tx, {
        action: 'curriculum.reorder.topics',
        entityType: 'curriculum_unit',
        entityId: unitId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        newValues: { orderedTopicIds },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async updateTopic(
    auth: AuthContext,
    topicId: string,
    payload: {
      title?: string;
      code?: string;
      description?: string;
      sequenceOrder?: number;
      weekNumber?: number;
      recommendedDurationMinutes?: number;
      difficultyLevel?: string;
      teacherNote?: string;
      lastKnownUpdatedAt: string;
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const topic = await prisma.curriculumTopic.findUnique({
      where: { id: topicId },
      include: { curriculumUnit: true },
    });
    if (!topic || topic.archivedAt) {
      throw notFound('Curriculum topic not found.');
    }

    const curriculum = await this.requireEditableCurriculum(topic.curriculumUnit.curriculumId, auth);
    this.assertNoConcurrentModification(topic.updatedAt, payload.lastKnownUpdatedAt);

    await prisma.$transaction(async (tx) => {
      const updated = await tx.curriculumTopic.update({
        where: { id: topicId },
        data: {
          title: payload.title,
          code: payload.code,
          description: payload.description,
          sequenceOrder: payload.sequenceOrder,
          weekNumber: payload.weekNumber,
          recommendedDurationMinutes: payload.recommendedDurationMinutes,
          difficultyLevel: payload.difficultyLevel,
          teacherNote: payload.teacherNote,
          updatedById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.topic.edit',
        entityType: 'curriculum_topic',
        entityId: topicId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        oldValues: { title: topic.title, sequenceOrder: topic.sequenceOrder },
        newValues: { title: updated.title, sequenceOrder: updated.sequenceOrder },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async deleteTopic(auth: AuthContext, topicId: string, requestId?: string): Promise<CurriculumAggregate> {
    const topic = await prisma.curriculumTopic.findUnique({
      where: { id: topicId },
      include: { curriculumUnit: true },
    });
    if (!topic || topic.archivedAt) {
      throw notFound('Curriculum topic not found.');
    }

    const curriculum = await this.requireEditableCurriculum(topic.curriculumUnit.curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      await tx.curriculumTopic.update({
        where: { id: topicId },
        data: {
          archivedAt: new Date(),
          isActive: false,
          updatedById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.topic.delete',
        entityType: 'curriculum_topic',
        entityId: topicId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        reason: 'Draft-only soft delete',
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async createConceptLink(
    auth: AuthContext,
    topicId: string,
    payload: {
      curriculumConceptId?: string;
      masterConceptId?: string;
      sequenceOrder?: number;
      teacherNote?: string;
      importanceLevel?: string;
      expectedDepth?: string;
      instructionalEmphasis?: string;
      isCore?: boolean;
      assessmentRelevance?: string;
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const topic = await prisma.curriculumTopic.findUnique({
      where: { id: topicId },
      include: { curriculumUnit: true },
    });
    if (!topic || topic.archivedAt) {
      throw notFound('Curriculum topic not found.');
    }

    const curriculum = await this.requireEditableCurriculum(topic.curriculumUnit.curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      const mapping = await tx.curriculumTopicConcept.create({
        data: {
          curriculumTopicId: topicId,
          curriculumConceptId: payload.curriculumConceptId,
          masterConceptId: payload.masterConceptId,
          sequenceOrder: payload.sequenceOrder,
          teacherNote: payload.teacherNote,
          importanceLevel: payload.importanceLevel,
          expectedDepth: payload.expectedDepth,
          instructionalEmphasis: payload.instructionalEmphasis,
          isCore: payload.isCore,
          assessmentRelevance: payload.assessmentRelevance,
          createdById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.topic.concept.link',
        entityType: 'curriculum_topic_concept',
        entityId: mapping.id,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        newValues: { topicId, curriculumConceptId: mapping.curriculumConceptId, masterConceptId: mapping.masterConceptId },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async updateTopicConcept(
    auth: AuthContext,
    mappingId: string,
    payload: {
      sequenceOrder?: number;
      teacherNote?: string;
      importanceLevel?: string;
      expectedDepth?: string;
      instructionalEmphasis?: string;
      isCore?: boolean;
      assessmentRelevance?: string;
      lastKnownUpdatedAt: string;
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const mapping = await prisma.curriculumTopicConcept.findUnique({
      where: { id: mappingId },
      include: {
        curriculumTopic: {
          include: { curriculumUnit: true },
        },
      },
    });

    if (!mapping) {
      throw notFound('Curriculum topic concept mapping not found.');
    }

    const curriculum = await this.requireEditableCurriculum(mapping.curriculumTopic.curriculumUnit.curriculumId, auth);
    this.assertNoConcurrentModification(mapping.updatedAt, payload.lastKnownUpdatedAt);

    await prisma.$transaction(async (tx) => {
      const updated = await tx.curriculumTopicConcept.update({
        where: { id: mappingId },
        data: {
          sequenceOrder: payload.sequenceOrder,
          teacherNote: payload.teacherNote,
          importanceLevel: payload.importanceLevel,
          expectedDepth: payload.expectedDepth,
          instructionalEmphasis: payload.instructionalEmphasis,
          isCore: payload.isCore,
          assessmentRelevance: payload.assessmentRelevance,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.topic.concept.edit',
        entityType: 'curriculum_topic_concept',
        entityId: mappingId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        oldValues: {
          sequenceOrder: mapping.sequenceOrder,
          importanceLevel: mapping.importanceLevel,
          expectedDepth: mapping.expectedDepth,
          instructionalEmphasis: mapping.instructionalEmphasis,
          isCore: mapping.isCore,
          assessmentRelevance: mapping.assessmentRelevance,
        },
        newValues: {
          sequenceOrder: updated.sequenceOrder,
          importanceLevel: updated.importanceLevel,
          expectedDepth: updated.expectedDepth,
          instructionalEmphasis: updated.instructionalEmphasis,
          isCore: updated.isCore,
          assessmentRelevance: updated.assessmentRelevance,
        },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async deleteTopicConcept(auth: AuthContext, mappingId: string, requestId?: string): Promise<CurriculumAggregate> {
    const mapping = await prisma.curriculumTopicConcept.findUnique({
      where: { id: mappingId },
      include: {
        curriculumTopic: {
          include: { curriculumUnit: true },
        },
      },
    });

    if (!mapping) {
      throw notFound('Curriculum topic concept mapping not found.');
    }

    const curriculum = await this.requireEditableCurriculum(mapping.curriculumTopic.curriculumUnit.curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      await tx.curriculumTopicConcept.delete({
        where: { id: mappingId },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.topic.concept.unlink',
        entityType: 'curriculum_topic_concept',
        entityId: mappingId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        reason: 'Draft-only mapping removal',
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async createProject(
    auth: AuthContext,
    unitId: string,
    payload: {
      title: string;
      description: string;
      sequenceOrder: number;
      objective?: string;
      expectedOutput?: string;
      estimatedDurationMinutes?: number;
      difficultyLevel?: string;
      safetyNote?: string;
      masterProjectId?: string;
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const unit = await prisma.curriculumUnit.findUnique({ where: { id: unitId } });
    if (!unit || unit.archivedAt) {
      throw notFound('Curriculum unit not found.');
    }

    const curriculum = await this.requireEditableCurriculum(unit.curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      const project = await tx.curriculumProject.create({
        data: {
          curriculumUnitId: unitId,
          title: payload.title,
          description: payload.description,
          sequenceOrder: payload.sequenceOrder,
          objective: payload.objective,
          expectedOutput: payload.expectedOutput,
          estimatedDurationMinutes: payload.estimatedDurationMinutes,
          difficultyLevel: payload.difficultyLevel,
          safetyNote: payload.safetyNote,
          masterProjectId: payload.masterProjectId,
          createdById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.project.create',
        entityType: 'curriculum_project',
        entityId: project.id,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        newValues: { unitId, sequenceOrder: project.sequenceOrder, title: project.title },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async updateProject(
    auth: AuthContext,
    projectId: string,
    payload: {
      title?: string;
      description?: string;
      sequenceOrder?: number;
      objective?: string;
      expectedOutput?: string;
      estimatedDurationMinutes?: number;
      difficultyLevel?: string;
      safetyNote?: string;
      lastKnownUpdatedAt: string;
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const project = await prisma.curriculumProject.findUnique({
      where: { id: projectId },
      include: { curriculumUnit: true },
    });
    if (!project || project.archivedAt) {
      throw notFound('Curriculum project not found.');
    }

    const curriculum = await this.requireEditableCurriculum(project.curriculumUnit.curriculumId, auth);
    this.assertNoConcurrentModification(project.updatedAt, payload.lastKnownUpdatedAt);

    await prisma.$transaction(async (tx) => {
      const updated = await tx.curriculumProject.update({
        where: { id: projectId },
        data: {
          title: payload.title,
          description: payload.description,
          sequenceOrder: payload.sequenceOrder,
          objective: payload.objective,
          expectedOutput: payload.expectedOutput,
          estimatedDurationMinutes: payload.estimatedDurationMinutes,
          difficultyLevel: payload.difficultyLevel,
          safetyNote: payload.safetyNote,
          updatedById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.project.edit',
        entityType: 'curriculum_project',
        entityId: projectId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        oldValues: { title: project.title, sequenceOrder: project.sequenceOrder },
        newValues: { title: updated.title, sequenceOrder: updated.sequenceOrder },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async deleteProject(auth: AuthContext, projectId: string, requestId?: string): Promise<CurriculumAggregate> {
    const project = await prisma.curriculumProject.findUnique({
      where: { id: projectId },
      include: { curriculumUnit: true },
    });
    if (!project || project.archivedAt) {
      throw notFound('Curriculum project not found.');
    }

    const curriculum = await this.requireEditableCurriculum(project.curriculumUnit.curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      await tx.curriculumProject.update({
        where: { id: projectId },
        data: {
          archivedAt: new Date(),
          isActive: false,
          updatedById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.project.delete',
        entityType: 'curriculum_project',
        entityId: projectId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        reason: 'Draft-only soft delete',
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async linkProjectTopic(
    auth: AuthContext,
    projectId: string,
    topicId: string,
    sequenceOrder?: number,
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const project = await prisma.curriculumProject.findUnique({ where: { id: projectId }, include: { curriculumUnit: true } });
    if (!project || project.archivedAt) {
      throw notFound('Curriculum project not found.');
    }

    const topic = await prisma.curriculumTopic.findUnique({
      where: { id: topicId },
      include: { curriculumUnit: true },
    });
    if (!topic || topic.archivedAt) {
      throw notFound('Curriculum topic not found.');
    }

    if (project.curriculumUnit.curriculumId !== topic.curriculumUnit.curriculumId) {
      throw tenantScopeViolation('Topic and project must belong to the same curriculum.');
    }

    const curriculum = await this.requireEditableCurriculum(project.curriculumUnit.curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      const link = await tx.curriculumTopicProject.create({
        data: {
          curriculumProjectId: projectId,
          curriculumTopicId: topicId,
          sequenceOrder,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.project.topic.link',
        entityType: 'curriculum_topic_project',
        entityId: link.id,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        newValues: { projectId, topicId },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async deleteTopicProjectLink(auth: AuthContext, linkId: string, requestId?: string): Promise<CurriculumAggregate> {
    const link = await prisma.curriculumTopicProject.findUnique({
      where: { id: linkId },
      include: {
        curriculumProject: {
          include: { curriculumUnit: true },
        },
      },
    });

    if (!link) {
      throw notFound('Project-topic link not found.');
    }

    const curriculum = await this.requireEditableCurriculum(link.curriculumProject.curriculumUnit.curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      await tx.curriculumTopicProject.delete({ where: { id: linkId } });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.project.topic.unlink',
        entityType: 'curriculum_topic_project',
        entityId: linkId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        reason: 'Draft-only mapping removal',
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async createProjectImplementation(
    auth: AuthContext,
    projectId: string,
    payload: {
      title: string;
      implementationType: Prisma.EnumMasterProjectImplementationTypeFieldUpdateOperationsInput['set'] | string;
      description?: string;
      sequenceOrder: number;
      requiredInternet?: boolean;
      requiredDeviceCount?: number;
      estimatedDurationMinutes?: number;
      learnerInstructions?: string;
      teacherInstructions?: string;
      safetyInstructions?: string;
      masterProjectImplementationId?: string;
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const project = await prisma.curriculumProject.findUnique({
      where: { id: projectId },
      include: { curriculumUnit: true },
    });

    if (!project || project.archivedAt) {
      throw notFound('Curriculum project not found.');
    }

    const curriculum = await this.requireEditableCurriculum(project.curriculumUnit.curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      const implementation = await tx.curriculumProjectImplementation.create({
        data: {
          curriculumProjectId: projectId,
          title: payload.title,
          implementationType: payload.implementationType as never,
          description: payload.description ?? '',
          sequenceOrder: payload.sequenceOrder,
          requiredInternet: payload.requiredInternet,
          requiredDeviceCount: payload.requiredDeviceCount,
          estimatedDurationMinutes: payload.estimatedDurationMinutes,
          learnerInstructions: payload.learnerInstructions,
          teacherInstructions: payload.teacherInstructions,
          safetyInstructions: payload.safetyInstructions,
          masterProjectImplementationId: payload.masterProjectImplementationId,
          createdById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.project.implementation.create',
        entityType: 'curriculum_project_implementation',
        entityId: implementation.id,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        newValues: {
          projectId,
          sequenceOrder: implementation.sequenceOrder,
          title: implementation.title,
          implementationType: implementation.implementationType,
        },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async updateProjectImplementation(
    auth: AuthContext,
    implementationId: string,
    payload: {
      title?: string;
      implementationType?: Prisma.EnumMasterProjectImplementationTypeFieldUpdateOperationsInput['set'] | string;
      description?: string;
      sequenceOrder?: number;
      requiredInternet?: boolean;
      requiredDeviceCount?: number;
      estimatedDurationMinutes?: number;
      learnerInstructions?: string;
      teacherInstructions?: string;
      safetyInstructions?: string;
      lastKnownUpdatedAt: string;
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const implementation = await prisma.curriculumProjectImplementation.findUnique({
      where: { id: implementationId },
      include: {
        curriculumProject: {
          include: { curriculumUnit: true },
        },
      },
    });

    if (!implementation || !implementation.isActive) {
      throw notFound('Curriculum project implementation not found.');
    }

    const curriculum = await this.requireEditableCurriculum(implementation.curriculumProject.curriculumUnit.curriculumId, auth);
    this.assertNoConcurrentModification(implementation.updatedAt, payload.lastKnownUpdatedAt);

    await prisma.$transaction(async (tx) => {
      const updated = await tx.curriculumProjectImplementation.update({
        where: { id: implementationId },
        data: {
          title: payload.title,
          implementationType: payload.implementationType as never,
          description: payload.description,
          sequenceOrder: payload.sequenceOrder,
          requiredInternet: payload.requiredInternet,
          requiredDeviceCount: payload.requiredDeviceCount,
          estimatedDurationMinutes: payload.estimatedDurationMinutes,
          learnerInstructions: payload.learnerInstructions,
          teacherInstructions: payload.teacherInstructions,
          safetyInstructions: payload.safetyInstructions,
          updatedById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.project.implementation.edit',
        entityType: 'curriculum_project_implementation',
        entityId: implementationId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        oldValues: {
          title: implementation.title,
          sequenceOrder: implementation.sequenceOrder,
          implementationType: implementation.implementationType,
        },
        newValues: {
          title: updated.title,
          sequenceOrder: updated.sequenceOrder,
          implementationType: updated.implementationType,
        },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async deleteProjectImplementation(
    auth: AuthContext,
    implementationId: string,
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const implementation = await prisma.curriculumProjectImplementation.findUnique({
      where: { id: implementationId },
      include: {
        curriculumProject: {
          include: { curriculumUnit: true },
        },
      },
    });

    if (!implementation || !implementation.isActive) {
      throw notFound('Curriculum project implementation not found.');
    }

    const curriculum = await this.requireEditableCurriculum(implementation.curriculumProject.curriculumUnit.curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      await tx.curriculumProjectImplementation.update({
        where: { id: implementationId },
        data: {
          isActive: false,
          updatedById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.project.implementation.delete',
        entityType: 'curriculum_project_implementation',
        entityId: implementationId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        reason: 'Draft-only soft delete',
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async createLearningOutcome(
    auth: AuthContext,
    curriculumId: string,
    payload: {
      statement: string;
      code?: string;
      bloomLevel?: string;
      measurableVerb?: string;
      masterLearningOutcomeId?: string;
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const curriculum = await this.requireEditableCurriculum(curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      const outcome = await tx.curriculumLearningOutcome.create({
        data: {
          curriculumId,
          statement: payload.statement,
          code: payload.code,
          bloomLevel: payload.bloomLevel,
          measurableVerb: payload.measurableVerb,
          masterLearningOutcomeId: payload.masterLearningOutcomeId,
          createdById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.learning_outcome.create',
        entityType: 'curriculum_learning_outcome',
        entityId: outcome.id,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        newValues: { curriculumId, statement: outcome.statement },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async mapLearningOutcomeToTopic(
    auth: AuthContext,
    topicId: string,
    outcomeId: string,
    sequenceOrder?: number,
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const topic = await prisma.curriculumTopic.findUnique({ where: { id: topicId }, include: { curriculumUnit: true } });
    if (!topic || topic.archivedAt) {
      throw notFound('Curriculum topic not found.');
    }

    const outcome = await prisma.curriculumLearningOutcome.findUnique({ where: { id: outcomeId } });
    if (!outcome || outcome.archivedAt) {
      throw notFound('Curriculum learning outcome not found.');
    }

    if (topic.curriculumUnit.curriculumId !== outcome.curriculumId) {
      throw tenantScopeViolation('Learning outcome and topic must belong to the same curriculum.');
    }

    const curriculum = await this.requireEditableCurriculum(outcome.curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      const link = await tx.curriculumTopicLearningOutcome.create({
        data: {
          curriculumTopicId: topicId,
          curriculumLearningOutcomeId: outcomeId,
          sequenceOrder,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.learning_outcome.topic.link',
        entityType: 'curriculum_topic_learning_outcome',
        entityId: link.id,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        newValues: { topicId, outcomeId },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async deleteTopicLearningOutcomeLink(
    auth: AuthContext,
    linkId: string,
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const link = await prisma.curriculumTopicLearningOutcome.findUnique({
      where: { id: linkId },
      include: {
        curriculumTopic: {
          include: { curriculumUnit: true },
        },
      },
    });

    if (!link) {
      throw notFound('Topic-learning outcome link not found.');
    }

    const curriculum = await this.requireEditableCurriculum(link.curriculumTopic.curriculumUnit.curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      await tx.curriculumTopicLearningOutcome.delete({ where: { id: linkId } });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.learning_outcome.topic.unlink',
        entityType: 'curriculum_topic_learning_outcome',
        entityId: linkId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        reason: 'Draft-only mapping removal',
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async mapLearningOutcomeToProject(
    auth: AuthContext,
    projectId: string,
    outcomeId: string,
    sequenceOrder?: number,
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const project = await prisma.curriculumProject.findUnique({ where: { id: projectId }, include: { curriculumUnit: true } });
    if (!project || project.archivedAt) {
      throw notFound('Curriculum project not found.');
    }

    const outcome = await prisma.curriculumLearningOutcome.findUnique({ where: { id: outcomeId } });
    if (!outcome || outcome.archivedAt) {
      throw notFound('Curriculum learning outcome not found.');
    }

    if (project.curriculumUnit.curriculumId !== outcome.curriculumId) {
      throw tenantScopeViolation('Learning outcome and project must belong to the same curriculum.');
    }

    const curriculum = await this.requireEditableCurriculum(outcome.curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      const link = await tx.curriculumProjectLearningOutcome.create({
        data: {
          curriculumProjectId: projectId,
          curriculumLearningOutcomeId: outcomeId,
          sequenceOrder,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.learning_outcome.project.link',
        entityType: 'curriculum_project_learning_outcome',
        entityId: link.id,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        newValues: { projectId, outcomeId },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async deleteProjectLearningOutcomeLink(
    auth: AuthContext,
    linkId: string,
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const link = await prisma.curriculumProjectLearningOutcome.findUnique({
      where: { id: linkId },
      include: {
        curriculumProject: {
          include: { curriculumUnit: true },
        },
      },
    });

    if (!link) {
      throw notFound('Project-learning outcome link not found.');
    }

    const curriculum = await this.requireEditableCurriculum(link.curriculumProject.curriculumUnit.curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      await tx.curriculumProjectLearningOutcome.delete({ where: { id: linkId } });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.learning_outcome.project.unlink',
        entityType: 'curriculum_project_learning_outcome',
        entityId: linkId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        reason: 'Draft-only mapping removal',
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async updateLearningOutcome(
    auth: AuthContext,
    outcomeId: string,
    payload: {
      statement?: string;
      code?: string;
      bloomLevel?: string;
      measurableVerb?: string;
      lastKnownUpdatedAt: string;
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const outcome = await prisma.curriculumLearningOutcome.findUnique({ where: { id: outcomeId } });
    if (!outcome || outcome.archivedAt) {
      throw notFound('Curriculum learning outcome not found.');
    }

    const curriculum = await this.requireEditableCurriculum(outcome.curriculumId, auth);
    this.assertNoConcurrentModification(outcome.updatedAt, payload.lastKnownUpdatedAt);

    await prisma.$transaction(async (tx) => {
      const updated = await tx.curriculumLearningOutcome.update({
        where: { id: outcomeId },
        data: {
          statement: payload.statement,
          code: payload.code,
          bloomLevel: payload.bloomLevel,
          measurableVerb: payload.measurableVerb,
          updatedById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.learning_outcome.edit',
        entityType: 'curriculum_learning_outcome',
        entityId: outcomeId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        oldValues: { statement: outcome.statement },
        newValues: { statement: updated.statement },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async createResource(
    auth: AuthContext,
    curriculumId: string,
    payload: {
      curriculumTopicId: string;
      title: string;
      description?: string;
      resourceType: Prisma.EnumMasterResourceTypeFieldUpdateOperationsInput['set'] | string;
      quantityRequired?: string;
      requiresInternet?: boolean;
      requiresLogin?: boolean;
      safetyNote?: string;
      externalUrl?: string;
      internalFileReference?: string;
      masterResourceId?: string;
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const curriculum = await this.requireEditableCurriculum(curriculumId, auth);

    const topic = await prisma.curriculumTopic.findFirst({
      where: {
        id: payload.curriculumTopicId,
        curriculumUnit: { curriculumId },
        archivedAt: null,
      },
    });

    if (!topic) {
      throw tenantScopeViolation('Resource topic does not belong to the selected curriculum.');
    }

    await prisma.$transaction(async (tx) => {
      const resource = await tx.curriculumResource.create({
        data: {
          curriculumId,
          curriculumTopicId: payload.curriculumTopicId,
          title: payload.title,
          description: payload.description,
          resourceType: payload.resourceType as never,
          quantityRequired: payload.quantityRequired,
          requiresInternet: payload.requiresInternet,
          requiresLogin: payload.requiresLogin,
          safetyNote: payload.safetyNote,
          externalUrl: payload.externalUrl,
          internalFileReference: payload.internalFileReference,
          masterResourceId: payload.masterResourceId,
          createdById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.resource.create',
        entityType: 'curriculum_resource',
        entityId: resource.id,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        newValues: {
          curriculumId,
          curriculumTopicId: payload.curriculumTopicId,
          title: resource.title,
          resourceType: resource.resourceType,
        },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async updateResource(
    auth: AuthContext,
    resourceId: string,
    payload: {
      title?: string;
      description?: string;
      quantityRequired?: string;
      requiresInternet?: boolean;
      requiresLogin?: boolean;
      safetyNote?: string;
      externalUrl?: string;
      internalFileReference?: string;
      lastKnownUpdatedAt: string;
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const resource = await prisma.curriculumResource.findUnique({ where: { id: resourceId } });
    if (!resource || resource.archivedAt) {
      throw notFound('Curriculum resource not found.');
    }

    const curriculum = await this.requireEditableCurriculum(resource.curriculumId, auth);
    this.assertNoConcurrentModification(resource.updatedAt, payload.lastKnownUpdatedAt);

    await prisma.$transaction(async (tx) => {
      const updated = await tx.curriculumResource.update({
        where: { id: resourceId },
        data: {
          title: payload.title,
          description: payload.description,
          quantityRequired: payload.quantityRequired,
          requiresInternet: payload.requiresInternet,
          requiresLogin: payload.requiresLogin,
          safetyNote: payload.safetyNote,
          externalUrl: payload.externalUrl,
          internalFileReference: payload.internalFileReference,
          updatedById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.resource.edit',
        entityType: 'curriculum_resource',
        entityId: resourceId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        oldValues: { title: resource.title },
        newValues: { title: updated.title },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async deleteResource(auth: AuthContext, resourceId: string, requestId?: string): Promise<CurriculumAggregate> {
    const resource = await prisma.curriculumResource.findUnique({ where: { id: resourceId } });
    if (!resource || resource.archivedAt) {
      throw notFound('Curriculum resource not found.');
    }

    const curriculum = await this.requireEditableCurriculum(resource.curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      await tx.curriculumResource.update({
        where: { id: resourceId },
        data: {
          archivedAt: new Date(),
          isActive: false,
          updatedById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.resource.delete',
        entityType: 'curriculum_resource',
        entityId: resourceId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        reason: 'Draft-only soft delete',
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  async getVisibility(auth: AuthContext, curriculumId: string) {
    const curriculum = await this.requireCurriculumInScope(curriculumId, auth);
    return curriculum.visibilitySetting;
  }

  async updateVisibility(
    auth: AuthContext,
    curriculumId: string,
    payload: Prisma.CurriculumVisibilitySettingUncheckedUpdateInput,
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const curriculum = await this.requireEditableCurriculum(curriculumId, auth);

    await prisma.$transaction(async (tx) => {
      const current = await tx.curriculumVisibilitySetting.findUnique({ where: { curriculumId } });
      if (!current) {
        throw notFound('Visibility settings not found for curriculum.');
      }

      const updated = await tx.curriculumVisibilitySetting.update({
        where: { curriculumId },
        data: payload,
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.visibility.update',
        entityType: 'curriculum_visibility_setting',
        entityId: updated.id,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        oldValues: current as unknown as Prisma.InputJsonValue,
        newValues: updated as unknown as Prisma.InputJsonValue,
        requestId,
      });
    });

    return this.reloadCurriculum(curriculumId);
  }

  async listVersions(auth: AuthContext, curriculumId: string) {
    const curriculum = await this.requireCurriculumInScope(curriculumId, auth);
    return curriculum.versions;
  }

  async getVersion(auth: AuthContext, curriculumId: string, versionId: string) {
    const curriculum = await this.requireCurriculumInScope(curriculumId, auth);
    const version = curriculum.versions.find((item) => item.id === versionId);
    if (!version) {
      throw notFound('Curriculum version not found.');
    }
    return version;
  }

  async createVersion(
    auth: AuthContext,
    curriculumId: string,
    payload: {
      basedOnVersionId?: string;
      changeSummary?: string;
      majorVersion?: number;
      minorVersion?: number;
      patchVersion?: number;
      versionLabel?: string;
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const curriculum = await this.requireCurriculumInScope(curriculumId, auth);

    if (!(curriculum.status === 'PUBLISHED' || curriculum.status === 'APPROVED')) {
      throw lifecycleConflict('A new version can only be created from approved or published curriculum state.');
    }

    const latestVersion = curriculum.versions[0];
    const latestNumbers = latestVersion
      ? parseVersionNumber(latestVersion.versionNumber)
      : { majorVersion: 1, minorVersion: 0, patchVersion: 0 };

    const numbers: VersionNumbers = {
      majorVersion: payload.majorVersion ?? latestNumbers.majorVersion,
      minorVersion: payload.minorVersion ?? latestNumbers.minorVersion + 1,
      patchVersion: payload.patchVersion ?? 0,
    };

    const versionNumber = makeVersionNumber(numbers);

    const snapshot = this.buildSnapshot(curriculum);

    await prisma.$transaction(async (tx) => {
      await tx.curriculumVersion.updateMany({
        where: { curriculumId, isCurrent: true },
        data: { isCurrent: false },
      });

      const created = await tx.curriculumVersion.create({
        data: {
          curriculumId,
          basedOnVersionId: payload.basedOnVersionId ?? latestVersion?.id,
          versionNumber,
          majorVersion: numbers.majorVersion,
          minorVersion: numbers.minorVersion,
          patchVersion: numbers.patchVersion,
          versionLabel: payload.versionLabel ?? `v${versionNumber}-draft`,
          status: 'DRAFT',
          changeSummary: payload.changeSummary,
          snapshotData: snapshot,
          snapshotChecksum: checksumSnapshot(snapshot),
          createdById: auth.userId,
          isCurrent: true,
          isPublished: false,
        },
      });

      await tx.curriculum.update({
        where: { id: curriculumId },
        data: {
          status: 'DRAFT',
          currentVersionId: created.id,
          currentVersionNumber: created.versionNumber,
          approvedAt: null,
          approvedById: null,
          submittedAt: null,
          submittedById: null,
          publishedAt: null,
          publishedById: null,
          publicationChecksum: null,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.version.create',
        entityType: 'curriculum_version',
        entityId: created.id,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        newValues: {
          curriculumId,
          versionNumber: created.versionNumber,
          basedOnVersionId: created.basedOnVersionId,
        },
        reason: payload.changeSummary,
        requestId,
      });
    });

    return this.reloadCurriculum(curriculumId);
  }

  async getSnapshot(auth: AuthContext, curriculumId: string, versionId: string) {
    const version = await this.getVersion(auth, curriculumId, versionId);
    return {
      versionId: version.id,
      versionNumber: version.versionNumber,
      snapshotData: version.snapshotData,
      snapshotChecksum: version.snapshotChecksum,
    };
  }

  async compareVersions(auth: AuthContext, curriculumId: string, leftVersionId: string, rightVersionId: string) {
    const left = await this.getVersion(auth, curriculumId, leftVersionId);
    const right = await this.getVersion(auth, curriculumId, rightVersionId);

    const leftSerialized = serializeStableSnapshot(left.snapshotData);
    const rightSerialized = serializeStableSnapshot(right.snapshotData);

    return {
      left: {
        id: left.id,
        versionNumber: left.versionNumber,
        status: left.status,
        checksum: left.snapshotChecksum,
        snapshotData: left.snapshotData,
      },
      right: {
        id: right.id,
        versionNumber: right.versionNumber,
        status: right.status,
        checksum: right.snapshotChecksum,
        snapshotData: right.snapshotData,
      },
      metadata: {
        checksumMatch: left.snapshotChecksum && right.snapshotChecksum
          ? left.snapshotChecksum === right.snapshotChecksum
          : false,
        serializedLengthDelta: leftSerialized.length - rightSerialized.length,
      },
    };
  }

  async submitReview(
    auth: AuthContext,
    curriculumId: string,
    comment: string | undefined,
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const curriculum = await this.requireCurriculumInScope(curriculumId, auth);
    if (!isEditableCurriculumStatus(curriculum.status)) {
      throw lifecycleConflict('Only draft or revision-required curriculum can be submitted for review.');
    }

    this.assertCurriculumHasRequiredContent(curriculum);

    return this.transitionCurriculumStatus({
      auth,
      curriculum,
      toStatus: 'UNDER_REVIEW',
      decision: 'SUBMITTED',
      comment,
      requestedChanges: undefined,
      requestId,
      action: 'curriculum.submit_review',
      reason: comment,
    });
  }

  async requestRevision(
    auth: AuthContext,
    curriculumId: string,
    payload: { requestedChanges: string; comment?: string },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const curriculum = await this.requireCurriculumInScope(curriculumId, auth);
    if (curriculum.status !== 'UNDER_REVIEW') {
      throw lifecycleConflict('Revision request requires UNDER_REVIEW status.');
    }

    return this.transitionCurriculumStatus({
      auth,
      curriculum,
      toStatus: 'REVISION_REQUIRED',
      decision: 'REVISION_REQUESTED',
      comment: payload.comment,
      requestedChanges: payload.requestedChanges,
      requestId,
      action: 'curriculum.request_revision',
      reason: payload.requestedChanges,
    });
  }

  async withdrawReview(
    auth: AuthContext,
    curriculumId: string,
    reason: string,
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const curriculum = await this.requireCurriculumInScope(curriculumId, auth);
    if (curriculum.status !== 'UNDER_REVIEW') {
      throw lifecycleConflict('Only under-review curriculum can be withdrawn to draft.');
    }

    return this.transitionCurriculumStatus({
      auth,
      curriculum,
      toStatus: 'DRAFT',
      decision: 'WITHDRAWN',
      comment: reason,
      requestedChanges: undefined,
      requestId,
      action: 'curriculum.withdraw_review',
      reason,
    });
  }

  async approve(
    auth: AuthContext,
    curriculumId: string,
    comment?: string,
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const curriculum = await this.requireCurriculumInScope(curriculumId, auth);
    if (curriculum.status !== 'UNDER_REVIEW') {
      throw lifecycleConflict('Only under-review curriculum can be approved.');
    }

    return this.transitionCurriculumStatus({
      auth,
      curriculum,
      toStatus: 'APPROVED',
      decision: 'APPROVED',
      comment,
      requestedChanges: undefined,
      requestId,
      action: 'curriculum.approve',
      reason: comment,
    });
  }

  async publish(
    auth: AuthContext,
    curriculumId: string,
    payload: { versionId?: string; comment?: string },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const curriculum = await this.requireCurriculumInScope(curriculumId, auth);
    if (curriculum.status !== 'APPROVED') {
      throw lifecycleConflict('Only approved curriculum can be published.');
    }

    const targetVersion = payload.versionId
      ? curriculum.versions.find((item) => item.id === payload.versionId)
      : curriculum.versions.find((item) => item.isCurrent);

    if (!targetVersion) {
      throw publicationRequirementFailure('A valid curriculum version is required for publication.');
    }

    const snapshot = this.buildSnapshot(curriculum);
    const checksum = checksumSnapshot(snapshot);

    await prisma.$transaction(async (tx) => {
      const now = new Date();

      await tx.curriculumVersion.updateMany({
        where: { curriculumId },
        data: {
          isPublished: false,
        },
      });

      await tx.curriculumVersion.update({
        where: { id: targetVersion.id },
        data: {
          status: 'PUBLISHED',
          snapshotData: snapshot,
          snapshotChecksum: checksum,
          approvedById: curriculum.approvedById ?? auth.userId,
          approvedAt: curriculum.approvedAt ?? now,
          publishedById: auth.userId,
          publishedAt: now,
          isCurrent: true,
          isPublished: true,
        },
      });

      await tx.curriculum.update({
        where: { id: curriculumId },
        data: {
          status: 'PUBLISHED',
          currentVersionId: targetVersion.id,
          currentVersionNumber: targetVersion.versionNumber,
          publishedById: auth.userId,
          publishedAt: now,
          publicationChecksum: checksum,
          isActive: true,
        },
      });

      await tx.curriculumReviewAction.create({
        data: {
          curriculumId,
          curriculumVersionId: targetVersion.id,
          decision: 'APPROVED',
          comment: payload.comment,
          previousStatus: 'APPROVED',
          resultingStatus: 'PUBLISHED',
          actorUserId: auth.userId,
        },
      });

      await tx.curriculumStatusHistory.create({
        data: {
          curriculumId,
          curriculumVersionId: targetVersion.id,
          previousStatus: 'APPROVED',
          newStatus: 'PUBLISHED',
          reason: payload.comment,
          changedById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.publish',
        entityType: 'curriculum',
        entityId: curriculumId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        newValues: {
          publishedVersionId: targetVersion.id,
          publishedVersionNumber: targetVersion.versionNumber,
          checksum,
        },
        reason: payload.comment,
        requestId,
      });
    });

    return this.reloadCurriculum(curriculumId);
  }

  async archive(
    auth: AuthContext,
    curriculumId: string,
    reason: string,
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const curriculum = await this.requireCurriculumInScope(curriculumId, auth);

    if (!canTransitionCurriculumStatus(curriculum.status, 'ARCHIVED')) {
      throw lifecycleConflict(`Curriculum in status ${curriculum.status} cannot be archived.`);
    }

    const hasActiveAssignment = curriculum.assignments.some(
      (assignment) => assignment.archivedAt === null && (assignment.status === 'ACTIVE' || assignment.status === 'PLANNED'),
    );

    if (curriculum.status === 'APPROVED' && hasActiveAssignment) {
      throw lifecycleConflict('Approved curriculum with active or planned assignments cannot be archived.');
    }

    return this.transitionCurriculumStatus({
      auth,
      curriculum,
      toStatus: 'ARCHIVED',
      decision: 'COMMENTED',
      comment: reason,
      requestedChanges: undefined,
      requestId,
      action: 'curriculum.archive',
      reason,
    });
  }

  async createAssignment(
    auth: AuthContext,
    curriculumId: string,
    payload: {
      curriculumVersionId: string;
      academicSessionId: string;
      termId: string;
      academicClassId: string;
      schoolProgrammeComponentId: string;
      teacherUserId?: string;
      effectiveFrom: string;
      effectiveTo?: string;
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const curriculum = await this.requireCurriculumInScope(curriculumId, auth);

    const schoolId = curriculum.schoolId;
    if (curriculum.status !== 'PUBLISHED' || !curriculum.isActive) {
      throw lifecycleConflict('Only active published curriculum can be assigned.');
    }

    const version = curriculum.versions.find((item) => item.id === payload.curriculumVersionId);
    if (!version || !version.isPublished || version.status !== 'PUBLISHED') {
      throw publicationRequirementFailure('Assignments require a published curriculum version belonging to the curriculum.');
    }

    const [session, term, academicClass, schoolComponent] = await Promise.all([
      curriculumRepository.findSession(payload.academicSessionId, schoolId),
      curriculumRepository.findTerm(payload.termId, schoolId),
      curriculumRepository.findAcademicClass(payload.academicClassId, schoolId),
      curriculumRepository.findSchoolProgrammeComponent(payload.schoolProgrammeComponentId, schoolId),
    ]);

    if (!session || !term || !academicClass || !schoolComponent) {
      throw tenantScopeViolation('Assignment scope entities must belong to the curriculum school.');
    }

    if (term.academicSessionId !== session.id) {
      throw tenantScopeViolation('Term must belong to the selected academic session.');
    }

    if (schoolComponent.id !== curriculum.schoolProgrammeComponentId) {
      throw tenantScopeViolation('Assignment programme component must match curriculum programme component.');
    }

    if (payload.teacherUserId) {
      const teacher = await curriculumRepository.findUserInSchool(payload.teacherUserId, schoolId);
      if (!teacher) {
        throw tenantScopeViolation('Assigned teacher must belong to the curriculum school.');
      }
    }

    const effectiveFrom = toDate(payload.effectiveFrom);
    const effectiveTo = payload.effectiveTo ? toDate(payload.effectiveTo) : null;
    if (effectiveTo && effectiveTo < effectiveFrom) {
      throw badRequest('effectiveTo cannot be before effectiveFrom.');
    }

    await prisma.$transaction(async (tx) => {
      const duplicate = await tx.curriculumAssignment.findFirst({
        where: {
          schoolId,
          academicSessionId: payload.academicSessionId,
          termId: payload.termId,
          academicClassId: payload.academicClassId,
          schoolProgrammeComponentId: payload.schoolProgrammeComponentId,
          archivedAt: null,
          status: { in: ['PLANNED', 'ACTIVE'] },
        },
      });

      if (duplicate) {
        throw duplicateAssignment('An active or planned assignment already exists for this scope.');
      }

      const assignment = await tx.curriculumAssignment.create({
        data: {
          schoolId,
          curriculumId,
          curriculumVersionId: payload.curriculumVersionId,
          academicSessionId: payload.academicSessionId,
          termId: payload.termId,
          academicClassId: payload.academicClassId,
          schoolProgrammeComponentId: payload.schoolProgrammeComponentId,
          teacherUserId: payload.teacherUserId,
          status: 'PLANNED',
          effectiveFrom,
          effectiveTo,
          assignedById: auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.assign',
        entityType: 'curriculum_assignment',
        entityId: assignment.id,
        schoolId,
        actorUserId: auth.userId,
        newValues: {
          curriculumId,
          curriculumVersionId: payload.curriculumVersionId,
          academicSessionId: payload.academicSessionId,
          termId: payload.termId,
          academicClassId: payload.academicClassId,
          schoolProgrammeComponentId: payload.schoolProgrammeComponentId,
        },
        requestId,
      });
    });

    return this.reloadCurriculum(curriculumId);
  }

  async listAssignments(auth: AuthContext, curriculumId: string): Promise<CurriculumAssignment[]> {
    const curriculum = await this.requireCurriculumInScope(curriculumId, auth);
    return curriculum.assignments;
  }

  async updateAssignment(
    auth: AuthContext,
    assignmentId: string,
    payload: {
      teacherUserId?: string | null;
      effectiveFrom?: string;
      effectiveTo?: string | null;
      status?: CurriculumAssignmentStatus;
      reason?: string;
    },
    requestId?: string,
  ): Promise<CurriculumAggregate> {
    const assignment = await prisma.curriculumAssignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) {
      throw notFound('Curriculum assignment not found.');
    }

    const curriculum = await this.requireCurriculumInScope(assignment.curriculumId, auth);

    if (payload.teacherUserId) {
      const teacher = await curriculumRepository.findUserInSchool(payload.teacherUserId, curriculum.schoolId);
      if (!teacher) {
        throw tenantScopeViolation('Assigned teacher must belong to curriculum school.');
      }
    }

    const effectiveFrom = payload.effectiveFrom ? toDate(payload.effectiveFrom) : undefined;
    const effectiveTo = payload.effectiveTo ? toDate(payload.effectiveTo) : payload.effectiveTo === null ? null : undefined;

    if (effectiveFrom && effectiveTo && effectiveTo < effectiveFrom) {
      throw badRequest('effectiveTo cannot be before effectiveFrom.');
    }

    await prisma.$transaction(async (tx) => {
      const updated = await tx.curriculumAssignment.update({
        where: { id: assignmentId },
        data: {
          teacherUserId: payload.teacherUserId,
          effectiveFrom,
          effectiveTo,
          status: payload.status,
          ...(payload.status === 'ACTIVE'
            ? { activatedById: auth.userId, activatedAt: new Date() }
            : {}),
          ...(payload.status === 'COMPLETED' ? { completedAt: new Date() } : {}),
          ...(payload.status === 'ARCHIVED' ? { archivedAt: new Date() } : {}),
        },
      });

      await this.createAuditLogTx(tx, {
        action: 'curriculum.assignment.update',
        entityType: 'curriculum_assignment',
        entityId: assignmentId,
        schoolId: curriculum.schoolId,
        actorUserId: auth.userId,
        oldValues: {
          status: assignment.status,
          teacherUserId: assignment.teacherUserId,
        },
        newValues: {
          status: updated.status,
          teacherUserId: updated.teacherUserId,
        },
        reason: payload.reason,
        requestId,
      });
    });

    return this.reloadCurriculum(curriculum.id);
  }

  private async requireCurriculumInScope(curriculumId: string, auth: AuthContext): Promise<CurriculumAggregate> {
    const curriculum = await curriculumRepository.findCurriculumById(curriculumId);
    if (!curriculum) {
      throw notFound('Curriculum not found.');
    }

    if (!auth.schoolId || curriculum.schoolId !== auth.schoolId) {
      throw tenantScopeViolation('Curriculum does not belong to authenticated school scope.');
    }

    return curriculum;
  }

  private async requireEditableCurriculum(curriculumId: string, auth: AuthContext): Promise<CurriculumAggregate> {
    const curriculum = await this.requireCurriculumInScope(curriculumId, auth);
    if (!isEditableCurriculumStatus(curriculum.status)) {
      throw lifecycleConflict('Curriculum is not editable in current lifecycle state.');
    }

    return curriculum;
  }

  private assertNoConcurrentModification(actualUpdatedAt: Date, lastKnownUpdatedAt: string): void {
    const known = new Date(lastKnownUpdatedAt);
    if (Number.isNaN(known.getTime())) {
      throw badRequest('Invalid lastKnownUpdatedAt value.');
    }

    if (actualUpdatedAt.getTime() !== known.getTime()) {
      throw versionConflict('Curriculum draft has changed since last read. Refresh and retry.');
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

  private assertCurriculumHasRequiredContent(curriculum: CurriculumAggregate): void {
    if (curriculum.units.length === 0) {
      throw publicationRequirementFailure('Curriculum must contain at least one unit before review submission.');
    }

    const hasTopic = curriculum.units.some((unit) => unit.topics.length > 0);
    if (!hasTopic) {
      throw publicationRequirementFailure('Curriculum must contain at least one topic before review submission.');
    }
  }

  private async transitionCurriculumStatus(input: {
    auth: AuthContext;
    curriculum: Curriculum;
    toStatus: CurriculumStatus;
    decision: CurriculumReviewDecision;
    comment?: string;
    requestedChanges?: string;
    requestId?: string;
    action: string;
    reason?: string;
  }): Promise<CurriculumAggregate> {
    if (!canTransitionCurriculumStatus(input.curriculum.status, input.toStatus)) {
      throw lifecycleConflict(`Invalid status transition from ${input.curriculum.status} to ${input.toStatus}.`);
    }

    await prisma.$transaction(async (tx) => {
      const now = new Date();

      const statusPatch: Prisma.CurriculumUpdateInput = {
        status: input.toStatus,
      };

      if (input.toStatus === 'UNDER_REVIEW') {
        statusPatch.submittedAt = now;
      }

      if (input.toStatus === 'APPROVED') {
        statusPatch.approvedAt = now;
      }

      if (input.toStatus === 'ARCHIVED') {
        statusPatch.archivedAt = now;
        statusPatch.archiveReason = input.reason;
        statusPatch.isActive = false;
      }

      await tx.curriculum.update({
        where: { id: input.curriculum.id },
        data: statusPatch,
      });

      await tx.curriculumReviewAction.create({
        data: {
          curriculumId: input.curriculum.id,
          curriculumVersionId: input.curriculum.currentVersionId,
          decision: input.decision,
          comment: input.comment,
          requestedChanges: input.requestedChanges,
          previousStatus: input.curriculum.status,
          resultingStatus: input.toStatus,
          actorUserId: input.auth.userId,
        },
      });

      await tx.curriculumStatusHistory.create({
        data: {
          curriculumId: input.curriculum.id,
          curriculumVersionId: input.curriculum.currentVersionId,
          previousStatus: input.curriculum.status,
          newStatus: input.toStatus,
          reason: input.reason,
          changedById: input.auth.userId,
        },
      });

      await this.createAuditLogTx(tx, {
        action: input.action,
        entityType: 'curriculum',
        entityId: input.curriculum.id,
        schoolId: input.curriculum.schoolId,
        actorUserId: input.auth.userId,
        oldValues: { status: input.curriculum.status },
        newValues: { status: input.toStatus },
        reason: input.reason,
        requestId: input.requestId,
      });
    });

    return this.reloadCurriculum(input.curriculum.id);
  }

  private buildSnapshot(curriculum: CurriculumAggregate): Prisma.JsonObject {
    return {
      curriculum: {
        id: curriculum.id,
        schoolId: curriculum.schoolId,
        schoolProgrammeComponentId: curriculum.schoolProgrammeComponentId,
        title: curriculum.title,
        code: curriculum.code,
        description: curriculum.description,
        status: curriculum.status,
        creationMethod: curriculum.creationMethod,
      },
      versions: curriculum.versions.map((version) => ({
        id: version.id,
        versionNumber: version.versionNumber,
        majorVersion: version.majorVersion,
        minorVersion: version.minorVersion,
        patchVersion: version.patchVersion,
        status: version.status,
        isCurrent: version.isCurrent,
        isPublished: version.isPublished,
        basedOnVersionId: version.basedOnVersionId,
      })),
      units: curriculum.units.map((unit) => ({
        id: unit.id,
        title: unit.title,
        code: unit.code,
        sequenceOrder: unit.sequenceOrder,
        estimatedWeeks: unit.estimatedWeeks,
        masterCurriculumUnitId: unit.masterCurriculumUnitId,
        topics: unit.topics.map((topic) => ({
          id: topic.id,
          title: topic.title,
          code: topic.code,
          sequenceOrder: topic.sequenceOrder,
          weekNumber: topic.weekNumber,
          recommendedDurationMinutes: topic.recommendedDurationMinutes,
          masterTopicId: topic.masterTopicId,
          concepts: topic.conceptLinks.map((link) => ({
            id: link.id,
            curriculumConceptId: link.curriculumConceptId,
            masterConceptId: link.masterConceptId,
            sequenceOrder: link.sequenceOrder,
            isCore: link.isCore,
          })),
          projects: topic.topicProjects.map((link) => ({
            projectId: link.curriculumProjectId,
            sequenceOrder: link.sequenceOrder,
          })),
          learningOutcomes: topic.topicLearningOutcomes.map((link) => ({
            curriculumLearningOutcomeId: link.curriculumLearningOutcomeId,
            sequenceOrder: link.sequenceOrder,
          })),
        })),
        projects: unit.projects.map((project) => ({
          id: project.id,
          title: project.title,
          description: project.description,
          sequenceOrder: project.sequenceOrder,
          objective: project.objective,
          expectedOutput: project.expectedOutput,
          estimatedDurationMinutes: project.estimatedDurationMinutes,
          difficultyLevel: project.difficultyLevel,
          masterProjectId: project.masterProjectId,
          topicLinks: project.topicLinks.map((link) => ({
            topicId: link.curriculumTopicId,
            sequenceOrder: link.sequenceOrder,
          })),
          implementations: project.implementations.map((implementation) => ({
            id: implementation.id,
            title: implementation.title,
            implementationType: implementation.implementationType,
            sequenceOrder: implementation.sequenceOrder,
            estimatedDurationMinutes: implementation.estimatedDurationMinutes,
            masterProjectImplementationId: implementation.masterProjectImplementationId,
          })),
          learningOutcomes: project.projectLearningOutcomes.map((link) => ({
            curriculumLearningOutcomeId: link.curriculumLearningOutcomeId,
            sequenceOrder: link.sequenceOrder,
          })),
        })),
      })),
      concepts: curriculum.concepts.map((concept) => ({
        id: concept.id,
        name: concept.name,
        code: concept.code,
        definition: concept.definition,
        explanation: concept.explanation,
        masterConceptId: concept.masterConceptId,
      })),
      learningOutcomes: curriculum.learningOutcomes.map((outcome) => ({
        id: outcome.id,
        statement: outcome.statement,
        code: outcome.code,
        bloomLevel: outcome.bloomLevel,
        measurableVerb: outcome.measurableVerb,
        masterLearningOutcomeId: outcome.masterLearningOutcomeId,
      })),
      resources: curriculum.resources.map((resource) => ({
        id: resource.id,
        curriculumTopicId: resource.curriculumTopicId,
        title: resource.title,
        description: resource.description,
        resourceType: resource.resourceType,
        quantityRequired: resource.quantityRequired,
        requiresInternet: resource.requiresInternet,
        requiresLogin: resource.requiresLogin,
        masterResourceId: resource.masterResourceId,
      })),
      visibilitySetting: curriculum.visibilitySetting
        ? {
            ...curriculum.visibilitySetting,
            createdAt: curriculum.visibilitySetting.createdAt.toISOString(),
            updatedAt: curriculum.visibilitySetting.updatedAt.toISOString(),
          }
        : null,
      publicationMetadata: {
        submittedById: curriculum.submittedById,
        submittedAt: curriculum.submittedAt?.toISOString() ?? null,
        approvedById: curriculum.approvedById,
        approvedAt: curriculum.approvedAt?.toISOString() ?? null,
        publishedById: curriculum.publishedById,
        publishedAt: curriculum.publishedAt?.toISOString() ?? null,
      },
    };
  }

  private async createAuditLogTx(
    tx: Prisma.TransactionClient,
    payload: AuditPayload,
  ): Promise<void> {
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

  private async reloadCurriculum(curriculumId: string): Promise<CurriculumAggregate> {
    const curriculum = await curriculumRepository.findCurriculumById(curriculumId);
    if (!curriculum) {
      throw notFound('Curriculum not found after operation.');
    }

    return curriculum;
  }

  private handleKnownPrismaErrors(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2002' || error.code === 'P2003' || error.code === 'P2004')
    ) {
      throw databaseConflict('Database constraint conflict occurred.');
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw error;
  }
}

export const curriculumService = new CurriculumService();
