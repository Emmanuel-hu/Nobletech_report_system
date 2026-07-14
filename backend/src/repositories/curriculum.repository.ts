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

const sourceInclude = {
  sourceContents: {
    orderBy: { sequenceOrder: 'asc' },
  },
  masterContentLinks: {
    orderBy: { createdAt: 'desc' },
  },
} satisfies Prisma.CurriculumSourceInclude;

export type CurriculumAggregate = Prisma.CurriculumGetPayload<{ include: typeof curriculumInclude }>;
export type CurriculumSourceAggregate = Prisma.CurriculumSourceGetPayload<{ include: typeof sourceInclude }>;

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

  async listSources(args: {
    where: Prisma.CurriculumSourceWhereInput;
    skip?: number;
    take?: number;
  }): Promise<CurriculumSourceAggregate[]> {
    return this.db.curriculumSource.findMany({
      where: args.where,
      include: sourceInclude,
      orderBy: [{ updatedAt: 'desc' }],
      ...(typeof args.skip === 'number' ? { skip: args.skip } : {}),
      ...(typeof args.take === 'number' ? { take: args.take } : {}),
    });
  }

  async countSources(where: Prisma.CurriculumSourceWhereInput): Promise<number> {
    return this.db.curriculumSource.count({ where });
  }

  async findSourceById(sourceId: string): Promise<CurriculumSourceAggregate | null> {
    return this.db.curriculumSource.findUnique({
      where: { id: sourceId },
      include: sourceInclude,
    });
  }

  async findSourceRecordById(sourceId: string) {
    return this.db.curriculumSource.findUnique({ where: { id: sourceId } });
  }

  async findSourceContentById(contentId: string) {
    return this.db.curriculumSourceContent.findUnique({
      where: { id: contentId },
      include: { curriculumSource: true },
    });
  }

  async findSourceMasterLinkById(linkId: string) {
    return this.db.curriculumSourceMasterContentLink.findUnique({
      where: { id: linkId },
      include: { curriculumSource: true },
    });
  }

  async listApprovedMasterCatalog(args: {
    type:
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
    schoolId: string;
    q?: string;
    includeGlobal?: boolean;
  }) {
    const scopedWhere = args.includeGlobal === false ? { schoolId: args.schoolId } : { OR: [{ schoolId: args.schoolId }, { schoolId: null }] };
    const q = args.q?.trim();

    if (args.type === 'unit') {
      return this.db.masterCurriculumUnit.findMany({
        where: {
          ...scopedWhere,
          status: 'APPROVED',
          archivedAt: null,
          ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
        },
        orderBy: [{ schoolId: 'desc' }, { title: 'asc' }],
      });
    }

    if (args.type === 'topic') {
      return this.db.masterTopic.findMany({
        where: {
          ...scopedWhere,
          status: 'APPROVED',
          archivedAt: null,
          ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
        },
        orderBy: [{ schoolId: 'desc' }, { title: 'asc' }],
      });
    }

    if (args.type === 'concept') {
      return this.db.masterConcept.findMany({
        where: {
          ...scopedWhere,
          status: 'APPROVED',
          archivedAt: null,
          ...(q
            ? {
                OR: [
                  { name: { contains: q, mode: 'insensitive' } },
                  { definition: { contains: q, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        orderBy: [{ schoolId: 'desc' }, { name: 'asc' }],
      });
    }

    if (args.type === 'skill') {
      return this.db.masterSkill.findMany({
        where: {
          ...scopedWhere,
          status: 'APPROVED',
          archivedAt: null,
          ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
        },
        orderBy: [{ schoolId: 'desc' }, { name: 'asc' }],
      });
    }

    if (args.type === 'learning_outcome') {
      return this.db.masterLearningOutcome.findMany({
        where: {
          ...scopedWhere,
          status: 'APPROVED',
          archivedAt: null,
          ...(q ? { statement: { contains: q, mode: 'insensitive' } } : {}),
        },
        orderBy: [{ schoolId: 'desc' }, { createdAt: 'desc' }],
      });
    }

    if (args.type === 'activity') {
      return this.db.masterActivity.findMany({
        where: {
          ...scopedWhere,
          status: 'APPROVED',
          archivedAt: null,
          ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
        },
        orderBy: [{ schoolId: 'desc' }, { title: 'asc' }],
      });
    }

    if (args.type === 'project') {
      return this.db.masterProject.findMany({
        where: {
          ...scopedWhere,
          status: 'APPROVED',
          archivedAt: null,
          ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
        },
        orderBy: [{ schoolId: 'desc' }, { title: 'asc' }],
      });
    }

    if (args.type === 'project_implementation') {
      return this.db.masterProjectImplementation.findMany({
        where: {
          ...scopedWhere,
          isActive: true,
          ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
        },
        orderBy: [{ schoolId: 'desc' }, { title: 'asc' }],
      });
    }

    if (args.type === 'resource') {
      return this.db.masterResource.findMany({
        where: {
          ...scopedWhere,
          status: 'APPROVED',
          archivedAt: null,
          ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
        },
        orderBy: [{ schoolId: 'desc' }, { title: 'asc' }],
      });
    }

    if (args.type === 'assessment_template') {
      return this.db.masterAssessmentTemplate.findMany({
        where: {
          ...scopedWhere,
          status: 'APPROVED',
          archivedAt: null,
          ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
        },
        orderBy: [{ schoolId: 'desc' }, { title: 'asc' }],
      });
    }

    return this.db.masterRubric.findMany({
      where: {
        ...scopedWhere,
        status: 'APPROVED',
        archivedAt: null,
        ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
      },
      orderBy: [{ schoolId: 'desc' }, { title: 'asc' }],
      include: {
        criteria: {
          orderBy: { sequenceOrder: 'asc' },
          include: { levels: { orderBy: { sequenceOrder: 'asc' } } },
        },
      },
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
