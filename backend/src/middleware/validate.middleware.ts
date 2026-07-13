import type { NextFunction, Request, Response } from 'express';
import type { ZodError, ZodTypeAny } from 'zod';

import { AppError } from '../utils/app-error';

const formatZodIssues = (error: ZodError): Array<{ path: string; message: string }> => {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
};

export const validateBody = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      next(new AppError(400, 'VALIDATION_ERROR', 'Request body validation failed.', formatZodIssues(parsed.error)));
      return;
    }

    req.body = parsed.data;
    next();
  };
};

export const validateParams = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      next(new AppError(400, 'VALIDATION_ERROR', 'Request params validation failed.', formatZodIssues(parsed.error)));
      return;
    }

    req.params = parsed.data;
    next();
  };
};

export const validateQuery = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      next(new AppError(400, 'VALIDATION_ERROR', 'Request query validation failed.', formatZodIssues(parsed.error)));
      return;
    }

    req.query = parsed.data;
    next();
  };
};
