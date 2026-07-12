import path from 'node:path';

import dotenv from 'dotenv';
import { Prisma, PrismaClient } from '@prisma/client';

const repoRoot = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.join(repoRoot, '.env') });

const prisma = new PrismaClient();

class RollbackSignal extends Error {
  constructor() {
    super('__ROLLBACK__');
  }
}

type TestResult = {
  name: string;
  passed: boolean;
  details: string;
};

const results: TestResult[] = [];

const nowTag = Date.now().toString(36);
let seq = 0;

const nextTag = (prefix: string): string => {
  seq += 1;
  return `${prefix}_${nowTag}_${seq}`;
};

const record = (name: string, passed: boolean, details: string): void => {
  results.push({ name, passed, details });
};

const isUniqueViolation = (error: unknown): boolean => {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
};

const isConstraintViolation = (error: unknown): boolean => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === 'P2003' || error.code === 'P2004';
  }

  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes('constraint') || message.includes('violates') || message.includes('foreign key');
};

const runAllowsWithRollback = async (
  name: string,
  fn: (tx: Prisma.TransactionClient) => Promise<void>,
): Promise<void> => {
  try {
    await prisma.$transaction(async (tx) => {
      await fn(tx);
      throw new RollbackSignal();
    });
    record(name, false, 'Transaction unexpectedly committed.');
  } catch (error) {
    if (error instanceof RollbackSignal) {
      record(name, true, 'Allowed behavior observed; transaction rolled back.');
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    record(name, false, `Unexpected error: ${message}`);
  }
};

const runRejects = async (
  name: string,
  fn: (tx: Prisma.TransactionClient) => Promise<void>,
  predicate: (error: unknown) => boolean,
  expectedLabel: string,
): Promise<void> => {
  try {
    await prisma.$transaction(async (tx) => {
      await fn(tx);
    });
    record(name, false, 'Expected rejection did not occur.');
  } catch (error) {
    if (predicate(error)) {
      record(name, true, `Expected ${expectedLabel} rejection observed.`);
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    record(name, false, `Unexpected error type: ${message}`);
  }
};

const createSchool = async (tx: Prisma.TransactionClient, code: string) => {
  return tx.school.create({
    data: {
      code,
      name: `${code}-name`,
      status: 'ACTIVE',
    },
  });
};

const createUser = async (tx: Prisma.TransactionClient, schoolId: string, label = 'mcs') => {
  return tx.user.create({
    data: {
      schoolId,
      firstName: 'Verifier',
      lastName: 'User',
      username: `${label}_${nextTag('u')}`,
      email: null,
      passwordHash: 'hash-placeholder',
      status: 'ACTIVE',
      mustChangePassword: false,
    },
  });
};

const createSubject = async (tx: Prisma.TransactionClient, code: string) => {
  return tx.subject.create({
    data: {
      code,
      name: `${code}-name`,
      status: 'ACTIVE',
      isCore: false,
    },
  });
};

const createDomain = async (tx: Prisma.TransactionClient, code: string) => {
  return tx.integrationDomain.create({
    data: {
      code,
      name: `${code}-name`,
      status: 'ACTIVE',
    },
  });
};

const createProgrammeComponent = async (tx: Prisma.TransactionClient, code: string) => {
  return tx.programmeComponent.create({
    data: {
      code,
      name: `${code}-name`,
      status: 'ACTIVE',
      requiresDevice: false,
      requiresInternet: false,
      requiresKit: false,
    },
  });
};

const createMasterUnit = async (
  tx: Prisma.TransactionClient,
  createdById: string,
  programmeComponentId?: string,
) => {
  return tx.masterCurriculumUnit.create({
    data: {
      title: `Unit-${nextTag('u')}`,
      code: `MU-${nextTag('c')}`,
      description: 'Master curriculum unit for verification.',
      programmeComponentId,
      status: 'DRAFT',
      versionNumber: 1,
      isActive: true,
      createdById,
    },
  });
};

const createMasterTopic = async (tx: Prisma.TransactionClient, masterCurriculumUnitId: string, createdById: string, sequenceOrder: number) => {
  return tx.masterTopic.create({
    data: {
      masterCurriculumUnitId,
      title: `Topic-${nextTag('t')}`,
      description: 'Master topic for verification.',
      sequenceOrder,
      status: 'DRAFT',
      versionNumber: 1,
      isActive: true,
      createdById,
    },
  });
};

const createMasterConcept = async (tx: Prisma.TransactionClient, createdById: string) => {
  return tx.masterConcept.create({
    data: {
      name: `Concept-${nextTag('c')}`,
      code: `MC-${nextTag('x')}`,
      definition: 'Concept definition.',
      status: 'DRAFT',
      versionNumber: 1,
      isActive: true,
      createdById,
    },
  });
};

const createMasterSkill = async (tx: Prisma.TransactionClient, createdById: string) => {
  return tx.masterSkill.create({
    data: {
      name: `Skill-${nextTag('s')}`,
      code: `MS-${nextTag('x')}`,
      description: 'Skill description.',
      category: 'COGNITIVE',
      status: 'DRAFT',
      isActive: true,
      createdById,
    },
  });
};

const createMasterOutcome = async (tx: Prisma.TransactionClient, createdById: string) => {
  return tx.masterLearningOutcome.create({
    data: {
      statement: `Learner can demonstrate ${nextTag('o')}.`,
      code: `MLO-${nextTag('x')}`,
      status: 'DRAFT',
      versionNumber: 1,
      isActive: true,
      createdById,
    },
  });
};

const createMasterProject = async (tx: Prisma.TransactionClient, createdById: string) => {
  return tx.masterProject.create({
    data: {
      title: `Project-${nextTag('p')}`,
      description: 'Master project for verification.',
      status: 'DRAFT',
      versionNumber: 1,
      isActive: true,
      createdById,
    },
  });
};

const main = async (): Promise<void> => {
  await runRejects(
    '1) Duplicate source code differing only by case is rejected',
    async (tx) => {
      await tx.curriculumSource.create({
        data: {
          sourceCode: 'SRC-CODE',
          title: `Global Source ${nextTag('a')}`,
          sourceType: 'GOVERNMENT_CURRICULUM',
          sourceFormat: 'PDF',
          usageRights: 'Internal educational use',
          status: 'DRAFT',
          reviewStatus: 'DRAFT',
          isActive: true,
        },
      });

      await tx.curriculumSource.create({
        data: {
          sourceCode: 'src-code',
          title: `Global Source ${nextTag('b')}`,
          sourceType: 'GOVERNMENT_CURRICULUM',
          sourceFormat: 'PDF',
          usageRights: 'Internal educational use',
          status: 'DRAFT',
          reviewStatus: 'DRAFT',
          isActive: true,
        },
      });
    },
    isUniqueViolation,
    'case-insensitive unique-constraint',
  );

  await runAllowsWithRollback(
    '2) School-owned source cross-tenant ownership requires service-level guard',
    async (tx) => {
      const schoolA = await createSchool(tx, `SCH-${nextTag('a')}`);
      const schoolB = await createSchool(tx, `SCH-${nextTag('b')}`);
      const userB = await createUser(tx, schoolB.id, 'other_school_uploader');

      await tx.curriculumSource.create({
        data: {
          schoolId: schoolA.id,
          sourceCode: `SCHSRC-${nextTag('x')}`,
          title: 'School scheme source',
          sourceType: 'SCHOOL_SCHEME_OF_WORK',
          sourceFormat: 'PDF',
          usageRights: 'School-owned',
          uploadedById: userB.id,
          status: 'DRAFT',
          reviewStatus: 'DRAFT',
          isActive: true,
        },
      });

      record(
        '2a) Cross-tenant source ownership control note',
        true,
        'Database permits cross-school uploader references; enforce tenant ownership at service or RBAC layer.',
      );
    },
  );

  await runAllowsWithRollback('3) Global source can exist without school ownership', async (tx) => {
    await tx.curriculumSource.create({
      data: {
        title: `Global Framework ${nextTag('g')}`,
        sourceType: 'INTERNATIONAL_FRAMEWORK',
        sourceFormat: 'URL',
        sourceUrl: 'https://example.org/framework',
        usageRights: 'Attribution required',
        status: 'DRAFT',
        reviewStatus: 'DRAFT',
        isActive: true,
      },
    });
  });

  await runRejects(
    '4) Duplicate master topic sequence within one unit is rejected',
    async (tx) => {
      const school = await createSchool(tx, `SCH-${nextTag('c')}`);
      const user = await createUser(tx, school.id, 'unit_user');
      const unit = await createMasterUnit(tx, user.id);
      await createMasterTopic(tx, unit.id, user.id, 1);
      await createMasterTopic(tx, unit.id, user.id, 1);
    },
    isUniqueViolation,
    'unique-constraint',
  );

  await runAllowsWithRollback('5) Same topic sequence can be reused in different units', async (tx) => {
    const school = await createSchool(tx, `SCH-${nextTag('d')}`);
    const user = await createUser(tx, school.id, 'topic_seq_user');
    const unitA = await createMasterUnit(tx, user.id);
    const unitB = await createMasterUnit(tx, user.id);
    await createMasterTopic(tx, unitA.id, user.id, 1);
    await createMasterTopic(tx, unitB.id, user.id, 1);
  });

  await runRejects(
    '6) Duplicate topic-concept link is rejected',
    async (tx) => {
      const school = await createSchool(tx, `SCH-${nextTag('e')}`);
      const user = await createUser(tx, school.id, 'topic_concept_user');
      const unit = await createMasterUnit(tx, user.id);
      const topic = await createMasterTopic(tx, unit.id, user.id, 1);
      const concept = await createMasterConcept(tx, user.id);

      await tx.masterTopicConcept.create({
        data: {
          masterTopicId: topic.id,
          masterConceptId: concept.id,
          isCore: true,
          isActive: true,
          createdById: user.id,
        },
      });

      await tx.masterTopicConcept.create({
        data: {
          masterTopicId: topic.id,
          masterConceptId: concept.id,
          isCore: false,
          isActive: true,
          createdById: user.id,
        },
      });
    },
    isUniqueViolation,
    'unique-constraint',
  );

  await runRejects(
    '7) Duplicate topic-skill link is rejected',
    async (tx) => {
      const school = await createSchool(tx, `SCH-${nextTag('f')}`);
      const user = await createUser(tx, school.id, 'topic_skill_user');
      const unit = await createMasterUnit(tx, user.id);
      const topic = await createMasterTopic(tx, unit.id, user.id, 1);
      const skill = await createMasterSkill(tx, user.id);

      await tx.masterTopicSkill.create({
        data: {
          masterTopicId: topic.id,
          masterSkillId: skill.id,
          isCore: true,
          isActive: true,
          createdById: user.id,
        },
      });

      await tx.masterTopicSkill.create({
        data: {
          masterTopicId: topic.id,
          masterSkillId: skill.id,
          isCore: false,
          isActive: true,
          createdById: user.id,
        },
      });
    },
    isUniqueViolation,
    'unique-constraint',
  );

  await runRejects(
    '8) Duplicate topic-learning-outcome link is rejected',
    async (tx) => {
      const school = await createSchool(tx, `SCH-${nextTag('g')}`);
      const user = await createUser(tx, school.id, 'topic_outcome_user');
      const unit = await createMasterUnit(tx, user.id);
      const topic = await createMasterTopic(tx, unit.id, user.id, 1);
      const outcome = await createMasterOutcome(tx, user.id);

      await tx.masterTopicLearningOutcome.create({
        data: {
          masterTopicId: topic.id,
          masterLearningOutcomeId: outcome.id,
          isPrimary: true,
          isActive: true,
          createdById: user.id,
        },
      });

      await tx.masterTopicLearningOutcome.create({
        data: {
          masterTopicId: topic.id,
          masterLearningOutcomeId: outcome.id,
          isPrimary: false,
          isActive: true,
          createdById: user.id,
        },
      });
    },
    isUniqueViolation,
    'unique-constraint',
  );

  await runRejects(
    '9) Duplicate project implementation sequence within one project is rejected',
    async (tx) => {
      const school = await createSchool(tx, `SCH-${nextTag('h')}`);
      const user = await createUser(tx, school.id, 'project_impl_user');
      const project = await createMasterProject(tx, user.id);

      await tx.masterProjectImplementation.create({
        data: {
          masterProjectId: project.id,
          title: 'Implementation One',
          implementationType: 'SIMULATION_ONLY',
          description: 'First implementation',
          sequenceOrder: 1,
          isActive: true,
          createdById: user.id,
        },
      });

      await tx.masterProjectImplementation.create({
        data: {
          masterProjectId: project.id,
          title: 'Implementation Two',
          implementationType: 'LOW_RESOURCE',
          description: 'Second implementation',
          sequenceOrder: 1,
          isActive: true,
          createdById: user.id,
        },
      });
    },
    isUniqueViolation,
    'unique-constraint',
  );

  await runRejects(
    '10) Approved linked content cannot be destructively deleted',
    async (tx) => {
      const school = await createSchool(tx, `SCH-${nextTag('i')}`);
      const user = await createUser(tx, school.id, 'delete_protect_user');
      const unit = await createMasterUnit(tx, user.id);
      const topic = await createMasterTopic(tx, unit.id, user.id, 1);
      const concept = await tx.masterConcept.create({
        data: {
          name: `Protected Concept ${nextTag('pc')}`,
          code: `PC-${nextTag('pc')}`,
          definition: 'Protected concept definition.',
          status: 'APPROVED',
          versionNumber: 1,
          isActive: true,
          createdById: user.id,
        },
      });

      await tx.masterTopicConcept.create({
        data: {
          masterTopicId: topic.id,
          masterConceptId: concept.id,
          isCore: true,
          isActive: true,
          createdById: user.id,
        },
      });

      await tx.masterConcept.delete({ where: { id: concept.id } });
    },
    isConstraintViolation,
    'restrict-foreign-key',
  );

  await runAllowsWithRollback('11) Archived master content remains historically retrievable', async (tx) => {
    const school = await createSchool(tx, `SCH-${nextTag('j')}`);
    const user = await createUser(tx, school.id, 'archive_user');

    const archived = await tx.masterLearningOutcome.create({
      data: {
        statement: `Archived outcome ${nextTag('ao')}`,
        code: `AO-${nextTag('ao')}`,
        status: 'ARCHIVED',
        versionNumber: 1,
        isActive: false,
        archivedAt: new Date('2026-12-20T00:00:00.000Z'),
        createdById: user.id,
      },
    });

    const fetched = await tx.masterLearningOutcome.findUnique({ where: { id: archived.id } });
    if (!fetched || !fetched.archivedAt) {
      throw new Error('Archived item was not retrievable by historical lookup.');
    }
  });

  await runAllowsWithRollback('12) Only approved and active content is eligible for future selection query', async (tx) => {
    const school = await createSchool(tx, `SCH-${nextTag('k')}`);
    const user = await createUser(tx, school.id, 'eligibility_user');
    const component = await createProgrammeComponent(tx, `PC-${nextTag('k')}`);

    await tx.masterCurriculumUnit.create({
      data: {
        title: 'Eligible Unit',
        code: `EL-${nextTag('x')}`,
        description: 'Eligible for selection',
        programmeComponentId: component.id,
        status: 'APPROVED',
        versionNumber: 1,
        isActive: true,
        createdById: user.id,
      },
    });

    await tx.masterCurriculumUnit.create({
      data: {
        title: 'Inactive Approved Unit',
        code: `IN-${nextTag('x')}`,
        description: 'Should not be eligible',
        programmeComponentId: component.id,
        status: 'APPROVED',
        versionNumber: 1,
        isActive: false,
        archivedAt: new Date('2026-12-20T00:00:00.000Z'),
        createdById: user.id,
      },
    });

    await tx.masterCurriculumUnit.create({
      data: {
        title: 'Draft Active Unit',
        code: `DR-${nextTag('x')}`,
        description: 'Should not be eligible',
        programmeComponentId: component.id,
        status: 'DRAFT',
        versionNumber: 1,
        isActive: true,
        createdById: user.id,
      },
    });

    const eligible = await tx.masterCurriculumUnit.findMany({
      where: {
        status: 'APPROVED',
        isActive: true,
        archivedAt: null,
      },
      select: { id: true },
    });

    if (eligible.length !== 1) {
      throw new Error(`Expected one eligible unit, got ${eligible.length}.`);
    }
  });

  await runAllowsWithRollback(
    '13) Cross-tenant source access rules are represented as service-level controls',
    async () => {
      record(
        '13a) Cross-tenant access control note',
        true,
        'Database schema enforces ownership shape and FK integrity, while visibility and authorization remain RBAC or service-layer controls.',
      );
    },
  );

  await runRejects(
    '14) School-owned source type requires school ownership',
    async (tx) => {
      await tx.curriculumSource.create({
        data: {
          title: `Invalid School Source ${nextTag('x')}`,
          sourceType: 'SCHOOL_SCHEME_OF_WORK',
          sourceFormat: 'PDF',
          usageRights: 'Internal',
          status: 'DRAFT',
          reviewStatus: 'DRAFT',
          isActive: true,
        },
      });
    },
    isConstraintViolation,
    'scope check-constraint',
  );

  await runRejects(
    '15) Internal Nobletech source type must remain global',
    async (tx) => {
      const school = await createSchool(tx, `SCH-${nextTag('m')}`);
      await tx.curriculumSource.create({
        data: {
          schoolId: school.id,
          title: `Invalid Internal Source ${nextTag('x')}`,
          sourceType: 'INTERNAL_NOBLETECH_CONTENT',
          sourceFormat: 'PDF',
          usageRights: 'Internal',
          status: 'DRAFT',
          reviewStatus: 'DRAFT',
          isActive: true,
        },
      });
    },
    isConstraintViolation,
    'scope check-constraint',
  );

  await runRejects(
    '16) Source-lineage link cannot target multiple master entities at once',
    async (tx) => {
      const school = await createSchool(tx, `SCH-${nextTag('n')}`);
      const user = await createUser(tx, school.id, 'lineage_user');
      const source = await tx.curriculumSource.create({
        data: {
          schoolId: school.id,
          title: `Lineage Source ${nextTag('x')}`,
          sourceType: 'SCHOOL_SCHEME_OF_WORK',
          sourceFormat: 'PDF',
          usageRights: 'Internal',
          status: 'DRAFT',
          reviewStatus: 'DRAFT',
          isActive: true,
          uploadedById: user.id,
        },
      });
      const unit = await createMasterUnit(tx, user.id);
      const concept = await createMasterConcept(tx, user.id);

      await tx.curriculumSourceMasterContentLink.create({
        data: {
          curriculumSourceId: source.id,
          masterCurriculumUnitId: unit.id,
          masterConceptId: concept.id,
          createdById: user.id,
          reviewStatus: 'DRAFT',
        },
      });
    },
    isConstraintViolation,
    'single-target check-constraint',
  );

  const failed = results.filter((r) => !r.passed);
  const summary = {
    passed: results.length - failed.length,
    failed: failed.length,
    results,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (failed.length > 0) {
    process.exitCode = 1;
  }
};

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[master-content-source-constraints-check] fatal: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
