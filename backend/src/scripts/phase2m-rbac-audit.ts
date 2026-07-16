import { env } from '../config/env';
import { prisma } from '../config/prisma';
import {
  phase2mRequiredPermissions,
  phase2mRoleCodes,
  phase2mRoleMappingsByCode,
} from './phase2m-rbac-policy';

void env;

const main = async (): Promise<void> => {
  const apply = process.argv.includes('--apply');

  const expectedCodes = phase2mRequiredPermissions.map((item) => item.code);

  const existingPermissions = await prisma.permission.findMany({
    where: { code: { in: expectedCodes } },
    select: { id: true, code: true, isActive: true },
  });

  const existingCodeSet = new Set(existingPermissions.map((item) => item.code.toLowerCase()));
  const missingPermissionCodes = expectedCodes.filter((code) => !existingCodeSet.has(code.toLowerCase()));

  if (apply && missingPermissionCodes.length > 0) {
    for (const spec of phase2mRequiredPermissions) {
      await prisma.permission.upsert({
        where: { code: spec.code },
        create: {
          code: spec.code,
          name: spec.name,
          resource: spec.resource,
          action: spec.action,
          description: spec.description,
          isActive: true,
        },
        update: {
          name: spec.name,
          resource: spec.resource,
          action: spec.action,
          description: spec.description,
          isActive: true,
        },
      });
    }
  }

  const permissionRows = await prisma.permission.findMany({
    where: { code: { in: expectedCodes } },
    select: { id: true, code: true, isActive: true },
  });

  const targetRoles = await prisma.role.findMany({
    where: {
      isActive: true,
      code: {
        in: phase2mRoleCodes,
      },
    },
    select: { id: true, code: true, schoolId: true },
    orderBy: [{ schoolId: 'asc' }, { code: 'asc' }],
  });

  const rolePermissionRows = await prisma.rolePermission.findMany({
    where: {
      roleId: { in: targetRoles.map((role) => role.id) },
      permissionId: { in: permissionRows.map((item) => item.id) },
    },
    select: { roleId: true, permissionId: true },
  });

  const assignmentSet = new Set(rolePermissionRows.map((row) => `${row.roleId}:${row.permissionId}`));

  let assignmentsCreated = 0;

  if (apply && targetRoles.length > 0 && permissionRows.length > 0) {
    for (const role of targetRoles) {
      const mapping = phase2mRoleMappingsByCode.get(role.code.toUpperCase());
      if (!mapping) {
        continue;
      }

      for (const permission of permissionRows.filter((item) => mapping.permissions.includes(item.code))) {
        const key = `${role.id}:${permission.id}`;
        if (assignmentSet.has(key)) {
          continue;
        }

        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
            grantedById: null,
          },
        });

        assignmentSet.add(key);
        assignmentsCreated += 1;
      }
    }
  }

  const finalMissingPermissions = phase2mRequiredPermissions
    .map((item) => item.code)
    .filter((code) => !permissionRows.some((row) => row.code.toLowerCase() === code.toLowerCase()));

  const perRoleCoverage = targetRoles.map((role) => {
    const mapping = phase2mRoleMappingsByCode.get(role.code.toUpperCase());
    const coveredCodes = permissionRows
      .filter((permission) => assignmentSet.has(`${role.id}:${permission.id}`))
      .map((permission) => permission.code)
      .sort();

    const expectedRoleCodes = mapping?.permissions ?? [];
    const missingCodes = expectedRoleCodes
      .filter((code) => !coveredCodes.some((covered) => covered.toLowerCase() === code.toLowerCase()));

    const unexpectedCodes = coveredCodes.filter(
      (code) => !expectedRoleCodes.some((expected) => expected.toLowerCase() === code.toLowerCase()),
    );

    return {
      roleId: role.id,
      roleCode: role.code,
      schoolId: role.schoolId,
      coveredCount: coveredCodes.length,
      expectedCount: expectedRoleCodes.length,
      missingCount: missingCodes.length,
      missingCodes,
      unexpectedCount: unexpectedCodes.length,
      unexpectedCodes,
    };
  });

  const missingTargetRoleCodes = phase2mRoleCodes.filter(
    (code) => !targetRoles.some((role) => role.code.toUpperCase() === code.toUpperCase()),
  );

  const summary = {
    mode: apply ? 'apply' : 'audit',
    requiredPermissionCount: phase2mRequiredPermissions.length,
    targetRoleCount: targetRoles.length,
    missingTargetRoleCodes,
    initiallyMissingPermissionCodes: missingPermissionCodes,
    finalMissingPermissionCodes: finalMissingPermissions,
    assignmentsCreated,
    roleCoverage: perRoleCoverage,
    allPermissionsPresent: finalMissingPermissions.length === 0,
    allTargetRolesFullyCovered:
      targetRoles.length > 0 &&
      missingTargetRoleCodes.length === 0 &&
      perRoleCoverage.every((role) => role.missingCount === 0 && role.unexpectedCount === 0),
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);

  if (!summary.allPermissionsPresent || !summary.allTargetRolesFullyCovered) {
    process.exitCode = 1;
  }
};

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[phase2m-rbac-audit] fatal: ${message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
