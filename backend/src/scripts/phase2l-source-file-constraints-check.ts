import { Prisma } from '@prisma/client';

import { prisma } from '../config/prisma';

type TestResult = {
  name: string;
  passed: boolean;
  details: string;
};

type SourceSeed = {
  schoolId: string;
  sourceId: string;
  userId: string;
};

const results: TestResult[] = [];

const record = (name: string, passed: boolean, details: string): void => {
  results.push({ name, passed, details });
};

const isConstraintError = (error: unknown): boolean => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === 'P2002' || error.code === 'P2003' || error.code === 'P2004';
  }

  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes('constraint') || message.includes('violates');
};

const runRejects = async (
  name: string,
  action: () => Promise<void>,
): Promise<void> => {
  try {
    await action();
    record(name, false, 'Expected rejection did not occur.');
  } catch (error) {
    if (isConstraintError(error)) {
      record(name, true, 'Expected constraint rejection observed.');
      return;
    }

    const details = error instanceof Error ? error.message : String(error);
    record(name, false, `Unexpected error type: ${details}`);
  }
};

const makeTag = (): string => Math.random().toString(36).slice(2, 10);

const seedSource = async (): Promise<SourceSeed> => {
  const tag = makeTag();

  const school = await prisma.school.create({
    data: {
      code: `P2L-SCH-${tag}`,
      name: `P2L School ${tag}`,
      status: 'ACTIVE',
    },
  });

  const user = await prisma.user.create({
    data: {
      schoolId: school.id,
      firstName: 'Phase',
      lastName: 'TwoL',
      username: `p2l_${tag}`,
      email: null,
      passwordHash: 'placeholder',
      status: 'ACTIVE',
      mustChangePassword: false,
    },
  });

  const source = await prisma.curriculumSource.create({
    data: {
      schoolId: school.id,
      sourceCode: `P2L-SRC-${tag}`,
      title: `P2L Source ${tag}`,
      sourceType: 'SCHOOL_SCHEME_OF_WORK',
      sourceFormat: 'PDF',
      usageRights: 'Internal educational use',
      status: 'DRAFT',
      reviewStatus: 'DRAFT',
      isActive: true,
      uploadedById: user.id,
    },
  });

  return {
    schoolId: school.id,
    sourceId: source.id,
    userId: user.id,
  };
};

const cleanupSeed = async (seed: SourceSeed): Promise<void> => {
  await prisma.curriculumSourceFile.deleteMany({ where: { curriculumSourceId: seed.sourceId } });
  await prisma.curriculumSource.delete({ where: { id: seed.sourceId } });
  await prisma.user.delete({ where: { id: seed.userId } });
  await prisma.school.delete({ where: { id: seed.schoolId } });
};

const createBaseFile = async (seed: SourceSeed, sequenceOrder: number, overrides?: Record<string, unknown>) => {
  return prisma.curriculumSourceFile.create({
    data: {
      curriculumSourceId: seed.sourceId,
      schoolId: seed.schoolId,
      storageProvider: 'LOCAL',
      storageKey: `curriculum-sources/${seed.schoolId}/${seed.sourceId}/${Date.now()}-${Math.random()}.pdf`,
      originalFileName: `source-${sequenceOrder}.pdf`,
      safeFileName: `source-${sequenceOrder}.pdf`,
      fileExtension: '.pdf',
      mimeType: 'application/pdf',
      fileSize: BigInt(1234),
      checksum: `sha-${makeTag()}`,
      checksumAlgorithm: 'SHA256',
      fileCategory: 'SOURCE_DOCUMENT',
      uploadStatus: 'READY',
      scanStatus: 'NOT_CONFIGURED',
      sequenceOrder,
      isPrimary: sequenceOrder === 1,
      isActive: true,
      status: 'ACTIVE',
      uploadedById: seed.userId,
      ...(overrides ?? {}),
    },
  });
};

const main = async (): Promise<void> => {
  const seed = await seedSource();

  try {
    await createBaseFile(seed, 1);

    await runRejects('1) Duplicate sequence order per source is rejected', async () => {
      await createBaseFile(seed, 1);
    });

    await runRejects('2) Superseded file reference must target an existing file id', async () => {
      await createBaseFile(seed, 2, {
        supersededFileId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      });
    });

    await runRejects('3) Source foreign key is enforced', async () => {
      await prisma.curriculumSourceFile.create({
        data: {
          curriculumSourceId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
          schoolId: seed.schoolId,
          storageProvider: 'LOCAL',
          storageKey: `curriculum-sources/${seed.schoolId}/invalid/invalid.pdf`,
          originalFileName: 'invalid.pdf',
          safeFileName: 'invalid.pdf',
          fileExtension: '.pdf',
          mimeType: 'application/pdf',
          fileSize: BigInt(10),
          checksum: `sha-${makeTag()}`,
          checksumAlgorithm: 'SHA256',
          fileCategory: 'SOURCE_DOCUMENT',
          uploadStatus: 'READY',
          scanStatus: 'NOT_CONFIGURED',
          sequenceOrder: 4,
          isPrimary: false,
          isActive: true,
          status: 'ACTIVE',
          uploadedById: seed.userId,
        },
      });
    });

    const passed = results.filter((item) => item.passed).length;
    const failed = results.length - passed;

    const summary = {
      total: results.length,
      passed,
      failed,
      results,
    };

    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);

    if (failed > 0) {
      process.exitCode = 1;
    }
  } finally {
    await cleanupSeed(seed);
  }
};

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[phase2l-source-file-constraints-check] fatal: ${message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
