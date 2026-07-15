import { Router } from 'express';

import {
  approveProcessingSession,
  archiveProcessingSection,
  archiveProcessingSession,
  compareProcessingRevisions,
  completeProcessingSession,
  createProcessingSection,
  createProcessingSession,
  createStructuredRecordFromSection,
  deleteProcessingSection,
  getProcessingAuditHistory,
  getProcessingSection,
  getProcessingSession,
  listProcessingRevisions,
  listProcessingSections,
  listProcessingSessions,
  listProcessingStructuredRecords,
  moveProcessingSection,
  rejectProcessingSession,
  reorderProcessingSections,
  requestProcessingSessionRevision,
  submitProcessingSessionReview,
  updateProcessingSection,
  updateProcessingSession,
} from '../controllers/source-processing.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware';
import {
  archiveSectionSchema,
  compareRevisionQuerySchema,
  createProcessingSessionSchema,
  createSectionSchema,
  createStructuredRecordSchema,
  deleteSectionSchema,
  moveSectionSchema,
  processingSessionIdParamSchema,
  reorderSectionsSchema,
  sessionLifecycleSchema,
  sessionSectionParamSchema,
  sourceAndSessionParamSchema,
  sourceIdParamSchema,
  updateProcessingSessionSchema,
  updateSectionSchema,
} from '../validators/source-processing.validator';
import { asyncHandler } from '../utils/async-handler';

const sourceProcessingRouter = Router();

sourceProcessingRouter.use(authMiddleware);

sourceProcessingRouter.get(
  '/curriculum-sources/:sourceId/processing-sessions',
  requirePermission('curriculum_source.processing.view'),
  validateParams(sourceIdParamSchema),
  asyncHandler(listProcessingSessions),
);

sourceProcessingRouter.post(
  '/curriculum-sources/:sourceId/processing-sessions',
  requirePermission('curriculum_source.processing.create'),
  validateParams(sourceIdParamSchema),
  validateBody(createProcessingSessionSchema),
  asyncHandler(createProcessingSession),
);

sourceProcessingRouter.get(
  '/curriculum-sources/:sourceId/processing-sessions/:sessionId',
  requirePermission('curriculum_source.processing.view'),
  validateParams(sourceAndSessionParamSchema),
  asyncHandler(getProcessingSession),
);

sourceProcessingRouter.patch(
  '/curriculum-sources/:sourceId/processing-sessions/:sessionId',
  requirePermission('curriculum_source.processing.edit'),
  validateParams(sourceAndSessionParamSchema),
  validateBody(updateProcessingSessionSchema),
  asyncHandler(updateProcessingSession),
);

sourceProcessingRouter.post(
  '/curriculum-sources/:sourceId/processing-sessions/:sessionId/submit-review',
  requirePermission('curriculum_source.processing.submit_review'),
  validateParams(sourceAndSessionParamSchema),
  validateBody(sessionLifecycleSchema),
  asyncHandler(submitProcessingSessionReview),
);

sourceProcessingRouter.post(
  '/curriculum-sources/:sourceId/processing-sessions/:sessionId/request-revision',
  requirePermission('curriculum_source.processing.request_revision'),
  validateParams(sourceAndSessionParamSchema),
  validateBody(sessionLifecycleSchema),
  asyncHandler(requestProcessingSessionRevision),
);

sourceProcessingRouter.post(
  '/curriculum-sources/:sourceId/processing-sessions/:sessionId/approve',
  requirePermission('curriculum_source.processing.approve'),
  validateParams(sourceAndSessionParamSchema),
  validateBody(sessionLifecycleSchema),
  asyncHandler(approveProcessingSession),
);

sourceProcessingRouter.post(
  '/curriculum-sources/:sourceId/processing-sessions/:sessionId/reject',
  requirePermission('curriculum_source.processing.reject'),
  validateParams(sourceAndSessionParamSchema),
  validateBody(sessionLifecycleSchema),
  asyncHandler(rejectProcessingSession),
);

sourceProcessingRouter.post(
  '/curriculum-sources/:sourceId/processing-sessions/:sessionId/complete',
  requirePermission('curriculum_source.processing.complete'),
  validateParams(sourceAndSessionParamSchema),
  validateBody(sessionLifecycleSchema),
  asyncHandler(completeProcessingSession),
);

