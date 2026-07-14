import { Router } from 'express';

import {
  createMasterEntity,
  createMasterLineage,
  createMasterMapping,
  createMasterRevision,
  deleteMasterLineage,
  deleteMasterMapping,
  getMasterAudit,
  getMasterDashboard,
  getMasterEntity,
  getMasterReviewQueue,
  listMasterEntities,
  transitionMasterLifecycle,
  updateMasterEntity,
  updateMasterLineage,
} from '../controllers/master-content.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware';
import { asyncHandler } from '../utils/async-handler';
import {
  createLineageSchema,
  createMappingSchema,
  createMasterEntitySchema,
  lifecycleActionBodySchema,
  lifecycleActionParamSchema,
  lineageEntityParamSchema,
  lineageIdParamSchema,
  listMasterEntitiesQuerySchema,
  mappingIdParamSchema,
  mappingTypeParamSchema,
  masterEntityIdParamSchema,
  masterEntityTypeParamSchema,
  updateLineageSchema,
  updateMasterEntitySchema,
} from '../validators/master-content.validator';

const masterContentRouter = Router();

masterContentRouter.use(authMiddleware);

masterContentRouter.get(
  '/dashboard',
  requirePermission('master_content.view'),
  asyncHandler(getMasterDashboard),
);

masterContentRouter.get(
  '/review-queue',
  requirePermission('master_content.view'),
  asyncHandler(getMasterReviewQueue),
);

masterContentRouter.get(
  '/entities/:entityType',
  requirePermission('master_content.view'),
  validateParams(masterEntityTypeParamSchema),
  validateQuery(listMasterEntitiesQuerySchema),
  asyncHandler(listMasterEntities),
);

masterContentRouter.get(
  '/entities/:entityType/:entityId',
  requirePermission('master_content.view'),
  validateParams(masterEntityIdParamSchema),
  asyncHandler(getMasterEntity),
);

masterContentRouter.post(
  '/entities/:entityType',
  requirePermission('master_content.create'),
  validateParams(masterEntityTypeParamSchema),
  validateBody(createMasterEntitySchema),
  asyncHandler(createMasterEntity),
);

masterContentRouter.patch(
  '/entities/:entityType/:entityId',
  requirePermission('master_content.edit'),
  validateParams(masterEntityIdParamSchema),
  validateBody(updateMasterEntitySchema),
  asyncHandler(updateMasterEntity),
);

masterContentRouter.post(
  '/entities/:entityType/:entityId/lifecycle/:action',
  requirePermission('master_content.edit'),
  validateParams(masterEntityIdParamSchema.merge(lifecycleActionParamSchema)),
  validateBody(lifecycleActionBodySchema),
  asyncHandler(transitionMasterLifecycle),
);

masterContentRouter.post(
  '/entities/:entityType/:entityId/revisions',
  requirePermission('master_content.edit'),
  validateParams(masterEntityIdParamSchema),
  asyncHandler(createMasterRevision),
);

masterContentRouter.get(
  '/entities/:entityType/:entityId/audit',
  requirePermission('master_content.view_audit'),
  validateParams(masterEntityIdParamSchema),
  asyncHandler(getMasterAudit),
);

masterContentRouter.post(
  '/mappings/:mappingType',
  requirePermission('master_content.manage_mappings'),
  validateParams(mappingTypeParamSchema),
  validateBody(createMappingSchema),
  asyncHandler(createMasterMapping),
);

masterContentRouter.delete(
  '/mappings/:mappingType/:mappingId',
  requirePermission('master_content.manage_mappings'),
  validateParams(mappingIdParamSchema),
  asyncHandler(deleteMasterMapping),
);

masterContentRouter.post(
  '/lineage/:entityType/:entityId',
  requirePermission('master_content.manage_lineage'),
  validateParams(lineageEntityParamSchema),
  validateBody(createLineageSchema),
  asyncHandler(createMasterLineage),
);

masterContentRouter.patch(
  '/lineage/:lineageId',
  requirePermission('master_content.manage_lineage'),
  validateParams(lineageIdParamSchema),
  validateBody(updateLineageSchema),
  asyncHandler(updateMasterLineage),
);

masterContentRouter.delete(
  '/lineage/:lineageId',
  requirePermission('master_content.manage_lineage'),
  validateParams(lineageIdParamSchema),
  asyncHandler(deleteMasterLineage),
);

export default masterContentRouter;
