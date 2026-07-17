import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { phase2nRequiredPermissions, phase2nRoleCodes, phase2nRoleMappingsByCode } from './phase2n-rbac-policy';

void env;

const main = async (): Promise<void> => {
  const apply = process.argv.includes('--apply');

  const expectedCodes = phase2nRequiredPermissions.map((item) => item.code);

  if (apply) {
    for (const spec of phase2nRequiredPermissions) {
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
    select: { id: true, code: true },
  });

  const targetRoles = await prisma.role.findMany({
    where: {
      isActive: true,
      code: { in: phase2nRoleCodes },
    },
    select: { id: true, code: true, schoolId: true },
    orderBy: [{ schoolId: 'asc' }, { code: 'asc' }],
  });

  const existingAssignments = await prisma.rolePermission.findMany({
    where: {
      roleId: { in: targetRoles.map((role) => role.id) },
      permissionId: { in: permissionRows.map((permission) => permission.id) },
    },
    select: { roleId: true, permissionId: true },
  });

  const assignmentSet = new Set(existingAssignments.map((item) => `${item.roleId}:${item.permissionId}`));
  let assignmentsCreated = 0;

  if (apply) {
    for (const role of targetRoles) {
      const mapping = phase2nRoleMappingsByCode.get(role.code.toUpperCase());
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

  const missingPermissionCodes = expectedCodes.filter(
    (code) => !permissionRows.some((permission) => permission.code.toLowerCase() === code.toLowerCase()),
  );

  const missingTargetRoleCodes = phase2nRoleCodes.filter(
    (code) => !targetRoles.some((role) => role.code.toUpperCase() === code.toUpperCase()),
  );

  const roleCoverage = targetRoles.map((role) => {
    const mapping = phase2nRoleMappingsByCode.get(role.code.toUpperCase());
    const expected = mapping?.permissions ?? [];
    const covered = permissionRows
      .filter((permission) => assignmentSet.has(`${role.id}:${permission.id}`))
      .map((permission) => permission.code);

    const missingCodes = expected.filter(
      (code) => !covered.some((item) => item.toLowerCase() === code.toLowerCase()),
    );

    return {
      roleId: role.id,
      roleCode: role.code,
      schoolId: role.schoolId,
      expectedCount: expected.length,
      coveredCount: covered.length,
      missingCodes,
      missingCount: missingCodes.length,
    };
  });

  const summary = {
    mode: apply ? 'apply' : 'audit',
    requiredPermissionCount: phase2nRequiredPermissions.length,
    targetRoleCount: targetRoles.length,
    missingPermissionCodes,
    missingTargetRoleCodes,
    assignmentsCreated,
    roleCoverage,
    allPermissionsPresent: missingPermissionCodes.length === 0,
    allTargetRolesFullyCovered:
      targetRoles.length > 0 &&
      missingTargetRoleCodes.length === 0 &&
      roleCoverage.every((coverage) => coverage.missingCount === 0),
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);

  if (!summary.allPermissionsPresent || !summary.allTargetRolesFullyCovered) {
    process.exitCode = 1;
  }
};

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[phase2n-rbac-audit] fatal: ${message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });