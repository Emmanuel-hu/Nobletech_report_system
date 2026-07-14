import { Prisma, type MasterContentStatus, type PrismaClient } from '@prisma/client';

import { prisma } from '../config/prisma';
import type { AuthContext } from '../types/auth.types';
import { badRequest, databaseConflict, forbidden, lifecycleConflict, notFound, tenantScopeViolation, versionConflict } from '../utils/app-error';

const EDITABLE_STATUSES: ReadonlyArray<MasterContentStatus> = ['DRAFT', 'REVISION_REQUIRED'];
const REVIEW_LOCKED_STATUSES: ReadonlyArray<MasterContentStatus> = ['UNDER_REVIEW'];
const IMMUTABLE_STATUSES: ReadonlyArray<MasterContentStatus> = ['APPROVED', 'ARCHIVED'];

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
  | 'assessments'
  | 'rubrics'
  | 'rubric-criteria'
  | 'rubric-levels';

type LifecycleAction = 'submit-review' | 'request-revision' | 'approve' | 'archive';

type MappingType =
  | 'unit-subject'
  | 'unit-integration-domain'
  | 'unit-programme-component'
  | 'topic-subject'
  | 'topic-integration-domain'
  | 'topic-concept'
  | 'topic-skill'
  | 'topic-outcome'
  | 'topic-activity'
  | 'topic-project'
  | 'activity-resource'
  | 'project-resource'
  | 'project-skill'
  | 'project-outcome'
  | 'assessment-outcome';

type LineageEntityType =
  | 'unit'
  | 'topic'
  | 'concept'
  | 'skill'
  | 'learning_outcome'
  | 'activity'
  | 'project'
  | 'project_implementation'
  | 'resource'
  | 'assessment_template'
  | 'rubric';

type ListFilters = {
  q?: string;
  status?: MasterContentStatus;
  ownership?: 'all' | 'school' | 'global';
  page?: number;
  pageSize?: number;
};

type EntityDescriptor = {
  modelName: string;
  displayField: string;
  supportsLifecycle: boolean;
  scoped: boolean;
};

const MASTER_ENTITY_DESCRIPTORS: Record<MasterEntityType, EntityDescriptor> = {
  units: { modelName: 'masterCurriculumUnit', displayField: 'title', supportsLifecycle: true, scoped: true },
  topics: { modelName: 'masterTopic', displayField: 'title', supportsLifecycle: true, scoped: true },
  concepts: { modelName: 'masterConcept', displayField: 'name', supportsLifecycle: true, scoped: true },
  skills: { modelName: 'masterSkill', displayField: 'name', supportsLifecycle: true, scoped: true },
  outcomes: { modelName: 'masterLearningOutcome', displayField: 'statement', supportsLifecycle: true, scoped: true },
  activities: { modelName: 'masterActivity', displayField: 'title', supportsLifecycle: true, scoped: true },
  projects: { modelName: 'masterProject', displayField: 'title', supportsLifecycle: true, scoped: true },
  'project-implementations': {
    modelName: 'masterProjectImplementation',
    displayField: 'title',
    supportsLifecycle: false,
    scoped: true,
  },
  resources: { modelName: 'masterResource', displayField: 'title', supportsLifecycle: true, scoped: true },
  assessments: { modelName: 'masterAssessmentTemplate', displayField: 'title', supportsLifecycle: true, scoped: true },
  rubrics: { modelName: 'masterRubric', displayField: 'title', supportsLifecycle: true, scoped: true },
  'rubric-criteria': { modelName: 'masterRubricCriterion', displayField: 'title', supportsLifecycle: false, scoped: false },
  'rubric-levels': { modelName: 'masterRubricLevel', displayField: 'title', supportsLifecycle: false, scoped: false },
};

const STATUS_TRANSITIONS: Record<LifecycleAction, MasterContentStatus> = {
  'submit-review': 'UNDER_REVIEW',
  'request-revision': 'REVISION_REQUIRED',
  approve: 'APPROVED',
  archive: 'ARCHIVED',
};

const ensureSchoolScope = (auth: AuthContext): string => {
  if (!auth.schoolId) {
    throw forbidden('School scope is required for this operation.');
  }
  return auth.schoolId;
};

const normalize = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const parseUpdatedAt = (value: string): Date => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw badRequest('Invalid lastKnownUpdatedAt value.');
  }
  return parsed;
};

const assertOwnership = (auth: AuthContext, schoolId: string | null): void => {
  if (schoolId === null) {
    if (!auth.isSuperAdmin) {
      throw forbidden('Global master content is editable only by authorised global administrators.');
    }
    return;
  }

  const authSchoolId = ensureSchoolScope(auth);
  if (authSchoolId !== schoolId) {
    throw tenantScopeViolation('Cross-school write access is prohibited.');
  }
};

const assertReadableOwnership = (auth: AuthContext, schoolId: string | null): void => {
  if (schoolId === null) {
    return;
  }

  if (!auth.schoolId || auth.schoolId !== schoolId) {
    throw tenantScopeViolation('Cross-school read access is prohibited.');
  }
};

const isEditable = (status: MasterContentStatus): boolean => EDITABLE_STATUSES.includes(status);

const ensureEditableStatus = (status: MasterContentStatus): void => {
  if (!isEditable(status)) {
    if (REVIEW_LOCKED_STATUSES.includes(status)) {
      throw lifecycleConflict('This record is review-locked while UNDER_REVIEW.');
    }
    if (IMMUTABLE_STATUSES.includes(status)) {
      throw lifecycleConflict('Approved and archived records are immutable. Create a new revision instead.');
    }
    throw lifecycleConflict('This record is not editable in its current lifecycle state.');
  }
};

const applyOwnership = (
  auth: AuthContext,
  filters: ListFilters,
): Prisma.MasterCurriculumUnitWhereInput => {
  if (filters.ownership === 'global') {
    return { schoolId: null };
  }

  if (filters.ownership === 'school') {
    return { schoolId: ensureSchoolScope(auth) };
  }

  if (!auth.schoolId) {
    return { schoolId: null };
  }

  return { OR: [{ schoolId: auth.schoolId }, { schoolId: null }] };
};

const createSearchWhere = (displayField: string, q?: string): Record<string, unknown> => {
  const query = normalize(q);
  if (!query) {
    return {};
  }

  return {
    OR: [
      { [displayField]: { contains: query, mode: 'insensitive' } },
      { code: { contains: query, mode: 'insensitive' } },
    ],
  };
};

const serializeRecord = (record: Record<string, unknown>): Prisma.InputJsonValue => {
  return JSON.parse(JSON.stringify(record)) as Prisma.InputJsonValue;
};

