import type { Request, Response } from 'express';

import { masterContentPromotionService } from '../services/master-content-promotion.service';
import { badRequest, unauthorized } from '../utils/app-error';

const getAuth = (req: Request) => {
  if (!req.auth) {
    throw unauthorized();
  }
  return req.auth;
};

const param = (req: Request, key: string): string => {
  const value = req.params[key];
  if (!value) {
    throw badRequest(`Missing required route parameter: ${key}.`);
  }
  return value;
};

export const listMasterContentPromotions = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.listPromotions(getAuth(req), {
    status: req.query.status ? (String(req.query.status) as any) : undefined,
    processingSessionId: req.query.processingSessionId ? String(req.query.processingSessionId) : undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });

  res.status(200).json({ success: true, message: 'Master-content promotions fetched.', data });
};

export const createMasterContentPromotion = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.createPromotion(
    getAuth(req),
    {
      processingSessionId: String(req.body.processingSessionId),
      adaptationNote: req.body.adaptationNote,
      reviewNote: req.body.reviewNote,
      metadata: req.body.metadata,
    },
    req.requestId,
  );

  res.status(201).json({ success: true, message: 'Master-content promotion created.', data });
};

export const getMasterContentPromotion = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.getPromotion(getAuth(req), param(req, 'promotionId'));
  res.status(200).json({ success: true, message: 'Master-content promotion fetched.', data });
};

export const updateMasterContentPromotion = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.updatePromotion(
    getAuth(req),
    param(req, 'promotionId'),
    {
      adaptationNote: req.body.adaptationNote,
      reviewNote: req.body.reviewNote,
      duplicateDecision: req.body.duplicateDecision,
      metadata: req.body.metadata,
      reviewerId: req.body.reviewerId,
      lastKnownUpdatedAt: String(req.body.lastKnownUpdatedAt),
    },
    req.requestId,
  );

  res.status(200).json({ success: true, message: 'Master-content promotion updated.', data });
};

export const submitMasterContentPromotionReview = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.submitReview(getAuth(req), param(req, 'promotionId'), req.body, req.requestId);
  res.status(200).json({ success: true, message: 'Promotion submitted for review.', data });
};

export const requestMasterContentPromotionRevision = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.requestRevision(
    getAuth(req),
    param(req, 'promotionId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Revision requested for promotion.', data });
};

export const approveMasterContentPromotion = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.approve(getAuth(req), param(req, 'promotionId'), req.body, req.requestId);
  res.status(200).json({ success: true, message: 'Promotion approved.', data });
};

export const rejectMasterContentPromotion = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.reject(getAuth(req), param(req, 'promotionId'), req.body, req.requestId);
  res.status(200).json({ success: true, message: 'Promotion rejected.', data });
};

export const completeMasterContentPromotion = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.complete(getAuth(req), param(req, 'promotionId'), req.body, req.requestId);
  res.status(200).json({ success: true, message: 'Promotion completed.', data });
};

export const archiveMasterContentPromotion = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.archive(getAuth(req), param(req, 'promotionId'), req.body, req.requestId);
  res.status(200).json({ success: true, message: 'Promotion archived.', data });
};

export const listMasterContentPromotionItems = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.listItems(getAuth(req), param(req, 'promotionId'));
  res.status(200).json({ success: true, message: 'Promotion items fetched.', data });
};

export const addMasterContentPromotionItem = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.addItem(getAuth(req), param(req, 'promotionId'), req.body, req.requestId);
  res.status(201).json({ success: true, message: 'Promotion item added.', data });
};

export const updateMasterContentPromotionItem = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.updateItem(
    getAuth(req),
    param(req, 'promotionId'),
    param(req, 'itemId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Promotion item updated.', data });
};

export const deleteMasterContentPromotionItem = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.removeItem(
    getAuth(req),
    param(req, 'promotionId'),
    param(req, 'itemId'),
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Promotion item removed.', data });
};

export const reorderMasterContentPromotionItems = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.reorderItems(getAuth(req), param(req, 'promotionId'), req.body, req.requestId);
  res.status(200).json({ success: true, message: 'Promotion items reordered.', data });
};

export const checkMasterContentPromotionItemDuplicates = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.checkDuplicates(
    getAuth(req),
    param(req, 'promotionId'),
    param(req, 'itemId'),
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Duplicate candidates checked.', data });
};

export const linkMasterContentPromotionItemExisting = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.linkExisting(
    getAuth(req),
    param(req, 'promotionId'),
    param(req, 'itemId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Promotion item linked to existing master content.', data });
};

export const createMasterContentPromotionItemDraft = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.createDraft(
    getAuth(req),
    param(req, 'promotionId'),
    param(req, 'itemId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Master-content draft created from promotion item.', data });
};

export const getMasterContentPromotionHistory = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.history(getAuth(req), param(req, 'promotionId'));
  res.status(200).json({ success: true, message: 'Promotion history fetched.', data });
};

export const getMasterContentPromotionCompare = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.compare(getAuth(req), param(req, 'promotionId'));
  res.status(200).json({ success: true, message: 'Promotion comparison fetched.', data });
};

export const getMasterContentPromotionAudit = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentPromotionService.audit(getAuth(req), param(req, 'promotionId'));
  res.status(200).json({ success: true, message: 'Promotion audit fetched.', data });
};