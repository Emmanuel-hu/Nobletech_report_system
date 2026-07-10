import compression from 'compression';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';
import apiRouter from './routes';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
  }),
);
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Operation completed successfully.',
    data: {
      name: 'Nobletech Education Management Platform',
      apiPrefix: `/api/${env.API_VERSION}`,
    },
  });
});

app.use(`/api/${env.API_VERSION}`, apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
