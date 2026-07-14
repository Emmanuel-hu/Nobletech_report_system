export type MasterContentStatus = 'DRAFT' | 'UNDER_REVIEW' | 'REVISION_REQUIRED' | 'APPROVED' | 'ARCHIVED';

export type MasterEntityType =
  | 'units'
  | 'topics'
  | 'concepts'
  | 'skills'
  | 'outcomes'
  | 'activities'
  | 'projects'
  | 'project-implementations'
  | 'resources'
  | 'assessments'
  | 'rubrics'
  | 'rubric-criteria'
  | 'rubric-levels';

export type MappingType =
  | 'unit-subject'
  | 'unit-integration-domain'
  | 'unit-programme-component'
  | 'topic-subject'
  | 'topic-integration-domain'
  | 'topic-concept'
  | 'topic-skill'
  | 'topic-outcome'
  | 'topic-activity'
  | 'topic-project'
  | 'activity-resource'
  | 'project-resource'
  | 'project-skill'
  | 'project-outcome'
  | 'assessment-outcome';

export type LineageEntityType =
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

export type MasterDashboardCounts = {
  entities: {
    units: number;
    topics: number;
    concepts: number;
    skills: number;
    outcomes: number;
    activities: number;
    projects: number;
    resources: number;
    assessments: number;
    rubrics: number;
  };
  lifecycle: {
    draft: number;
    underReview: number;
    revisionRequired: number;
    approved: number;
    archived: number;
  };
};

export type MasterEntityRecord = {
  id: string;
  schoolId?: string | null;
  status?: MasterContentStatus;
  versionNumber?: number;
  updatedAt: string;
  [key: string]: unknown;
};

export type MasterEntityListResponse = {
  items: MasterEntityRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type MasterReviewQueueItem = {
  id: string;
  schoolId: string | null;
  status: MasterContentStatus;
  versionNumber: number | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  title?: string | null;
  name?: string | null;
  statement?: string | null;
  entityType: string;
};

export type MasterAuditRecord = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  reason: string | null;
  createdAt: string;
  actorUserId: string | null;
  oldValues: unknown;
  newValues: unknown;
};

export type LineageRecord = {
  id: string;
  curriculumSourceId: string;
  sourceVersionLabel: string | null;
  sourcePage: string | null;
  sourceSection: string | null;
  extractionNote: string | null;
  adaptationNote: string | null;
  attribution: string | null;
  usageRestriction: string | null;
  updatedAt: string;
};