const maybeCode = (payload: Record<string, unknown>): string | null => {
  const code = payload.code;
  return typeof code === 'string' && code.trim() ? code.trim() : null;
};

const maybeString = (payload: Record<string, unknown>, key: string): string | null => {
  const value = payload[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
};

const maybeNumber = (payload: Record<string, unknown>, key: string): number | null => {
  const value = payload[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return null;
};

const maybeBoolean = (payload: Record<string, unknown>, key: string): boolean | null => {
  const value = payload[key];
  if (typeof value === 'boolean') {
    return value;
  }
  return null;
};

export class MasterContentService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getDashboard(auth: AuthContext) {
    const scope = applyOwnership(auth, { ownership: 'all' });

    const [
      units,
      topics,
      concepts,
      skills,
      outcomes,
      activities,
      projects,
      resources,
      assessments,
      rubrics,
      draft,
      underReview,
      revisionRequired,
      approved,
      archived,
    ] = await Promise.all([
      this.db.masterCurriculumUnit.count({ where: { ...(scope as object), archivedAt: null } }),
      this.db.masterTopic.count({ where: { ...(scope as object), archivedAt: null } }),
      this.db.masterConcept.count({ where: { ...(scope as object), archivedAt: null } }),
      this.db.masterSkill.count({ where: { ...(scope as object), archivedAt: null } }),
      this.db.masterLearningOutcome.count({ where: { ...(scope as object), archivedAt: null } }),
      this.db.masterActivity.count({ where: { ...(scope as object), archivedAt: null } }),
      this.db.masterProject.count({ where: { ...(scope as object), archivedAt: null } }),
      this.db.masterResource.count({ where: { ...(scope as object), archivedAt: null } }),
      this.db.masterAssessmentTemplate.count({ where: { ...(scope as object), archivedAt: null } }),
      this.db.masterRubric.count({ where: { ...(scope as object), archivedAt: null } }),
      this.countByStatus(scope, 'DRAFT'),
      this.countByStatus(scope, 'UNDER_REVIEW'),
      this.countByStatus(scope, 'REVISION_REQUIRED'),
      this.countByStatus(scope, 'APPROVED'),
      this.countByStatus(scope, 'ARCHIVED'),
    ]);

    return {
      entities: { units, topics, concepts, skills, outcomes, activities, projects, resources, assessments, rubrics },
      lifecycle: {
        draft,
        underReview,
        revisionRequired,
        approved,
        archived,
      },
    };
  }

  async listEntities(auth: AuthContext, entityType: MasterEntityType, filters: ListFilters) {
    const descriptor = MASTER_ENTITY_DESCRIPTORS[entityType];
    const model = this.getModel(descriptor.modelName);
    const where = {
      ...(descriptor.scoped ? (applyOwnership(auth, filters) as object) : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(descriptor.modelName !== 'masterProjectImplementation' && descriptor.modelName !== 'masterRubricCriterion' && descriptor.modelName !== 'masterRubricLevel'
        ? { archivedAt: null }
        : {}),
      ...createSearchWhere(descriptor.displayField, filters.q),
    } as Record<string, unknown>;

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      model.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }],
        skip,
        take: pageSize,
      }),
      model.count({ where }),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async getEntity(auth: AuthContext, entityType: MasterEntityType, entityId: string) {
    const descriptor = MASTER_ENTITY_DESCRIPTORS[entityType];
    const model = this.getModel(descriptor.modelName);
    const found = await model.findUnique({ where: { id: entityId } });

    if (!found) {
      throw notFound('Master content entity not found.');
    }

    const schoolId = this.getNullableSchoolId(found);
    if (descriptor.scoped) {
      assertReadableOwnership(auth, schoolId);
    }

    return found;
  }

  async createEntity(auth: AuthContext, entityType: MasterEntityType, payload: { isGlobal?: boolean; data: Record<string, unknown> }, requestId?: string) {
    const descriptor = MASTER_ENTITY_DESCRIPTORS[entityType];
    const model = this.getModel(descriptor.modelName);

    const schoolId = payload.isGlobal ? null : ensureSchoolScope(auth);
    if (schoolId === null && !auth.isSuperAdmin) {
      throw forbidden('Global master content creation requires global administrator scope.');
    }

    const data = this.buildCreateData(entityType, auth, schoolId, payload.data);

    try {
      const created = await this.db.$transaction(async (tx) => {
        const transactionalModel = this.getModel(descriptor.modelName, tx);
        const row = await transactionalModel.create({ data });
        await this.createAudit(tx, {
          schoolId,
          actorUserId: auth.userId,
          action: `master_content.${entityType}.create`,
          entityType,
          entityId: row.id,
          newValues: serializeRecord(row),
          requestId,
        });
        return row;
      });

      return created;
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async updateEntity(
    auth: AuthContext,
    entityType: MasterEntityType,
    entityId: string,
    payload: { data: Record<string, unknown>; lastKnownUpdatedAt: string },
    requestId?: string,
  ) {
    const descriptor = MASTER_ENTITY_DESCRIPTORS[entityType];
    const model = this.getModel(descriptor.modelName);
    const existing = await model.findUnique({ where: { id: entityId } });

    if (!existing) {
      throw notFound('Master content entity not found.');
    }

    const schoolId = this.getNullableSchoolId(existing);
    if (descriptor.scoped) {
      assertOwnership(auth, schoolId);
    }

    const existingStatus = this.getNullableStatus(existing);
    if (existingStatus) {
      ensureEditableStatus(existingStatus);
    }

    this.assertUpdatedAt(existing.updatedAt, payload.lastKnownUpdatedAt);

    const updateData = this.buildUpdateData(entityType, payload.data);

    const updated = await this.db.$transaction(async (tx) => {
      const transactionalModel = this.getModel(descriptor.modelName, tx);
      const row = await transactionalModel.update({ where: { id: entityId }, data: updateData });
      await this.createAudit(tx, {
        schoolId,
        actorUserId: auth.userId,
        action: `master_content.${entityType}.edit`,
        entityType,
        entityId,
        oldValues: serializeRecord(existing),
        newValues: serializeRecord(row),
        requestId,
      });
      return row;
    });

    return updated;
  }

  async transitionLifecycle(
    auth: AuthContext,
    entityType: MasterEntityType,
    entityId: string,
    action: LifecycleAction,
    payload: { comment?: string; requestedChanges?: string; reason?: string; lastKnownUpdatedAt: string },
    requestId?: string,
  ) {
    const descriptor = MASTER_ENTITY_DESCRIPTORS[entityType];
    if (!descriptor.supportsLifecycle) {
      throw badRequest('Lifecycle actions are not supported for this entity.');
    }

    const model = this.getModel(descriptor.modelName);
    const existing = await model.findUnique({ where: { id: entityId } });
    if (!existing) {
      throw notFound('Master content entity not found.');
    }

    const schoolId = this.getNullableSchoolId(existing);
    assertOwnership(auth, schoolId);

    this.assertUpdatedAt(existing.updatedAt, payload.lastKnownUpdatedAt);

    const from = this.getStatus(existing);
    const to = STATUS_TRANSITIONS[action];

    this.assertAllowedTransition(action, from);

    const updateData: Record<string, unknown> = { status: to };
    if (to === 'ARCHIVED') {
      updateData.archivedAt = new Date();
      updateData.isActive = false;
    }
    if (to === 'APPROVED') {
      updateData.approvedAt = new Date();
      updateData.approvedById = auth.userId;
    }
    if (to === 'UNDER_REVIEW') {
      updateData.reviewedById = auth.userId;
    }

    const updated = await this.db.$transaction(async (tx) => {
      const transactionalModel = this.getModel(descriptor.modelName, tx);
      const row = await transactionalModel.update({ where: { id: entityId }, data: updateData });
      await this.createAudit(tx, {
        schoolId,
        actorUserId: auth.userId,
        action: `master_content.${entityType}.${action}`,
        entityType,
        entityId,
        oldValues: { status: from },
        newValues: { status: to, comment: payload.comment ?? null, requestedChanges: payload.requestedChanges ?? null, reason: payload.reason ?? null },
        reason: payload.reason ?? payload.comment ?? payload.requestedChanges,
        requestId,
      });
      return row;
    });

    return updated;
  }

  async createRevision(auth: AuthContext, entityType: MasterEntityType, entityId: string, summary: string | undefined, requestId?: string) {
    const descriptor = MASTER_ENTITY_DESCRIPTORS[entityType];
    const model = this.getModel(descriptor.modelName);
    const existing = await model.findUnique({ where: { id: entityId } });

    if (!existing) {
      throw notFound('Master content entity not found.');
    }

    const schoolId = this.getNullableSchoolId(existing);
    if (descriptor.scoped) {
      assertOwnership(auth, schoolId);
    }

    const status = this.getNullableStatus(existing);
    if (status && status !== 'APPROVED' && status !== 'ARCHIVED') {
      throw lifecycleConflict('New revision is only allowed from APPROVED or ARCHIVED content.');
    }

    const cloneData = { ...existing } as Record<string, unknown>;
    delete cloneData.id;
    delete cloneData.createdAt;
    delete cloneData.updatedAt;
    cloneData.status = 'DRAFT';
    cloneData.isActive = true;
    cloneData.archivedAt = null;
    cloneData.createdById = auth.userId;
    if (typeof cloneData.versionNumber === 'number') {
      cloneData.versionNumber = Number(cloneData.versionNumber) + 1;
    }

    const created = await this.db.$transaction(async (tx) => {
      const transactionalModel = this.getModel(descriptor.modelName, tx);
      const row = await transactionalModel.create({ data: cloneData });
      await this.createAudit(tx, {
        schoolId,
        actorUserId: auth.userId,
        action: `master_content.${entityType}.create_revision`,
        entityType,
        entityId: row.id,
        oldValues: { basedOn: entityId, status },
        newValues: { summary: summary ?? null, status: 'DRAFT' },
        reason: summary,
        requestId,
      });
      return row;
    });

    return created;
  }

  async listReviewQueue(auth: AuthContext) {
    const scope = applyOwnership(auth, { ownership: 'all' });

    const [
      units,
      topics,
      concepts,
      skills,
      outcomes,
      activities,
      projects,
      resources,
      assessments,
      rubrics,
    ] = await Promise.all([
      this.db.masterCurriculumUnit.findMany({ where: { ...(scope as object), status: 'UNDER_REVIEW', archivedAt: null }, select: this.reviewSelect('unit') }),
      this.db.masterTopic.findMany({ where: { ...(scope as object), status: 'UNDER_REVIEW', archivedAt: null }, select: this.reviewSelect('topic') }),
      this.db.masterConcept.findMany({ where: { ...(scope as object), status: 'UNDER_REVIEW', archivedAt: null }, select: this.reviewSelect('concept') }),
      this.db.masterSkill.findMany({ where: { ...(scope as object), status: 'UNDER_REVIEW', archivedAt: null }, select: this.reviewSelect('skill') }),
      this.db.masterLearningOutcome.findMany({ where: { ...(scope as object), status: 'UNDER_REVIEW', archivedAt: null }, select: this.reviewSelect('outcome') }),
      this.db.masterActivity.findMany({ where: { ...(scope as object), status: 'UNDER_REVIEW', archivedAt: null }, select: this.reviewSelect('activity') }),
      this.db.masterProject.findMany({ where: { ...(scope as object), status: 'UNDER_REVIEW', archivedAt: null }, select: this.reviewSelect('project') }),
      this.db.masterResource.findMany({ where: { ...(scope as object), status: 'UNDER_REVIEW', archivedAt: null }, select: this.reviewSelect('resource') }),
      this.db.masterAssessmentTemplate.findMany({ where: { ...(scope as object), status: 'UNDER_REVIEW', archivedAt: null }, select: this.reviewSelect('assessment') }),
      this.db.masterRubric.findMany({ where: { ...(scope as object), status: 'UNDER_REVIEW', archivedAt: null }, select: this.reviewSelect('rubric') }),
    ]);

    const flatten = [
      ...units,
      ...topics,
      ...concepts,
      ...skills,
      ...outcomes,
      ...activities,
      ...projects,
      ...resources,
      ...assessments,
      ...rubrics,
    ];

    return flatten.sort((a, b) => String(b.submittedAt ?? b.updatedAt).localeCompare(String(a.submittedAt ?? a.updatedAt)));
  }

  async getAuditHistory(auth: AuthContext, entityType: MasterEntityType, entityId: string) {
    await this.getEntity(auth, entityType, entityId);

    return this.db.auditLog.findMany({
      where: { entityType: `master-content:${entityType}`, entityId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async createMapping(
    auth: AuthContext,
    mappingType: MappingType,
    payload: {
      leftId: string;
      rightId: string;
      sequenceOrder?: number;
      isPrimary?: boolean;
      isRequired?: boolean;
      proficiencyTarget?: string;
      importanceLevel?: string;
      expectedDepth?: string;
      instructionalEmphasis?: string;
      assessmentRelevance?: string;
      teacherNote?: string;
    },
    requestId?: string,
  ) {
    const spec = this.mappingSpec(mappingType);
    const left = await this.getEntity(auth, spec.leftEntityType, payload.leftId);
    const right = await this.getEntity(auth, spec.rightEntityType, payload.rightId);

    this.ensureMappingLifecycleEditable(spec.leftStatus(left));

    const createData = spec.createData(payload, auth.userId);

    try {
      const created = await this.db.$transaction(async (tx) => {
        const mappingModel = this.getModel(spec.modelName, tx);
        const row = await mappingModel.create({ data: createData });
        await this.createAudit(tx, {
          schoolId: spec.leftSchoolId(left),
          actorUserId: auth.userId,
          action: `master_content.mapping.${mappingType}.create`,
          entityType: `mapping:${mappingType}`,
          entityId: row.id,
          newValues: { leftId: payload.leftId, rightId: payload.rightId },
          requestId,
        });
        return row;
      });

      return created;
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async removeMapping(auth: AuthContext, mappingType: MappingType, mappingId: string, requestId?: string) {
    const spec = this.mappingSpec(mappingType);
    const mappingModel = this.getModel(spec.modelName);
    const existing = await mappingModel.findUnique({ where: { id: mappingId } });

    if (!existing) {
      throw notFound('Mapping not found.');
    }

    const leftId = spec.readLeftId(existing);
    const left = await this.getEntity(auth, spec.leftEntityType, leftId);
    this.ensureMappingLifecycleEditable(spec.leftStatus(left));

    await this.db.$transaction(async (tx) => {
      const txModel = this.getModel(spec.modelName, tx);
      await txModel.delete({ where: { id: mappingId } });
      await this.createAudit(tx, {
        schoolId: spec.leftSchoolId(left),
        actorUserId: auth.userId,
        action: `master_content.mapping.${mappingType}.remove`,
        entityType: `mapping:${mappingType}`,
        entityId: mappingId,
        reason: 'Removed from editable lifecycle state',
        requestId,
      });
    });

    return { removed: true };
  }

  async createLineage(
    auth: AuthContext,
    entityType: LineageEntityType,
    entityId: string,
    payload: {
      sourceId: string;
      sourceVersionLabel?: string;
      sourcePage?: string;
      sourceSection?: string;
      extractionNote?: string;
      adaptationNote?: string;
      attribution?: string;
      usageRestriction?: string;
    },
    requestId?: string,
  ) {
    const descriptor = this.lineageDescriptor(entityType);
    const entity = await this.getEntity(auth, descriptor.masterEntityType, entityId);
    const source = await this.db.curriculumSource.findUnique({ where: { id: payload.sourceId } });

    if (!source) {
      throw notFound('Curriculum source not found.');
    }

    this.ensureSourceVisibilityForEntity(auth, source.schoolId, this.getNullableSchoolId(entity));

    const targetField = descriptor.targetField;
    const duplicate = await this.db.curriculumSourceMasterContentLink.findFirst({
      where: {
        curriculumSourceId: source.id,
        [targetField]: entityId,
      },
    });

    if (duplicate) {
      throw databaseConflict('Duplicate lineage link is not allowed.');
    }

    const created = await this.db.$transaction(async (tx) => {
      const row = await tx.curriculumSourceMasterContentLink.create({
        data: {
          curriculumSourceId: payload.sourceId,
          [targetField]: entityId,
          sourceVersionLabel: payload.sourceVersionLabel,
          sourcePage: payload.sourcePage,
          sourceSection: payload.sourceSection,
          extractionNote: payload.extractionNote,
          adaptationNote: payload.adaptationNote,
          attribution: payload.attribution,
          usageRestriction: payload.usageRestriction,
          reviewStatus: 'DRAFT',
          createdById: auth.userId,
        },
      });

      await this.createAudit(tx, {
        schoolId: this.getNullableSchoolId(entity),
        actorUserId: auth.userId,
        action: `master_content.lineage.${entityType}.create`,
        entityType: `lineage:${entityType}`,
        entityId: row.id,
        newValues: { sourceId: payload.sourceId, targetEntityId: entityId },
        requestId,
      });

      return row;
    });

    return created;
  }

  async updateLineage(auth: AuthContext, lineageId: string, payload: {
    sourceVersionLabel?: string;
    sourcePage?: string;
    sourceSection?: string;
    extractionNote?: string;
    adaptationNote?: string;
    attribution?: string;
    usageRestriction?: string;
    lastKnownUpdatedAt: string;
  }, requestId?: string) {
    const existing = await this.db.curriculumSourceMasterContentLink.findUnique({ where: { id: lineageId } });
    if (!existing) {
      throw notFound('Lineage entry not found.');
    }

    const target = await this.getLineageTarget(existing);
    assertOwnership(auth, target.schoolId);

    this.assertUpdatedAt(existing.updatedAt, payload.lastKnownUpdatedAt);

    const updated = await this.db.$transaction(async (tx) => {
      const row = await tx.curriculumSourceMasterContentLink.update({
        where: { id: lineageId },
        data: {
          sourceVersionLabel: payload.sourceVersionLabel,
          sourcePage: payload.sourcePage,
          sourceSection: payload.sourceSection,
          extractionNote: payload.extractionNote,
          adaptationNote: payload.adaptationNote,
          attribution: payload.attribution,
          usageRestriction: payload.usageRestriction,
        },
      });

      await this.createAudit(tx, {
        schoolId: target.schoolId,
        actorUserId: auth.userId,
        action: 'master_content.lineage.update',
        entityType: `lineage:${target.entityType}`,
        entityId: lineageId,
        oldValues: serializeRecord(existing),
        newValues: serializeRecord(row),
        requestId,
      });

      return row;
    });

    return updated;
  }

  async deleteLineage(auth: AuthContext, lineageId: string, requestId?: string) {
    const existing = await this.db.curriculumSourceMasterContentLink.findUnique({ where: { id: lineageId } });
    if (!existing) {
      throw notFound('Lineage entry not found.');
    }

    const target = await this.getLineageTarget(existing);
    assertOwnership(auth, target.schoolId);

    this.ensureMappingLifecycleEditable(target.status);

    await this.db.$transaction(async (tx) => {
      await tx.curriculumSourceMasterContentLink.delete({ where: { id: lineageId } });
      await this.createAudit(tx, {
        schoolId: target.schoolId,
        actorUserId: auth.userId,
        action: 'master_content.lineage.remove',
        entityType: `lineage:${target.entityType}`,
        entityId: lineageId,
        reason: 'Removed while entity was editable',
        requestId,
      });
    });

    return { removed: true };
  }

  private async countByStatus(scope: object, status: MasterContentStatus): Promise<number> {
    const [a, b, c, d, e, f, g, h, i, j] = await Promise.all([
      this.db.masterCurriculumUnit.count({ where: { ...(scope as object), status, archivedAt: null } }),
      this.db.masterTopic.count({ where: { ...(scope as object), status, archivedAt: null } }),
      this.db.masterConcept.count({ where: { ...(scope as object), status, archivedAt: null } }),
      this.db.masterSkill.count({ where: { ...(scope as object), status, archivedAt: null } }),
      this.db.masterLearningOutcome.count({ where: { ...(scope as object), status, archivedAt: null } }),
      this.db.masterActivity.count({ where: { ...(scope as object), status, archivedAt: null } }),
      this.db.masterProject.count({ where: { ...(scope as object), status, archivedAt: null } }),
      this.db.masterResource.count({ where: { ...(scope as object), status, archivedAt: null } }),
      this.db.masterAssessmentTemplate.count({ where: { ...(scope as object), status, archivedAt: null } }),
      this.db.masterRubric.count({ where: { ...(scope as object), status, archivedAt: null } }),
    ]);

    return a + b + c + d + e + f + g + h + i + j;
  }

  private reviewSelect(entityType: string): Record<string, unknown> {
    return {
      id: true,
      schoolId: true,
      status: true,
      versionNumber: true,
      createdById: true,
      createdAt: true,
      updatedAt: true,
      approvedAt: true,
      title: true,
      name: true,
      statement: true,
      entityType,
      submittedAt: true,
    };
  }

  private getModel(modelName: string, client?: PrismaClient | Prisma.TransactionClient): any {
    const instance = client ?? this.db;
    return (instance as any)[modelName];
  }

  private getNullableSchoolId(row: Record<string, unknown>): string | null {
    const schoolId = row.schoolId;
    return typeof schoolId === 'string' ? schoolId : null;
  }

  private getNullableStatus(row: Record<string, unknown>): MasterContentStatus | null {
    const status = row.status;
    return typeof status === 'string' ? (status as MasterContentStatus) : null;
  }

  private getStatus(row: Record<string, unknown>): MasterContentStatus {
    const status = this.getNullableStatus(row);
    if (!status) {
      throw badRequest('Lifecycle status is not available for this entity.');
    }
    return status;
  }

  private assertUpdatedAt(actual: Date, lastKnownUpdatedAt: string): void {
    const parsed = parseUpdatedAt(lastKnownUpdatedAt);
    if (actual.getTime() !== parsed.getTime()) {
      throw versionConflict('The record has changed since it was loaded. Refresh and retry.');
    }
  }

  private assertAllowedTransition(action: LifecycleAction, from: MasterContentStatus): void {
    if (action === 'submit-review' && !EDITABLE_STATUSES.includes(from)) {
      throw lifecycleConflict('Only DRAFT or REVISION_REQUIRED content can be submitted for review.');
    }
    if (action === 'request-revision' && from !== 'UNDER_REVIEW') {
      throw lifecycleConflict('Revision can only be requested from UNDER_REVIEW.');
    }
    if (action === 'approve' && from !== 'UNDER_REVIEW') {
      throw lifecycleConflict('Only UNDER_REVIEW content can be approved.');
    }
    if (action === 'archive' && from === 'ARCHIVED') {
      throw lifecycleConflict('Content is already archived.');
    }
  }

  private ensureMappingLifecycleEditable(status: MasterContentStatus): void {
    ensureEditableStatus(status);
  }

  private buildCreateData(entityType: MasterEntityType, auth: AuthContext, schoolId: string | null, payload: Record<string, unknown>): Record<string, unknown> {
    const common = {
      schoolId,
      createdById: auth.userId,
    } as Record<string, unknown>;

    if (entityType === 'units') {
      return {
        ...common,
        title: maybeString(payload, 'title') ?? 'Untitled unit',
        code: maybeCode(payload),
        description: maybeString(payload, 'description') ?? '',
        programmeComponentId: maybeString(payload, 'programmeComponentId'),
        recommendedEducationLevel: maybeString(payload, 'recommendedEducationLevel'),
        minimumClassLevel: maybeString(payload, 'minimumClassLevel'),
        maximumClassLevel: maybeString(payload, 'maximumClassLevel'),
        estimatedWeeks: maybeNumber(payload, 'estimatedWeeks'),
      };
    }

    if (entityType === 'topics') {
      return {
        ...common,
        masterCurriculumUnitId: maybeString(payload, 'masterCurriculumUnitId'),
        title: maybeString(payload, 'title') ?? 'Untitled topic',
        code: maybeCode(payload),
        description: maybeString(payload, 'description') ?? '',
        sequenceOrder: maybeNumber(payload, 'sequenceOrder') ?? 1,
        recommendedDurationMinutes: maybeNumber(payload, 'recommendedDurationMinutes'),
        difficultyLevel: maybeString(payload, 'difficultyLevel'),
        prerequisiteNote: maybeString(payload, 'prerequisiteNote'),
      };
    }

    if (entityType === 'concepts') {
      return {
        ...common,
        name: maybeString(payload, 'name') ?? 'Untitled concept',
        code: maybeCode(payload),
        definition: maybeString(payload, 'definition') ?? '',
        explanation: maybeString(payload, 'explanation'),
        category: maybeString(payload, 'category'),
      };
    }

    if (entityType === 'skills') {
      return {
        ...common,
        name: maybeString(payload, 'name') ?? 'Untitled skill',
        code: maybeCode(payload),
        description: maybeString(payload, 'description') ?? '',
        category: maybeString(payload, 'category') ?? 'GENERAL',
        progressionLevel: maybeString(payload, 'progressionLevel'),
      };
    }

    if (entityType === 'outcomes') {
      return {
        ...common,
        statement: maybeString(payload, 'statement') ?? '',
        code: maybeCode(payload),
        bloomLevel: maybeString(payload, 'bloomLevel'),
        measurableVerb: maybeString(payload, 'measurableVerb'),
        recommendedClassLevel: maybeString(payload, 'recommendedClassLevel'),
      };
    }

    if (entityType === 'activities') {
      return {
        ...common,
        title: maybeString(payload, 'title') ?? 'Untitled activity',
        description: maybeString(payload, 'description') ?? '',
        activityType: maybeString(payload, 'activityType') ?? 'OTHER',
        estimatedDurationMinutes: maybeNumber(payload, 'estimatedDurationMinutes'),
        teacherInstructions: maybeString(payload, 'teacherInstructions'),
        learnerInstructions: maybeString(payload, 'learnerInstructions'),
        groupingType: maybeString(payload, 'groupingType'),
        safetyNote: maybeString(payload, 'safetyNote'),
        difficultyLevel: maybeString(payload, 'difficultyLevel'),
      };
    }

    if (entityType === 'projects') {
      return {
        ...common,
        title: maybeString(payload, 'title') ?? 'Untitled project',
        description: maybeString(payload, 'description') ?? '',
        objective: maybeString(payload, 'objective'),
        expectedOutput: maybeString(payload, 'expectedOutput'),
        projectType: maybeString(payload, 'projectType'),
        difficultyLevel: maybeString(payload, 'difficultyLevel'),
        estimatedDurationMinutes: maybeNumber(payload, 'estimatedDurationMinutes'),
        recommendedClassLevel: maybeString(payload, 'recommendedClassLevel'),
        safetyNote: maybeString(payload, 'safetyNote'),
      };
    }

    if (entityType === 'project-implementations') {
      return {
        ...common,
        masterProjectId: maybeString(payload, 'masterProjectId'),
        title: maybeString(payload, 'title') ?? 'Untitled implementation',
        implementationType: maybeString(payload, 'implementationType') ?? 'OTHER',
        description: maybeString(payload, 'description') ?? '',
        sequenceOrder: maybeNumber(payload, 'sequenceOrder') ?? 1,
        teacherInstructions: maybeString(payload, 'teacherInstructions'),
        learnerInstructions: maybeString(payload, 'learnerInstructions'),
        safetyInstructions: maybeString(payload, 'safetyInstructions'),
        requiredInternet: maybeBoolean(payload, 'requiredInternet') ?? false,
        requiredDeviceCount: maybeNumber(payload, 'requiredDeviceCount'),
        estimatedDurationMinutes: maybeNumber(payload, 'estimatedDurationMinutes'),
      };
    }

    if (entityType === 'resources') {
      return {
        ...common,
        title: maybeString(payload, 'title') ?? 'Untitled resource',
        description: maybeString(payload, 'description') ?? '',
        resourceType: maybeString(payload, 'resourceType') ?? 'OTHER',
        resourceCategory: maybeString(payload, 'resourceCategory'),
        url: maybeString(payload, 'url'),
        fileReference: maybeString(payload, 'fileReference'),
        platformName: maybeString(payload, 'platformName'),
        manufacturer: maybeString(payload, 'manufacturer'),
        modelName: maybeString(payload, 'modelName'),
        quantityGuidance: maybeString(payload, 'quantityGuidance'),
        safetyNote: maybeString(payload, 'safetyNote'),
        requiresInternet: maybeBoolean(payload, 'requiresInternet') ?? false,
        requiresLogin: maybeBoolean(payload, 'requiresLogin') ?? false,
        isReusable: maybeBoolean(payload, 'isReusable') ?? true,
        lastVerifiedAt: maybeString(payload, 'lastVerifiedAt') ? new Date(String(payload.lastVerifiedAt)) : null,
      };
    }

    if (entityType === 'assessments') {
      return {
        ...common,
        title: maybeString(payload, 'title') ?? 'Untitled assessment template',
        description: maybeString(payload, 'description') ?? '',
        assessmentType: maybeString(payload, 'assessmentType') ?? 'OTHER',
        instructions: maybeString(payload, 'instructions'),
        maximumScore: maybeNumber(payload, 'maximumScore'),
        passingScore: maybeNumber(payload, 'passingScore'),
        durationMinutes: maybeNumber(payload, 'durationMinutes'),
        gradingMethod: maybeString(payload, 'gradingMethod'),
        templateData: (payload.templateData as Prisma.InputJsonValue) ?? null,
      };
    }

    if (entityType === 'rubrics') {
      return {
        ...common,
        title: maybeString(payload, 'title') ?? 'Untitled rubric',
        description: maybeString(payload, 'description') ?? '',
        rubricType: maybeString(payload, 'rubricType'),
        maximumScore: maybeNumber(payload, 'maximumScore'),
      };
    }

    if (entityType === 'rubric-criteria') {
      return {
        masterRubricId: maybeString(payload, 'masterRubricId'),
        title: maybeString(payload, 'title') ?? 'Criterion',
        description: maybeString(payload, 'description'),
        sequenceOrder: maybeNumber(payload, 'sequenceOrder') ?? 1,
        maximumScore: maybeNumber(payload, 'maximumScore'),
      };
    }

    return {
      masterRubricCriterionId: maybeString(payload, 'masterRubricCriterionId'),
      title: maybeString(payload, 'title') ?? 'Level',
      description: maybeString(payload, 'description'),
      scoreValue: maybeNumber(payload, 'scoreValue') ?? 0,
      sequenceOrder: maybeNumber(payload, 'sequenceOrder') ?? 1,
    };
  }

  private buildUpdateData(entityType: MasterEntityType, payload: Record<string, unknown>): Record<string, unknown> {
    const patch = { ...payload };

    const unsafeKeys = ['id', 'schoolId', 'createdById', 'createdAt', 'updatedAt', 'approvedAt', 'approvedById', 'status'];
    for (const key of unsafeKeys) {
      delete patch[key];
    }

    if (entityType === 'resources') {
      if (Object.hasOwn(patch, 'lastVerifiedAt')) {
        const value = patch.lastVerifiedAt;
        patch.lastVerifiedAt = typeof value === 'string' && value.trim() ? new Date(value) : null;
      }
    }

    return patch;
  }

  private mappingSpec(mappingType: MappingType) {
    const shared = {
      'unit-subject': {
        modelName: 'masterCurriculumUnitSubject',
        leftEntityType: 'units' as MasterEntityType,
        rightEntityType: 'units' as MasterEntityType,
        readLeftId: (row: Record<string, unknown>) => String(row.masterCurriculumUnitId),
        leftStatus: (left: Record<string, unknown>) => this.getStatus(left),
        leftSchoolId: (left: Record<string, unknown>) => this.getNullableSchoolId(left),
        createData: (payload: any, userId: string) => ({
          masterCurriculumUnitId: payload.leftId,
          subjectId: payload.rightId,
          createdById: userId,
        }),
      },
      'unit-integration-domain': {
        modelName: 'masterCurriculumUnitIntegrationDomain',
        leftEntityType: 'units' as MasterEntityType,
        rightEntityType: 'units' as MasterEntityType,
        readLeftId: (row: Record<string, unknown>) => String(row.masterCurriculumUnitId),
        leftStatus: (left: Record<string, unknown>) => this.getStatus(left),
        leftSchoolId: (left: Record<string, unknown>) => this.getNullableSchoolId(left),
        createData: (payload: any, userId: string) => ({
          masterCurriculumUnitId: payload.leftId,
          integrationDomainId: payload.rightId,
          createdById: userId,
        }),
      },
      'unit-programme-component': {
        modelName: 'masterCurriculumUnitProgrammeComponent',
        leftEntityType: 'units' as MasterEntityType,
        rightEntityType: 'units' as MasterEntityType,
        readLeftId: (row: Record<string, unknown>) => String(row.masterCurriculumUnitId),
        leftStatus: (left: Record<string, unknown>) => this.getStatus(left),
        leftSchoolId: (left: Record<string, unknown>) => this.getNullableSchoolId(left),
        createData: (payload: any, userId: string) => ({
          masterCurriculumUnitId: payload.leftId,
          programmeComponentId: payload.rightId,
          createdById: userId,
        }),
      },
      'topic-subject': {
        modelName: 'masterTopicSubject',
        leftEntityType: 'topics' as MasterEntityType,
        rightEntityType: 'topics' as MasterEntityType,
        readLeftId: (row: Record<string, unknown>) => String(row.masterTopicId),
        leftStatus: (left: Record<string, unknown>) => this.getStatus(left),
        leftSchoolId: (left: Record<string, unknown>) => this.getNullableSchoolId(left),
        createData: (payload: any, userId: string) => ({ masterTopicId: payload.leftId, subjectId: payload.rightId, createdById: userId }),
      },
      'topic-integration-domain': {
        modelName: 'masterTopicIntegrationDomain',
        leftEntityType: 'topics' as MasterEntityType,
        rightEntityType: 'topics' as MasterEntityType,
        readLeftId: (row: Record<string, unknown>) => String(row.masterTopicId),
        leftStatus: (left: Record<string, unknown>) => this.getStatus(left),
        leftSchoolId: (left: Record<string, unknown>) => this.getNullableSchoolId(left),
        createData: (payload: any, userId: string) => ({ masterTopicId: payload.leftId, integrationDomainId: payload.rightId, createdById: userId }),
      },
      'topic-concept': {
        modelName: 'masterTopicConcept',
        leftEntityType: 'topics' as MasterEntityType,
        rightEntityType: 'concepts' as MasterEntityType,
        readLeftId: (row: Record<string, unknown>) => String(row.masterTopicId),
        leftStatus: (left: Record<string, unknown>) => this.getStatus(left),
        leftSchoolId: (left: Record<string, unknown>) => this.getNullableSchoolId(left),
        createData: (payload: any, userId: string) => ({
          masterTopicId: payload.leftId,
          masterConceptId: payload.rightId,
          sequenceOrder: payload.sequenceOrder,
          importanceLevel: payload.importanceLevel,
          expectedDepth: payload.expectedDepth,
          instructionalEmphasis: payload.instructionalEmphasis,
          assessmentRelevance: payload.assessmentRelevance,
          isCore: payload.isPrimary ?? false,
          teacherNote: payload.teacherNote,
          createdById: userId,
        }),
      },
      'topic-skill': {
        modelName: 'masterTopicSkill',
        leftEntityType: 'topics' as MasterEntityType,
        rightEntityType: 'skills' as MasterEntityType,
        readLeftId: (row: Record<string, unknown>) => String(row.masterTopicId),
        leftStatus: (left: Record<string, unknown>) => this.getStatus(left),
        leftSchoolId: (left: Record<string, unknown>) => this.getNullableSchoolId(left),
        createData: (payload: any, userId: string) => ({
          masterTopicId: payload.leftId,
          masterSkillId: payload.rightId,
          sequenceOrder: payload.sequenceOrder,
          proficiencyTarget: payload.proficiencyTarget,
          isCore: payload.isPrimary ?? false,
          createdById: userId,
        }),
      },
      'topic-outcome': {
        modelName: 'masterTopicLearningOutcome',
        leftEntityType: 'topics' as MasterEntityType,
        rightEntityType: 'outcomes' as MasterEntityType,
        readLeftId: (row: Record<string, unknown>) => String(row.masterTopicId),
        leftStatus: (left: Record<string, unknown>) => this.getStatus(left),
        leftSchoolId: (left: Record<string, unknown>) => this.getNullableSchoolId(left),
        createData: (payload: any, userId: string) => ({
          masterTopicId: payload.leftId,
          masterLearningOutcomeId: payload.rightId,
          sequenceOrder: payload.sequenceOrder,
          isPrimary: payload.isPrimary ?? false,
          createdById: userId,
        }),
      },
      'topic-activity': {
        modelName: 'masterTopicActivity',
        leftEntityType: 'topics' as MasterEntityType,
        rightEntityType: 'activities' as MasterEntityType,
        readLeftId: (row: Record<string, unknown>) => String(row.masterTopicId),
        leftStatus: (left: Record<string, unknown>) => this.getStatus(left),
        leftSchoolId: (left: Record<string, unknown>) => this.getNullableSchoolId(left),
        createData: (payload: any, userId: string) => ({
          masterTopicId: payload.leftId,
          masterActivityId: payload.rightId,
          sequenceOrder: payload.sequenceOrder,
          isRequired: payload.isRequired ?? false,
          createdById: userId,
        }),
      },
      'topic-project': {
        modelName: 'masterTopicProject',
        leftEntityType: 'topics' as MasterEntityType,
        rightEntityType: 'projects' as MasterEntityType,
        readLeftId: (row: Record<string, unknown>) => String(row.masterTopicId),
        leftStatus: (left: Record<string, unknown>) => this.getStatus(left),
        leftSchoolId: (left: Record<string, unknown>) => this.getNullableSchoolId(left),
        createData: (payload: any, userId: string) => ({
          masterTopicId: payload.leftId,
          masterProjectId: payload.rightId,
          sequenceOrder: payload.sequenceOrder,
          isRequired: payload.isRequired ?? false,
          createdById: userId,
        }),
      },
      'activity-resource': {
        modelName: 'masterActivityResource',
        leftEntityType: 'activities' as MasterEntityType,
        rightEntityType: 'resources' as MasterEntityType,
        readLeftId: (row: Record<string, unknown>) => String(row.masterActivityId),
        leftStatus: (left: Record<string, unknown>) => this.getStatus(left),
        leftSchoolId: (left: Record<string, unknown>) => this.getNullableSchoolId(left),
        createData: (payload: any, userId: string) => ({
          masterActivityId: payload.leftId,
          masterResourceId: payload.rightId,
          sequenceOrder: payload.sequenceOrder,
          isRequired: payload.isRequired ?? false,
          createdById: userId,
        }),
      },
      'project-resource': {
        modelName: 'masterProjectResource',
        leftEntityType: 'projects' as MasterEntityType,
        rightEntityType: 'resources' as MasterEntityType,
        readLeftId: (row: Record<string, unknown>) => String(row.masterProjectId),
        leftStatus: (left: Record<string, unknown>) => this.getStatus(left),
        leftSchoolId: (left: Record<string, unknown>) => this.getNullableSchoolId(left),
        createData: (payload: any, userId: string) => ({
          masterProjectId: payload.leftId,
          masterResourceId: payload.rightId,
          sequenceOrder: payload.sequenceOrder,
          isRequired: payload.isRequired ?? false,
          createdById: userId,
        }),
      },
      'project-skill': {
        modelName: 'masterProjectSkill',
        leftEntityType: 'projects' as MasterEntityType,
        rightEntityType: 'skills' as MasterEntityType,
        readLeftId: (row: Record<string, unknown>) => String(row.masterProjectId),
        leftStatus: (left: Record<string, unknown>) => this.getStatus(left),
        leftSchoolId: (left: Record<string, unknown>) => this.getNullableSchoolId(left),
        createData: (payload: any, userId: string) => ({
          masterProjectId: payload.leftId,
          masterSkillId: payload.rightId,
          isPrimary: payload.isPrimary ?? false,
          createdById: userId,
        }),
      },
      'project-outcome': {
        modelName: 'masterProjectLearningOutcome',
        leftEntityType: 'projects' as MasterEntityType,
        rightEntityType: 'outcomes' as MasterEntityType,
        readLeftId: (row: Record<string, unknown>) => String(row.masterProjectId),
        leftStatus: (left: Record<string, unknown>) => this.getStatus(left),
        leftSchoolId: (left: Record<string, unknown>) => this.getNullableSchoolId(left),
        createData: (payload: any, userId: string) => ({
          masterProjectId: payload.leftId,
          masterLearningOutcomeId: payload.rightId,
          isPrimary: payload.isPrimary ?? false,
          createdById: userId,
        }),
      },
      'assessment-outcome': {
        modelName: 'masterAssessmentTemplateLearningOutcome',
        leftEntityType: 'assessments' as MasterEntityType,
        rightEntityType: 'outcomes' as MasterEntityType,
        readLeftId: (row: Record<string, unknown>) => String(row.masterAssessmentTemplateId),
        leftStatus: (left: Record<string, unknown>) => this.getStatus(left),
        leftSchoolId: (left: Record<string, unknown>) => this.getNullableSchoolId(left),
        createData: (payload: any, userId: string) => ({
          masterAssessmentTemplateId: payload.leftId,
          masterLearningOutcomeId: payload.rightId,
          isPrimary: payload.isPrimary ?? false,
          createdById: userId,
        }),
      },
    } as const;

    return shared[mappingType];
  }

  private lineageDescriptor(entityType: LineageEntityType): { masterEntityType: MasterEntityType; targetField: string } {
    if (entityType === 'unit') {
      return { masterEntityType: 'units', targetField: 'masterCurriculumUnitId' };
    }
    if (entityType === 'topic') {
      return { masterEntityType: 'topics', targetField: 'masterTopicId' };
    }
    if (entityType === 'concept') {
      return { masterEntityType: 'concepts', targetField: 'masterConceptId' };
    }
    if (entityType === 'skill') {
      return { masterEntityType: 'skills', targetField: 'masterSkillId' };
    }
    if (entityType === 'learning_outcome') {
      return { masterEntityType: 'outcomes', targetField: 'masterLearningOutcomeId' };
    }
    if (entityType === 'activity') {
      return { masterEntityType: 'activities', targetField: 'masterActivityId' };
    }
    if (entityType === 'project') {
      return { masterEntityType: 'projects', targetField: 'masterProjectId' };
    }
    if (entityType === 'project_implementation') {
      return { masterEntityType: 'project-implementations', targetField: 'masterProjectImplementationId' };
    }
    if (entityType === 'resource') {
      return { masterEntityType: 'resources', targetField: 'masterResourceId' };
    }
    if (entityType === 'assessment_template') {
      return { masterEntityType: 'assessments', targetField: 'masterAssessmentTemplateId' };
    }
    return { masterEntityType: 'rubrics', targetField: 'masterRubricId' };
  }

  private ensureSourceVisibilityForEntity(auth: AuthContext, sourceSchoolId: string | null, entitySchoolId: string | null): void {
    if (entitySchoolId === null) {
      if (sourceSchoolId !== null) {
        throw tenantScopeViolation('Global content may only reference global approved sources.');
      }
      return;
    }

    if (sourceSchoolId !== null && sourceSchoolId !== entitySchoolId) {
      throw tenantScopeViolation('Cross-school source linkage is prohibited.');
    }

    if (!auth.schoolId || auth.schoolId !== entitySchoolId) {
      throw tenantScopeViolation('Source linkage is outside authenticated school scope.');
    }
  }

  private async getLineageTarget(link: Record<string, unknown>) {
    const candidates: Array<[string, MasterEntityType | null]> = [
      ['masterCurriculumUnitId', 'units'],
      ['masterTopicId', 'topics'],
      ['masterConceptId', 'concepts'],
      ['masterSkillId', 'skills'],
      ['masterLearningOutcomeId', 'outcomes'],
      ['masterActivityId', 'activities'],
      ['masterProjectId', 'projects'],
      ['masterProjectImplementationId', 'project-implementations'],
      ['masterResourceId', 'resources'],
      ['masterAssessmentTemplateId', 'assessments'],
      ['masterRubricId', 'rubrics'],
    ];

    for (const [key, type] of candidates) {
      const value = link[key];
      if (typeof value === 'string' && type) {
        const entity = (await this.getEntity({ userId: '', schoolId: null, isSuperAdmin: true, permissions: new Set() }, type, value)) as Record<string, unknown>;
        return {
          entityType: type,
          status: this.getStatus(entity),
          schoolId: this.getNullableSchoolId(entity),
        };
      }
    }

    throw badRequest('Lineage target could not be resolved.');
  }

  private async createAudit(
    tx: Prisma.TransactionClient,
    payload: {
      schoolId: string | null;
      actorUserId: string;
      action: string;
      entityType: string;
      entityId: string;
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
        entityType: `master-content:${payload.entityType}`,
        entityId: payload.entityId,
        oldValues: payload.oldValues,
        newValues: payload.newValues,
        reason: payload.reason,
        requestId: payload.requestId,
      },
    });
  }

  private handlePrismaError(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2002' || error.code === 'P2003')
    ) {
      throw databaseConflict('Operation failed due to duplicate or invalid relationship constraint.');
    }
  }
}

export const masterContentService = new MasterContentService();
