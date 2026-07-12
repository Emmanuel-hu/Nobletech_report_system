import { Prisma, PrismaClient } from '@prisma/client';
import path from 'node:path';

import dotenv from 'dotenv';

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

const createUser = async (
  tx: Prisma.TransactionClient,
  schoolId: string,
  usernamePrefix = 'teacher',
) => {
  return tx.user.create({
    data: {
      schoolId,
      firstName: 'Teacher',
      lastName: 'User',
      username: `${usernamePrefix}_${nextTag('u')}`,
      email: null,
      passwordHash: 'hash-placeholder',
      status: 'ACTIVE',
      mustChangePassword: false,
    },
  });
};

const createSession = async (
  tx: Prisma.TransactionClient,
  schoolId: string,
  code: string,
  isCurrent = false,
  status: 'PLANNED' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED' = 'ACTIVE',
) => {
  return tx.academicSession.create({
    data: {
      schoolId,
      name: `${code}-name`,
      code,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2027-07-31'),
      status,
      isCurrent,
    },
  });
};

const createTerm = async (
  tx: Prisma.TransactionClient,
  schoolId: string,
  academicSessionId: string,
  code: string,
  sequenceOrder: number,
  isCurrent = false,
) => {
  return tx.term.create({
    data: {
      schoolId,
      academicSessionId,
      name: `${code}-name`,
      code,
      sequenceOrder,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-12-20'),
      status: 'ACTIVE',
      isCurrent,
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

const createStudent = async (tx: Prisma.TransactionClient, schoolId: string) => {
  return tx.student.create({
    data: {
      schoolId,
      studentNumber: `SN-${nextTag('s')}`,
      admissionNumber: `ADM-${nextTag('a')}`,
      firstName: 'Learner',
      lastName: 'One',
      status: 'ACTIVE',
    },
  });
};

const main = async (): Promise<void> => {
  await runRejects(
    '1) Duplicate session code in same school rejected',
    async (tx) => {
      const school = await createSchool(tx, nextTag('SCH'));
      const code = `SES-${nextTag('x')}`;
      await createSession(tx, school.id, code);
      await createSession(tx, school.id, code);
    },
    isUniqueViolation,
    'unique-constraint',
  );

  await runAllowsWithRollback('2) Same session code in different schools allowed', async (tx) => {
    const schoolA = await createSchool(tx, nextTag('SCHA'));
    const schoolB = await createSchool(tx, nextTag('SCHB'));
    const code = `SES-${nextTag('x')}`;
    await createSession(tx, schoolA.id, code);
    await createSession(tx, schoolB.id, code);
  });

  await runRejects(
    '3) More than one current active session per school rejected',
    async (tx) => {
      const school = await createSchool(tx, nextTag('SCH'));
      await createSession(tx, school.id, `SES-${nextTag('x')}`, true, 'ACTIVE');
      await createSession(tx, school.id, `SES-${nextTag('x')}`, true, 'ACTIVE');
    },
    isUniqueViolation,
    'partial-unique',
  );

  await runRejects(
    '4) Duplicate term sequence in same session rejected',
    async (tx) => {
      const school = await createSchool(tx, nextTag('SCH'));
      const session = await createSession(tx, school.id, `SES-${nextTag('x')}`);
      await createTerm(tx, school.id, session.id, `T-${nextTag('t')}`, 1);
      await createTerm(tx, school.id, session.id, `T-${nextTag('t')}`, 1);
    },
    isUniqueViolation,
    'unique-constraint',
  );

  await runRejects(
    '5) More than one current term in same school rejected',
    async (tx) => {
      const school = await createSchool(tx, nextTag('SCH'));
      const session = await createSession(tx, school.id, `SES-${nextTag('x')}`);
      await createTerm(tx, school.id, session.id, `T-${nextTag('t')}`, 1, true);
      await createTerm(tx, school.id, session.id, `T-${nextTag('t')}`, 2, true);
    },
    isUniqueViolation,
    'partial-unique',
  );

  await runRejects(
    '6) Duplicate class code in same school rejected',
    async (tx) => {
      const school = await createSchool(tx, nextTag('SCH'));
      const code = `CLS-${nextTag('c')}`;
      await createClass(tx, school.id, code, 1);
      await createClass(tx, school.id, code, 2);
    },
    isUniqueViolation,
    'unique-constraint',
  );

  await runAllowsWithRollback('7) Same class code in different schools allowed', async (tx) => {
    const schoolA = await createSchool(tx, nextTag('SCHA'));
    const schoolB = await createSchool(tx, nextTag('SCHB'));
    const code = `CLS-${nextTag('c')}`;
    await createClass(tx, schoolA.id, code, 1);
    await createClass(tx, schoolB.id, code, 1);
  });

  await runRejects(
    '8) Duplicate active learner enrolment in same session rejected',
    async (tx) => {
      const school = await createSchool(tx, nextTag('SCH'));
      const session = await createSession(tx, school.id, `SES-${nextTag('x')}`);
      const klass = await createClass(tx, school.id, `CLS-${nextTag('c')}`, 1);
      const student = await createStudent(tx, school.id);

      await tx.studentEnrolment.create({
        data: {
          schoolId: school.id,
          studentId: student.id,
          academicSessionId: session.id,
          academicClassId: klass.id,
          enrolmentStatus: 'ACTIVE',
          enrolmentDate: new Date('2026-09-01'),
        },
      });

      await tx.studentEnrolment.create({
        data: {
          schoolId: school.id,
          studentId: student.id,
          academicSessionId: session.id,
          academicClassId: klass.id,
          enrolmentStatus: 'ACTIVE',
          enrolmentDate: new Date('2026-09-02'),
        },
      });
    },
    isUniqueViolation,
    'partial-unique',
  );

  await runAllowsWithRollback('9) Historical enrolments remain possible', async (tx) => {
    const school = await createSchool(tx, nextTag('SCH'));
    const sessionA = await createSession(tx, school.id, `SES-${nextTag('x')}`);
    const sessionB = await createSession(tx, school.id, `SES-${nextTag('x')}`);
    const classA = await createClass(tx, school.id, `CLS-${nextTag('c')}`, 1);
    const classB = await createClass(tx, school.id, `CLS-${nextTag('c')}`, 2);
    const student = await createStudent(tx, school.id);

    await tx.studentEnrolment.create({
      data: {
        schoolId: school.id,
        studentId: student.id,
        academicSessionId: sessionA.id,
        academicClassId: classA.id,
        enrolmentStatus: 'COMPLETED',
        enrolmentDate: new Date('2025-09-01'),
        completionDate: new Date('2026-07-20'),
      },
    });

    await tx.studentEnrolment.create({
      data: {
        schoolId: school.id,
        studentId: student.id,
        academicSessionId: sessionB.id,
        academicClassId: classB.id,
        enrolmentStatus: 'ACTIVE',
        enrolmentDate: new Date('2026-09-01'),
      },
    });
  });

  await runRejects(
    '10) Cross-school enrolment relationship rejected by constraints',
    async (tx) => {
      const schoolA = await createSchool(tx, nextTag('SCHA'));
      const schoolB = await createSchool(tx, nextTag('SCHB'));
      const sessionB = await createSession(tx, schoolB.id, `SES-${nextTag('x')}`);
      const classB = await createClass(tx, schoolB.id, `CLS-${nextTag('c')}`, 1);
      const studentA = await createStudent(tx, schoolA.id);

      await tx.studentEnrolment.create({
        data: {
          schoolId: schoolA.id,
          studentId: studentA.id,
          academicSessionId: sessionB.id,
          academicClassId: classB.id,
          enrolmentStatus: 'ACTIVE',
          enrolmentDate: new Date('2026-09-01'),
        },
      });
    },
    isConstraintViolation,
    'cross-tenant FK/check',
  );

  await runRejects(
    '11) Invalid date ranges rejected where DB checks exist',
    async (tx) => {
      const school = await createSchool(tx, nextTag('SCH'));
      await tx.academicSession.create({
        data: {
          schoolId: school.id,
          name: `SES-${nextTag('x')}-name`,
          code: `SES-${nextTag('x')}`,
          startDate: new Date('2027-07-31'),
          endDate: new Date('2026-09-01'),
          status: 'PLANNED',
          isCurrent: false,
        },
      });
    },
    isConstraintViolation,
    'check-constraint',
  );

  await runRejects(
    '12) Duplicate active teacher class assignment rejected',
    async (tx) => {
      const school = await createSchool(tx, nextTag('SCH'));
      const session = await createSession(tx, school.id, `SES-${nextTag('x')}`);
      const klass = await createClass(tx, school.id, `CLS-${nextTag('c')}`, 1);
      const teacher = await createUser(tx, school.id, 'teacher');

      await tx.academicClassTeacherAssignment.create({
        data: {
          schoolId: school.id,
          userId: teacher.id,
          academicSessionId: session.id,
          academicClassId: klass.id,
          assignmentType: 'CLASS_TEACHER',
          isPrimary: true,
          isActive: true,
          startDate: new Date('2026-09-01'),
        },
      });

      await tx.academicClassTeacherAssignment.create({
        data: {
          schoolId: school.id,
          userId: teacher.id,
          academicSessionId: session.id,
          academicClassId: klass.id,
          assignmentType: 'CLASS_TEACHER',
          isPrimary: false,
          isActive: true,
          startDate: new Date('2026-09-02'),
        },
      });
    },
    isUniqueViolation,
    'partial-unique',
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
    console.error(`[academic-structure-constraints-check] fatal: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
