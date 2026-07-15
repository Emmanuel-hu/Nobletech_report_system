import { env } from '../config/env';
import { prisma } from '../config/prisma';

type PermissionSpec = {
  code: string;
  name: string;
  resource: string;
  action: string;
  description: string;
};

const requiredPermissions: PermissionSpec[] = [
  {
    code: 'curriculum_source.processing.view',
    name: 'View Curriculum Source Processing Sessions',
    resource: 'curriculum_source_processing',
    action: 'view',
    description: 'Allows viewing manual curriculum source processing sessions and related records.',
  },
  {
    code: 'curriculum_source.processing.create',
    name: 'Create Curriculum Source Processing Sessions',
    resource: 'curriculum_source_processing',
    action: 'create',
    description: 'Allows creating manual curriculum source processing sessions.',
  },
  {
    code: 'curriculum_source.processing.edit',
    name: 'Edit Curriculum Source Processing Sessions',
    resource: 'curriculum_source_processing',
    action: 'edit',
    description: 'Allows editing manual curriculum source processing sessions.',
  },
  {
    code: 'curriculum_source.processing.submit_review',
    name: 'Submit Curriculum Source Processing Review',
    resource: 'curriculum_source_processing',
    action: 'submit_review',
    description: 'Allows submitting manual curriculum source processing sessions for review.',
  },
  {
    code: 'curriculum_source.processing.request_revision',
    name: 'Request Curriculum Source Processing Revision',
    resource: 'curriculum_source_processing',
    action: 'request_revision',
    description: 'Allows requesting revisions for manual curriculum source processing sessions.',
  },
  {
    code: 'curriculum_source.processing.approve',
    name: 'Approve Curriculum Source Processing Session',
    resource: 'curriculum_source_processing',
    action: 'approve',
    description: 'Allows approving manual curriculum source processing sessions.',
  },
  {
    code: 'curriculum_source.processing.reject',
    name: 'Reject Curriculum Source Processing Session',
    resource: 'curriculum_source_processing',
    action: 'reject',
    description: 'Allows rejecting manual curriculum source processing sessions.',
  },
  {
    code: 'curriculum_source.processing.complete',
    name: 'Complete Curriculum Source Processing Session',
    resource: 'curriculum_source_processing',
    action: 'complete',
    description: 'Allows completing approved manual curriculum source processing sessions.',
  },
  {
    code: 'curriculum_source.processing.archive',
    name: 'Archive Curriculum Source Processing Session',
    resource: 'curriculum_source_processing',
    action: 'archive',
    description: 'Allows archiving manual curriculum source processing sessions.',
  },
  {
    code: 'curriculum_source.processing.compare_versions',
    name: 'Compare Curriculum Source Processing Revisions',
    resource: 'curriculum_source_processing',
    action: 'compare_versions',
    description: 'Allows comparing revisions of manual curriculum source processing sessions.',
  },
  {
    code: 'curriculum_source.processing.view_audit',
    name: 'View Curriculum Source Processing Audit History',
    resource: 'curriculum_source_processing',
    action: 'view_audit',
    description: 'Allows viewing audit logs for curriculum source processing sessions.',
  },
  {
    code: 'curriculum_source.section.create',
    name: 'Create Curriculum Source Sections',
    resource: 'curriculum_source_section',
    action: 'create',
    description: 'Allows creating extracted source sections within processing sessions.',
  },
  {
    code: 'curriculum_source.section.edit',
    name: 'Edit Curriculum Source Sections',
    resource: 'curriculum_source_section',
    action: 'edit',
    description: 'Allows editing extracted source sections within processing sessions.',
  },
  {
    code: 'curriculum_source.section.delete',
    name: 'Delete Curriculum Source Sections',
    resource: 'curriculum_source_section',
    action: 'delete',
    description: 'Allows deleting extracted source sections within processing sessions.',
  },
  {
    code: 'curriculum_source.section.reorder',
    name: 'Reorder Curriculum Source Sections',
    resource: 'curriculum_source_section',
    action: 'reorder',
    description: 'Allows reordering and moving extracted source sections within processing sessions.',
  },
];

void env;

const main = async (): Promise<void> => {
  const apply = process.argv.includes('--apply');

  const expectedCodes = requiredPermissions.map((item) => item.code);

  const existingPermissions = await prisma.permission.findMany({
    where: { code: { in: expectedCodes } },
    select: { id: true, code: true, isActive: true },
  });

  const existingCodeSet = new Set(existingPermissions.map((item) => item.code.toLowerCase()));
  const missingPermissionCodes = expectedCodes.filter((code) => !existingCodeSet.has(code.toLowerCase()));

  if (apply && missingPermissionCodes.length > 0) {
    for (const spec of requiredPermissions) {
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

  const superAdminRoles = await prisma.role.findMany({
    where: {
      isActive: true,
      code: { equals: 'SUPER_ADMIN', mode: 'insensitive' },
    },
    select: { id: true, code: true, schoolId: true },
  });

  const curriculumRoles = await prisma.role.findMany({
    where: {
      isActive: true,
      rolePermissions: {
        some: {
          permission: {
            code: {
              startsWith: 'curriculum.',
              mode: 'insensitive',
            },
          },
        },
      },
    },
    select: { id: true, code: true, schoolId: true },
  });

  const roleMap = new Map<string, { id: string; code: string; schoolId: string | null }>();
  for (const role of [...superAdminRoles, ...curriculumRoles]) {
    roleMap.set(role.id, role);
  }

  const targetRoles = Array.from(roleMap.values());

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
      for (const permission of permissionRows) {
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

  const finalMissingPermissions = requiredPermissions
    .map((item) => item.code)
    .filter((code) => !permissionRows.some((row) => row.code.toLowerCase() === code.toLowerCase()));

  const perRoleCoverage = targetRoles.map((role) => {
    const coveredCodes = permissionRows
      .filter((permission) => assignmentSet.has(`${role.id}:${permission.id}`))
      .map((permission) => permission.code)
      .sort();

    const missingCodes = requiredPermissions
      .map((item) => item.code)
      .filter((code) => !coveredCodes.some((covered) => covered.toLowerCase() === code.toLowerCase()));

    return {
      roleId: role.id,
      roleCode: role.code,
      schoolId: role.schoolId,
      coveredCount: coveredCodes.length,
      missingCount: missingCodes.length,
      missingCodes,
    };
  });

  const summary = {
    mode: apply ? 'apply' : 'audit',
    requiredPermissionCount: requiredPermissions.length,
    targetRoleCount: targetRoles.length,
    initiallyMissingPermissionCodes: missingPermissionCodes,
    finalMissingPermissionCodes: finalMissingPermissions,
    assignmentsCreated,
    roleCoverage: perRoleCoverage,
    allPermissionsPresent: finalMissingPermissions.length === 0,
    allTargetRolesFullyCovered: perRoleCoverage.every((role) => role.missingCount === 0),
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
