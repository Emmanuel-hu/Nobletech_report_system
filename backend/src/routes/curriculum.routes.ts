import { Router } from 'express';

import {
  activateAssignment,
  addTopicConcept,
  approveCurriculum,
  archiveAssignment,
  archiveCurriculum,
  compareVersions,
  createProjectImplementation,
  completeAssignment,
  createAssignment,
  createCurriculum,
  createLearningOutcome,
  createProject,
  createResource,
  createTopic,
  createUnit,
  createVersion,
  deleteProject,
  deleteProjectImplementation,
  deleteProjectLearningOutcomeLink,
  deleteResource,
  deleteTopicConcept,
  deleteTopicLearningOutcomeLink,
  deleteTopicProjectLink,
  deleteTopic,
  deleteUnit,
  getEditorLookups,
  getCurriculum,
  getSnapshot,
  getVersion,
  getVisibility,
  linkProjectLearningOutcome,
  linkProjectTopic,
  linkTopicLearningOutcome,
  listAssignments,
  listCurricula,
  listVersions,
  publishCurriculum,
  reorderTopics,
  reorderUnits,
  requestRevision,
  submitReview,
  suspendAssignment,
  updateAssignment,
  updateCurriculum,
  updateLearningOutcome,
  updateProject,
  updateProjectImplementation,
  updateResource,
  updateTopicConcept,
  updateTopic,
  updateUnit,
  updateVisibility,
  withdrawReview,
} from '../controllers/curriculum.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware';
import { asyncHandler } from '../utils/async-handler';
import {
  addTopicConceptSchema,
  archiveCurriculumSchema,
  assignmentIdParamSchema,
  conceptMappingIdParamSchema,
  createAssignmentSchema,
  createCurriculumSchema,
  createLearningOutcomeSchema,
  createProjectSchema,
  createProjectImplementationSchema,
  createResourceSchema,
  createTopicSchema,
  createUnitSchema,
  createVersionSchema,
  editorLookupsQuerySchema,
  curriculumIdParamSchema,
  curriculumUnitIdParamSchema,
  listCurriculaQuerySchema,
  linkProjectTopicSchema,
  mapLearningOutcomeSchema,
  implementationIdParamSchema,
  projectOutcomeLinkIdParamSchema,
  outcomeIdParamSchema,
  topicOutcomeLinkIdParamSchema,
  topicProjectLinkIdParamSchema,
  projectIdParamSchema,
  publishSchema,
  reorderTopicsSchema,
  reorderUnitsSchema,
  requestRevisionSchema,
  resourceIdParamSchema,
  submitReviewSchema,
  topicIdParamSchema,
  unitIdParamSchema,
  unitTopicIdParamSchema,
  updateAssignmentSchema,
  updateCurriculumSchema,
  updateLearningOutcomeSchema,
  updateProjectSchema,
  updateProjectImplementationSchema,
  updateResourceSchema,
  updateTopicConceptSchema,
  updateTopicSchema,
  updateUnitSchema,
  updateVisibilitySchema,
  versionCompareQuerySchema,
  versionIdParamSchema,
  withdrawReviewSchema,
} from '../validators/curriculum.validator';

const curriculumRouter = Router();

curriculumRouter.use(authMiddleware);

curriculumRouter.post(
  '/curricula',
  requirePermission('curriculum.create'),
  validateBody(createCurriculumSchema),
  asyncHandler(createCurriculum),
);

curriculumRouter.get(
  '/curricula',
  requirePermission('curriculum.view'),
  validateQuery(listCurriculaQuerySchema),
  asyncHandler(listCurricula),
);

curriculumRouter.get(
  '/curricula/:curriculumId',
  requirePermission('curriculum.view'),
  validateParams(curriculumIdParamSchema),
  asyncHandler(getCurriculum),
);

curriculumRouter.patch(
  '/curricula/:curriculumId',
  requirePermission('curriculum.edit'),
  validateParams(curriculumIdParamSchema),
  validateBody(updateCurriculumSchema),
  asyncHandler(updateCurriculum),
);

curriculumRouter.get(
  '/curricula/:curriculumId/editor-lookups',
  requirePermission('curriculum.view'),
  validateParams(curriculumIdParamSchema),
  validateQuery(editorLookupsQuerySchema),
  asyncHandler(getEditorLookups),
);

curriculumRouter.post(
  '/curricula/:curriculumId/archive',
  requirePermission('curriculum.archive'),
  validateParams(curriculumIdParamSchema),
  validateBody(archiveCurriculumSchema),
  asyncHandler(archiveCurriculum),
);

curriculumRouter.post(
  '/curricula/:curriculumId/units',
  requirePermission('curriculum.edit'),
  validateParams(curriculumIdParamSchema),
  validateBody(createUnitSchema),
  asyncHandler(createUnit),
);

curriculumRouter.patch(
  '/curricula/:curriculumId/units/:unitId',
  requirePermission('curriculum.edit'),
  validateParams(curriculumUnitIdParamSchema),
  validateBody(updateUnitSchema),
  asyncHandler(updateUnit),
);

curriculumRouter.delete(
  '/curricula/:curriculumId/units/:unitId',
  requirePermission('curriculum.edit'),
  validateParams(curriculumUnitIdParamSchema),
  asyncHandler(deleteUnit),
);

curriculumRouter.post(
  '/curricula/:curriculumId/units/reorder',
  requirePermission('curriculum.reorder'),
  validateParams(curriculumIdParamSchema),
  validateBody(reorderUnitsSchema),
  asyncHandler(reorderUnits),
);

curriculumRouter.post(
  '/curriculum-units/:unitId/topics',
  requirePermission('curriculum.edit'),
  validateParams(unitIdParamSchema),
  validateBody(createTopicSchema),
  asyncHandler(createTopic),
);

curriculumRouter.patch(
  '/curriculum-units/:unitId/topics/:topicId',
  requirePermission('curriculum.edit'),
  validateParams(unitTopicIdParamSchema),
  validateBody(updateTopicSchema),
  asyncHandler(updateTopic),
);

curriculumRouter.delete(
  '/curriculum-units/:unitId/topics/:topicId',
  requirePermission('curriculum.edit'),
  validateParams(unitTopicIdParamSchema),
  asyncHandler(deleteTopic),
);

curriculumRouter.post(
  '/curriculum-units/:unitId/topics/reorder',
  requirePermission('curriculum.reorder'),
  validateParams(unitIdParamSchema),
  validateBody(reorderTopicsSchema),
  asyncHandler(reorderTopics),
);

curriculumRouter.post(
  '/curriculum-topics/:topicId/concepts',
  requirePermission('curriculum.edit'),
  validateParams(topicIdParamSchema),
  validateBody(addTopicConceptSchema),
  asyncHandler(addTopicConcept),
);

curriculumRouter.patch(
  '/curriculum-topic-concepts/:mappingId',
  requirePermission('curriculum.edit'),
  validateParams(conceptMappingIdParamSchema),
  validateBody(updateTopicConceptSchema),
  asyncHandler(updateTopicConcept),
);

curriculumRouter.delete(
  '/curriculum-topic-concepts/:mappingId',
  requirePermission('curriculum.edit'),
  validateParams(conceptMappingIdParamSchema),
  asyncHandler(deleteTopicConcept),
);

curriculumRouter.post(
  '/curriculum-units/:unitId/projects',
  requirePermission('curriculum.edit'),
  validateParams(unitIdParamSchema),
  validateBody(createProjectSchema),
  asyncHandler(createProject),
);

curriculumRouter.patch(
  '/curriculum-projects/:projectId',
  requirePermission('curriculum.edit'),
  validateParams(projectIdParamSchema),
  validateBody(updateProjectSchema),
  asyncHandler(updateProject),
);

curriculumRouter.delete(
  '/curriculum-projects/:projectId',
  requirePermission('curriculum.edit'),
  validateParams(projectIdParamSchema),
  asyncHandler(deleteProject),
);

curriculumRouter.post(
  '/curriculum-projects/:projectId/topics',
  requirePermission('curriculum.edit'),
  validateParams(projectIdParamSchema),
  validateBody(linkProjectTopicSchema),
  asyncHandler(linkProjectTopic),
);

