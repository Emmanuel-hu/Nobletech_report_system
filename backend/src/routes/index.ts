import { Router } from 'express';

import curriculumRouter from './curriculum.routes';
import healthRouter from './health.routes';
import masterContentRouter from './master-content.routes';
import sourceProcessingRouter from './source-processing.routes';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/curriculum', curriculumRouter);
apiRouter.use('/master-content', masterContentRouter);
apiRouter.use('/curriculum', sourceProcessingRouter);

export default apiRouter;