sourceProcessingRouter.post(
  '/curriculum-sources/:sourceId/processing-sessions/:sessionId/archive',
  requirePermission('curriculum_source.processing.archive'),
  validateParams(sourceAndSessionParamSchema),
  validateBody(sessionLifecycleSchema),
  asyncHandler(archiveProcessingSession),
);

sourceProcessingRouter.get(
  '/processing-sessions/:sessionId/sections',
  requirePermission('curriculum_source.processing.view'),
  validateParams(processingSessionIdParamSchema),
  asyncHandler(listProcessingSections),
);

sourceProcessingRouter.post(
  '/processing-sessions/:sessionId/sections',
  requirePermission('curriculum_source.section.create'),
  validateParams(processingSessionIdParamSchema),
  validateBody(createSectionSchema),
  asyncHandler(createProcessingSection),
);

sourceProcessingRouter.get(
  '/processing-sessions/:sessionId/sections/:sectionId',
  requirePermission('curriculum_source.processing.view'),
  validateParams(sessionSectionParamSchema),
  asyncHandler(getProcessingSection),
);

sourceProcessingRouter.patch(
  '/processing-sessions/:sessionId/sections/:sectionId',
  requirePermission('curriculum_source.section.edit'),
  validateParams(sessionSectionParamSchema),
  validateBody(updateSectionSchema),
  asyncHandler(updateProcessingSection),
);

sourceProcessingRouter.delete(
  '/processing-sessions/:sessionId/sections/:sectionId',
  requirePermission('curriculum_source.section.delete'),
  validateParams(sessionSectionParamSchema),
  validateBody(deleteSectionSchema),
  asyncHandler(deleteProcessingSection),
);

sourceProcessingRouter.post(
  '/processing-sessions/:sessionId/sections/:sectionId/archive',
  requirePermission('curriculum_source.processing.archive'),
  validateParams(sessionSectionParamSchema),
  validateBody(archiveSectionSchema),
  asyncHandler(archiveProcessingSection),
);

sourceProcessingRouter.post(
  '/processing-sessions/:sessionId/sections/reorder',
  requirePermission('curriculum_source.section.reorder'),
  validateParams(processingSessionIdParamSchema),
  validateBody(reorderSectionsSchema),
  asyncHandler(reorderProcessingSections),
);

sourceProcessingRouter.post(
  '/processing-sessions/:sessionId/sections/:sectionId/move',
  requirePermission('curriculum_source.section.reorder'),
  validateParams(sessionSectionParamSchema),
  validateBody(moveSectionSchema),
  asyncHandler(moveProcessingSection),
);

sourceProcessingRouter.get(
  '/processing-sessions/:sessionId/revisions',
  requirePermission('curriculum_source.processing.compare_versions'),
  validateParams(processingSessionIdParamSchema),
  asyncHandler(listProcessingRevisions),
);

sourceProcessingRouter.get(
  '/processing-sessions/:sessionId/compare',
  requirePermission('curriculum_source.processing.compare_versions'),
  validateParams(processingSessionIdParamSchema),
  validateQuery(compareRevisionQuerySchema),
  asyncHandler(compareProcessingRevisions),
);

sourceProcessingRouter.get(
  '/processing-sessions/:sessionId/audit-history',
  requirePermission('curriculum_source.processing.view_audit'),
  validateParams(processingSessionIdParamSchema),
  asyncHandler(getProcessingAuditHistory),
);

sourceProcessingRouter.get(
  '/processing-sessions/:sessionId/structured-records',
  requirePermission('curriculum_source.processing.view'),
  validateParams(processingSessionIdParamSchema),
  asyncHandler(listProcessingStructuredRecords),
);

sourceProcessingRouter.post(
  '/processing-sessions/:sessionId/sections/:sectionId/structured-records',
  requirePermission('curriculum_source.section.create'),
  validateParams(sessionSectionParamSchema),
  validateBody(createStructuredRecordSchema),
  asyncHandler(createStructuredRecordFromSection),
);

export default sourceProcessingRouter;
