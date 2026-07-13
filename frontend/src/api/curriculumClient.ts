import type {
  CurriculumAssignment,
  CurriculumDetail,
  CurriculumListFilters,
  CurriculumSummary,
  CurriculumVersion,
  CurriculumVisibility,
} from '../types/curriculum';
import type { AuthSession } from '../types/auth';

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

export const curriculumClient = {
  listCurricula: (session: AuthSession, filters: CurriculumListFilters) => {
    return apiRequest<CurriculumSummary[]>(
      `/curriculum/curricula${queryString({
        status: filters.status,
        schoolProgrammeComponentId: filters.schoolProgrammeComponentId,
        createdById: filters.createdById,
        includeArchived: filters.includeArchived ? 'true' : undefined,
        isPublished:
          typeof filters.isPublished === 'boolean' ? String(filters.isPublished) : undefined,
      })}`,
      { method: 'GET' },
      session,
    );
  },
  getCurriculum: (session: AuthSession, curriculumId: string) =>
    apiRequest<CurriculumDetail>(`/curriculum/curricula/${curriculumId}`, { method: 'GET' }, session),
  createCurriculum: (
    session: AuthSession,
    payload: { schoolProgrammeComponentId: string; title: string; code: string; description?: string },
  ) => apiRequest<CurriculumDetail>('/curriculum/curricula', { method: 'POST', body: payload }, session),
  updateCurriculum: (
    session: AuthSession,
    curriculumId: string,
    payload: {
      title?: string;
      code?: string;
      description?: string;
      schoolProgrammeComponentId?: string;
      lastKnownUpdatedAt: string;
    },
  ) =>
    apiRequest<CurriculumDetail>(`/curriculum/curricula/${curriculumId}`, { method: 'PATCH', body: payload }, session),
  createUnit: (
    session: AuthSession,
    curriculumId: string,
    payload: { title: string; code?: string; description?: string; sequenceOrder: number; estimatedWeeks?: number },
  ) =>
    apiRequest<CurriculumDetail>(`/curriculum/curricula/${curriculumId}/units`, { method: 'POST', body: payload }, session),
  updateUnit: (
    session: AuthSession,
    curriculumId: string,
    unitId: string,
    payload: {
      title?: string;
      code?: string;
      description?: string;
      sequenceOrder?: number;
      estimatedWeeks?: number;
      lastKnownUpdatedAt: string;
    },
  ) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curricula/${curriculumId}/units/${unitId}`,
      { method: 'PATCH', body: payload },
      session,
    ),
  deleteUnit: (session: AuthSession, curriculumId: string, unitId: string) =>
    apiRequest<CurriculumDetail>(`/curriculum/curricula/${curriculumId}/units/${unitId}`, { method: 'DELETE' }, session),
  reorderUnits: (session: AuthSession, curriculumId: string, orderedUnitIds: string[]) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curricula/${curriculumId}/units/reorder`,
      { method: 'POST', body: { orderedUnitIds } },
      session,
    ),
  createTopic: (
    session: AuthSession,
    unitId: string,
    payload: {
      title: string;
      sequenceOrder: number;
      code?: string;
      description?: string;
      weekNumber?: number;
      recommendedDurationMinutes?: number;
      difficultyLevel?: string;
      teacherNote?: string;
    },
  ) =>
    apiRequest<CurriculumDetail>(`/curriculum/curriculum-units/${unitId}/topics`, { method: 'POST', body: payload }, session),
  updateTopic: (
    session: AuthSession,
    unitId: string,
    topicId: string,
    payload: {
      title?: string;
      code?: string;
      description?: string;
      sequenceOrder?: number;
      weekNumber?: number;
      recommendedDurationMinutes?: number;
      difficultyLevel?: string;
      teacherNote?: string;
      lastKnownUpdatedAt: string;
    },
  ) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curriculum-units/${unitId}/topics/${topicId}`,
      { method: 'PATCH', body: payload },
      session,
    ),
  deleteTopic: (session: AuthSession, unitId: string, topicId: string) =>
    apiRequest<CurriculumDetail>(`/curriculum/curriculum-units/${unitId}/topics/${topicId}`, { method: 'DELETE' }, session),
  reorderTopics: (session: AuthSession, unitId: string, orderedTopicIds: string[]) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curriculum-units/${unitId}/topics/reorder`,
      { method: 'POST', body: { orderedTopicIds } },
      session,
    ),
  addTopicConcept: (
    session: AuthSession,
    topicId: string,
    payload: {
      curriculumConceptId?: string;
      masterConceptId?: string;
      sequenceOrder?: number;
      importanceLevel?: string;
      expectedDepth?: string;
      instructionalEmphasis?: string;
      isCore?: boolean;
      assessmentRelevance?: string;
      teacherNote?: string;
    },
  ) =>
    apiRequest<CurriculumDetail>(`/curriculum/curriculum-topics/${topicId}/concepts`, { method: 'POST', body: payload }, session),
  createProject: (
    session: AuthSession,
    unitId: string,
    payload: {
      title: string;
      description: string;
      sequenceOrder: number;
      objective?: string;
      expectedOutput?: string;
      estimatedDurationMinutes?: number;
      difficultyLevel?: string;
      safetyNote?: string;
    },
  ) =>
    apiRequest<CurriculumDetail>(`/curriculum/curriculum-units/${unitId}/projects`, { method: 'POST', body: payload }, session),
  updateProject: (
    session: AuthSession,
    projectId: string,
    payload: {
      title?: string;
      description?: string;
      sequenceOrder?: number;
      objective?: string;
      expectedOutput?: string;
      estimatedDurationMinutes?: number;
      difficultyLevel?: string;
      safetyNote?: string;
      lastKnownUpdatedAt: string;
    },
  ) =>
    apiRequest<CurriculumDetail>(`/curriculum/curriculum-projects/${projectId}`, { method: 'PATCH', body: payload }, session),
  linkProjectTopic: (session: AuthSession, projectId: string, topicId: string, sequenceOrder?: number) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curriculum-projects/${projectId}/topics`,
      { method: 'POST', body: { topicId, sequenceOrder } },
      session,
    ),
  createLearningOutcome: (
    session: AuthSession,
    curriculumId: string,
    payload: { statement: string; code?: string; bloomLevel?: string; measurableVerb?: string },
  ) =>
    apiRequest<CurriculumDetail>(`/curriculum/curricula/${curriculumId}/learning-outcomes`, { method: 'POST', body: payload }, session),
  updateLearningOutcome: (
    session: AuthSession,
    outcomeId: string,
    payload: {
      statement?: string;
      code?: string;
      bloomLevel?: string;
      measurableVerb?: string;
      lastKnownUpdatedAt: string;
    },
  ) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curriculum-learning-outcomes/${outcomeId}`,
      { method: 'PATCH', body: payload },
      session,
    ),
  linkTopicOutcome: (session: AuthSession, topicId: string, outcomeId: string, sequenceOrder?: number) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curriculum-topics/${topicId}/learning-outcomes`,
      { method: 'POST', body: { outcomeId, sequenceOrder } },
      session,
    ),
  linkProjectOutcome: (session: AuthSession, projectId: string, outcomeId: string, sequenceOrder?: number) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curriculum-projects/${projectId}/learning-outcomes`,
      { method: 'POST', body: { outcomeId, sequenceOrder } },
      session,
    ),
  createResource: (
    session: AuthSession,
    curriculumId: string,
    payload: {
      curriculumTopicId: string;
      title: string;
      resourceType: string;
      description?: string;
      quantityRequired?: string;
      requiresInternet?: boolean;
      requiresLogin?: boolean;
      safetyNote?: string;
    },
  ) =>
    apiRequest<CurriculumDetail>(`/curriculum/curricula/${curriculumId}/resources`, { method: 'POST', body: payload }, session),
  updateResource: (
    session: AuthSession,
    resourceId: string,
    payload: {
      title?: string;
      description?: string;
      quantityRequired?: string;
      requiresInternet?: boolean;
      requiresLogin?: boolean;
      safetyNote?: string;
      lastKnownUpdatedAt: string;
    },
  ) =>
    apiRequest<CurriculumDetail>(`/curriculum/curriculum-resources/${resourceId}`, { method: 'PATCH', body: payload }, session),
  updateVisibility: (session: AuthSession, curriculumId: string, payload: CurriculumVisibility) =>
    apiRequest<CurriculumDetail>(`/curriculum/curricula/${curriculumId}/visibility`, { method: 'PUT', body: payload }, session),
  getVersions: (session: AuthSession, curriculumId: string) =>
    apiRequest<CurriculumVersion[]>(`/curriculum/curricula/${curriculumId}/versions`, { method: 'GET' }, session),
  compareVersions: (session: AuthSession, curriculumId: string, leftVersionId: string, rightVersionId: string) =>
    apiRequest<{
      left: Record<string, unknown>;
      right: Record<string, unknown>;
      metadata: Record<string, unknown>;
    }>(
      `/curriculum/curricula/${curriculumId}/versions/compare${queryString({ leftVersionId, rightVersionId })}`,
      { method: 'GET' },
      session,
    ),
  submitReview: (session: AuthSession, curriculumId: string, comment: string) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curricula/${curriculumId}/submit-review`,
      { method: 'POST', body: { comment } },
      session,
    ),
  requestRevision: (session: AuthSession, curriculumId: string, requestedChanges: string, comment?: string) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curricula/${curriculumId}/request-revision`,
      { method: 'POST', body: { requestedChanges, comment } },
      session,
    ),
  approve: (session: AuthSession, curriculumId: string, comment?: string) =>
    apiRequest<CurriculumDetail>(`/curriculum/curricula/${curriculumId}/approve`, { method: 'POST', body: { comment } }, session),
  publish: (session: AuthSession, curriculumId: string, versionId?: string, comment?: string) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curricula/${curriculumId}/publish`,
      { method: 'POST', body: { versionId, comment } },
      session,
    ),
  archiveCurriculum: (session: AuthSession, curriculumId: string, reason: string) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curricula/${curriculumId}/archive`,
      { method: 'POST', body: { reason } },
      session,
    ),
  getAssignments: (session: AuthSession, curriculumId: string) =>
    apiRequest<CurriculumAssignment[]>(`/curriculum/curricula/${curriculumId}/assignments`, { method: 'GET' }, session),
  createAssignment: (
    session: AuthSession,
    curriculumId: string,
    payload: {
      curriculumVersionId: string;
      academicSessionId: string;
      termId: string;
      academicClassId: string;
      schoolProgrammeComponentId: string;
      teacherUserId?: string;
      effectiveFrom: string;
      effectiveTo?: string;
    },
  ) =>
    apiRequest<CurriculumDetail>(`/curriculum/curricula/${curriculumId}/assignments`, { method: 'POST', body: payload }, session),
  updateAssignmentStatus: (session: AuthSession, assignmentId: string, action: 'activate' | 'complete' | 'suspend' | 'archive', reason: string) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curriculum-assignments/${assignmentId}/${action}`,
      { method: 'POST', body: { reason } },
      session,
    ),
};
