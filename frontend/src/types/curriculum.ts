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
  updatedAt?: string;
  lastKnownUpdatedAt?: string;
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
  updatedAt: string;
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
  updatedAt: string;
  masterTopicId?: string | null;
  conceptLinks: CurriculumTopicConcept[];
  topicProjects?: CurriculumTopicProjectLink[];
  topicLearningOutcomes?: CurriculumTopicLearningOutcomeLink[];
};

export type CurriculumTopicConcept = {
  id: string;
  curriculumConceptId: string | null;
  masterConceptId: string | null;
  sequenceOrder: number | null;
  teacherNote?: string | null;
  importanceLevel: string | null;
  expectedDepth: string | null;
  instructionalEmphasis: string | null;
  isCore: boolean;
  assessmentRelevance: string | null;
  updatedAt: string;
};

export type CurriculumTopicProjectLink = {
  id: string;
  curriculumProjectId: string;
  curriculumTopicId: string;
  sequenceOrder: number | null;
};

export type CurriculumTopicLearningOutcomeLink = {
  id: string;
  curriculumTopicId: string;
  curriculumLearningOutcomeId: string;
  sequenceOrder: number | null;
};

export type CurriculumProjectImplementation = {
  id: string;
  title: string;
  implementationType: string;
  sequenceOrder: number;
  estimatedDurationMinutes: number | null;
  requiredInternet?: boolean;
  requiredDeviceCount?: number | null;
  learnerInstructions?: string | null;
  teacherInstructions?: string | null;
  safetyInstructions?: string | null;
  description?: string | null;
  updatedAt: string;
};

export type CurriculumProjectOutcomeLink = {
  id: string;
  curriculumProjectId: string;
  curriculumLearningOutcomeId: string;
  sequenceOrder: number | null;
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
  updatedAt: string;
  implementations: CurriculumProjectImplementation[];
  topicLinks?: CurriculumTopicProjectLink[];
  projectLearningOutcomes?: CurriculumProjectOutcomeLink[];
};

export type CurriculumLearningOutcome = {
  id: string;
  statement: string;
  code: string | null;
  bloomLevel: string | null;
  measurableVerb: string | null;
  masterLearningOutcomeId?: string | null;
  updatedAt: string;
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
  masterResourceId?: string | null;
  externalUrl?: string | null;
  internalFileReference?: string | null;
  updatedAt: string;
};

export type CurriculumConcept = {
  id: string;
  name: string;
  code: string | null;
  definition: string;
  explanation: string | null;
  masterConceptId: string | null;
  updatedAt: string;
};

export type AcademicSessionLookup = {
  id: string;
  name: string;
  code: string;
  isCurrent: boolean;
};

export type TermLookup = {
  id: string;
  name: string;
  code: string;
  academicSessionId: string;
  sequenceOrder: number;
};

export type AcademicClassLookup = {
  id: string;
  name: string;
  code: string;
  displayName: string | null;
};

export type SchoolProgrammeComponentLookup = {
  id: string;
  displayName: string | null;
  localCode: string | null;
  isEnabled: boolean;
};

export type TeacherLookup = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  username: string;
};

export type MasterConceptLookup = {
  id: string;
  schoolId: string | null;
  name: string;
  code: string | null;
  definition: string;
};

export type MasterLearningOutcomeLookup = {
  id: string;
  schoolId: string | null;
  statement: string;
  code: string | null;
  bloomLevel: string | null;
  measurableVerb: string | null;
};

export type MasterResourceLookup = {
  id: string;
  schoolId: string | null;
  title: string;
  description: string | null;
  resourceType: string;
};

export type CurriculumEditorLookups = {
  sessions: AcademicSessionLookup[];
  terms: TermLookup[];
  academicClasses: AcademicClassLookup[];
  schoolProgrammeComponents: SchoolProgrammeComponentLookup[];
  teachers: TeacherLookup[];
  publishedVersions: CurriculumVersion[];
  masterConcepts: MasterConceptLookup[];
  masterLearningOutcomes: MasterLearningOutcomeLookup[];
  masterResources: MasterResourceLookup[];
  curriculum: {
    id: string;
    schoolProgrammeComponentId: string;
    status: CurriculumStatus;
  };
};

export type CurriculumVersionSnapshot = {
  versionId: string;
  versionNumber: string;
  snapshotData: Record<string, unknown>;
  snapshotChecksum: string | null;
};

