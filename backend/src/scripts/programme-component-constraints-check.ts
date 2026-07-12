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

const createUser = async (tx: Prisma.TransactionClient, schoolId: string) => {
  return tx.user.create({
    data: {
      schoolId,
      firstName: 'Verifier',
      lastName: 'User',
      username: `pcv_user_${nextTag('u')}`,
      email: null,
      passwordHash: 'hash-placeholder',
      status: 'ACTIVE',
      mustChangePassword: false,
    },
  });
};

const createSession = async (tx: Prisma.TransactionClient, schoolId: string, code: string) => {
  return tx.academicSession.create({
    data: {
      schoolId,
      name: `${code}-name`,
      code,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2027-07-31'),
      status: 'ACTIVE',
      isCurrent: false,
    },
  });
};

const createTerm = async (tx: Prisma.TransactionClient, schoolId: string, sessionId: string, code: string, order: number) => {
  return tx.term.create({
    data: {
      schoolId,
      academicSessionId: sessionId,
      name: `${code}-name`,
      code,
      sequenceOrder: order,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-12-20'),
      status: 'ACTIVE',
      isCurrent: false,
    },
  });
};

const createClass = async (tx: Prisma.TransactionClient, schoolId: string, code: string, order: number) => {
  return tx.academicClass.create({
    data: {
      schoolId,
      name: `${code}-name`,
      code,
      levelOrder: order,
      status: 'ACTIVE',
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

const createSchoolProgrammeComponent = async (
  tx: Prisma.TransactionClient,
  schoolId: string,
  programmeComponentId: string,
  localCode?: string,
) => {
  return tx.schoolProgrammeComponent.create({
    data: {
      schoolId,
      programmeComponentId,
      localCode,
      isEnabled: true,
      requiresApproval: false,
    },
  });
};

const main = async (): Promise<void> => {
  await runRejects(
    '1) Duplicate Subject code differing only by case is rejected',
    async (tx) => {
      const base = `SUB-${nextTag('s')}`;
      await createSubject(tx, base);
      await createSubject(tx, base.toLowerCase());
    },
    isUniqueViolation,
    'unique-constraint',
  );

  await runRejects(
    '2) Duplicate IntegrationDomain code differing only by case is rejected',
    async (tx) => {
      const base = `DOM-${nextTag('d')}`;
      await createDomain(tx, base);
      await createDomain(tx, base.toLowerCase());
    },
    isUniqueViolation,
    'unique-constraint',
  );

  await runRejects(
    '3) Same SchoolSubject link cannot be duplicated while active',
    async (tx) => {
      const school = await createSchool(tx, `SCH-${nextTag('a')}`);
      const subject = await createSubject(tx, `SUB-${nextTag('a')}`);

      await tx.schoolSubject.create({
        data: {
          schoolId: school.id,
          subjectId: subject.id,
          isEnabled: true,
        },
      });

      await tx.schoolSubject.create({
        data: {
          schoolId: school.id,
          subjectId: subject.id,
          isEnabled: true,
        },
      });
    },
    isUniqueViolation,
    'partial-unique',
  );

  await runRejects(
    '4) Same local subject code in one school is rejected',
    async (tx) => {
      const school = await createSchool(tx, `SCH-${nextTag('b')}`);
      const subjectA = await createSubject(tx, `SUB-${nextTag('b')}`);
      const subjectB = await createSubject(tx, `SUB-${nextTag('c')}`);

      await tx.schoolSubject.create({
        data: {
          schoolId: school.id,
          subjectId: subjectA.id,
          localCode: 'MATH-LOCAL',
          isEnabled: true,
        },
      });

      await tx.schoolSubject.create({
        data: {
          schoolId: school.id,
          subjectId: subjectB.id,
          localCode: 'MATH-LOCAL',
          isEnabled: true,
        },
      });
    },
    isUniqueViolation,
    'partial-unique',
  );

  await runAllowsWithRollback('5) Same local subject code in different schools is allowed', async (tx) => {
    const schoolA = await createSchool(tx, `SCH-${nextTag('c')}`);
    const schoolB = await createSchool(tx, `SCH-${nextTag('d')}`);
    const subjectA = await createSubject(tx, `SUB-${nextTag('d')}`);
    const subjectB = await createSubject(tx, `SUB-${nextTag('e')}`);

    await tx.schoolSubject.create({
      data: {
        schoolId: schoolA.id,
        subjectId: subjectA.id,
        localCode: 'SCI-LOCAL',
      },
    });

    await tx.schoolSubject.create({
      data: {
        schoolId: schoolB.id,
        subjectId: subjectB.id,
        localCode: 'SCI-LOCAL',
      },
    });
  });

  await runRejects(
    '6) Same SchoolProgrammeComponent link cannot be duplicated while active',
    async (tx) => {
      const school = await createSchool(tx, `SCH-${nextTag('e')}`);
      const component = await createProgrammeComponent(tx, `PC-${nextTag('e')}`);
      await createSchoolProgrammeComponent(tx, school.id, component.id);
      await createSchoolProgrammeComponent(tx, school.id, component.id);
    },
    isUniqueViolation,
    'partial-unique',
  );

  await runRejects(
    '7) Duplicate ProgrammeComponentSubject link is rejected',
    async (tx) => {
      const component = await createProgrammeComponent(tx, `PC-${nextTag('f')}`);
      const subject = await createSubject(tx, `SUB-${nextTag('f')}`);

      await tx.programmeComponentSubject.create({
        data: {
          programmeComponentId: component.id,
          subjectId: subject.id,
          isActive: true,
        },
      });

      await tx.programmeComponentSubject.create({
        data: {
          programmeComponentId: component.id,
          subjectId: subject.id,
          isActive: true,
        },
      });
    },
    isUniqueViolation,
    'unique-constraint',
  );

  await runRejects(
    '8) Duplicate ProgrammeComponentIntegrationDomain link is rejected',
    async (tx) => {
      const component = await createProgrammeComponent(tx, `PC-${nextTag('g')}`);
      const domain = await createDomain(tx, `DOM-${nextTag('g')}`);

      await tx.programmeComponentIntegrationDomain.create({
        data: {
          programmeComponentId: component.id,
          integrationDomainId: domain.id,
          isActive: true,
        },
      });

      await tx.programmeComponentIntegrationDomain.create({
        data: {
          programmeComponentId: component.id,
          integrationDomainId: domain.id,
          isActive: true,
        },
      });
    },
    isUniqueViolation,
    'unique-constraint',
  );

  await runRejects(
    '9) Duplicate term programme-component configuration is rejected',
    async (tx) => {
      const school = await createSchool(tx, `SCH-${nextTag('h')}`);
      const session = await createSession(tx, school.id, `SES-${nextTag('h')}`);
      const term = await createTerm(tx, school.id, session.id, `TERM-${nextTag('h')}`, 1);
      const component = await createProgrammeComponent(tx, `PC-${nextTag('h')}`);
      const schoolComponent = await createSchoolProgrammeComponent(tx, school.id, component.id);

      await tx.termProgrammeComponent.create({
        data: {
          schoolId: school.id,
          termId: term.id,
          schoolProgrammeComponentId: schoolComponent.id,
          isEnabled: true,
        },
      });

      await tx.termProgrammeComponent.create({
        data: {
          schoolId: school.id,
          termId: term.id,
          schoolProgrammeComponentId: schoolComponent.id,
          isEnabled: true,
        },
      });
    },
    isUniqueViolation,
    'partial-unique',
  );

  await runRejects(
    '10) Duplicate class programme-component configuration is rejected',
    async (tx) => {
      const school = await createSchool(tx, `SCH-${nextTag('i')}`);
      const session = await createSession(tx, school.id, `SES-${nextTag('i')}`);
      const term = await createTerm(tx, school.id, session.id, `TERM-${nextTag('i')}`, 1);
      const klass = await createClass(tx, school.id, `CLS-${nextTag('i')}`, 1);
      const component = await createProgrammeComponent(tx, `PC-${nextTag('i')}`);
      const schoolComponent = await createSchoolProgrammeComponent(tx, school.id, component.id);

      await tx.classProgrammeComponent.create({
        data: {
          schoolId: school.id,
          academicClassId: klass.id,
          academicSessionId: session.id,
          termId: term.id,
          schoolProgrammeComponentId: schoolComponent.id,
          isEnabled: true,
        },
      });

      await tx.classProgrammeComponent.create({
        data: {
          schoolId: school.id,
          academicClassId: klass.id,
          academicSessionId: session.id,
          termId: term.id,
          schoolProgrammeComponentId: schoolComponent.id,
          isEnabled: true,
        },
      });
    },
    isUniqueViolation,
    'partial-unique',
  );

  await runRejects(
    '11) Cross-school term/class/component relationships are rejected by constraints',
    async (tx) => {
      const schoolA = await createSchool(tx, `SCH-${nextTag('j')}`);
      const schoolB = await createSchool(tx, `SCH-${nextTag('k')}`);
      const sessionB = await createSession(tx, schoolB.id, `SES-${nextTag('j')}`);
      const termB = await createTerm(tx, schoolB.id, sessionB.id, `TERM-${nextTag('j')}`, 1);
      const component = await createProgrammeComponent(tx, `PC-${nextTag('j')}`);
      const schoolComponentA = await createSchoolProgrammeComponent(tx, schoolA.id, component.id);

      await tx.termProgrammeComponent.create({
        data: {
          schoolId: schoolA.id,
          termId: termB.id,
          schoolProgrammeComponentId: schoolComponentA.id,
          isEnabled: true,
        },
      });
    },
    isConstraintViolation,
    'cross-tenant FK/check',
  );

  await runAllowsWithRollback('12) Historical archived configuration remains possible', async (tx) => {
    const school = await createSchool(tx, `SCH-${nextTag('l')}`);
    const component = await createProgrammeComponent(tx, `PC-${nextTag('l')}`);

    const first = await createSchoolProgrammeComponent(tx, school.id, component.id, 'CODING-LOCAL');

    await tx.schoolProgrammeComponent.update({
      where: { id: first.id },
      data: {
        archivedAt: new Date('2026-12-20T00:00:00.000Z'),
        isEnabled: false,
      },
    });

    await createSchoolProgrammeComponent(tx, school.id, component.id, 'CODING-LOCAL');
  });

  const failed = results.filter((result) => !result.passed);
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
    console.error(`[programme-component-constraints-check] fatal: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
