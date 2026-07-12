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
): Promise<void> => {
  try {
    await prisma.$transaction(async (tx) => {
      await fn(tx);
    });
    record(name, false, 'Expected rejection did not occur.');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      record(name, true, 'Expected unique-constraint rejection observed.');
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
  username: string,
  schoolId?: string,
  email?: string | null,
) => {
  return tx.user.create({
    data: {
      schoolId,
      firstName: 'Test',
      lastName: 'User',
      username,
      email: email ?? null,
      passwordHash: 'hash-placeholder',
      status: 'ACTIVE',
      mustChangePassword: false,
    },
  });
};

const createRole = async (tx: Prisma.TransactionClient, code: string, schoolId?: string) => {
  return tx.role.create({
    data: {
      schoolId,
      name: `${code}-name`,
      code,
      isSystem: schoolId ? false : true,
      isActive: true,
    },
  });
};

const main = async (): Promise<void> => {
  await runRejects('1) Username case-insensitive global uniqueness', async (tx) => {
    const base = `CaseUser_${nextTag('u')}`;
    await createUser(tx, base);
    await createUser(tx, base.toLowerCase());
  });

  await runAllowsWithRollback('2) Multiple users with null email', async (tx) => {
    await createUser(tx, `nullmail_${nextTag('u')}`, undefined, null);
    await createUser(tx, `nullmail_${nextTag('u')}`, undefined, null);
  });

  await runRejects('3) Email case-insensitive uniqueness for non-null emails', async (tx) => {
    const base = nextTag('mail');
    await createUser(tx, `mailuser_${base}_1`, undefined, `${base}@example.com`);
    await createUser(tx, `mailuser_${base}_2`, undefined, `${base.toUpperCase()}@EXAMPLE.COM`);
  });

  await runRejects('4) School code case-insensitive uniqueness', async (tx) => {
    const base = nextTag('SCH');
    await createSchool(tx, base);
    await createSchool(tx, base.toLowerCase());
  });

  await runRejects('5) Student number uniqueness within prohibited scope', async (tx) => {
    const school = await createSchool(tx, nextTag('SCH'));
    const studentNumber = `STD-${nextTag('N')}`;

    await tx.student.create({
      data: {
        schoolId: school.id,
        studentNumber,
        firstName: 'A',
        lastName: 'B',
        status: 'ACTIVE',
      },
    });

    await tx.student.create({
      data: {
        schoolId: school.id,
        studentNumber,
        firstName: 'C',
        lastName: 'D',
        status: 'ACTIVE',
      },
    });
  });

  await runRejects('6) Admission number unique within same school when non-null', async (tx) => {
    const school = await createSchool(tx, nextTag('SCH'));
    const admissionNumber = `ADM-${nextTag('A')}`;

    await tx.student.create({
      data: {
        schoolId: school.id,
        studentNumber: `SN-${nextTag('S')}`,
        admissionNumber,
        firstName: 'A',
        lastName: 'B',
        status: 'ACTIVE',
      },
    });

    await tx.student.create({
      data: {
        schoolId: school.id,
        studentNumber: `SN-${nextTag('S')}`,
        admissionNumber,
        firstName: 'C',
        lastName: 'D',
        status: 'ACTIVE',
      },
    });
  });

  await runAllowsWithRollback('7) Same admission number allowed across different schools', async (tx) => {
    const schoolA = await createSchool(tx, nextTag('SCHA'));
    const schoolB = await createSchool(tx, nextTag('SCHB'));
    const admissionNumber = `ADM-${nextTag('X')}`;

    await tx.student.create({
      data: {
        schoolId: schoolA.id,
        studentNumber: `SN-${nextTag('S')}`,
        admissionNumber,
        firstName: 'A',
        lastName: 'B',
        status: 'ACTIVE',
      },
    });

    await tx.student.create({
      data: {
        schoolId: schoolB.id,
        studentNumber: `SN-${nextTag('S')}`,
        admissionNumber,
        firstName: 'C',
        lastName: 'D',
        status: 'ACTIVE',
      },
    });
  });

  await runRejects('8) Duplicate active scoped UserRole rejected', async (tx) => {
    const school = await createSchool(tx, nextTag('SCH'));
    const user = await createUser(tx, `roleuser_${nextTag('u')}`, school.id, null);
    const role = await createRole(tx, `teacher_${nextTag('r')}`, school.id);

    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
        schoolId: school.id,
        isActive: true,
      },
    });

    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
        schoolId: school.id,
        isActive: true,
      },
    });
  });

  await runAllowsWithRollback('9) Historical inactive UserRole allowed alongside active', async (tx) => {
    const school = await createSchool(tx, nextTag('SCH'));
    const user = await createUser(tx, `roleuser_${nextTag('u')}`, school.id, null);
    const role = await createRole(tx, `teacher_${nextTag('r')}`, school.id);

    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
        schoolId: school.id,
        isActive: true,
      },
    });

    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
        schoolId: school.id,
        isActive: false,
      },
    });
  });

  await runRejects('10) Duplicate StudentGuardian relationship rejected', async (tx) => {
    const school = await createSchool(tx, nextTag('SCH'));
    const student = await tx.student.create({
      data: {
        schoolId: school.id,
        studentNumber: `SN-${nextTag('S')}`,
        firstName: 'A',
        lastName: 'B',
        status: 'ACTIVE',
      },
    });

    const guardian = await tx.guardian.create({
      data: {
        schoolId: school.id,
        firstName: 'G',
        lastName: 'One',
      },
    });

    await tx.studentGuardian.create({
      data: {
        schoolId: school.id,
        studentId: student.id,
        guardianId: guardian.id,
        relationshipType: 'Guardian',
      },
    });

    await tx.studentGuardian.create({
      data: {
        schoolId: school.id,
        studentId: student.id,
        guardianId: guardian.id,
        relationshipType: 'Guardian',
      },
    });
  });

  await runAllowsWithRollback('11) Deleting user does not delete audit logs', async (tx) => {
    const school = await createSchool(tx, nextTag('SCH'));
    const user = await createUser(tx, `audituser_${nextTag('u')}`, school.id, null);

    const log = await tx.auditLog.create({
      data: {
        schoolId: school.id,
        actorUserId: user.id,
        action: 'user.delete.test',
        entityType: 'User',
        entityId: user.id,
      },
    });

    await tx.user.delete({ where: { id: user.id } });

    const persisted = await tx.auditLog.findUnique({ where: { id: log.id } });

    if (!persisted) {
      throw new Error('Audit log row was removed unexpectedly.');
    }

    if (persisted.actorUserId !== null) {
      throw new Error('Audit log actor reference was not set to null after user delete.');
    }
  });

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
    console.error(`[foundation-constraints-check] fatal: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
