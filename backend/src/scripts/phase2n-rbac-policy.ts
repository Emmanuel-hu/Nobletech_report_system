import type { PermissionSpec, RoleMappingSpec } from './phase2m-rbac-policy';

export const phase2nRequiredPermissions: PermissionSpec[] = [
  {
    code: 'master_content.promotion.view',
    name: 'View Master Content Promotions',
    resource: 'master_content_promotion',
    action: 'view',
    description: 'Allows viewing promotion requests and items.',
  },
  {
    code: 'master_content.promotion.create',
    name: 'Create Master Content Promotions',
    resource: 'master_content_promotion',
    action: 'create',
    description: 'Allows creating promotion requests from approved manual source records.',
  },
  {
    code: 'master_content.promotion.edit',
    name: 'Edit Master Content Promotions',
    resource: 'master_content_promotion',
    action: 'edit',
    description: 'Allows editing promotion metadata and mapped fields.',
  },
  {
    code: 'master_content.promotion.submit_review',
    name: 'Submit Master Content Promotion Review',
    resource: 'master_content_promotion',
    action: 'submit_review',
    description: 'Allows submitting promotion requests for review.',
  },
  {
    code: 'master_content.promotion.request_revision',
    name: 'Request Master Content Promotion Revision',
    resource: 'master_content_promotion',
    action: 'request_revision',
    description: 'Allows requesting revisions for promotion requests.',
  },
  {
    code: 'master_content.promotion.approve',
    name: 'Approve Master Content Promotion',
    resource: 'master_content_promotion',
    action: 'approve',
    description: 'Allows approving promotion requests.',
  },
  {
    code: 'master_content.promotion.reject',
    name: 'Reject Master Content Promotion',
    resource: 'master_content_promotion',
    action: 'reject',
    description: 'Allows rejecting promotion requests.',
  },
  {
    code: 'master_content.promotion.complete',
    name: 'Complete Master Content Promotion',
    resource: 'master_content_promotion',
    action: 'complete',
    description: 'Allows completing approved promotions after draft linkage.',
  },
  {
    code: 'master_content.promotion.archive',
    name: 'Archive Master Content Promotion',
    resource: 'master_content_promotion',
    action: 'archive',
    description: 'Allows archiving promotions.',
  },
  {
    code: 'master_content.promotion.manage_duplicates',
    name: 'Manage Master Content Promotion Duplicates',
    resource: 'master_content_promotion',
    action: 'manage_duplicates',
    description: 'Allows deterministic duplicate checks and decisions.',
  },
  {
    code: 'master_content.promotion.link_existing',
    name: 'Link Existing Master Content From Promotion',
    resource: 'master_content_promotion',
    action: 'link_existing',
    description: 'Allows linking promotion items to existing master content.',
  },
  {
    code: 'master_content.promotion.view_audit',
    name: 'View Master Content Promotion Audit',
    resource: 'master_content_promotion',
    action: 'view_audit',
    description: 'Allows viewing promotion audit history.',
  },
];

const allPromotionCodes = phase2nRequiredPermissions.map((permission) => permission.code);

export const phase2nRoleMappings: RoleMappingSpec[] = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    scope: 'global',
    description: 'Global administrator with full promotion authority.',
    permissions: allPromotionCodes,
  },
  {
    code: 'SCHOOL_ADMIN',
    name: 'School Admin',
    scope: 'school',
    description: 'School administrator for promotion governance.',
    permissions: allPromotionCodes,
  },
  {
    code: 'CURRICULUM_SUPERVISOR',
    name: 'Curriculum Supervisor',
    scope: 'school',
    description: 'School reviewer for promotion lifecycle and quality control.',
    permissions: [
      'master_content.promotion.view',
      'master_content.promotion.edit',
      'master_content.promotion.submit_review',
      'master_content.promotion.request_revision',
      'master_content.promotion.approve',
      'master_content.promotion.reject',
      'master_content.promotion.complete',
      'master_content.promotion.manage_duplicates',
      'master_content.promotion.link_existing',
      'master_content.promotion.view_audit',
    ],
  },
  {
    code: 'TEACHER',
    name: 'Teacher',
    scope: 'school',
    description: 'School contributor with view and draft preparation only.',
    permissions: [
      'master_content.promotion.view',
      'master_content.promotion.create',
      'master_content.promotion.edit',
      'master_content.promotion.submit_review',
    ],
  },
  {
    code: 'AUDITOR',
    name: 'Auditor',
    scope: 'school',
    description: 'Read-only promotion and audit visibility.',
    permissions: ['master_content.promotion.view', 'master_content.promotion.view_audit'],
  },
];

export const phase2nRoleCodes = phase2nRoleMappings.map((role) => role.code);

export const phase2nRoleMappingsByCode = new Map(
  phase2nRoleMappings.map((role) => [role.code.toUpperCase(), role]),
);