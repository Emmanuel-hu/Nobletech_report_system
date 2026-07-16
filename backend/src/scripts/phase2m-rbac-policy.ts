export type PermissionSpec = {
  code: string;
  name: string;
  resource: string;
  action: string;
  description: string;
};

export type RoleMappingScope = 'global' | 'school';

export type RoleMappingSpec = {
  code: string;
  name: string;
  scope: RoleMappingScope;
  description: string;
  permissions: string[];
};

export const phase2mRequiredPermissions: PermissionSpec[] = [
  {
    code: 'curriculum_source.processing.view',
    name: 'View Curriculum Source Processing Sessions',
    resource: 'curriculum_source_processing',
    action: 'view',
    description: 'Allows viewing manual curriculum source processing sessions and related records.',
  },
  {
    code: 'curriculum_source.processing.create',
    name: 'Create Curriculum Source Processing Sessions',
    resource: 'curriculum_source_processing',
    action: 'create',
    description: 'Allows creating manual curriculum source processing sessions.',
  },
  {
    code: 'curriculum_source.processing.edit',
    name: 'Edit Curriculum Source Processing Sessions',
    resource: 'curriculum_source_processing',
    action: 'edit',
    description: 'Allows editing manual curriculum source processing sessions.',
  },
  {
    code: 'curriculum_source.processing.submit_review',
    name: 'Submit Curriculum Source Processing Review',
    resource: 'curriculum_source_processing',
    action: 'submit_review',
    description: 'Allows submitting manual curriculum source processing sessions for review.',
  },
  {
    code: 'curriculum_source.processing.request_revision',
    name: 'Request Curriculum Source Processing Revision',
    resource: 'curriculum_source_processing',
    action: 'request_revision',
    description: 'Allows requesting revisions for manual curriculum source processing sessions.',
  },
  {
    code: 'curriculum_source.processing.approve',
    name: 'Approve Curriculum Source Processing Session',
    resource: 'curriculum_source_processing',
    action: 'approve',
    description: 'Allows approving manual curriculum source processing sessions.',
  },
  {
    code: 'curriculum_source.processing.reject',
    name: 'Reject Curriculum Source Processing Session',
    resource: 'curriculum_source_processing',
    action: 'reject',
    description: 'Allows rejecting manual curriculum source processing sessions.',
  },
  {
    code: 'curriculum_source.processing.complete',
    name: 'Complete Curriculum Source Processing Session',
    resource: 'curriculum_source_processing',
    action: 'complete',
    description: 'Allows completing approved manual curriculum source processing sessions.',
  },
  {
    code: 'curriculum_source.processing.archive',
    name: 'Archive Curriculum Source Processing Session',
    resource: 'curriculum_source_processing',
    action: 'archive',
    description: 'Allows archiving manual curriculum source processing sessions.',
  },
  {
    code: 'curriculum_source.processing.compare_versions',
    name: 'Compare Curriculum Source Processing Revisions',
    resource: 'curriculum_source_processing',
    action: 'compare_versions',
    description: 'Allows comparing revisions of manual curriculum source processing sessions.',
  },
  {
    code: 'curriculum_source.processing.view_audit',
    name: 'View Curriculum Source Processing Audit History',
    resource: 'curriculum_source_processing',
    action: 'view_audit',
    description: 'Allows viewing audit logs for curriculum source processing sessions.',
  },
  {
    code: 'curriculum_source.section.create',
    name: 'Create Curriculum Source Sections',
    resource: 'curriculum_source_section',
    action: 'create',
    description: 'Allows creating extracted source sections within processing sessions.',
  },
  {
    code: 'curriculum_source.section.edit',
    name: 'Edit Curriculum Source Sections',
    resource: 'curriculum_source_section',
    action: 'edit',
    description: 'Allows editing extracted source sections within processing sessions.',
  },
  {
    code: 'curriculum_source.section.delete',
    name: 'Delete Curriculum Source Sections',
    resource: 'curriculum_source_section',
    action: 'delete',
    description: 'Allows deleting extracted source sections within processing sessions.',
  },
  {
    code: 'curriculum_source.section.reorder',
    name: 'Reorder Curriculum Source Sections',
    resource: 'curriculum_source_section',
    action: 'reorder',
    description: 'Allows reordering and moving extracted source sections within processing sessions.',
  },
];

const allPermissionCodes = phase2mRequiredPermissions.map((permission) => permission.code);

export const phase2mRoleMappings: RoleMappingSpec[] = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    scope: 'global',
    description: 'Global platform administrator with full Phase 2M manual source-processing authority.',
    permissions: allPermissionCodes,
  },
  {
    code: 'SCHOOL_ADMIN',
    name: 'School Admin',
    scope: 'school',
    description: 'School-scoped administrator for manual source-processing governance.',
    permissions: allPermissionCodes,
  },
  {
    code: 'CURRICULUM_SUPERVISOR',
    name: 'Curriculum Supervisor',
    scope: 'school',
    description: 'School-scoped curriculum reviewer for manual processing workflows.',
    permissions: [
      'curriculum_source.processing.view',
      'curriculum_source.processing.create',
      'curriculum_source.processing.edit',
      'curriculum_source.processing.submit_review',
      'curriculum_source.processing.request_revision',
      'curriculum_source.processing.approve',
      'curriculum_source.processing.reject',
      'curriculum_source.processing.complete',
      'curriculum_source.processing.compare_versions',
      'curriculum_source.processing.view_audit',
      'curriculum_source.section.create',
      'curriculum_source.section.edit',
      'curriculum_source.section.delete',
      'curriculum_source.section.reorder',
    ],
  },
  {
    code: 'TEACHER',
    name: 'Teacher',
    scope: 'school',
    description: 'School-scoped editor for manual processing preparation without approval or archive authority.',
    permissions: [
      'curriculum_source.processing.view',
      'curriculum_source.processing.create',
      'curriculum_source.processing.edit',
      'curriculum_source.processing.submit_review',
      'curriculum_source.section.create',
      'curriculum_source.section.edit',
      'curriculum_source.section.delete',
      'curriculum_source.section.reorder',
    ],
  },
  {
    code: 'AUDITOR',
    name: 'Auditor',
    scope: 'school',
    description: 'School-scoped read-only reviewer for manual processing traceability.',
    permissions: [
      'curriculum_source.processing.view',
      'curriculum_source.processing.compare_versions',
      'curriculum_source.processing.view_audit',
    ],
  },
];

export const phase2mRoleCodes = phase2mRoleMappings.map((role) => role.code);

export const phase2mPermissionsByCode = new Map(
  phase2mRequiredPermissions.map((permission) => [permission.code.toLowerCase(), permission]),
);

export const phase2mRoleMappingsByCode = new Map(
  phase2mRoleMappings.map((role) => [role.code.toUpperCase(), role]),
);