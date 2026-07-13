import type { Prisma, PrismaClient } from '@prisma/client';

import { prisma } from '../config/prisma';

const curriculumInclude = {
  schoolProgrammeComponent: true,
  units: {
    where: { archivedAt: null },
    orderBy: { sequenceOrder: 'asc' },
    include: {
      topics: {
        where: { archivedAt: null },
        orderBy: { sequenceOrder: 'asc' },
        include: {
          conceptLinks: { orderBy: { sequenceOrder: 'asc' } },
          topicProjects: {
            orderBy: { sequenceOrder: 'asc' },
            include: { curriculumProject: true },
          },
          topicLearningOutcomes: {
            orderBy: { sequenceOrder: 'asc' },
            include: { curriculumLearningOutcome: true },
          },
          resources: { where: { archivedAt: null }, orderBy: { createdAt: 'asc' } },
        },
      },
      projects: {
        where: { archivedAt: null },
        orderBy: { sequenceOrder: 'asc' },
        include: {
          implementations: { orderBy: { sequenceOrder: 'asc' } },
          topicLinks: { orderBy: { sequenceOrder: 'asc' } },
          projectLearningOutcomes: {
            orderBy: { sequenceOrder: 'asc' },
            include: { curriculumLearningOutcome: true },
          },
        },
      },
    },
  },
  concepts: { where: { archivedAt: null }, orderBy: { createdAt: 'asc' } },
  learningOutcomes: { where: { archivedAt: null }, orderBy: { createdAt: 'asc' } },
  resources: { where: { archivedAt: null }, orderBy: { createdAt: 'asc' } },
  versions: { where: { archivedAt: null }, orderBy: [{ majorVersion: 'desc' }, { minorVersion: 'desc' }, { patchVersion: 'desc' }] },
  visibilitySetting: true,
  assignments: { where: { archivedAt: null }, orderBy: { createdAt: 'desc' } },
  reviewActions: { orderBy: { actedAt: 'desc' } },
  statusHistory: { orderBy: { changedAt: 'desc' } },
} satisfies Prisma.CurriculumInclude;

export type CurriculumAggregate = Prisma.CurriculumGetPayload<{ include: typeof curriculumInclude }>;

export class CurriculumRepository {
  private readonly db: PrismaClient;

  constructor(db: PrismaClient = prisma) {
    this.db = db;
  }

  get client(): PrismaClient {
    return this.db;
  }

  async findCurriculumById(curriculumId: string): Promise<CurriculumAggregate | null> {
    return this.db.curriculum.findUnique({
      where: { id: curriculumId },
      include: curriculumInclude,
    });
  }

  async listCurricula(where: Prisma.CurriculumWhereInput): Promise<CurriculumAggregate[]> {
    return this.db.curriculum.findMany({
      where,
      include: curriculumInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findSchoolProgrammeComponent(id: string, schoolId: string) {
    return this.db.schoolProgrammeComponent.findFirst({
      where: { id, schoolId, archivedAt: null },
    });
  }

  async findTerm(termId: string, schoolId: string) {
    return this.db.term.findFirst({
      where: { id: termId, schoolId, archivedAt: null },
    });
  }

  async findSession(sessionId: string, schoolId: string) {
    return this.db.academicSession.findFirst({
      where: { id: sessionId, schoolId, archivedAt: null },
    });
  }

  async findAcademicClass(classId: string, schoolId: string) {
    return this.db.academicClass.findFirst({
      where: { id: classId, schoolId, archivedAt: null },
    });
  }

  async findUserInSchool(userId: string, schoolId: string) {
    return this.db.user.findFirst({ where: { id: userId, schoolId, status: 'ACTIVE' } });
  }

  async listSessions(schoolId: string) {
    return this.db.academicSession.findMany({
      where: { schoolId, archivedAt: null },
      orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
    });
  }

  async listTerms(schoolId: string, sessionId?: string) {
    return this.db.term.findMany({
      where: {
        schoolId,
        archivedAt: null,
        ...(sessionId ? { academicSessionId: sessionId } : {}),
      },
      orderBy: [{ academicSessionId: 'desc' }, { sequenceOrder: 'asc' }],
    });
  }

  async listAcademicClasses(schoolId: string) {
    return this.db.academicClass.findMany({
      where: { schoolId, archivedAt: null },
      orderBy: [{ levelOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async listEnabledSchoolProgrammeComponents(schoolId: string) {
    return this.db.schoolProgrammeComponent.findMany({
      where: { schoolId, archivedAt: null, isEnabled: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async listEligibleSchoolUsers(schoolId: string) {
    return this.db.user.findMany({
      where: { schoolId, status: 'ACTIVE' },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
      },
    });
  }

  async listMasterConcepts(schoolId: string) {
    return this.db.masterConcept.findMany({
      where: {
        archivedAt: null,
        status: 'APPROVED',
        OR: [{ schoolId: null }, { schoolId }],
      },
      orderBy: [{ schoolId: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        schoolId: true,
        name: true,
        code: true,
        definition: true,
      },
    });
  }

  async listMasterLearningOutcomes(schoolId: string) {
    return this.db.masterLearningOutcome.findMany({
      where: {
        archivedAt: null,
        status: 'APPROVED',
        OR: [{ schoolId: null }, { schoolId }],
      },
      orderBy: [{ schoolId: 'desc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        schoolId: true,
        statement: true,
        code: true,
        bloomLevel: true,
        measurableVerb: true,
      },
    });
  }

  async listMasterResources(schoolId: string) {
    return this.db.masterResource.findMany({
      where: {
        archivedAt: null,
        status: 'APPROVED',
        OR: [{ schoolId: null }, { schoolId }],
      },
      orderBy: [{ schoolId: 'desc' }, { title: 'asc' }],
      select: {
        id: true,
        schoolId: true,
        title: true,
        resourceType: true,
        description: true,
      },
    });
  }

  async createAuditLog(data: Prisma.AuditLogUncheckedCreateInput): Promise<void> {
    await this.db.auditLog.create({ data });
  }
}

export const curriculumRepository = new CurriculumRepository();
