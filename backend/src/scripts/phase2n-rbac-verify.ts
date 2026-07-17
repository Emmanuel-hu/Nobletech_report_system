import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { phase2nRequiredPermissions, phase2nRoleMappingsByCode } from './phase2n-rbac-policy';

void env;

const expect = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const main = async (): Promise<void> => {
  const permissions = await prisma.permission.findMany({
    where: { code: { in: phase2nRequiredPermissions.map((item) => item.code) } },
    select: { id: true, code: true },
  });

  expect(permissions.length === phase2nRequiredPermissions.length, 'Missing phase2n promotion permissions in database.');

  const roles = await prisma.role.findMany({
    where: { code: { in: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CURRICULUM_SUPERVISOR', 'TEACHER', 'AUDITOR'] }, isActive: true },
    select: { id: true, code: true, schoolId: true },
  });

  const rolePermissions = await prisma.rolePermission.findMany({
    where: {
      roleId: { in: roles.map((role) => role.id) },
      permissionId: { in: permissions.map((permission) => permission.id) },
    },
    select: { roleId: true, permissionId: true },
  });

  const rolePermissionSet = new Set(rolePermissions.map((item) => `${item.roleId}:${item.permissionId}`));
  const permissionMap = new Map(permissions.map((item) => [item.code, item.id]));

  const roleChecks = roles.map((role) => {
    const mapping = phase2nRoleMappingsByCode.get(role.code.toUpperCase());
    const expected = mapping?.permissions ?? [];
    const missing = expected.filter((code) => {
      const permissionId = permissionMap.get(code);
      if (!permissionId) {
        return true;
      }
      return !rolePermissionSet.has(`${role.id}:${permissionId}`);
    });

    return {
      roleCode: role.code,
      schoolId: role.schoolId,
      expectedCount: expected.length,
      missing,
      missingCount: missing.length,
    };
  });

  const teacher = roleChecks.find((check) => check.roleCode === 'TEACHER');
  expect(Boolean(teacher), 'Teacher role was not found for verification.');
  expect(
    !(teacher?.missing.includes('master_content.promotion.view') ?? true),
    'Teacher must retain promotion view access where allowed.',
  );

  const auditor = roleChecks.find((check) => check.roleCode === 'AUDITOR');
  expect(Boolean(auditor), 'Auditor role was not found for verification.');

  const summary = {
    requiredPermissionCount: phase2nRequiredPermissions.length,
    roleChecks,
    allRolesCovered: roleChecks.every((check) => check.missingCount === 0),
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);

  if (!summary.allRolesCovered) {
    process.exitCode = 1;
  }
};

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[phase2n-rbac-verify] fatal: ${message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });