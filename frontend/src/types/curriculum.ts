export type CurriculumStatus =
  | 'GENERATED_DRAFT'
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'REVISION_REQUIRED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export const NON_EDITABLE_CURRICULUM_STATUSES: ReadonlyArray<CurriculumStatus> = [
  'UNDER_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'ARCHIVED',
];

export const isCurriculumEditable = (status: CurriculumStatus): boolean =>
  !NON_EDITABLE_CURRICULUM_STATUSES.includes(status);

export const isCurriculumPublished = (status: CurriculumStatus): boolean => status === 'PUBLISHED';

export type AssignmentStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'ARCHIVED';

export type CurriculumSummary = {
  id: string;
  title: string;
  code: string;
  schoolId: string;
  schoolProgrammeComponentId: string;
  status: CurriculumStatus;
  currentVersionNumber: string | null;
  createdById: string;
  updatedAt: string;
  publishedAt: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
};

export type CurriculumListFilters = {
  status?: CurriculumStatus;
  schoolProgrammeComponentId?: string;
  createdById?: string;
  includeArchived?: boolean;
  isPublished?: boolean;
};

export type CurriculumVisibility = {
  showProgrammeComponents: boolean;
  showTools: boolean;
  showResources: boolean;
  showProjects: boolean;
  showLearningOutcomes: boolean;
  showTeacherNotes: boolean;
  showStudentNotes: boolean;
  visibleToTeachers: boolean;
  visibleToLearners: boolean;
  visibleToGuardians: boolean;
};

export type CurriculumVersion = {
  id: string;
  curriculumId: string;
  basedOnVersionId: string | null;
  versionNumber: string;
  majorVersion: number;
  minorVersion: number;
  patchVersion: number;
  versionLabel: string | null;
  status: CurriculumStatus;
  changeSummary: string | null;
  isCurrent: boolean;
  isPublished: boolean;
  createdById: string;
  approvedById: string | null;
  publishedById: string | null;
  approvedAt: string | null;
  publishedAt: string | null;
  snapshotChecksum: string | null;
  createdAt: string;
};

export type CurriculumUnit = {
  id: string;
  title: string;
  code: string | null;
  description: string | null;
  sequenceOrder: number;
  estimatedWeeks: number | null;
  topics: CurriculumTopic[];
  projects: CurriculumProject[];
};

export type CurriculumTopic = {
  id: string;
  title: string;
  code: string | null;
  description: string | null;
  sequenceOrder: number;
  weekNumber: number | null;
  recommendedDurationMinutes: number | null;
  difficultyLevel: string | null;
  teacherNote: string | null;
  conceptLinks: CurriculumTopicConcept[];
};

export type CurriculumTopicConcept = {
  id: string;
  curriculumConceptId: string | null;
  masterConceptId: string | null;
  sequenceOrder: number | null;
  importanceLevel: string | null;
  expectedDepth: string | null;
  instructionalEmphasis: string | null;
  isCore: boolean;
  assessmentRelevance: string | null;
};

export type CurriculumProjectImplementation = {
  id: string;
  title: string;
  implementationType: string;
  sequenceOrder: number;
  estimatedDurationMinutes: number | null;
};

export type CurriculumProject = {
  id: string;
  title: string;
  description: string;
  sequenceOrder: number;
  objective: string | null;
  expectedOutput: string | null;
  estimatedDurationMinutes: number | null;
  difficultyLevel: string | null;
  safetyNote: string | null;
  implementations: CurriculumProjectImplementation[];
};

export type CurriculumLearningOutcome = {
  id: string;
  statement: string;
  code: string | null;
  bloomLevel: string | null;
  measurableVerb: string | null;
};

export type CurriculumResource = {
  id: string;
  curriculumTopicId: string;
  title: string;
  description: string | null;
  resourceType: string;
  quantityRequired: string | null;
  requiresInternet: boolean;
  requiresLogin: boolean;
  safetyNote: string | null;
};

export type CurriculumAssignment = {
  id: string;
  curriculumId: string;
  curriculumVersionId: string;
  academicSessionId: string;
  termId: string;
  academicClassId: string;
  schoolProgrammeComponentId: string;
  teacherUserId: string | null;
  status: AssignmentStatus;
  effectiveFrom: string;
  effectiveTo: string | null;
  assignedById: string | null;
  activatedById: string | null;
  activatedAt: string | null;
  completedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
};

export type CurriculumReviewAction = {
  id: string;
  curriculumId: string;
  curriculumVersionId: string;
  decision: string;
  comment: string | null;
  requestedChanges: string | null;
  previousStatus: CurriculumStatus;
  resultingStatus: CurriculumStatus;
  actorUserId: string;
  actedAt: string;
};

export type CurriculumStatusHistory = {
  id: string;
  curriculumId: string;
  curriculumVersionId: string;
  previousStatus: CurriculumStatus;
  newStatus: CurriculumStatus;
  reason: string | null;
  changedById: string;
  changedAt: string;
};

export type CurriculumDetail = CurriculumSummary & {
  description: string | null;
  currentVersionId: string | null;
  publicationChecksum: string | null;
  submittedById: string | null;
  approvedById: string | null;
  publishedById: string | null;
  units: CurriculumUnit[];
  learningOutcomes: CurriculumLearningOutcome[];
  resources: CurriculumResource[];
  versions: CurriculumVersion[];
  assignments: CurriculumAssignment[];
  reviewActions: CurriculumReviewAction[];
  statusHistory: CurriculumStatusHistory[];
  visibilitySetting: CurriculumVisibility | null;
};
