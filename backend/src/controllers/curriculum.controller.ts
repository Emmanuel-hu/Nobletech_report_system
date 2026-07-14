import type { Request, Response } from 'express';

import { curriculumService } from '../services/curriculum.service';
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

export const createCurriculum = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.createCurriculum(getAuth(req), req.body, req.requestId);
  res.status(201).json({ success: true, message: 'Curriculum created.', data });
};

export const listCurricula = async (req: Request, res: Response): Promise<void> => {
  const filters = {
    status: req.query.status as never,
    schoolProgrammeComponentId: req.query.schoolProgrammeComponentId as string | undefined,
    createdById: req.query.createdById as string | undefined,
    includeArchived: req.query.includeArchived === 'true',
    isPublished:
      req.query.isPublished === 'true' ? true : req.query.isPublished === 'false' ? false : undefined,
  };

  const data = await curriculumService.listCurricula(getAuth(req), filters);
  res.status(200).json({ success: true, message: 'Curricula fetched.', data });
};

export const getCurriculum = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.getCurriculum(getAuth(req), param(req, 'curriculumId'));
  res.status(200).json({ success: true, message: 'Curriculum fetched.', data });
};

export const getEditorLookups = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.getEditorLookups(
    getAuth(req),
    param(req, 'curriculumId'),
    req.query.sessionId ? String(req.query.sessionId) : undefined,
  );
  res.status(200).json({ success: true, message: 'Curriculum editor lookups fetched.', data });
};

export const updateCurriculum = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.updateCurriculum(
    getAuth(req),
    param(req, 'curriculumId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Curriculum updated.', data });
};

export const archiveCurriculum = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.archive(
    getAuth(req),
    param(req, 'curriculumId'),
    req.body.reason,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Curriculum archived.', data });
};

export const createUnit = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.createUnit(
    getAuth(req),
    param(req, 'curriculumId'),
    req.body,
    req.requestId,
  );
  res.status(201).json({ success: true, message: 'Unit created.', data });
};

export const updateUnit = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.updateUnit(
    getAuth(req),
    param(req, 'curriculumId'),
    param(req, 'unitId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Unit updated.', data });
};

export const deleteUnit = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.deleteUnit(
    getAuth(req),
    param(req, 'curriculumId'),
    param(req, 'unitId'),
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Unit deleted.', data });
};

export const reorderUnits = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.reorderUnits(
    getAuth(req),
    param(req, 'curriculumId'),
    req.body.orderedUnitIds,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Units reordered.', data });
};

export const createTopic = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.createTopic(getAuth(req), param(req, 'unitId'), req.body, req.requestId);
  res.status(201).json({ success: true, message: 'Topic created.', data });
};

export const updateTopic = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.updateTopic(getAuth(req), param(req, 'topicId'), req.body, req.requestId);
  res.status(200).json({ success: true, message: 'Topic updated.', data });
};

export const deleteTopic = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.deleteTopic(getAuth(req), param(req, 'topicId'), req.requestId);
  res.status(200).json({ success: true, message: 'Topic deleted.', data });
};

export const reorderTopics = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.reorderTopics(
    getAuth(req),
    param(req, 'unitId'),
    req.body.orderedTopicIds,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Topics reordered.', data });
};

export const addTopicConcept = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.createConceptLink(getAuth(req), param(req, 'topicId'), req.body, req.requestId);
  res.status(201).json({ success: true, message: 'Topic concept mapping created.', data });
};

export const createConcept = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.createConcept(
    getAuth(req),
    param(req, 'curriculumId'),
    req.body,
    req.requestId,
  );
  res.status(201).json({ success: true, message: 'Operational concept created.', data });
};

export const updateConcept = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.updateConcept(
    getAuth(req),
    param(req, 'conceptId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Operational concept updated.', data });
};

export const deleteConcept = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.deleteConcept(getAuth(req), param(req, 'conceptId'), req.requestId);
  res.status(200).json({ success: true, message: 'Operational concept deleted.', data });
};

export const reorderTopicConcepts = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.reorderTopicConcepts(
    getAuth(req),
    param(req, 'topicId'),
    req.body.orderedMappingIds,
    req.body.lastKnownTopicUpdatedAt,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Topic concept mappings reordered.', data });
};

