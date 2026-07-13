import type { NextFunction, Request, Response } from 'express';

import { forbidden, unauthorized } from '../utils/app-error';

export const requirePermission = (permissionCode: string) => {
  const normalized = permissionCode.toLowerCase();

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(unauthorized());
      return;
    }

    if (!req.auth.permissions.has(normalized)) {
      next(forbidden(`Missing permission: ${permissionCode}`));
      return;
    }

    next();
  };
};
