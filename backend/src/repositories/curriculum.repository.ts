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

  async createAuditLog(data: Prisma.AuditLogUncheckedCreateInput): Promise<void> {
    await this.db.auditLog.create({ data });
  }
}

export const curriculumRepository = new CurriculumRepository();
