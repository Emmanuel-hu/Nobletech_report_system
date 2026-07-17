import type {
  CurriculumSourceContent,
  CurriculumSourceProcessingAuditItem,
  CurriculumSourceProcessingSession,
  CurriculumSourceRevisionComparison,
  CurriculumSourceSection,
  CurriculumSource,
  CurriculumSourceContentType,
  CurriculumSourceFormat,
  CurriculumSourceType,
  MasterCatalogType,
  CurriculumAssignment,
  CurriculumDetail,
  CurriculumEditorLookups,
  CurriculumListFilters,
  CurriculumSummary,
  CurriculumVersionComparison,
  CurriculumVersionSnapshot,
  CurriculumVersion,
  CurriculumVisibility,
  MasterContentPromotionStatus,
  MasterContentPromotionRecordType,
  MasterContentPromotionTargetType,
  MasterContentPromotionAction,
  MasterContentPromotionItem,
  MasterContentPromotion,
} from '../types/curriculum';
import type { AuthSession } from '../types/auth';

import { apiRequest } from './httpClient';
import { masterContentClient } from './masterContentClient';
import { runtimeConfig } from '../config/runtime';

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
  downloadSourceFileBlob: async (
    session: AuthSession,
    sourceId: string,
    fileId: string,
    mode: 'download' | 'preview' = 'download',
  ) => {
    const endpoint =
      mode === 'preview'
        ? `/curriculum/sources/${sourceId}/files/${fileId}/preview`
        : `/curriculum/sources/${sourceId}/files/${fileId}/download`;

    const response = await fetch(`${runtimeConfig.apiBaseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'x-user-id': session.userId,
        'x-school-id': session.schoolId,
      },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to download file.');
    }

    const disposition = response.headers.get('content-disposition') || '';
    const fileNameMatch = disposition.match(/filename="([^"]+)"/i);
    const fileName = fileNameMatch?.[1] || 'source-file';

    return {
      blob: await response.blob(),
      fileName,
      mimeType: response.headers.get('content-type') || 'application/octet-stream',
    };
  },
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
  getEditorLookups: (session: AuthSession, curriculumId: string, sessionId?: string) =>
    apiRequest<CurriculumEditorLookups>(
      `/curriculum/curricula/${curriculumId}/editor-lookups${queryString({ sessionId })}`,
      { method: 'GET' },
      session,
    ),
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
  updateTopicConcept: (
    session: AuthSession,
    mappingId: string,
    payload: {
      sequenceOrder?: number;
      importanceLevel?: string;
      expectedDepth?: string;
      instructionalEmphasis?: string;
      isCore?: boolean;
      assessmentRelevance?: string;
      teacherNote?: string;
      lastKnownUpdatedAt: string;
    },
  ) =>
    apiRequest<CurriculumDetail>(`/curriculum/curriculum-topic-concepts/${mappingId}`, { method: 'PATCH', body: payload }, session),
  deleteTopicConcept: (session: AuthSession, mappingId: string) =>
    apiRequest<CurriculumDetail>(`/curriculum/curriculum-topic-concepts/${mappingId}`, { method: 'DELETE' }, session),
  createConcept: (
    session: AuthSession,
    curriculumId: string,
    payload: {
      name: string;
      code?: string;
      definition: string;
      explanation?: string;
      masterConceptId?: string;
    },
  ) =>
    apiRequest<CurriculumDetail>(`/curriculum/curricula/${curriculumId}/concepts`, { method: 'POST', body: payload }, session),
  updateConcept: (
    session: AuthSession,
    conceptId: string,
    payload: {
      name?: string;
      code?: string;
      definition?: string;
      explanation?: string;
      lastKnownUpdatedAt: string;
    },
  ) =>
    apiRequest<CurriculumDetail>(`/curriculum/curriculum-concepts/${conceptId}`, { method: 'PATCH', body: payload }, session),
  deleteConcept: (session: AuthSession, conceptId: string) =>
    apiRequest<CurriculumDetail>(`/curriculum/curriculum-concepts/${conceptId}`, { method: 'DELETE' }, session),
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
  deleteProject: (session: AuthSession, projectId: string) =>
    apiRequest<CurriculumDetail>(`/curriculum/curriculum-projects/${projectId}`, { method: 'DELETE' }, session),
  linkProjectTopic: (session: AuthSession, projectId: string, topicId: string, sequenceOrder?: number) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curriculum-projects/${projectId}/topics`,
      { method: 'POST', body: { topicId, sequenceOrder } },
      session,
    ),
  deleteProjectTopicLink: (session: AuthSession, linkId: string) =>
    apiRequest<CurriculumDetail>(`/curriculum/curriculum-topic-project-links/${linkId}`, { method: 'DELETE' }, session),
  createProjectImplementation: (
    session: AuthSession,
    projectId: string,
    payload: {
      title: string;
      implementationType: string;
      description?: string;
      sequenceOrder: number;
      teacherInstructions?: string;
      learnerInstructions?: string;
      safetyInstructions?: string;
      requiredInternet?: boolean;
      requiredDeviceCount?: number;
      estimatedDurationMinutes?: number;
    },
  ) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curriculum-projects/${projectId}/implementations`,
      { method: 'POST', body: payload },
      session,
    ),
  updateProjectImplementation: (
    session: AuthSession,
    implementationId: string,
    payload: {
      title?: string;
      implementationType?: string;
      description?: string;
      sequenceOrder?: number;
      teacherInstructions?: string;
      learnerInstructions?: string;
      safetyInstructions?: string;
      requiredInternet?: boolean;
      requiredDeviceCount?: number;
      estimatedDurationMinutes?: number;
      lastKnownUpdatedAt: string;
    },
  ) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curriculum-project-implementations/${implementationId}`,
      { method: 'PATCH', body: payload },
      session,
    ),
  deleteProjectImplementation: (session: AuthSession, implementationId: string) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curriculum-project-implementations/${implementationId}`,
      { method: 'DELETE' },
      session,
    ),
  createLearningOutcome: (
    session: AuthSession,
    curriculumId: string,
    payload: {
      statement: string;
      code?: string;
      bloomLevel?: string;
      measurableVerb?: string;
      masterLearningOutcomeId?: string;
    },
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
  deleteLearningOutcome: (session: AuthSession, outcomeId: string) =>
    apiRequest<CurriculumDetail>(`/curriculum/curriculum-learning-outcomes/${outcomeId}`, { method: 'DELETE' }, session),
  linkTopicOutcome: (session: AuthSession, topicId: string, outcomeId: string, sequenceOrder?: number) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curriculum-topics/${topicId}/learning-outcomes`,
      { method: 'POST', body: { outcomeId, sequenceOrder } },
      session,
    ),
  deleteTopicOutcomeLink: (session: AuthSession, linkId: string) =>
    apiRequest<CurriculumDetail>(`/curriculum/curriculum-topic-learning-outcome-links/${linkId}`, { method: 'DELETE' }, session),
  linkProjectOutcome: (session: AuthSession, projectId: string, outcomeId: string, sequenceOrder?: number) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curriculum-projects/${projectId}/learning-outcomes`,
      { method: 'POST', body: { outcomeId, sequenceOrder } },
      session,
    ),
  deleteProjectOutcomeLink: (session: AuthSession, linkId: string) =>
    apiRequest<CurriculumDetail>(`/curriculum/curriculum-project-learning-outcome-links/${linkId}`, { method: 'DELETE' }, session),
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
      externalUrl?: string;
      internalFileReference?: string;
      masterResourceId?: string;
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
      externalUrl?: string;
      internalFileReference?: string;
      lastKnownUpdatedAt: string;
    },
  ) =>
    apiRequest<CurriculumDetail>(`/curriculum/curriculum-resources/${resourceId}`, { method: 'PATCH', body: payload }, session),
  deleteResource: (session: AuthSession, resourceId: string) =>
    apiRequest<CurriculumDetail>(`/curriculum/curriculum-resources/${resourceId}`, { method: 'DELETE' }, session),
  reorderTopicConcepts: (
    session: AuthSession,
    topicId: string,
    orderedMappingIds: string[],
    lastKnownTopicUpdatedAt: string,
  ) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curriculum-topics/${topicId}/concepts/reorder`,
      { method: 'POST', body: { orderedMappingIds, lastKnownTopicUpdatedAt } },
      session,
    ),
  reorderProjectImplementations: (
    session: AuthSession,
    projectId: string,
    orderedImplementationIds: string[],
    lastKnownProjectUpdatedAt: string,
  ) =>
    apiRequest<CurriculumDetail>(
      `/curriculum/curriculum-projects/${projectId}/implementations/reorder`,
      { method: 'POST', body: { orderedImplementationIds, lastKnownProjectUpdatedAt } },
      session,
    ),
  updateVisibility: (session: AuthSession, curriculumId: string, payload: CurriculumVisibility) =>
    apiRequest<CurriculumDetail>(`/curriculum/curricula/${curriculumId}/visibility`, { method: 'PUT', body: payload }, session),
  getVersions: (session: AuthSession, curriculumId: string) =>
    apiRequest<CurriculumVersion[]>(`/curriculum/curricula/${curriculumId}/versions`, { method: 'GET' }, session),
  compareVersions: (session: AuthSession, curriculumId: string, leftVersionId: string, rightVersionId: string) =>
    apiRequest<CurriculumVersionComparison>(
      `/curriculum/curricula/${curriculumId}/versions/compare${queryString({ leftVersionId, rightVersionId })}`,
      { method: 'GET' },
      session,
    ),
  getVersionSnapshot: (session: AuthSession, curriculumId: string, versionId: string) =>
    apiRequest<CurriculumVersionSnapshot>(
      `/curriculum/curricula/${curriculumId}/versions/${versionId}/snapshot`,
      { method: 'GET' },
      session,
    ),
  createDraftVersion: (
    session: AuthSession,
    curriculumId: string,
    payload: {
      basedOnVersionId?: string;
      changeSummary?: string;
      majorVersion?: number;
      minorVersion?: number;
      patchVersion?: number;
      versionLabel?: string;
    },
  ) => apiRequest<CurriculumDetail>(`/curriculum/curricula/${curriculumId}/versions`, { method: 'POST', body: payload }, session),
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
  listSources: (
    session: AuthSession,
    filters?: {
      reviewStatus?: string;
      sourceType?: CurriculumSourceType;
      sourceFormat?: CurriculumSourceFormat;
      subjectId?: string;
      ownership?: 'school' | 'global' | 'all';
      q?: string;
      page?: number;
      pageSize?: number;
      includeGlobal?: boolean;
    },
  ) =>
    apiRequest<CurriculumSource[]>(
      `/curriculum/sources${queryString({
        reviewStatus: filters?.reviewStatus,
        sourceType: filters?.sourceType,
        sourceFormat: filters?.sourceFormat,
        subjectId: filters?.subjectId,
        ownership: filters?.ownership,
        q: filters?.q,
        page: typeof filters?.page === 'number' ? String(filters.page) : undefined,
        pageSize: typeof filters?.pageSize === 'number' ? String(filters.pageSize) : undefined,
        includeGlobal: filters?.includeGlobal === false ? 'false' : undefined,
      })}`,
      { method: 'GET' },
      session,
    ),
  getSource: (session: AuthSession, sourceId: string) =>
    apiRequest<CurriculumSource>(`/curriculum/sources/${sourceId}`, { method: 'GET' }, session),
  createSource: (
    session: AuthSession,
    payload: {
      sourceCode?: string;
      title: string;
      description?: string;
      sourceType: CurriculumSourceType;
      sourceFormat: CurriculumSourceFormat;
      usageRights: string;
      sourceUrl?: string;
      fileReference?: string;
      isGlobal?: boolean;
    },
  ) => apiRequest<CurriculumSource>('/curriculum/sources', { method: 'POST', body: payload }, session),
  updateSource: (
    session: AuthSession,
    sourceId: string,
    payload: {
      sourceCode?: string;
      title?: string;
      description?: string;
      sourceType?: CurriculumSourceType;
      sourceFormat?: CurriculumSourceFormat;
      usageRights?: string;
      sourceUrl?: string;
      fileReference?: string;
      lastKnownUpdatedAt: string;
    },
  ) => apiRequest<CurriculumSource>(`/curriculum/sources/${sourceId}`, { method: 'PATCH', body: payload }, session),
  submitSourceReview: (session: AuthSession, sourceId: string, comment?: string) =>
    apiRequest<CurriculumSource>(`/curriculum/sources/${sourceId}/submit-review`, { method: 'POST', body: { comment } }, session),
  requestSourceRevision: (
    session: AuthSession,
    sourceId: string,
    payload: { requestedChanges: string; comment?: string; lastKnownUpdatedAt?: string },
  ) =>
    apiRequest<CurriculumSource>(
      `/curriculum/sources/${sourceId}/request-revision`,
      { method: 'POST', body: payload },
      session,
    ),
  rejectSource: (
    session: AuthSession,
    sourceId: string,
    payload: { rejectionReason: string; comment?: string; lastKnownUpdatedAt?: string },
  ) => apiRequest<CurriculumSource>(`/curriculum/sources/${sourceId}/reject`, { method: 'POST', body: payload }, session),
  approveSource: (session: AuthSession, sourceId: string, comment?: string) =>
    apiRequest<CurriculumSource>(`/curriculum/sources/${sourceId}/approve`, { method: 'POST', body: { comment } }, session),
  archiveSource: (session: AuthSession, sourceId: string, reason?: string) =>
    apiRequest<CurriculumSource>(`/curriculum/sources/${sourceId}/archive`, { method: 'POST', body: { reason } }, session),
  createSourceContent: (
    session: AuthSession,
    sourceId: string,
    payload: {
      sequenceOrder?: number;
      contentType: CurriculumSourceContentType;
      heading?: string;
      rawText?: string;
      sourcePage?: string;
      sourceSection?: string;
      confidenceScore?: number;
      extractionMethod?: string;
    },
  ) => apiRequest<CurriculumSource>(`/curriculum/sources/${sourceId}/contents`, { method: 'POST', body: payload }, session),
  updateSourceContent: (
    session: AuthSession,
    contentId: string,
    payload: {
      sequenceOrder?: number;
      contentType?: CurriculumSourceContentType;
      heading?: string;
      rawText?: string;
      sourcePage?: string;
      sourceSection?: string;
      confidenceScore?: number;
      extractionMethod?: string;
      reviewed?: boolean;
      lastKnownUpdatedAt: string;
    },
  ) => apiRequest<CurriculumSource>(`/curriculum/source-contents/${contentId}`, { method: 'PATCH', body: payload }, session),
  deleteSourceContent: (session: AuthSession, contentId: string, lastKnownUpdatedAt: string) =>
    apiRequest<CurriculumSource>(
      `/curriculum/source-contents/${contentId}`,
      { method: 'DELETE', body: { lastKnownUpdatedAt } },
      session,
    ),
  reorderSourceContents: (
    session: AuthSession,
    sourceId: string,
    orderedContentIds: string[],
    lastKnownUpdatedAt: string,
  ) =>
    apiRequest<CurriculumSource>(
      `/curriculum/sources/${sourceId}/contents/reorder`,
      { method: 'POST', body: { orderedContentIds, lastKnownUpdatedAt } },
      session,
    ),
  listMasterCatalog: (session: AuthSession, type: MasterCatalogType, q?: string, includeGlobal = true) =>
    apiRequest<Array<Record<string, unknown>>>(
      `/curriculum/master-content/catalog${queryString({
        type,
        q,
        includeGlobal: includeGlobal ? undefined : 'false',
      })}`,
      { method: 'GET' },
      session,
    ),
  createSourceMasterLink: (
    session: AuthSession,
    sourceId: string,
    payload: {
      masterContentType: MasterCatalogType;
      masterContentId: string;
      sourceVersionLabel?: string;
      sourcePage?: string;
      sourceSection?: string;
      extractionNote?: string;
      adaptationNote?: string;
      attribution?: string;
      usageRestriction?: string;
    },
  ) => apiRequest<CurriculumSource>(`/curriculum/sources/${sourceId}/master-links`, { method: 'POST', body: payload }, session),
  updateSourceMasterLink: (
    session: AuthSession,
    linkId: string,
    payload: {
      reviewStatus?: string;
      sourceVersionLabel?: string;
      sourcePage?: string;
      sourceSection?: string;
      extractionNote?: string;
      adaptationNote?: string;
      attribution?: string;
      usageRestriction?: string;
      lastKnownUpdatedAt: string;
    },
  ) => apiRequest<CurriculumSource>(`/curriculum/source-master-links/${linkId}`, { method: 'PATCH', body: payload }, session),
  deleteSourceMasterLink: (session: AuthSession, linkId: string) =>
    apiRequest<CurriculumSource>(`/curriculum/source-master-links/${linkId}`, { method: 'DELETE' }, session),
  uploadSourceFile: (
    session: AuthSession,
    sourceId: string,
    file: File,
    lastKnownUpdatedAt?: string,
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    if (lastKnownUpdatedAt) {
      formData.append('lastKnownUpdatedAt', lastKnownUpdatedAt);
    }

    return apiRequest<CurriculumSource>(
      `/curriculum/sources/${sourceId}/files`,
      { method: 'POST', body: formData },
      session,
    );
  },
  replaceSourceFile: (
    session: AuthSession,
    sourceId: string,
    fileId: string,
    file: File,
    lastKnownUpdatedAt: string,
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lastKnownUpdatedAt', lastKnownUpdatedAt);

    return apiRequest<CurriculumSource>(
      `/curriculum/sources/${sourceId}/files/${fileId}/replace`,
      { method: 'POST', body: formData },
      session,
    );
  },
  reorderSourceFiles: (
    session: AuthSession,
    sourceId: string,
    orderedFileIds: string[],
    lastKnownUpdatedAt: string,
  ) =>
    apiRequest<CurriculumSource>(
      `/curriculum/sources/${sourceId}/files/reorder`,
      { method: 'POST', body: { orderedFileIds, lastKnownUpdatedAt } },
      session,
    ),
  makePrimarySourceFile: (session: AuthSession, sourceId: string, fileId: string, lastKnownUpdatedAt: string) =>
    apiRequest<CurriculumSource>(
      `/curriculum/sources/${sourceId}/files/${fileId}/make-primary`,
      { method: 'POST', body: { lastKnownUpdatedAt } },
      session,
    ),
  archiveSourceFile: (
    session: AuthSession,
    sourceId: string,
    fileId: string,
    reason: string,
    lastKnownUpdatedAt: string,
  ) =>
    apiRequest<CurriculumSource>(
      `/curriculum/sources/${sourceId}/files/${fileId}/archive`,
      { method: 'POST', body: { reason, lastKnownUpdatedAt } },
      session,
    ),
  deleteSourceFile: (
    session: AuthSession,
    sourceId: string,
    fileId: string,
    reason: string,
    lastKnownUpdatedAt: string,
  ) =>
    apiRequest<CurriculumSource>(
      `/curriculum/sources/${sourceId}/files/${fileId}`,
      { method: 'DELETE', body: { reason, lastKnownUpdatedAt } },
      session,
    ),
  updateSourceFileMetadata: (
    session: AuthSession,
    sourceId: string,
    fileId: string,
    payload: {
      fileCategory?: 'SOURCE_DOCUMENT' | 'SUPPLEMENTARY_IMAGE' | 'SUPPLEMENTARY_DATA' | 'OTHER';
      documentVersion?: string;
      effectiveDate?: string;
      metadata?: Record<string, unknown>;
      lastKnownUpdatedAt: string;
    },
  ) =>
    apiRequest<CurriculumSource>(
      `/curriculum/sources/${sourceId}/files/${fileId}/metadata`,
      { method: 'PATCH', body: payload },
      session,
    ),
  updateSourceFileScan: (
    session: AuthSession,
    sourceId: string,
    fileId: string,
    payload: {
      uploadStatus?: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';
      scanStatus?: 'PENDING' | 'NOT_CONFIGURED' | 'CLEAN' | 'REJECTED' | 'FAILED';
      scanDetails?: string;
      verifiedAt?: string;
      lastKnownUpdatedAt: string;
    },
  ) =>
    apiRequest<CurriculumSource>(
      `/curriculum/sources/${sourceId}/files/${fileId}/scan`,
      { method: 'PATCH', body: payload },
      session,
    ),
  unlinkSourceFile: (
    session: AuthSession,
    sourceId: string,
    fileId: string,
    reason: string,
    lastKnownUpdatedAt: string,
  ) =>
    apiRequest<CurriculumSource>(
      `/curriculum/sources/${sourceId}/files/${fileId}/unlink`,
      { method: 'POST', body: { reason, lastKnownUpdatedAt } },
      session,
    ),
  purgeSourceFile: (
    session: AuthSession,
    sourceId: string,
    fileId: string,
    reason: string,
    lastKnownUpdatedAt: string,
  ) =>
    apiRequest<CurriculumSource>(
      `/curriculum/sources/${sourceId}/files/${fileId}/purge`,
      { method: 'DELETE', body: { reason, lastKnownUpdatedAt } },
      session,
    ),
  listProcessingSessions: (session: AuthSession, sourceId: string) =>
    apiRequest<CurriculumSourceProcessingSession[]>(
      `/curriculum/curriculum-sources/${sourceId}/processing-sessions`,
      { method: 'GET' },
      session,
    ),
  createProcessingSession: (
    session: AuthSession,
    sourceId: string,
    payload: {
      curriculumSourceFileId: string;
      notes?: string;
      metadata?: Record<string, unknown>;
      basedOnSessionId?: string;
    },
  ) =>
    apiRequest<CurriculumSourceProcessingSession>(
      `/curriculum/curriculum-sources/${sourceId}/processing-sessions`,
      { method: 'POST', body: payload },
      session,
    ),
  getProcessingSession: (session: AuthSession, sourceId: string, sessionId: string) =>
    apiRequest<CurriculumSourceProcessingSession>(
      `/curriculum/curriculum-sources/${sourceId}/processing-sessions/${sessionId}`,
      { method: 'GET' },
      session,
    ),
  updateProcessingSession: (
    session: AuthSession,
    sourceId: string,
    sessionId: string,
    payload: {
      notes?: string;
      metadata?: Record<string, unknown>;
      assignedReviewerId?: string | null;
      lastKnownUpdatedAt: string;
    },
  ) =>
    apiRequest<CurriculumSourceProcessingSession>(
      `/curriculum/curriculum-sources/${sourceId}/processing-sessions/${sessionId}`,
      { method: 'PATCH', body: payload },
      session,
    ),
  submitProcessingSessionReview: (
    session: AuthSession,
    sourceId: string,
    sessionId: string,
    payload: { comment?: string; lastKnownUpdatedAt: string },
  ) =>
    apiRequest<CurriculumSourceProcessingSession>(
      `/curriculum/curriculum-sources/${sourceId}/processing-sessions/${sessionId}/submit-review`,
      { method: 'POST', body: payload },
      session,
    ),
  requestProcessingSessionRevision: (
    session: AuthSession,
    sourceId: string,
    sessionId: string,
    payload: { requestedChanges: string; comment?: string; lastKnownUpdatedAt: string },
  ) =>
    apiRequest<CurriculumSourceProcessingSession>(
      `/curriculum/curriculum-sources/${sourceId}/processing-sessions/${sessionId}/request-revision`,
      { method: 'POST', body: payload },
      session,
    ),
  approveProcessingSession: (
    session: AuthSession,
    sourceId: string,
    sessionId: string,
    payload: { comment?: string; lastKnownUpdatedAt: string },
  ) =>
    apiRequest<CurriculumSourceProcessingSession>(
      `/curriculum/curriculum-sources/${sourceId}/processing-sessions/${sessionId}/approve`,
      { method: 'POST', body: payload },
      session,
    ),
  rejectProcessingSession: (
    session: AuthSession,
    sourceId: string,
    sessionId: string,
    payload: { rejectionReason: string; comment?: string; lastKnownUpdatedAt: string },
  ) =>
    apiRequest<CurriculumSourceProcessingSession>(
      `/curriculum/curriculum-sources/${sourceId}/processing-sessions/${sessionId}/reject`,
      { method: 'POST', body: payload },
      session,
    ),
  completeProcessingSession: (
    session: AuthSession,
    sourceId: string,
    sessionId: string,
    payload: { comment?: string; lastKnownUpdatedAt: string },
  ) =>
    apiRequest<CurriculumSourceProcessingSession>(
      `/curriculum/curriculum-sources/${sourceId}/processing-sessions/${sessionId}/complete`,
      { method: 'POST', body: payload },
      session,
    ),
  archiveProcessingSession: (
    session: AuthSession,
    sourceId: string,
    sessionId: string,
    payload: { reason: string; lastKnownUpdatedAt: string },
  ) =>
    apiRequest<CurriculumSourceProcessingSession>(
      `/curriculum/curriculum-sources/${sourceId}/processing-sessions/${sessionId}/archive`,
      { method: 'POST', body: payload },
      session,
    ),
  listProcessingSections: (session: AuthSession, sessionId: string) =>
    apiRequest<CurriculumSourceSection[]>(`/curriculum/processing-sessions/${sessionId}/sections`, { method: 'GET' }, session),
  createProcessingSection: (
    session: AuthSession,
    sessionId: string,
    payload: {
      parentSectionId?: string;
      sectionType:
        | 'DOCUMENT_HEADING'
        | 'INTRODUCTION'
        | 'CLASS_LEVEL'
        | 'TERM'
        | 'SUBJECT'
        | 'UNIT'
        | 'TOPIC'
        | 'CONCEPT'
        | 'SKILL'
        | 'LEARNING_OUTCOME'
        | 'ACTIVITY'
        | 'PROJECT'
        | 'RESOURCE'
        | 'ASSESSMENT'
        | 'NOTE'
        | 'OTHER';
      heading: string;
      rawText: string;
      structuredData?: Record<string, unknown>;
      pageStart?: number;
      pageEnd?: number;
      sourceSectionReference?: string;
      sequenceOrder?: number;
    },
  ) =>
    apiRequest<CurriculumSourceSection>(
      `/curriculum/processing-sessions/${sessionId}/sections`,
      { method: 'POST', body: payload },
      session,
    ),
  updateProcessingSection: (
    session: AuthSession,
    sessionId: string,
    sectionId: string,
    payload: {
      sectionType?:
        | 'DOCUMENT_HEADING'
        | 'INTRODUCTION'
        | 'CLASS_LEVEL'
        | 'TERM'
        | 'SUBJECT'
        | 'UNIT'
        | 'TOPIC'
        | 'CONCEPT'
        | 'SKILL'
        | 'LEARNING_OUTCOME'
        | 'ACTIVITY'
        | 'PROJECT'
        | 'RESOURCE'
        | 'ASSESSMENT'
        | 'NOTE'
        | 'OTHER';
      heading?: string;
      rawText?: string;
      structuredData?: Record<string, unknown>;
      pageStart?: number;
      pageEnd?: number;
      sourceSectionReference?: string;
      reviewStatus?: 'DRAFT' | 'PENDING_REVIEW' | 'REVISION_REQUIRED' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
      reviewNote?: string;
      lastKnownUpdatedAt: string;
    },
  ) =>
    apiRequest<CurriculumSourceSection>(
      `/curriculum/processing-sessions/${sessionId}/sections/${sectionId}`,
      { method: 'PATCH', body: payload },
      session,
    ),
  deleteProcessingSection: (session: AuthSession, sessionId: string, sectionId: string, lastKnownUpdatedAt: string) =>
    apiRequest<CurriculumSourceSection[]>(
      `/curriculum/processing-sessions/${sessionId}/sections/${sectionId}`,
      { method: 'DELETE', body: { lastKnownUpdatedAt } },
      session,
    ),
  reorderProcessingSections: (
    session: AuthSession,
    sessionId: string,
    payload: { orderedSectionIds: string[]; parentSectionId?: string; lastKnownSessionUpdatedAt: string },
  ) =>
    apiRequest<CurriculumSourceSection[]>(
      `/curriculum/processing-sessions/${sessionId}/sections/reorder`,
      { method: 'POST', body: payload },
      session,
    ),
  moveProcessingSection: (
    session: AuthSession,
    sessionId: string,
    sectionId: string,
    payload: { targetParentSectionId?: string; targetSequenceOrder?: number; lastKnownUpdatedAt: string },
  ) =>
    apiRequest<CurriculumSourceSection>(
      `/curriculum/processing-sessions/${sessionId}/sections/${sectionId}/move`,
      { method: 'POST', body: payload },
      session,
    ),
  createStructuredRecordFromSection: (
    session: AuthSession,
    sessionId: string,
    sectionId: string,
    payload: {
      contentType?: CurriculumSourceContentType;
      heading?: string;
      rawText?: string;
      structuredData?: Record<string, unknown>;
      adaptationNote?: string;
      reviewStatus?: 'DRAFT' | 'PENDING_REVIEW' | 'REVISION_REQUIRED' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
      sourcePage?: string;
      sourceSection?: string;
      lastKnownSectionUpdatedAt: string;
    },
  ) =>
    apiRequest<CurriculumSourceContent>(
      `/curriculum/processing-sessions/${sessionId}/sections/${sectionId}/structured-records`,
      { method: 'POST', body: payload },
      session,
    ),
  listProcessingStructuredRecords: (session: AuthSession, sessionId: string) =>
    apiRequest<CurriculumSourceContent[]>(
      `/curriculum/processing-sessions/${sessionId}/structured-records`,
      { method: 'GET' },
      session,
    ),
  listProcessingRevisions: (session: AuthSession, sessionId: string) =>
    apiRequest<CurriculumSourceProcessingSession[]>(`/curriculum/processing-sessions/${sessionId}/revisions`, { method: 'GET' }, session),
  compareProcessingRevisions: (
    session: AuthSession,
    sessionId: string,
    leftRevisionId?: string,
    rightRevisionId?: string,
  ) =>
    apiRequest<CurriculumSourceRevisionComparison>(
      `/curriculum/processing-sessions/${sessionId}/compare${queryString({ leftRevisionId, rightRevisionId })}`,
      { method: 'GET' },
      session,
    ),
  getProcessingAuditHistory: (session: AuthSession, sessionId: string) =>
    apiRequest<CurriculumSourceProcessingAuditItem[]>(
      `/curriculum/processing-sessions/${sessionId}/audit-history`,
      { method: 'GET' },
      session,
    ),
  // Master Content Promotion API methods
  listMasterContentPromotions: (
    session: AuthSession,
    filters?: {
      status?: MasterContentPromotionStatus;
      recordType?: MasterContentPromotionRecordType;
      targetType?: MasterContentPromotionTargetType;
      curriculumSourceId?: string;
      processingSessionId?: string;
      requestedById?: string;
      includeArchived?: boolean;
      page?: number;
      pageSize?: number;
    },
  ) =>
    apiRequest<{ items: MasterContentPromotion[]; total: number; page: number; pageSize: number }>(
      `/curriculum/master-content-promotions${queryString({
        status: filters?.status,
        recordType: filters?.recordType,
        targetType: filters?.targetType,
        curriculumSourceId: filters?.curriculumSourceId,
        processingSessionId: filters?.processingSessionId,
        requestedById: filters?.requestedById,
        includeArchived: filters?.includeArchived ? 'true' : undefined,
        page: typeof filters?.page === 'number' ? String(filters.page) : undefined,
        pageSize: typeof filters?.pageSize === 'number' ? String(filters.pageSize) : undefined,
      })}`,
      { method: 'GET' },
      session,
    ),
  getMasterContentPromotion: (session: AuthSession, promotionId: string) =>
    apiRequest<MasterContentPromotion>(`/curriculum/master-content-promotions/${promotionId}`, { method: 'GET' }, session),
  createMasterContentPromotion: (
    session: AuthSession,
    payload: {
      curriculumSourceId: string;
      processingSessionId: string;
      curriculumSourceFileId: string;
      sourceChecksum: string;
      adaptationNote?: string;
      metadata?: Record<string, unknown>;
    },
  ) =>
    apiRequest<MasterContentPromotion>('/curriculum/master-content-promotions', { method: 'POST', body: payload }, session),
  updateMasterContentPromotion: (
    session: AuthSession,
    promotionId: string,
    payload: {
      adaptationNote?: string;
      metadata?: Record<string, unknown>;
      lastKnownUpdatedAt: string;
    },
  ) =>
    apiRequest<MasterContentPromotion>(
      `/curriculum/master-content-promotions/${promotionId}`,
      { method: 'PATCH', body: payload },
      session,
    ),
  submitMasterContentPromotionReview: (
    session: AuthSession,
    promotionId: string,
    payload: { comment?: string; lastKnownUpdatedAt: string },
  ) =>
    apiRequest<MasterContentPromotion>(
      `/curriculum/master-content-promotions/${promotionId}/submit-review`,
      { method: 'POST', body: payload },
      session,
    ),
  requestMasterContentPromotionRevision: (
    session: AuthSession,
    promotionId: string,
    payload: { requestedChanges: string; comment?: string; lastKnownUpdatedAt: string },
  ) =>
    apiRequest<MasterContentPromotion>(
      `/curriculum/master-content-promotions/${promotionId}/request-revision`,
      { method: 'POST', body: payload },
      session,
    ),
  approveMasterContentPromotion: (
    session: AuthSession,
    promotionId: string,
    payload: { comment?: string; lastKnownUpdatedAt: string },
  ) =>
    apiRequest<MasterContentPromotion>(
      `/curriculum/master-content-promotions/${promotionId}/approve`,
      { method: 'POST', body: payload },
      session,
    ),
  rejectMasterContentPromotion: (
    session: AuthSession,
    promotionId: string,
    payload: { rejectionReason: string; comment?: string; lastKnownUpdatedAt: string },
  ) =>
    apiRequest<MasterContentPromotion>(
      `/curriculum/master-content-promotions/${promotionId}/reject`,
      { method: 'POST', body: payload },
      session,
    ),
  completeMasterContentPromotion: (
    session: AuthSession,
    promotionId: string,
    payload: { comment?: string; lastKnownUpdatedAt: string },
  ) =>
    apiRequest<MasterContentPromotion>(
      `/curriculum/master-content-promotions/${promotionId}/complete`,
      { method: 'POST', body: payload },
      session,
    ),
  archiveMasterContentPromotion: (
    session: AuthSession,
    promotionId: string,
    payload: { reason: string; lastKnownUpdatedAt: string },
  ) =>
    apiRequest<MasterContentPromotion>(
      `/curriculum/master-content-promotions/${promotionId}/archive`,
      { method: 'POST', body: payload },
      session,
    ),
  addMasterContentPromotionItem: (
    session: AuthSession,
    promotionId: string,
    payload: {
      sourceContentId: string;
      sourceSectionId?: string;
      sourceRecordType?: MasterContentPromotionRecordType;
      targetMasterContentType: MasterContentPromotionTargetType;
      action: MasterContentPromotionAction;
      sequenceOrder?: number;
      mappedFields?: Record<string, unknown>;
      transformationData?: Record<string, unknown>;
      duplicateCandidates?: Record<string, unknown>[];
      sourcePageStart?: number;
      sourcePageEnd?: number;
      sourceSectionReference?: string;
      sourceFileVersion?: string;
      sourceFileChecksum?: string;
      adaptationNote?: string;
      attribution?: string;
    },
  ) =>
    apiRequest<MasterContentPromotion>(
      `/curriculum/master-content-promotions/${promotionId}/items`,
      { method: 'POST', body: payload },
      session,
    ),
  updateMasterContentPromotionItem: (
    session: AuthSession,
    itemId: string,
    payload: {
      action?: MasterContentPromotionAction;
      status?: MasterContentPromotionStatus;
      sequenceOrder?: number;
      mappedFields?: Record<string, unknown>;
      transformationData?: Record<string, unknown>;
      duplicateCandidates?: Record<string, unknown>[];
      adaptationNote?: string;
      attribution?: string;
      lastKnownUpdatedAt: string;
    },
  ) =>
    apiRequest<MasterContentPromotion>(
      `/curriculum/master-content-promotions/items/${itemId}`,
      { method: 'PATCH', body: payload },
      session,
    ),
  removeMasterContentPromotionItem: (session: AuthSession, itemId: string, promotionId: string, lastKnownUpdatedAt: string) =>
    apiRequest<MasterContentPromotion>(
      `/curriculum/master-content-promotions/items/${itemId}`,
      { method: 'DELETE', body: { promotionId, lastKnownUpdatedAt } },
      session,
    ),
  reorderMasterContentPromotionItems: (
    session: AuthSession,
    promotionId: string,
    payload: { orderedItemIds: string[]; lastKnownUpdatedAt: string },
  ) =>
    apiRequest<MasterContentPromotion>(
      `/curriculum/master-content-promotions/${promotionId}/items/reorder`,
      { method: 'POST', body: payload },
      session,
    ),
  checkMasterContentPromotionItemDuplicates: (
    session: AuthSession,
    promotionId: string,
    itemId: string,
  ) =>
    apiRequest<{ candidates: Array<{ id: string; code: string; title: string; score: number }> }>(
      `/curriculum/master-content-promotions/${promotionId}/items/${itemId}/check-duplicates`,
      { method: 'GET' },
      session,
    ),
  linkMasterContentPromotionItem: (
    session: AuthSession,
    promotionId: string,
    itemId: string,
    masterContentId: string,
    lastKnownUpdatedAt: string,
  ) =>
    apiRequest<MasterContentPromotion>(
      `/curriculum/master-content-promotions/${promotionId}/items/${itemId}/link`,
      { method: 'POST', body: { masterContentId, lastKnownUpdatedAt } },
      session,
    ),
  createMasterContentPromotionItemDraft: (
    session: AuthSession,
    promotionId: string,
    itemId: string,
    payload: {
      draftMasterContent?: Record<string, unknown>;
      lastKnownUpdatedAt: string;
    },
  ) =>
    apiRequest<MasterContentPromotion>(
      `/curriculum/master-content-promotions/${promotionId}/items/${itemId}/create-draft`,
      { method: 'POST', body: payload },
      session,
    ),
  getMasterContentPromotionHistory: (session: AuthSession, promotionId: string) =>
    apiRequest<Array<{ action: string; timestamp: string; userId: string; details: Record<string, unknown> }>>(
      `/curriculum/master-content-promotions/${promotionId}/history`,
      { method: 'GET' },
      session,
    ),
  getMasterContentPromotionCompare: (
    session: AuthSession,
    promotionId: string,
    leftVersion: number,
    rightVersion: number,
  ) =>
    apiRequest<{ differences: Record<string, unknown> }>(
      `/curriculum/master-content-promotions/${promotionId}/compare${queryString({
        leftVersion: String(leftVersion),
        rightVersion: String(rightVersion),
      })}`,
      { method: 'GET' },
      session,
    ),
  getMasterContentPromotionAudit: (session: AuthSession, promotionId: string) =>
    apiRequest<Array<{ action: string; userId: string; timestamp: string; details: Record<string, unknown> }>>(
      `/curriculum/master-content-promotions/${promotionId}/audit`,
      { method: 'GET' },
      session,
    ),
  masterContent: masterContentClient,
};
