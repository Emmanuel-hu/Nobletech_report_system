import type { Request, Response } from 'express';

import { masterContentService } from '../services/master-content.service';
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

const readRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
};

export const getMasterDashboard = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentService.getDashboard(getAuth(req));
  res.status(200).json({ success: true, message: 'Master content dashboard metrics fetched.', data });
};

export const listMasterEntities = async (req: Request, res: Response): Promise<void> => {
  const entityType = param(req, 'entityType') as Parameters<typeof masterContentService.listEntities>[1];
  const data = await masterContentService.listEntities(getAuth(req), entityType, {
    q: req.query.q ? String(req.query.q) : undefined,
    status: req.query.status ? (String(req.query.status) as any) : undefined,
    ownership: req.query.ownership ? (String(req.query.ownership) as any) : undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });

  res.status(200).json({ success: true, message: 'Master content list fetched.', data });
};

export const getMasterEntity = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentService.getEntity(
    getAuth(req),
    param(req, 'entityType') as Parameters<typeof masterContentService.getEntity>[1],
    param(req, 'entityId'),
  );

  res.status(200).json({ success: true, message: 'Master content detail fetched.', data });
};

export const createMasterEntity = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentService.createEntity(
    getAuth(req),
    param(req, 'entityType') as Parameters<typeof masterContentService.createEntity>[1],
    {
      isGlobal: Boolean(req.body.isGlobal),
      data: readRecord(req.body.data),
    },
    req.requestId,
  );

  res.status(201).json({ success: true, message: 'Master content entity created.', data });
};

export const updateMasterEntity = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentService.updateEntity(
    getAuth(req),
    param(req, 'entityType') as Parameters<typeof masterContentService.updateEntity>[1],
    param(req, 'entityId'),
    {
      data: readRecord(req.body.data),
      lastKnownUpdatedAt: String(req.body.lastKnownUpdatedAt),
    },
    req.requestId,
  );

  res.status(200).json({ success: true, message: 'Master content entity updated.', data });
};

export const transitionMasterLifecycle = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentService.transitionLifecycle(
    getAuth(req),
    param(req, 'entityType') as Parameters<typeof masterContentService.transitionLifecycle>[1],
    param(req, 'entityId'),
    param(req, 'action') as Parameters<typeof masterContentService.transitionLifecycle>[3],
    {
      comment: req.body.comment,
      requestedChanges: req.body.requestedChanges,
      reason: req.body.reason,
      lastKnownUpdatedAt: String(req.body.lastKnownUpdatedAt),
    },
    req.requestId,
  );

  res.status(200).json({ success: true, message: 'Lifecycle action applied.', data });
};

export const createMasterRevision = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentService.createRevision(
    getAuth(req),
    param(req, 'entityType') as Parameters<typeof masterContentService.createRevision>[1],
    param(req, 'entityId'),
    req.body.summary ? String(req.body.summary) : undefined,
    req.requestId,
  );

  res.status(201).json({ success: true, message: 'New draft revision created.', data });
};

export const getMasterReviewQueue = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentService.listReviewQueue(getAuth(req));
  res.status(200).json({ success: true, message: 'Master content review queue fetched.', data });
};

export const getMasterAudit = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentService.getAuditHistory(
    getAuth(req),
    param(req, 'entityType') as Parameters<typeof masterContentService.getAuditHistory>[1],
    param(req, 'entityId'),
  );

  res.status(200).json({ success: true, message: 'Master content audit history fetched.', data });
};

export const createMasterMapping = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentService.createMapping(
    getAuth(req),
    param(req, 'mappingType') as Parameters<typeof masterContentService.createMapping>[1],
    {
      leftId: String(req.body.leftId),
      rightId: String(req.body.rightId),
      sequenceOrder: req.body.sequenceOrder,
      isPrimary: req.body.isPrimary,
      isRequired: req.body.isRequired,
      proficiencyTarget: req.body.proficiencyTarget,
      importanceLevel: req.body.importanceLevel,
      expectedDepth: req.body.expectedDepth,
      instructionalEmphasis: req.body.instructionalEmphasis,
      assessmentRelevance: req.body.assessmentRelevance,
      teacherNote: req.body.teacherNote,
    },
    req.requestId,
  );

  res.status(201).json({ success: true, message: 'Master mapping created.', data });
};

export const deleteMasterMapping = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentService.removeMapping(
    getAuth(req),
    param(req, 'mappingType') as Parameters<typeof masterContentService.removeMapping>[1],
    param(req, 'mappingId'),
    req.requestId,
  );

  res.status(200).json({ success: true, message: 'Master mapping removed.', data });
};

export const createMasterLineage = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentService.createLineage(
    getAuth(req),
    param(req, 'entityType') as Parameters<typeof masterContentService.createLineage>[1],
    param(req, 'entityId'),
    {
      sourceId: String(req.body.sourceId),
      sourceVersionLabel: req.body.sourceVersionLabel,
      sourcePage: req.body.sourcePage,
      sourceSection: req.body.sourceSection,
      extractionNote: req.body.extractionNote,
      adaptationNote: req.body.adaptationNote,
      attribution: req.body.attribution,
      usageRestriction: req.body.usageRestriction,
    },
    req.requestId,
  );

  res.status(201).json({ success: true, message: 'Lineage link created.', data });
};

export const updateMasterLineage = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentService.updateLineage(
    getAuth(req),
    param(req, 'lineageId'),
    {
      sourceVersionLabel: req.body.sourceVersionLabel,
      sourcePage: req.body.sourcePage,
      sourceSection: req.body.sourceSection,
      extractionNote: req.body.extractionNote,
      adaptationNote: req.body.adaptationNote,
      attribution: req.body.attribution,
      usageRestriction: req.body.usageRestriction,
      lastKnownUpdatedAt: String(req.body.lastKnownUpdatedAt),
    },
    req.requestId,
  );

  res.status(200).json({ success: true, message: 'Lineage link updated.', data });
};

export const deleteMasterLineage = async (req: Request, res: Response): Promise<void> => {
  const data = await masterContentService.deleteLineage(getAuth(req), param(req, 'lineageId'), req.requestId);
  res.status(200).json({ success: true, message: 'Lineage link removed.', data });
};
