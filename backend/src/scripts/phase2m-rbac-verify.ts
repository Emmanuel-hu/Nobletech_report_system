import { Prisma } from '@prisma/client';

import { prisma } from '../config/prisma';
import { curriculumRepository } from '../repositories/curriculum.repository';
import { sourceProcessingService } from '../services/source-processing.service';
import {
  forbidden,
  tenantScopeViolation,
} from '../utils/app-error';
import {
  phase2mRequiredPermissions,
  phase2mRoleMappings,
  phase2mRoleMappingsByCode,
} from './phase2m-rbac-policy';

type Result = {
  name: string;
  passed: boolean;
  details: string;
};

const results: Result[] = [];

const record = (name: string, passed: boolean, details: string): void => {
  results.push({ name, passed, details });
};

const expectThrows = async (
  name: string,
  fn: () => Promise<void>,
  predicate: (error: unknown) => boolean,
  label: string,
): Promise<void> => {
  try {
    await fn();
    record(name, false, 'Expected denial did not occur.');
  } catch (error) {
    if (predicate(error)) {
      record(name, true, `Expected ${label} observed.`);
      return;
    }

    const details = error instanceof Error ? error.message : String(error);
    record(name, false, `Unexpected error: ${details}`);
  }
};

const isForbiddenError = (error: unknown): boolean => {
  return error instanceof Error && error.message === forbidden().message;
};

const isTenantViolationError = (error: unknown): boolean => {
  return error instanceof Error && error.message === tenantScopeViolation('').message;
};

const makeTag = (): string => Math.random().toString(36).slice(2, 10);

const createUser = async (schoolId: string | null, usernamePrefix: string) => {
  return prisma.user.create({
    data: {
      schoolId,
      firstName: 'Phase2M',
      lastName: 'Verifier',
      username: `${usernamePrefix}_${makeTag()}`,
      email: null,
      passwordHash: 'placeholder',
      status: 'ACTIVE',
      mustChangePassword: false,
    },
  });
};

const createSchool = async (codePrefix: string) => {
  return prisma.school.create({
    data: {
      code: `${codePrefix}_${makeTag()}`,
      name: `${codePrefix} ${makeTag()}`,
      status: 'ACTIVE',
    },
  });
};

const cleanupIds = {
  schoolIds: [] as string[],
  userIds: [] as string[],
  sourceIds: [] as string[],
  sourceFileIds: [] as string[],
};

const cleanup = async (): Promise<void> => {
  if (cleanupIds.sourceFileIds.length > 0) {
    await prisma.curriculumSourceFile.deleteMany({ where: { id: { in: cleanupIds.sourceFileIds } } });
  }
  if (cleanupIds.sourceIds.length > 0) {
    await prisma.curriculumSource.deleteMany({ where: { id: { in: cleanupIds.sourceIds } } });
  }
  if (cleanupIds.userIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: cleanupIds.userIds } } });
  }
  if (cleanupIds.schoolIds.length > 0) {
    await prisma.school.deleteMany({ where: { id: { in: cleanupIds.schoolIds } } });
  }
};