curriculumRouter.delete(
  '/curriculum-topic-project-links/:linkId',
  requirePermission('curriculum.edit'),
  validateParams(topicProjectLinkIdParamSchema),
  asyncHandler(deleteTopicProjectLink),
);

curriculumRouter.post(
  '/curriculum-projects/:projectId/implementations',
  requirePermission('curriculum.edit'),
  validateParams(projectIdParamSchema),
  validateBody(createProjectImplementationSchema),
  asyncHandler(createProjectImplementation),
);

curriculumRouter.patch(
  '/curriculum-project-implementations/:implementationId',
  requirePermission('curriculum.edit'),
  validateParams(implementationIdParamSchema),
  validateBody(updateProjectImplementationSchema),
  asyncHandler(updateProjectImplementation),
);

curriculumRouter.delete(
  '/curriculum-project-implementations/:implementationId',
  requirePermission('curriculum.edit'),
  validateParams(implementationIdParamSchema),
  asyncHandler(deleteProjectImplementation),
);

curriculumRouter.post(
  '/curricula/:curriculumId/learning-outcomes',
  requirePermission('curriculum.edit'),
  validateParams(curriculumIdParamSchema),
  validateBody(createLearningOutcomeSchema),
  asyncHandler(createLearningOutcome),
);

curriculumRouter.patch(
  '/curriculum-learning-outcomes/:outcomeId',
  requirePermission('curriculum.edit'),
  validateParams(outcomeIdParamSchema),
  validateBody(updateLearningOutcomeSchema),
  asyncHandler(updateLearningOutcome),
);

curriculumRouter.post(
  '/curriculum-topics/:topicId/learning-outcomes',
  requirePermission('curriculum.edit'),
  validateParams(topicIdParamSchema),
  validateBody(mapLearningOutcomeSchema),
  asyncHandler(linkTopicLearningOutcome),
);

curriculumRouter.delete(
  '/curriculum-topic-learning-outcome-links/:linkId',
  requirePermission('curriculum.edit'),
  validateParams(topicOutcomeLinkIdParamSchema),
  asyncHandler(deleteTopicLearningOutcomeLink),
);

curriculumRouter.post(
  '/curriculum-projects/:projectId/learning-outcomes',
  requirePermission('curriculum.edit'),
  validateParams(projectIdParamSchema),
  validateBody(mapLearningOutcomeSchema),
  asyncHandler(linkProjectLearningOutcome),
);

curriculumRouter.delete(
  '/curriculum-project-learning-outcome-links/:linkId',
  requirePermission('curriculum.edit'),
  validateParams(projectOutcomeLinkIdParamSchema),
  asyncHandler(deleteProjectLearningOutcomeLink),
);

curriculumRouter.post(
  '/curricula/:curriculumId/resources',
  requirePermission('curriculum.edit'),
  validateParams(curriculumIdParamSchema),
  validateBody(createResourceSchema),
  asyncHandler(createResource),
);

curriculumRouter.patch(
  '/curriculum-resources/:resourceId',
  requirePermission('curriculum.edit'),
  validateParams(resourceIdParamSchema),
  validateBody(updateResourceSchema),
  asyncHandler(updateResource),
);

curriculumRouter.delete(
  '/curriculum-resources/:resourceId',
  requirePermission('curriculum.edit'),
  validateParams(resourceIdParamSchema),
  asyncHandler(deleteResource),
);

curriculumRouter.get(
  '/curricula/:curriculumId/visibility',
  requirePermission('curriculum.view'),
  validateParams(curriculumIdParamSchema),
  asyncHandler(getVisibility),
);

curriculumRouter.put(
  '/curricula/:curriculumId/visibility',
  requirePermission('curriculum.edit'),
  validateParams(curriculumIdParamSchema),
  validateBody(updateVisibilitySchema),
  asyncHandler(updateVisibility),
);

curriculumRouter.get(
  '/curricula/:curriculumId/versions',
  requirePermission('curriculum.view'),
  validateParams(curriculumIdParamSchema),
  asyncHandler(listVersions),
);

