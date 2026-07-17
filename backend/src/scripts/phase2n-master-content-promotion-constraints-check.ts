import { Prisma } from '@prisma/client';

import { prisma } from '../config/prisma';

type Result = {
  name: string;
  passed: boolean;
  details: string;
};

const results: Result[] = [];

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

const main = async (): Promise<void> => {
  const tag = makeTag();

  const school = await prisma.school.create({
    data: { code: `P2N-SCH-${tag}`, name: `P2N School ${tag}`, status: 'ACTIVE' },
  });

  const user = await prisma.user.create({
    data: {
      schoolId: school.id,
      firstName: 'Phase',
      lastName: 'TwoN',
      username: `p2n_${tag}`,
      email: null,
      passwordHash: 'placeholder',
      status: 'ACTIVE',
      mustChangePassword: false,
    },
  });

  const source = await prisma.curriculumSource.create({
    data: {
      schoolId: school.id,
      sourceCode: `P2N-SRC-${tag}`,
      title: `P2N Source ${tag}`,
      sourceType: 'SCHOOL_SCHEME_OF_WORK',
      sourceFormat: 'PDF',
      usageRights: 'Internal',
      status: 'DRAFT',
      reviewStatus: 'APPROVED',
      isActive: true,
      uploadedById: user.id,
    },
  });

  const sourceFile = await prisma.curriculumSourceFile.create({
    data: {
      curriculumSourceId: source.id,
      schoolId: school.id,
      storageProvider: 'LOCAL',
      storageKey: `sources/${tag}.pdf`,
      originalFileName: `${tag}.pdf`,
      safeFileName: `${tag}.pdf`,
      fileExtension: '.pdf',
      mimeType: 'application/pdf',
      fileSize: BigInt(1024),
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
      status: 'APPROVED',
      processingMethod: 'MANUAL',
      startedById: user.id,
      revisionNumber: 1,
      lastKnownSourceChecksum: sourceFile.checksum,
    },
  });

  const content = await prisma.curriculumSourceContent.create({
    data: {
      curriculumSourceId: source.id,
      sequenceOrder: 1,
      contentType: 'UNIT',
      heading: 'Unit 1',
      rawText: 'Unit raw text',
      extractionMethod: 'MANUAL',
      reviewStatus: 'APPROVED',
      createdById: user.id,
      processingSessionId: processingSession.id,
      sourceFileId: sourceFile.id,
      sourceFileChecksum: sourceFile.checksum,
    },
  });

  const promotion = await prisma.masterContentPromotion.create({
    data: {
      schoolId: school.id,
      curriculumSourceId: source.id,
      processingSessionId: processingSession.id,
      curriculumSourceFileId: sourceFile.id,
      requestedById: user.id,
      sourceChecksum: sourceFile.checksum,
      sourceRevisionNumber: 1,
    },
  });

  await runRejects('1) Duplicate source content in same promotion is rejected', async () => {
    await prisma.masterContentPromotionItem.create({
      data: {
        promotionId: promotion.id,
        sourceContentId: content.id,
        sourceRecordType: 'UNIT',
        targetMasterContentType: 'CURRICULUM_UNIT',
        sequenceOrder: 1,
        processingRevisionNumber: 1,
        createdById: user.id,
      },
    });

    await prisma.masterContentPromotionItem.create({
      data: {
        promotionId: promotion.id,
        sourceContentId: content.id,
        sourceRecordType: 'UNIT',
        targetMasterContentType: 'CURRICULUM_UNIT',
        sequenceOrder: 2,
        processingRevisionNumber: 1,
        createdById: user.id,
      },
    });
  });

  await runRejects('2) Duplicate item sequence within promotion is rejected', async () => {
    const contentTwo = await prisma.curriculumSourceContent.create({
      data: {
        curriculumSourceId: source.id,
        sequenceOrder: 2,
        contentType: 'TOPIC',
        heading: 'Topic 1',
        rawText: 'Topic raw text',
        extractionMethod: 'MANUAL',
        reviewStatus: 'APPROVED',
        createdById: user.id,
        processingSessionId: processingSession.id,
        sourceFileId: sourceFile.id,
        sourceFileChecksum: sourceFile.checksum,
      },
    });

    await prisma.masterContentPromotionItem.create({
      data: {
        promotionId: promotion.id,
        sourceContentId: contentTwo.id,
        sourceRecordType: 'TOPIC',
        targetMasterContentType: 'TOPIC',
        sequenceOrder: 3,
        processingRevisionNumber: 1,
        createdById: user.id,
      },
    });

    const contentThree = await prisma.curriculumSourceContent.create({
      data: {
        curriculumSourceId: source.id,
        sequenceOrder: 3,
        contentType: 'CONCEPT',
        heading: 'Concept 1',
        rawText: 'Concept raw text',
        extractionMethod: 'MANUAL',
        reviewStatus: 'APPROVED',
        createdById: user.id,
        processingSessionId: processingSession.id,
        sourceFileId: sourceFile.id,
        sourceFileChecksum: sourceFile.checksum,
      },
    });

    await prisma.masterContentPromotionItem.create({
      data: {
        promotionId: promotion.id,
        sourceContentId: contentThree.id,
        sourceRecordType: 'CONCEPT',
        targetMasterContentType: 'CONCEPT',
        sequenceOrder: 3,
        processingRevisionNumber: 1,
        createdById: user.id,
      },
    });
  });

  const passed = results.filter((result) => result.passed).length;
  const failed = results.length - passed;

  const summary = {
    total: results.length,
    passed,
    failed,
    results,
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);

  await prisma.masterContentPromotionItem.deleteMany({ where: { promotionId: promotion.id } });
  await prisma.masterContentPromotion.delete({ where: { id: promotion.id } });
  await prisma.curriculumSourceContent.deleteMany({ where: { processingSessionId: processingSession.id } });
  await prisma.curriculumSourceProcessingSession.delete({ where: { id: processingSession.id } });
  await prisma.curriculumSourceFile.deleteMany({ where: { curriculumSourceId: source.id } });
  await prisma.curriculumSource.delete({ where: { id: source.id } });
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.school.delete({ where: { id: school.id } });

  if (failed > 0) {
    process.exitCode = 1;
  }
};

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[phase2n-master-content-promotion-constraints-check] fatal: ${message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });