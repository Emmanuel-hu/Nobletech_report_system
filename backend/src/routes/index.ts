import { Router } from 'express';

import curriculumRouter from './curriculum.routes';
import healthRouter from './health.routes';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/curriculum', curriculumRouter);

export default apiRouter;
