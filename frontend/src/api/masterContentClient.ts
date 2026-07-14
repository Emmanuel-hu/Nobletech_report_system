import type { AuthSession } from '../types/auth';
import type {
  LineageEntityType,
  LineageRecord,
  MappingType,
  MasterAuditRecord,
  MasterDashboardCounts,
  MasterEntityListResponse,
  MasterEntityRecord,
  MasterEntityType,
  MasterReviewQueueItem,
} from '../types/master-content';

import { apiRequest } from './httpClient';

const queryString = (filters: Record<string, string | undefined>): string => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, value);
    }
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
};

export const masterContentClient = {
  getDashboard: (session: AuthSession) =>
    apiRequest<MasterDashboardCounts>('/master-content/dashboard', { method: 'GET' }, session),

  listEntities: (
    session: AuthSession,
    entityType: MasterEntityType,
    filters: {
      q?: string;
      status?: 'DRAFT' | 'UNDER_REVIEW' | 'REVISION_REQUIRED' | 'APPROVED' | 'ARCHIVED';
      ownership?: 'all' | 'school' | 'global';
      page?: number;
      pageSize?: number;
    },
  ) =>
    apiRequest<MasterEntityListResponse>(
      `/master-content/entities/${entityType}${
        queryString({
          q: filters.q,
          status: filters.status,
          ownership: filters.ownership,
          page: filters.page ? String(filters.page) : undefined,
          pageSize: filters.pageSize ? String(filters.pageSize) : undefined,
        })
      }`,
      { method: 'GET' },
      session,
    ),

  getEntity: (session: AuthSession, entityType: MasterEntityType, entityId: string) =>
    apiRequest<MasterEntityRecord>(`/master-content/entities/${entityType}/${entityId}`, { method: 'GET' }, session),

  createEntity: (session: AuthSession, entityType: MasterEntityType, data: Record<string, unknown>, isGlobal = false) =>
    apiRequest<MasterEntityRecord>(
      `/master-content/entities/${entityType}`,
      { method: 'POST', body: { isGlobal, data } },
      session,
    ),

  updateEntity: (
    session: AuthSession,
    entityType: MasterEntityType,
    entityId: string,
    data: Record<string, unknown>,
    lastKnownUpdatedAt: string,
  ) =>
    apiRequest<MasterEntityRecord>(
      `/master-content/entities/${entityType}/${entityId}`,
      { method: 'PATCH', body: { data, lastKnownUpdatedAt } },
      session,
    ),

  lifecycleAction: (
    session: AuthSession,
    entityType: MasterEntityType,
    entityId: string,
    action: 'submit-review' | 'request-revision' | 'approve' | 'archive',
    payload: {
      comment?: string;
      requestedChanges?: string;
      reason?: string;
      lastKnownUpdatedAt: string;
    },
  ) =>
    apiRequest<MasterEntityRecord>(
      `/master-content/entities/${entityType}/${entityId}/lifecycle/${action}`,
      { method: 'POST', body: payload },
      session,
    ),

  createRevision: (session: AuthSession, entityType: MasterEntityType, entityId: string, summary?: string) =>
    apiRequest<MasterEntityRecord>(
      `/master-content/entities/${entityType}/${entityId}/revisions`,
      { method: 'POST', body: { summary } },
      session,
    ),

  listReviewQueue: (session: AuthSession) =>
    apiRequest<MasterReviewQueueItem[]>('/master-content/review-queue', { method: 'GET' }, session),

  listAudit: (session: AuthSession, entityType: MasterEntityType, entityId: string) =>
    apiRequest<MasterAuditRecord[]>(`/master-content/entities/${entityType}/${entityId}/audit`, { method: 'GET' }, session),

  createMapping: (
    session: AuthSession,
    mappingType: MappingType,
    payload: {
      leftId: string;
      rightId: string;
      sequenceOrder?: number;
      isPrimary?: boolean;
      isRequired?: boolean;
      proficiencyTarget?: string;
      importanceLevel?: string;
      expectedDepth?: string;
      instructionalEmphasis?: string;
      assessmentRelevance?: string;
      teacherNote?: string;
    },
  ) => apiRequest<{ id: string }>(`/master-content/mappings/${mappingType}`, { method: 'POST', body: payload }, session),

  deleteMapping: (session: AuthSession, mappingType: MappingType, mappingId: string) =>
    apiRequest<{ removed: boolean }>(`/master-content/mappings/${mappingType}/${mappingId}`, { method: 'DELETE' }, session),

  createLineage: (
    session: AuthSession,
    entityType: LineageEntityType,
    entityId: string,
    payload: {
      sourceId: string;
      sourceVersionLabel?: string;
      sourcePage?: string;
      sourceSection?: string;
      extractionNote?: string;
      adaptationNote?: string;
      attribution?: string;
      usageRestriction?: string;
    },
  ) =>
    apiRequest<LineageRecord>(`/master-content/lineage/${entityType}/${entityId}`, { method: 'POST', body: payload }, session),

  updateLineage: (
    session: AuthSession,
    lineageId: string,
    payload: {
      sourceVersionLabel?: string;
      sourcePage?: string;
      sourceSection?: string;
      extractionNote?: string;
      adaptationNote?: string;
      attribution?: string;
      usageRestriction?: string;
      lastKnownUpdatedAt: string;
    },
  ) => apiRequest<LineageRecord>(`/master-content/lineage/${lineageId}`, { method: 'PATCH', body: payload }, session),

  deleteLineage: (session: AuthSession, lineageId: string) =>
    apiRequest<{ removed: boolean }>(`/master-content/lineage/${lineageId}`, { method: 'DELETE' }, session),
};
