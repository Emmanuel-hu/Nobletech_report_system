import crypto from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

export const requestContextMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const incoming = req.header('x-request-id');
  req.requestId = incoming ?? crypto.randomUUID();
  next();
};