export type CurriculumVersionComparison = {
  left: {
    id: string;
    versionNumber: string;
    status: CurriculumStatus;
    checksum: string | null;
    snapshotData: Record<string, unknown>;
  };
  right: {
    id: string;
    versionNumber: string;
    status: CurriculumStatus;
    checksum: string | null;
    snapshotData: Record<string, unknown>;
  };
  metadata: {
    checksumMatch: boolean;
    serializedLengthDelta: number;
  };
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
  concepts: CurriculumConcept[];
  learningOutcomes: CurriculumLearningOutcome[];
  resources: CurriculumResource[];
  versions: CurriculumVersion[];
  assignments: CurriculumAssignment[];
  reviewActions: CurriculumReviewAction[];
  statusHistory: CurriculumStatusHistory[];
  visibilitySetting: CurriculumVisibility | null;
};

export type SourceReviewStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'REVISION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED';

export type CurriculumSourceType =
  | 'GOVERNMENT_CURRICULUM'
  | 'SCHOOL_SCHEME_OF_WORK'
  | 'INTERNATIONAL_FRAMEWORK'
  | 'TEXTBOOK'
  | 'TEACHER_MATERIAL'
  | 'WEBSITE'
  | 'INTERNAL_NOBLETECH_CONTENT'
  | 'UPLOADED_DOCUMENT'
  | 'OTHER';

export type CurriculumSourceFormat = 'PDF' | 'DOCX' | 'XLSX' | 'CSV' | 'HTML' | 'URL' | 'TEXT' | 'IMAGE' | 'OTHER';

export type CurriculumSourceContentType =
  | 'SECTION'
  | 'UNIT'
  | 'TOPIC'
  | 'CONCEPT'
  | 'SKILL'
  | 'LEARNING_OUTCOME'
  | 'ACTIVITY'
  | 'PROJECT'
  | 'RESOURCE'
  | 'ASSESSMENT'
  | 'OTHER';

export type MasterCatalogType =
  | 'unit'
  | 'topic'
  | 'concept'
  | 'skill'
  | 'learning_outcome'
  | 'activity'
  | 'project'
  | 'project_implementation'
  | 'resource'
  | 'assessment_template'
  | 'rubric';

export type CurriculumSourceContent = {
  id: string;
  curriculumSourceId: string;
  sequenceOrder: number;
  contentType: CurriculumSourceContentType;
  heading: string | null;
  rawText: string | null;
  structuredData: Record<string, unknown> | null;
  sourcePage: string | null;
  sourceSection: string | null;
  confidenceScore: string | number | null;
  extractionMethod: string | null;
  reviewed: boolean;
  reviewedById: string | null;
  reviewedAt: string | null;
  reviewStatus?: SourceReviewStatus;
  createdById?: string | null;
  processingSessionId?: string | null;
  sectionId?: string | null;
  sourceFileId?: string | null;
  sourceFileVersion?: string | null;
  sourceFileChecksum?: string | null;
  adaptationNote?: string | null;
  archivedAt?: string | null;
  updatedAt: string;
};

export type CurriculumSourceProcessingStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'PENDING_REVIEW'
  | 'REVISION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'ARCHIVED';

export type CurriculumSourceProcessingMethod = 'MANUAL' | 'OCR' | 'AI_ASSISTED' | 'IMPORTED' | 'HYBRID';

export type CurriculumSourceSectionType =
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

export type CurriculumSourceSectionReviewStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'REVISION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED';

export type CurriculumSourceSection = {
  id: string;
  processingSessionId: string;
  parentSectionId: string | null;
  sectionType: CurriculumSourceSectionType;
  heading: string;
  rawText: string;
  structuredData: Record<string, unknown> | null;
  pageStart: number | null;
  pageEnd: number | null;
  sourceSectionReference: string | null;
  sequenceOrder: number;
  reviewStatus: CurriculumSourceSectionReviewStatus;
  reviewNote: string | null;
  createdById: string;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  sourceContents?: CurriculumSourceContent[];
};

export type CurriculumSourceProcessingSession = {
  id: string;
  schoolId: string | null;
  curriculumSourceId: string;
  curriculumSourceFileId: string;
  sourceFileVersion: string | null;
  status: CurriculumSourceProcessingStatus;
  processingMethod: CurriculumSourceProcessingMethod;
  startedById: string;
  assignedReviewerId: string | null;
  startedAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  approvedAt: string | null;
  completedAt: string | null;
  archivedAt: string | null;
  revisionNumber: number;
  lastKnownSourceChecksum: string;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  revisionReason: string | null;
  archiveReason: string | null;
  previousSessionId: string | null;
  createdAt: string;
  updatedAt: string;
  sections?: CurriculumSourceSection[];
  sourceContents?: CurriculumSourceContent[];
};