export const updateTopicConcept = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.updateTopicConcept(
    getAuth(req),
    param(req, 'mappingId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Topic concept mapping updated.', data });
};

export const deleteTopicConcept = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.deleteTopicConcept(getAuth(req), param(req, 'mappingId'), req.requestId);
  res.status(200).json({ success: true, message: 'Topic concept mapping removed.', data });
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.createProject(getAuth(req), param(req, 'unitId'), req.body, req.requestId);
  res.status(201).json({ success: true, message: 'Project created.', data });
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.updateProject(
    getAuth(req),
    param(req, 'projectId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Project updated.', data });
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.deleteProject(getAuth(req), param(req, 'projectId'), req.requestId);
  res.status(200).json({ success: true, message: 'Project deleted.', data });
};

export const linkProjectTopic = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.linkProjectTopic(
    getAuth(req),
    param(req, 'projectId'),
    req.body.topicId,
    req.body.sequenceOrder,
    req.requestId,
  );
  res.status(201).json({ success: true, message: 'Project-topic mapping created.', data });
};

export const deleteTopicProjectLink = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.deleteTopicProjectLink(getAuth(req), param(req, 'linkId'), req.requestId);
  res.status(200).json({ success: true, message: 'Project-topic mapping removed.', data });
};

export const createProjectImplementation = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.createProjectImplementation(
    getAuth(req),
    param(req, 'projectId'),
    req.body,
    req.requestId,
  );
  res.status(201).json({ success: true, message: 'Project implementation created.', data });
};

export const updateProjectImplementation = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.updateProjectImplementation(
    getAuth(req),
    param(req, 'implementationId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Project implementation updated.', data });
};

export const deleteProjectImplementation = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.deleteProjectImplementation(
    getAuth(req),
    param(req, 'implementationId'),
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Project implementation removed.', data });
};

export const reorderProjectImplementations = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.reorderProjectImplementations(
    getAuth(req),
    param(req, 'projectId'),
    req.body.orderedImplementationIds,
    req.body.lastKnownProjectUpdatedAt,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Project implementations reordered.', data });
};

export const createLearningOutcome = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.createLearningOutcome(
    getAuth(req),
    param(req, 'curriculumId'),
    req.body,
    req.requestId,
  );
  res.status(201).json({ success: true, message: 'Learning outcome created.', data });
};

export const updateLearningOutcome = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.updateLearningOutcome(
    getAuth(req),
    param(req, 'outcomeId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Learning outcome updated.', data });
};

export const deleteLearningOutcome = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.deleteLearningOutcome(getAuth(req), param(req, 'outcomeId'), req.requestId);
  res.status(200).json({ success: true, message: 'Learning outcome deleted.', data });
};

export const linkTopicLearningOutcome = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.mapLearningOutcomeToTopic(
    getAuth(req),
    param(req, 'topicId'),
    req.body.outcomeId,
    req.body.sequenceOrder,
    req.requestId,
  );
  res.status(201).json({ success: true, message: 'Topic-learning outcome mapping created.', data });
};

export const deleteTopicLearningOutcomeLink = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.deleteTopicLearningOutcomeLink(
    getAuth(req),
    param(req, 'linkId'),
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Topic-learning outcome mapping removed.', data });
};

export const linkProjectLearningOutcome = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.mapLearningOutcomeToProject(
    getAuth(req),
    param(req, 'projectId'),
    req.body.outcomeId,
    req.body.sequenceOrder,
    req.requestId,
  );
  res.status(201).json({ success: true, message: 'Project-learning outcome mapping created.', data });
};

export const deleteProjectLearningOutcomeLink = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.deleteProjectLearningOutcomeLink(
    getAuth(req),
    param(req, 'linkId'),
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Project-learning outcome mapping removed.', data });
};

export const createResource = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.createResource(
    getAuth(req),
    param(req, 'curriculumId'),
    req.body,
    req.requestId,
  );
  res.status(201).json({ success: true, message: 'Resource created.', data });
};

export const updateResource = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.updateResource(
    getAuth(req),
    param(req, 'resourceId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Resource updated.', data });
};

