import { Router } from 'express';

import curriculumRouter from './curriculum.routes';
import healthRouter from './health.routes';
import masterContentRouter from './master-content.routes';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/curriculum', curriculumRouter);
apiRouter.use('/master-content', masterContentRouter);

export default apiRouter;