const main = async (): Promise<void> => {
  const permissions = await prisma.permission.findMany({
    where: { code: { in: phase2mRequiredPermissions.map((item) => item.code) } },
    select: { id: true, code: true },
  });

  const missingPermissionCodes = phase2mRequiredPermissions
    .map((item) => item.code)
    .filter((code) => !permissions.some((permission) => permission.code.toLowerCase() === code.toLowerCase()));
  record(
    '1) All Phase 2M permissions exist',
    missingPermissionCodes.length === 0,
    missingPermissionCodes.length === 0
      ? 'All required permission codes are present.'
      : `Missing permission codes: ${missingPermissionCodes.join(', ')}`,
  );

  const roles = await prisma.role.findMany({
    where: { code: { in: phase2mRoleMappings.map((item) => item.code) }, isActive: true },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
    orderBy: [{ schoolId: 'asc' }, { code: 'asc' }],
  });

  for (const mapping of phase2mRoleMappings) {
    const matchingRoles = roles.filter((role) => role.code.toUpperCase() === mapping.code.toUpperCase());
    const exists = matchingRoles.length > 0;
    record(
      `2) ${mapping.code} role exists`,
      exists,
      exists ? `Found ${matchingRoles.length} active role record(s).` : 'No active role records found.',
    );

    for (const role of matchingRoles) {
      const actualCodes = role.rolePermissions.map((item) => item.permission.code).sort();
      const missingCodes = mapping.permissions.filter((code) => !actualCodes.includes(code));
      const unexpectedCodes = actualCodes.filter((code) => !mapping.permissions.includes(code));
      record(
        `3) ${mapping.code} exact mapping${role.schoolId ? ` (${role.schoolId})` : ''}`,
        missingCodes.length === 0 && unexpectedCodes.length === 0,
        `Missing: ${missingCodes.join(', ') || 'none'} | Unexpected: ${unexpectedCodes.join(', ') || 'none'}`,
      );
    }
  }

  const teacherMapping = phase2mRoleMappingsByCode.get('TEACHER');
  const auditorMapping = phase2mRoleMappingsByCode.get('AUDITOR');
  if (teacherMapping) {
    const prohibited = [
      'curriculum_source.processing.request_revision',
      'curriculum_source.processing.approve',
      'curriculum_source.processing.reject',
      'curriculum_source.processing.complete',
      'curriculum_source.processing.archive',
      'curriculum_source.processing.view_audit',
    ].filter((code) => teacherMapping.permissions.includes(code));
    record(
      '4) Teacher mapping excludes approval and archive powers',
      prohibited.length === 0,
      prohibited.length === 0 ? 'Teacher role excludes prohibited powers.' : `Unexpected teacher powers: ${prohibited.join(', ')}`,
    );
  }

  if (auditorMapping) {
    const prohibited = phase2mRequiredPermissions
      .map((item) => item.code)
      .filter(
        (code) =>
          ![
            'curriculum_source.processing.view',
            'curriculum_source.processing.compare_versions',
            'curriculum_source.processing.view_audit',
          ].includes(code) && auditorMapping.permissions.includes(code),
      );
    record(
      '5) Auditor mapping remains read-only',
      prohibited.length === 0,
      prohibited.length === 0 ? 'Auditor role remains read-only.' : `Unexpected auditor powers: ${prohibited.join(', ')}`,
    );
  }

  const teacherRole = roles.find((role) => role.code.toUpperCase() === 'TEACHER');
  if (teacherRole && teacherRole.rolePermissions.length > 0) {
    const duplicatePermissionId = teacherRole.rolePermissions[0]!.permissionId;
    await expectThrows(
      '6) Duplicate role-permission assignment is rejected',
      async () => {
        await prisma.rolePermission.create({
          data: {
            roleId: teacherRole.id,
            permissionId: duplicatePermissionId,
            grantedById: null,
          },
        });
      },
      (error) => error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002',
      'duplicate-assignment rejection',
    );
  }

  const schoolA = await createSchool('P2M_RBAC_A');
  const schoolB = await createSchool('P2M_RBAC_B');
  cleanupIds.schoolIds.push(schoolA.id, schoolB.id);

  const schoolUser = await createUser(schoolA.id, 'p2m_school');
  const otherSchoolUser = await createUser(schoolB.id, 'p2m_other_school');
  const globalUser = await createUser(null, 'p2m_global');
  cleanupIds.userIds.push(schoolUser.id, otherSchoolUser.id, globalUser.id);

  const schoolSource = await prisma.curriculumSource.create({
    data: {
      schoolId: schoolB.id,
      sourceCode: `SRC_${makeTag()}`,
      title: 'Cross-tenant source',
      sourceType: 'SCHOOL_SCHEME_OF_WORK',
      sourceFormat: 'PDF',
      usageRights: 'Internal educational use',
      status: 'DRAFT',
      reviewStatus: 'DRAFT',
      isActive: true,
      uploadedById: otherSchoolUser.id,
    },
  });
  cleanupIds.sourceIds.push(schoolSource.id);

  const globalSource = await prisma.curriculumSource.create({
    data: {
      schoolId: null,
      sourceCode: `GLB_${makeTag()}`,
      title: 'Global source',
      sourceType: 'GOVERNMENT_CURRICULUM',
      sourceFormat: 'PDF',
      usageRights: 'Internal educational use',
      status: 'DRAFT',
      reviewStatus: 'DRAFT',
      isActive: true,
      uploadedById: globalUser.id,
    },
  });
  cleanupIds.sourceIds.push(globalSource.id);

  const globalSourceFile = await prisma.curriculumSourceFile.create({
    data: {
      curriculumSourceId: globalSource.id,
      schoolId: schoolA.id,
      storageProvider: 'LOCAL',
      storageKey: `curriculum-sources/${schoolA.id}/${globalSource.id}/${makeTag()}.pdf`,
      originalFileName: 'global.pdf',
      safeFileName: 'global.pdf',
      fileExtension: '.pdf',
      mimeType: 'application/pdf',
      fileSize: BigInt(2048),
      checksum: `sha-${makeTag()}`,
      checksumAlgorithm: 'SHA256',
      fileCategory: 'SOURCE_DOCUMENT',
      uploadStatus: 'READY',
      scanStatus: 'NOT_CONFIGURED',
      sequenceOrder: 1,
      isPrimary: true,
      isActive: true,
      status: 'ACTIVE',
      uploadedById: schoolUser.id,
    },
  });
  cleanupIds.sourceFileIds.push(globalSourceFile.id);

  await expectThrows(
    '7) Cross-tenant source visibility is denied',
    async () => {
      await sourceProcessingService.listProcessingSessions(
        {
          userId: schoolUser.id,
          schoolId: schoolA.id,
          isSuperAdmin: false,
          permissions: new Set(['curriculum_source.processing.view']),
        },
        schoolSource.id,
      );
    },
    (error) => error instanceof Error && error.message.includes('authenticated school scope'),
    'tenant-scope denial',
  );

  await expectThrows(
    '8) School-scoped role cannot start processing for global source',
    async () => {
      await sourceProcessingService.createProcessingSession(
        {
          userId: schoolUser.id,
          schoolId: schoolA.id,
          isSuperAdmin: false,
          permissions: new Set(['curriculum_source.processing.create']),
        },
        globalSource.id,
        { curriculumSourceFileId: globalSourceFile.id },
      );
    },
    (error) => error instanceof Error && error.message.includes('Only super administrators can create processing sessions for global sources.'),
    'global-source denial',
  );

  const passed = results.filter((item) => item.passed).length;
  const failed = results.length - passed;

  process.stdout.write(
    `${JSON.stringify({ total: results.length, passed, failed, results }, null, 2)}\n`,
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
};

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[phase2m-rbac-verify] fatal: ${message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
    await curriculumRepository.client.$disconnect();
  });