export const deleteResource = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.deleteResource(getAuth(req), param(req, 'resourceId'), req.requestId);
  res.status(200).json({ success: true, message: 'Resource deleted.', data });
};

export const getVisibility = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.getVisibility(getAuth(req), param(req, 'curriculumId'));
  res.status(200).json({ success: true, message: 'Visibility fetched.', data });
};

export const updateVisibility = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.updateVisibility(
    getAuth(req),
    param(req, 'curriculumId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Visibility updated.', data });
};

export const listVersions = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.listVersions(getAuth(req), param(req, 'curriculumId'));
  res.status(200).json({ success: true, message: 'Versions fetched.', data });
};

export const getVersion = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.getVersion(
    getAuth(req),
    param(req, 'curriculumId'),
    param(req, 'versionId'),
  );
  res.status(200).json({ success: true, message: 'Version fetched.', data });
};

export const createVersion = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.createVersion(
    getAuth(req),
    param(req, 'curriculumId'),
    req.body,
    req.requestId,
  );
  res.status(201).json({ success: true, message: 'Version created.', data });
};

export const getSnapshot = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.getSnapshot(
    getAuth(req),
    param(req, 'curriculumId'),
    param(req, 'versionId'),
  );
  res.status(200).json({ success: true, message: 'Snapshot fetched.', data });
};

export const compareVersions = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.compareVersions(
    getAuth(req),
    param(req, 'curriculumId'),
    String(req.query.leftVersionId),
    String(req.query.rightVersionId),
  );
  res.status(200).json({ success: true, message: 'Version comparison ready.', data });
};

export const submitReview = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.submitReview(
    getAuth(req),
    param(req, 'curriculumId'),
    req.body.comment,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Curriculum submitted for review.', data });
};

export const requestRevision = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.requestRevision(
    getAuth(req),
    param(req, 'curriculumId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Revision requested.', data });
};

export const approveCurriculum = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.approve(
    getAuth(req),
    param(req, 'curriculumId'),
    req.body.comment,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Curriculum approved.', data });
};

export const publishCurriculum = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.publish(
    getAuth(req),
    param(req, 'curriculumId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Curriculum published.', data });
};

export const withdrawReview = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.withdrawReview(
    getAuth(req),
    param(req, 'curriculumId'),
    req.body.reason,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Review withdrawn.', data });
};

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.createAssignment(
    getAuth(req),
    param(req, 'curriculumId'),
    req.body,
    req.requestId,
  );
  res.status(201).json({ success: true, message: 'Curriculum assignment created.', data });
};

export const listAssignments = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.listAssignments(getAuth(req), param(req, 'curriculumId'));
  res.status(200).json({ success: true, message: 'Assignments fetched.', data });
};

export const updateAssignment = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.updateAssignment(
    getAuth(req),
    param(req, 'assignmentId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Assignment updated.', data });
};

export const activateAssignment = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.updateAssignment(
    getAuth(req),
    param(req, 'assignmentId'),
    { status: 'ACTIVE', reason: req.body.reason },
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Assignment activated.', data });
};

export const completeAssignment = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.updateAssignment(
    getAuth(req),
    param(req, 'assignmentId'),
    { status: 'COMPLETED', reason: req.body.reason },
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Assignment completed.', data });
};

export const suspendAssignment = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.updateAssignment(
    getAuth(req),
    param(req, 'assignmentId'),
    { status: 'SUSPENDED', reason: req.body.reason },
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Assignment suspended.', data });
};

export const archiveAssignment = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.updateAssignment(
    getAuth(req),
    param(req, 'assignmentId'),
    { status: 'ARCHIVED', reason: req.body.reason },
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Assignment archived.', data });
};

