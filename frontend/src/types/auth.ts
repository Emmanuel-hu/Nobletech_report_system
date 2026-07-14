export type AuthSession = {
  userId: string;
  schoolId: string;
  permissions: string[];
};

export const defaultAuthSession: AuthSession = {
  userId: '00000000-0000-0000-0000-000000000001',
  schoolId: '00000000-0000-0000-0000-000000000010',
  permissions: [
    'curriculum.view',
    'curriculum.create',
    'curriculum.edit',
    'curriculum.reorder',
    'curriculum.submit_review',
    'curriculum.request_revision',
    'curriculum.approve',
    'curriculum.publish',
    'curriculum.archive',
    'curriculum.assign',
    'curriculum.compare_versions',
    'curriculum.view_audit',
    'curriculum.restore_version',
    'master_content.view',
    'master_content.create',
    'master_content.edit',
    'master_content.reorder',
    'master_content.submit_review',
    'master_content.request_revision',
    'master_content.approve',
    'master_content.archive',
    'master_content.manage_lineage',
    'master_content.manage_mappings',
    'master_content.view_audit',
  ],
};
