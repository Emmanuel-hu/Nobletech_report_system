import type { NextFunction, Request, Response } from 'express';

import { prisma } from '../config/prisma';
import {
  forbidden,
  unauthorized,
} from '../utils/app-error';

const ACTIVE_USER_ROLE_WHERE = {
  isActive: true,
};

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.header('x-user-id');
    if (!userId) {
      throw unauthorized();
    }

    const requestedSchoolId = req.header('x-school-id');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roleAssignments: {
          where: ACTIVE_USER_ROLE_WHERE,
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw unauthorized('Invalid or inactive user context.');
    }

    if (user.schoolId && requestedSchoolId && user.schoolId !== requestedSchoolId) {
      throw forbidden('Requested school scope does not match authenticated user scope.');
    }

    const schoolId = requestedSchoolId ?? user.schoolId ?? null;
    const roleCodes = new Set(user.roleAssignments.map((assignment) => assignment.role.code.toUpperCase()));
    const isSuperAdmin = roleCodes.has('SUPER_ADMIN');

    const permissions = new Set<string>();
    for (const assignment of user.roleAssignments) {
      const assignmentSchoolId = assignment.schoolId;
      if (schoolId && assignmentSchoolId && assignmentSchoolId !== schoolId) {
        continue;
      }

      for (const rolePermission of assignment.role.rolePermissions) {
        if (rolePermission.permission.isActive) {
          permissions.add(rolePermission.permission.code.toLowerCase());
        }
      }
    }

    req.auth = {
      userId: user.id,
      schoolId,
      isSuperAdmin,
      permissions,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireSchoolScope = (req: Request): string => {
  if (!req.auth) {
    throw unauthorized();
  }

  if (!req.auth.schoolId) {
    throw forbidden('School scope is required for this operation.');
  }

  return req.auth.schoolId;
};