export const listSources = async (req: Request, res: Response): Promise<void> => {
  const sourceFilters: Parameters<typeof curriculumService.listSources>[1] = {
    reviewStatus: req.query.reviewStatus
      ? (String(req.query.reviewStatus) as Parameters<typeof curriculumService.listSources>[1]['reviewStatus'])
      : undefined,
    sourceType: req.query.sourceType
      ? (String(req.query.sourceType) as Parameters<typeof curriculumService.listSources>[1]['sourceType'])
      : undefined,
    sourceFormat: req.query.sourceFormat
      ? (String(req.query.sourceFormat) as Parameters<typeof curriculumService.listSources>[1]['sourceFormat'])
      : undefined,
    subjectId: req.query.subjectId ? String(req.query.subjectId) : undefined,
    q: req.query.q ? String(req.query.q) : undefined,
    ownership: req.query.ownership
      ? (String(req.query.ownership) as Parameters<typeof curriculumService.listSources>[1]['ownership'])
      : undefined,
    includeGlobal: req.query.includeGlobal !== 'false',
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  };

  const data = await curriculumService.listSources(getAuth(req), {
    ...sourceFilters,
  });
  res.status(200).json({ success: true, message: 'Curriculum sources fetched.', data });
};

export const getSource = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.getSource(getAuth(req), param(req, 'sourceId'));
  res.status(200).json({ success: true, message: 'Curriculum source fetched.', data });
};

export const createSource = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.createSource(getAuth(req), req.body, req.requestId);
  res.status(201).json({ success: true, message: 'Curriculum source created.', data });
};

export const updateSource = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.updateSource(getAuth(req), param(req, 'sourceId'), req.body, req.requestId);
  res.status(200).json({ success: true, message: 'Curriculum source updated.', data });
};

export const submitSourceReview = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.submitSourceReview(
    getAuth(req),
    param(req, 'sourceId'),
    req.body.comment,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Curriculum source submitted for review.', data });
};

export const requestSourceRevision = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.requestSourceRevision(
    getAuth(req),
    param(req, 'sourceId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Curriculum source revision requested.', data });
};

export const rejectSource = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.rejectSource(getAuth(req), param(req, 'sourceId'), req.body, req.requestId);
  res.status(200).json({ success: true, message: 'Curriculum source rejected.', data });
};

export const approveSource = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.approveSource(
    getAuth(req),
    param(req, 'sourceId'),
    req.body.comment,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Curriculum source approved.', data });
};

export const archiveSource = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.archiveSource(
    getAuth(req),
    param(req, 'sourceId'),
    req.body.reason ?? req.body.comment,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Curriculum source archived.', data });
};

export const createSourceContent = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.createSourceContent(
    getAuth(req),
    param(req, 'sourceId'),
    req.body,
    req.requestId,
  );
  res.status(201).json({ success: true, message: 'Curriculum source content created.', data });
};

export const updateSourceContent = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.updateSourceContent(
    getAuth(req),
    param(req, 'contentId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Curriculum source content updated.', data });
};

export const deleteSourceContent = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.deleteSourceContent(getAuth(req), param(req, 'contentId'), req.body, req.requestId);
  res.status(200).json({ success: true, message: 'Curriculum source content deleted.', data });
};

export const reorderSourceContents = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.reorderSourceContents(
    getAuth(req),
    param(req, 'sourceId'),
    req.body.orderedContentIds,
    req.body.lastKnownUpdatedAt,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Curriculum source contents reordered.', data });
};

export const listMasterCatalog = async (req: Request, res: Response): Promise<void> => {
  const type = String(req.query.type) as Parameters<typeof curriculumService.listMasterCatalog>[1]['type'];

  const data = await curriculumService.listMasterCatalog(getAuth(req), {
    type,
    q: req.query.q ? String(req.query.q) : undefined,
    includeGlobal: req.query.includeGlobal !== 'false',
  });
  res.status(200).json({ success: true, message: 'Master content catalog fetched.', data });
};

export const createSourceMasterLink = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.createSourceMasterLink(
    getAuth(req),
    param(req, 'sourceId'),
    req.body,
    req.requestId,
  );
  res.status(201).json({ success: true, message: 'Source-to-master content link created.', data });
};

export const updateSourceMasterLink = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.updateSourceMasterLink(
    getAuth(req),
    param(req, 'linkId'),
    req.body,
    req.requestId,
  );
  res.status(200).json({ success: true, message: 'Source-to-master content link updated.', data });
};

export const deleteSourceMasterLink = async (req: Request, res: Response): Promise<void> => {
  const data = await curriculumService.deleteSourceMasterLink(getAuth(req), param(req, 'linkId'), req.requestId);
  res.status(200).json({ success: true, message: 'Source-to-master content link removed.', data });
};