export type CurriculumSourceRevisionComparison = {
  leftRevisionId: string | null;
  rightRevisionId: string;
  addedSections: CurriculumSourceSection[];
  removedSections: CurriculumSourceSection[];
  changedSections: Array<{ before: CurriculumSourceSection; after: CurriculumSourceSection }>;
};

export type CurriculumSourceProcessingAuditItem = {
  id: string;
  schoolId: string | null;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  reason: string | null;
  requestId: string | null;
  createdAt: string;
};

export type CurriculumSourceMasterContentLink = {
  id: string;
  curriculumSourceId: string;
  masterCurriculumUnitId: string | null;
  masterTopicId: string | null;
  masterConceptId: string | null;
  masterSkillId: string | null;
  masterLearningOutcomeId: string | null;
  masterActivityId: string | null;
  masterProjectId: string | null;
  masterProjectImplementationId: string | null;
  masterResourceId: string | null;
  masterAssessmentTemplateId: string | null;
  masterRubricId: string | null;
  sourceVersionLabel: string | null;
  sourcePage: string | null;
  sourceSection: string | null;
  extractionNote: string | null;
  adaptationNote: string | null;
  attribution: string | null;
  usageRestriction: string | null;
  reviewStatus: SourceReviewStatus;
  updatedAt: string;
};

export type CurriculumSourceFileStatus = 'ACTIVE' | 'ARCHIVED' | 'DELETED';

export type CurriculumSourceFileUploadStatus = 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';

export type CurriculumSourceFileScanStatus =
  | 'PENDING'
  | 'NOT_CONFIGURED'
  | 'CLEAN'
  | 'REJECTED'
  | 'FAILED';

export type CurriculumSourceFileCategory =
  | 'SOURCE_DOCUMENT'
  | 'SUPPLEMENTARY_IMAGE'
  | 'SUPPLEMENTARY_DATA'
  | 'OTHER';

export type CurriculumSourceStorageProvider = 'LOCAL' | 'AZURE_BLOB' | 'AWS_S3' | 'GCP_STORAGE';

export type CurriculumSourceFile = {
  id: string;
  curriculumSourceId: string;
  schoolId: string;
  storageProvider: CurriculumSourceStorageProvider;
  storageKey: string;
  originalFileName: string;
  safeFileName: string;
  fileExtension: string;
  mimeType: string;
  fileSize: string | number;
  checksum: string;
  checksumAlgorithm: 'SHA256';
  fileCategory: CurriculumSourceFileCategory;
  uploadStatus: CurriculumSourceFileUploadStatus;
  scanStatus: CurriculumSourceFileScanStatus;
  scanDetails: string | null;
  metadata: Record<string, unknown> | null;
  documentVersion: string | null;
  effectiveDate: string | null;
  supersededFileId: string | null;
  sequenceOrder: number;
  isPrimary: boolean;
  isActive: boolean;
  status: CurriculumSourceFileStatus;
  uploadedById: string;
  uploadedAt: string;
  verifiedAt: string | null;
  archivedAt: string | null;
  archivedById: string | null;
  unlinkedAt: string | null;
  unlinkedById: string | null;
  deletedAt: string | null;
  deletedById: string | null;
  updatedAt: string;
};

export type CurriculumSource = {
  id: string;
  schoolId: string | null;
  sourceCode: string | null;
  title: string;
  description: string | null;
  sourceType: CurriculumSourceType;
  sourceFormat: CurriculumSourceFormat;
  usageRights: string;
  status: 'DRAFT' | 'UNDER_REVIEW' | 'REVISION_REQUIRED' | 'APPROVED' | 'ARCHIVED';
  reviewStatus: SourceReviewStatus;
  isActive: boolean;
  sourceUrl: string | null;
  fileReference: string | null;
  uploadedById: string | null;
  reviewedById: string | null;
  approvedById: string | null;
  uploadedAt: string;
  reviewedAt: string | null;
  approvedAt: string | null;
  archivedAt: string | null;
  updatedAt: string;
  sourceFiles: CurriculumSourceFile[];
  sourceContents: CurriculumSourceContent[];
  masterContentLinks: CurriculumSourceMasterContentLink[];
};