curriculumRouter.get(
  '/curricula/:curriculumId/versions/:versionId',
  requirePermission('curriculum.view'),
  validateParams(versionIdParamSchema),
  asyncHandler(getVersion),
);

curriculumRouter.post(
  '/curricula/:curriculumId/versions',
  requirePermission('curriculum.restore_version'),
  validateParams(curriculumIdParamSchema),
  validateBody(createVersionSchema),
  asyncHandler(createVersion),
);

curriculumRouter.get(
  '/curricula/:curriculumId/versions/:versionId/snapshot',
  requirePermission('curriculum.view'),
  validateParams(versionIdParamSchema),
  asyncHandler(getSnapshot),
);

curriculumRouter.get(
  '/curricula/:curriculumId/versions/compare',
  requirePermission('curriculum.compare_versions'),
  validateParams(curriculumIdParamSchema),
  validateQuery(versionCompareQuerySchema),
  asyncHandler(compareVersions),
);

curriculumRouter.post(
  '/curricula/:curriculumId/submit-review',
  requirePermission('curriculum.submit_review'),
  validateParams(curriculumIdParamSchema),
  validateBody(submitReviewSchema),
  asyncHandler(submitReview),
);

curriculumRouter.post(
  '/curricula/:curriculumId/request-revision',
  requirePermission('curriculum.request_revision'),
  validateParams(curriculumIdParamSchema),
  validateBody(requestRevisionSchema),
  asyncHandler(requestRevision),
);

curriculumRouter.post(
  '/curricula/:curriculumId/approve',
  requirePermission('curriculum.approve'),
  validateParams(curriculumIdParamSchema),
  validateBody(submitReviewSchema),
  asyncHandler(approveCurriculum),
);

curriculumRouter.post(
  '/curricula/:curriculumId/publish',
  requirePermission('curriculum.publish'),
  validateParams(curriculumIdParamSchema),
  validateBody(publishSchema),
  asyncHandler(publishCurriculum),
);

curriculumRouter.post(
  '/curricula/:curriculumId/withdraw-review',
  requirePermission('curriculum.submit_review'),
  validateParams(curriculumIdParamSchema),
  validateBody(withdrawReviewSchema),
  asyncHandler(withdrawReview),
);

curriculumRouter.post(
  '/curricula/:curriculumId/assignments',
  requirePermission('curriculum.assign'),
  validateParams(curriculumIdParamSchema),
  validateBody(createAssignmentSchema),
  asyncHandler(createAssignment),
);

curriculumRouter.get(
  '/curricula/:curriculumId/assignments',
  requirePermission('curriculum.view'),
  validateParams(curriculumIdParamSchema),
  asyncHandler(listAssignments),
);

curriculumRouter.patch(
  '/curriculum-assignments/:assignmentId',
  requirePermission('curriculum.assign'),
  validateParams(assignmentIdParamSchema),
  validateBody(updateAssignmentSchema),
  asyncHandler(updateAssignment),
);

curriculumRouter.post(
  '/curriculum-assignments/:assignmentId/activate',
  requirePermission('curriculum.assign'),
  validateParams(assignmentIdParamSchema),
  validateBody(archiveCurriculumSchema),
  asyncHandler(activateAssignment),
);

curriculumRouter.post(
  '/curriculum-assignments/:assignmentId/complete',
  requirePermission('curriculum.assign'),
  validateParams(assignmentIdParamSchema),
  validateBody(archiveCurriculumSchema),
  asyncHandler(completeAssignment),
);

curriculumRouter.post(
  '/curriculum-assignments/:assignmentId/suspend',
  requirePermission('curriculum.assign'),
  validateParams(assignmentIdParamSchema),
  validateBody(archiveCurriculumSchema),
  asyncHandler(suspendAssignment),
);

curriculumRouter.post(
  '/curriculum-assignments/:assignmentId/archive',
  requirePermission('curriculum.assign'),
  validateParams(assignmentIdParamSchema),
  validateBody(archiveCurriculumSchema),
  asyncHandler(archiveAssignment),
);

export default curriculumRouter;
