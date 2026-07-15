import type { Request, Response } from 'express';

import { sourceProcessingService } from '../services/source-processing.service';
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

export const listProcessingSessions = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.listProcessingSessions(getAuth(req), param(req, 'sourceId'));
  res.status(200).json({ success: true, message: 'Processing sessions fetched.', data });
};

export const createProcessingSession = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.createProcessingSession(
    getAuth(req),
    param(req, 'sourceId'),
    req.body,
    req.requestId,
  );
  res.status(201).json({ success: true, message: 'Processing session created.', data });
};

export const getProcessingSession = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.getProcessingSession(
    getAuth(req),
    param(req, 'sourceId'),
    param(req, 'sessionId'),
  );
  res.status(200).json({ success: true, message: 'Processing session fetched.', data });
};

export const updateProcessingSession = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.updateProcessingSession(
    getAuth(req),
    param(req, 'sourceId'),
    param(req, 'sessionId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Processing session updated.', data });
};

export const submitProcessingSessionReview = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.submitForReview(
    getAuth(req),
    param(req, 'sourceId'),
    param(req, 'sessionId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Processing session submitted for review.', data });
};

export const requestProcessingSessionRevision = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.requestRevision(
    getAuth(req),
    param(req, 'sourceId'),
    param(req, 'sessionId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Revision requested for processing session.', data });
};

export const approveProcessingSession = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.approve(
    getAuth(req),
    param(req, 'sourceId'),
    param(req, 'sessionId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Processing session approved.', data });
};

export const rejectProcessingSession = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.reject(
    getAuth(req),
    param(req, 'sourceId'),
    param(req, 'sessionId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Processing session rejected.', data });
};

export const completeProcessingSession = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.complete(
    getAuth(req),
    param(req, 'sourceId'),
    param(req, 'sessionId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Processing session completed.', data });
};

export const archiveProcessingSession = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.archive(
    getAuth(req),
    param(req, 'sourceId'),
    param(req, 'sessionId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Processing session archived.', data });
};

export const listProcessingSections = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.listSections(getAuth(req), param(req, 'sessionId'));
  res.status(200).json({ success: true, message: 'Processing sections fetched.', data });
};

export const createProcessingSection = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.createSection(getAuth(req), param(req, 'sessionId'), req.body, req.requestId);
  res.status(201).json({ success: true, message: 'Processing section created.', data });
};

export const getProcessingSection = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.getSection(getAuth(req), param(req, 'sessionId'), param(req, 'sectionId'));
  res.status(200).json({ success: true, message: 'Processing section fetched.', data });
};

export const updateProcessingSection = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.updateSection(
    getAuth(req),
    param(req, 'sessionId'),
    param(req, 'sectionId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Processing section updated.', data });
};

export const deleteProcessingSection = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.deleteSection(
    getAuth(req),
    param(req, 'sessionId'),
    param(req, 'sectionId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Processing section deleted.', data });
};

export const archiveProcessingSection = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.archiveSection(
    getAuth(req),
    param(req, 'sessionId'),
    param(req, 'sectionId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Processing section archived.', data });
};

export const reorderProcessingSections = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.reorderSections(getAuth(req), param(req, 'sessionId'), req.body, req.requestId);
  res.status(200).json({ success: true, message: 'Processing sections reordered.', data });
};

export const moveProcessingSection = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.moveSection(
    getAuth(req),
    param(req, 'sessionId'),
    param(req, 'sectionId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Processing section moved.', data });
};

export const listProcessingRevisions = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.listRevisions(getAuth(req), param(req, 'sessionId'));
  res.status(200).json({ success: true, message: 'Processing revisions fetched.', data });
};

export const compareProcessingRevisions = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.compareRevisions(getAuth(req), param(req, 'sessionId'), {
    leftRevisionId: req.query.leftRevisionId ? String(req.query.leftRevisionId) : undefined,
    rightRevisionId: req.query.rightRevisionId ? String(req.query.rightRevisionId) : undefined,
  });
  res.status(200).json({ success: true, message: 'Processing revisions compared.', data });
};

export const getProcessingAuditHistory = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.getAuditHistory(getAuth(req), param(req, 'sessionId'));
  res.status(200).json({ success: true, message: 'Processing audit history fetched.', data });
};

export const createStructuredRecordFromSection = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.createStructuredRecordFromSection(
    getAuth(req),
    param(req, 'sessionId'),
    param(req, 'sectionId'),
    req.body,
    req.requestId,
  );
  res.status(201).json({ success: true, message: 'Structured record created from section.', data });
};

export const listProcessingStructuredRecords = async (req: Request, res: Response): Promise<void> => {
  const data = await sourceProcessingService.listStructuredRecords(getAuth(req), param(req, 'sessionId'));
  res.status(200).json({ success: true, message: 'Structured records fetched.', data });
};
