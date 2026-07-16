import { Prisma } from '@prisma/client';

import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { phase2mRequiredPermissions, phase2mRoleMappings } from './phase2m-rbac-policy';

void env;

const schoolBootstrapFlag = '--bootstrap-school-if-empty';
const defaultDevSchoolCode = 'DEV_LOCAL_BOOTSTRAP';
const defaultDevSchoolName = 'Local Development School';

const getArgValue = (prefix: string): string | undefined => {
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
};

const ensureRole = async (
  tx: Prisma.TransactionClient,
  args: { schoolId: string | null; code: string; name: string; description: string },
) => {
  const existing = await tx.role.findFirst({
    where: {
      schoolId: args.schoolId,
      code: { equals: args.code, mode: 'insensitive' },
    },
  });

  if (existing) {
    return tx.role.update({
      where: { id: existing.id },
      data: {
        name: args.name,
        description: args.description,
        isSystem: true,
        isActive: true,
      },
    });
  }

  return tx.role.create({
    data: {
      schoolId: args.schoolId,
      code: args.code,
      name: args.name,
      description: args.description,
      isSystem: true,
      isActive: true,
    },
  });
};

const main = async (): Promise<void> => {
  const bootstrapSchoolIfEmpty = process.argv.includes(schoolBootstrapFlag);
  const devSchoolCode = getArgValue('--dev-school-code=') ?? defaultDevSchoolCode;
  const devSchoolName = getArgValue('--dev-school-name=') ?? defaultDevSchoolName;

  const summary = await prisma.$transaction(async (tx) => {
    for (const permission of phase2mRequiredPermissions) {
      await tx.permission.upsert({
        where: { code: permission.code },
        create: {
          code: permission.code,
          name: permission.name,
          resource: permission.resource,
          action: permission.action,
          description: permission.description,
          isActive: true,
        },
        update: {
          name: permission.name,
          resource: permission.resource,
          action: permission.action,
          description: permission.description,
          isActive: true,
        },
      });
    }

    let createdDevelopmentSchoolId: string | null = null;
    let schools = await tx.school.findMany({
      select: { id: true, code: true },
      orderBy: { code: 'asc' },
    });

    if (schools.length === 0 && bootstrapSchoolIfEmpty) {
      const school = await tx.school.create({
        data: {
          code: devSchoolCode,
          name: devSchoolName,
          status: 'ACTIVE',
        },
      });
      createdDevelopmentSchoolId = school.id;
      schools = [{ id: school.id, code: school.code }];
    }

    const permissions = await tx.permission.findMany({
      where: { code: { in: phase2mRequiredPermissions.map((item) => item.code) } },
      select: { id: true, code: true },
    });
    const permissionIdsByCode = new Map(permissions.map((item) => [item.code.toLowerCase(), item.id]));

    const ensuredRoles: Array<{ id: string; code: string; schoolId: string | null }> = [];
    for (const mapping of phase2mRoleMappings) {
      if (mapping.scope === 'global') {
        const role = await ensureRole(tx, {
          schoolId: null,
          code: mapping.code,
          name: mapping.name,
          description: mapping.description,
        });
        ensuredRoles.push({ id: role.id, code: role.code, schoolId: role.schoolId });
        continue;
      }

      for (const school of schools) {
        const role = await ensureRole(tx, {
          schoolId: school.id,
          code: mapping.code,
          name: mapping.name,
          description: mapping.description,
        });
        ensuredRoles.push({ id: role.id, code: role.code, schoolId: role.schoolId });
      }
    }

    let assignmentsCreated = 0;
    let assignmentsRemoved = 0;

    for (const role of ensuredRoles) {
      const mapping = phase2mRoleMappings.find((item) => item.code === role.code);
      if (!mapping) {
        continue;
      }

      const expectedPermissionIds = mapping.permissions
        .map((code) => permissionIdsByCode.get(code.toLowerCase()))
        .filter((id): id is string => typeof id === 'string');

      const existingAssignments = await tx.rolePermission.findMany({
        where: {
          roleId: role.id,
          permissionId: { in: Array.from(permissionIdsByCode.values()) },
        },
        select: { permissionId: true },
      });

      const existingPermissionIds = new Set(existingAssignments.map((item) => item.permissionId));
      const unexpectedPermissionIds = existingAssignments
        .map((item) => item.permissionId)
        .filter((permissionId) => !expectedPermissionIds.includes(permissionId));

      if (unexpectedPermissionIds.length > 0) {
        const removal = await tx.rolePermission.deleteMany({
          where: {
            roleId: role.id,
            permissionId: { in: unexpectedPermissionIds },
          },
        });
        assignmentsRemoved += removal.count;
      }

      const missingPermissionIds = expectedPermissionIds.filter((permissionId) => !existingPermissionIds.has(permissionId));
      if (missingPermissionIds.length > 0) {
        const created = await tx.rolePermission.createMany({
          data: missingPermissionIds.map((permissionId) => ({
            roleId: role.id,
            permissionId,
            grantedById: null,
          })),
          skipDuplicates: true,
        });
        assignmentsCreated += created.count;
      }
    }

    return {
      bootstrapSchoolIfEmpty,
      createdDevelopmentSchoolId,
      schoolCount: schools.length,
      ensuredRoleCount: ensuredRoles.length,
      assignmentsCreated,
      assignmentsRemoved,
      roleCodes: ensuredRoles.map((role) => ({ code: role.code, schoolId: role.schoolId })),
    };
  });

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
};

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[phase2m-rbac-bootstrap] fatal: ${message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });