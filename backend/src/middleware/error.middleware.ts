import type { NextFunction, Request, Response } from 'express';

import { env } from '../config/env';
import { AppError } from '../utils/app-error';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const isProduction = env.NODE_ENV === 'production';

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: [
        {
          code: err.code,
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
        },
      ],
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'An internal server error occurred.',
    errors: [
      {
        code: 'INTERNAL_ERROR',
        message: err.message,
        ...(isProduction ? {} : { stack: err.stack }),
      },
    ],
  });
};
