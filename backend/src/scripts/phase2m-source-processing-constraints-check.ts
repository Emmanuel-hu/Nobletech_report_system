import { Prisma } from '@prisma/client';

import { prisma } from '../config/prisma';

type TestResult = {
  name: string;
  passed: boolean;
  details: string;
};

type Seed = {
  schoolId: string;
  userId: string;
  sourceId: string;
  sourceFileId: string;
  processingSessionId: string;
  sectionId: string;
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

const runRejects = async (name: string, action: () => Promise<void>): Promise<void> => {
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

const seedRecords = async (): Promise<Seed> => {
  const tag = makeTag();

  const school = await prisma.school.create({
    data: {
      code: `P2M-SCH-${tag}`,
      name: `P2M School ${tag}`,
      status: 'ACTIVE',
    },
  });

  const user = await prisma.user.create({
    data: {
      schoolId: school.id,
      firstName: 'Phase',
      lastName: 'TwoM',
      username: `p2m_${tag}`,
      email: null,
      passwordHash: 'placeholder',
      status: 'ACTIVE',
      mustChangePassword: false,
    },
  });

  const source = await prisma.curriculumSource.create({
    data: {
      schoolId: school.id,
      sourceCode: `P2M-SRC-${tag}`,
      title: `P2M Source ${tag}`,
      sourceType: 'SCHOOL_SCHEME_OF_WORK',
      sourceFormat: 'PDF',
      usageRights: 'Internal educational use',
      status: 'DRAFT',
      reviewStatus: 'DRAFT',
      isActive: true,
      uploadedById: user.id,
    },
  });

  const sourceFile = await prisma.curriculumSourceFile.create({
    data: {
      curriculumSourceId: source.id,
      schoolId: school.id,
      storageProvider: 'LOCAL',
      storageKey: `curriculum-sources/${school.id}/${source.id}/${tag}.pdf`,
      originalFileName: `${tag}.pdf`,
      safeFileName: `${tag}.pdf`,
      fileExtension: '.pdf',
      mimeType: 'application/pdf',
      fileSize: BigInt(2048),
      checksum: `sha-${tag}`,
      checksumAlgorithm: 'SHA256',
      fileCategory: 'SOURCE_DOCUMENT',
      uploadStatus: 'READY',
      scanStatus: 'NOT_CONFIGURED',
      sequenceOrder: 1,
      isPrimary: true,
      isActive: true,
      status: 'ACTIVE',
      uploadedById: user.id,
    },
  });

  const processingSession = await prisma.curriculumSourceProcessingSession.create({
    data: {
      schoolId: school.id,
      curriculumSourceId: source.id,
      curriculumSourceFileId: sourceFile.id,
      sourceFileVersion: sourceFile.documentVersion,
      status: 'IN_PROGRESS',
      processingMethod: 'MANUAL',
      startedById: user.id,
      revisionNumber: 1,
      lastKnownSourceChecksum: sourceFile.checksum,
    },
  });

  const section = await prisma.curriculumSourceSection.create({
    data: {
      processingSessionId: processingSession.id,
      sectionType: 'UNIT',
      heading: 'Unit 1',
      rawText: 'Manual extraction text',
      sequenceOrder: 1,
      createdById: user.id,
      updatedById: user.id,
    },
  });

  return {
    schoolId: school.id,
    userId: user.id,
    sourceId: source.id,
    sourceFileId: sourceFile.id,
    processingSessionId: processingSession.id,
    sectionId: section.id,
  };
};

const cleanupSeed = async (seed: Seed): Promise<void> => {
  await prisma.curriculumSourceContent.deleteMany({ where: { processingSessionId: seed.processingSessionId } });
  await prisma.curriculumSourceSection.deleteMany({ where: { processingSessionId: seed.processingSessionId } });
  await prisma.curriculumSourceProcessingSession.deleteMany({ where: { id: seed.processingSessionId } });
  await prisma.curriculumSourceFile.deleteMany({ where: { curriculumSourceId: seed.sourceId } });
  await prisma.curriculumSource.delete({ where: { id: seed.sourceId } });
  await prisma.user.delete({ where: { id: seed.userId } });
  await prisma.school.delete({ where: { id: seed.schoolId } });
};

const main = async (): Promise<void> => {
  const seed = await seedRecords();

  try {
    await runRejects('1) Duplicate processing revision per source is rejected', async () => {
      await prisma.curriculumSourceProcessingSession.create({
        data: {
          schoolId: seed.schoolId,
          curriculumSourceId: seed.sourceId,
          curriculumSourceFileId: seed.sourceFileId,
          status: 'IN_PROGRESS',
          processingMethod: 'MANUAL',
          startedById: seed.userId,
          revisionNumber: 1,
          lastKnownSourceChecksum: 'sha-duplicate',
        },
      });
    });

    await runRejects('2) Duplicate section order under same parent is rejected', async () => {
      await prisma.curriculumSourceSection.create({
        data: {
          processingSessionId: seed.processingSessionId,
          parentSectionId: seed.sectionId,
          sectionType: 'TOPIC',
          heading: 'Topic duplicate order',
          rawText: 'Raw',
          sequenceOrder: 1,
          createdById: seed.userId,
          updatedById: seed.userId,
        },
      });

      await prisma.curriculumSourceSection.create({
        data: {
          processingSessionId: seed.processingSessionId,
          parentSectionId: seed.sectionId,
          sectionType: 'TOPIC',
          heading: 'Topic duplicate order 2',
          rawText: 'Raw 2',
          sequenceOrder: 1,
          createdById: seed.userId,
          updatedById: seed.userId,
        },
      });
    });

    await runRejects('3) Content section reference requires existing section id', async () => {
      await prisma.curriculumSourceContent.create({
        data: {
          curriculumSourceId: seed.sourceId,
          sequenceOrder: 10,
          contentType: 'UNIT',
          heading: 'Ghost section reference',
          rawText: 'Raw',
          extractionMethod: 'MANUAL',
          reviewStatus: 'DRAFT',
          createdById: seed.userId,
          processingSessionId: seed.processingSessionId,
          sectionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          sourceFileId: seed.sourceFileId,
          sourceFileChecksum: 'sha-x',
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
    process.stderr.write(`[phase2m-source-processing-constraints-check] fatal: ${message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
