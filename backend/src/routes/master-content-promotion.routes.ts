import { Router } from 'express';

import {
  addMasterContentPromotionItem,
  approveMasterContentPromotion,
  archiveMasterContentPromotion,
  checkMasterContentPromotionItemDuplicates,
  completeMasterContentPromotion,
  createMasterContentPromotion,
  createMasterContentPromotionItemDraft,
  deleteMasterContentPromotionItem,
  getMasterContentPromotion,
  getMasterContentPromotionAudit,
  getMasterContentPromotionCompare,
  getMasterContentPromotionHistory,
  linkMasterContentPromotionItemExisting,
  listMasterContentPromotionItems,
  listMasterContentPromotions,
  rejectMasterContentPromotion,
  reorderMasterContentPromotionItems,
  requestMasterContentPromotionRevision,
  submitMasterContentPromotionReview,
  updateMasterContentPromotion,
  updateMasterContentPromotionItem,
} from '../controllers/master-content-promotion.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware';
import { asyncHandler } from '../utils/async-handler';
import {
  addPromotionItemSchema,
  createDraftItemSchema,
  createPromotionSchema,
  linkExistingItemSchema,
  listPromotionsQuerySchema,
  promotionIdParamSchema,
  promotionItemIdParamSchema,
  promotionLifecycleSchema,
  reorderPromotionItemsSchema,
  updatePromotionItemSchema,
  updatePromotionSchema,
} from '../validators/master-content-promotion.validator';

const masterContentPromotionRouter = Router();

masterContentPromotionRouter.use(authMiddleware);

masterContentPromotionRouter.get(
  '/',
  requirePermission('master_content.promotion.view'),
  validateQuery(listPromotionsQuerySchema),
  asyncHandler(listMasterContentPromotions),
);

masterContentPromotionRouter.post(
  '/',
  requirePermission('master_content.promotion.create'),
  validateBody(createPromotionSchema),
  asyncHandler(createMasterContentPromotion),
);

masterContentPromotionRouter.get(
  '/:promotionId',
  requirePermission('master_content.promotion.view'),
  validateParams(promotionIdParamSchema),
  asyncHandler(getMasterContentPromotion),
);

masterContentPromotionRouter.patch(
  '/:promotionId',
  requirePermission('master_content.promotion.edit'),
  validateParams(promotionIdParamSchema),
  validateBody(updatePromotionSchema),
  asyncHandler(updateMasterContentPromotion),
);

masterContentPromotionRouter.post(
  '/:promotionId/submit-review',
  requirePermission('master_content.promotion.submit_review'),
  validateParams(promotionIdParamSchema),
  validateBody(promotionLifecycleSchema),
  asyncHandler(submitMasterContentPromotionReview),
);

masterContentPromotionRouter.post(
  '/:promotionId/request-revision',
  requirePermission('master_content.promotion.request_revision'),
  validateParams(promotionIdParamSchema),
  validateBody(promotionLifecycleSchema),
  asyncHandler(requestMasterContentPromotionRevision),
);

masterContentPromotionRouter.post(
  '/:promotionId/approve',
  requirePermission('master_content.promotion.approve'),
  validateParams(promotionIdParamSchema),
  validateBody(promotionLifecycleSchema),
  asyncHandler(approveMasterContentPromotion),
);

masterContentPromotionRouter.post(
  '/:promotionId/reject',
  requirePermission('master_content.promotion.reject'),
  validateParams(promotionIdParamSchema),
  validateBody(promotionLifecycleSchema),
  asyncHandler(rejectMasterContentPromotion),
);

masterContentPromotionRouter.post(
  '/:promotionId/complete',
  requirePermission('master_content.promotion.complete'),
  validateParams(promotionIdParamSchema),
  validateBody(promotionLifecycleSchema),
  asyncHandler(completeMasterContentPromotion),
);

masterContentPromotionRouter.post(
  '/:promotionId/archive',
  requirePermission('master_content.promotion.archive'),
  validateParams(promotionIdParamSchema),
  validateBody(promotionLifecycleSchema),
  asyncHandler(archiveMasterContentPromotion),
);

masterContentPromotionRouter.get(
  '/:promotionId/items',
  requirePermission('master_content.promotion.view'),
  validateParams(promotionIdParamSchema),
  asyncHandler(listMasterContentPromotionItems),
);

masterContentPromotionRouter.post(
  '/:promotionId/items',
  requirePermission('master_content.promotion.edit'),
  validateParams(promotionIdParamSchema),
  validateBody(addPromotionItemSchema),
  asyncHandler(addMasterContentPromotionItem),
);

masterContentPromotionRouter.patch(
  '/:promotionId/items/:itemId',
  requirePermission('master_content.promotion.edit'),
  validateParams(promotionItemIdParamSchema),
  validateBody(updatePromotionItemSchema),
  asyncHandler(updateMasterContentPromotionItem),
);

masterContentPromotionRouter.delete(
  '/:promotionId/items/:itemId',
  requirePermission('master_content.promotion.edit'),
  validateParams(promotionItemIdParamSchema),
  asyncHandler(deleteMasterContentPromotionItem),
);

masterContentPromotionRouter.post(
  '/:promotionId/items/reorder',
  requirePermission('master_content.promotion.edit'),
  validateParams(promotionIdParamSchema),
  validateBody(reorderPromotionItemsSchema),
  asyncHandler(reorderMasterContentPromotionItems),
);

masterContentPromotionRouter.post(
  '/:promotionId/items/:itemId/check-duplicates',
  requirePermission('master_content.promotion.manage_duplicates'),
  validateParams(promotionItemIdParamSchema),
  asyncHandler(checkMasterContentPromotionItemDuplicates),
);

masterContentPromotionRouter.post(
  '/:promotionId/items/:itemId/link-existing',
  requirePermission('master_content.promotion.link_existing'),
  validateParams(promotionItemIdParamSchema),
  validateBody(linkExistingItemSchema),
  asyncHandler(linkMasterContentPromotionItemExisting),
);

masterContentPromotionRouter.post(
  '/:promotionId/items/:itemId/create-draft',
  requirePermission('master_content.promotion.edit'),
  validateParams(promotionItemIdParamSchema),
  validateBody(createDraftItemSchema),
  asyncHandler(createMasterContentPromotionItemDraft),
);

masterContentPromotionRouter.get(
  '/:promotionId/history',
  requirePermission('master_content.promotion.view'),
  validateParams(promotionIdParamSchema),
  asyncHandler(getMasterContentPromotionHistory),
);

masterContentPromotionRouter.get(
  '/:promotionId/compare',
  requirePermission('master_content.promotion.view'),
  validateParams(promotionIdParamSchema),
  asyncHandler(getMasterContentPromotionCompare),
);

masterContentPromotionRouter.get(
  '/:promotionId/audit',
  requirePermission('master_content.promotion.view_audit'),
  validateParams(promotionIdParamSchema),
  asyncHandler(getMasterContentPromotionAudit),
);

export default masterContentPromotionRouter;