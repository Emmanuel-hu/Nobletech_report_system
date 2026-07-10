import { Router, type Request, type Response } from 'express';

import { env } from '../config/env';

const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'NEMP API is running.',
    data: {
      service: 'Nobletech Education Management Platform',
      version: env.APP_VERSION,
      environment: env.NODE_ENV,
    },
  });
});

export default healthRouter;
