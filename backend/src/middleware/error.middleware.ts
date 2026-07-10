import type { NextFunction, Request, Response } from 'express';

import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const isProduction = env.NODE_ENV === 'production';

  res.status(500).json({
    success: false,
    message: 'An error occurred.',
    errors: [
      {
        message: err.message,
        ...(isProduction ? {} : { stack: err.stack }),
      },
    ],
  });
};
