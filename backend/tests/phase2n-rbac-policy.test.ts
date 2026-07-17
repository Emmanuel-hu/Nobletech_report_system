import { describe, expect, it } from 'vitest';

import {
  phase2nRequiredPermissions,
  phase2nRoleMappings,
  phase2nRoleMappingsByCode,
} from '../src/scripts/phase2n-rbac-policy';

describe('Phase 2N RBAC policy', () => {
  it('defines exactly 12 promotion permission codes', () => {
    expect(phase2nRequiredPermissions).toHaveLength(12);
    expect(new Set(phase2nRequiredPermissions.map((item) => item.code)).size).toBe(12);
  });

  it('grants all promotion permissions to super admin', () => {
    const superAdmin = phase2nRoleMappingsByCode.get('SUPER_ADMIN');
    expect(superAdmin).toBeDefined();
    expect(new Set(superAdmin?.permissions ?? []).size).toBe(12);
  });

  it('keeps teacher from promotion approval and archive permissions', () => {
    const teacher = phase2nRoleMappingsByCode.get('TEACHER');
    expect(teacher).toBeDefined();
    expect(teacher?.permissions).not.toContain('master_content.promotion.approve');
    expect(teacher?.permissions).not.toContain('master_content.promotion.reject');
    expect(teacher?.permissions).not.toContain('master_content.promotion.complete');
    expect(teacher?.permissions).not.toContain('master_content.promotion.archive');
    expect(teacher?.permissions).not.toContain('master_content.promotion.link_existing');
    expect(teacher?.permissions).not.toContain('master_content.promotion.manage_duplicates');
  });

  it('keeps auditor read-only for promotion', () => {
    const auditor = phase2nRoleMappingsByCode.get('AUDITOR');
    expect(auditor).toBeDefined();
    expect(auditor?.permissions).toEqual(['master_content.promotion.view', 'master_content.promotion.view_audit']);
  });

  it('uses approved role codes only', () => {
    expect(phase2nRoleMappings.map((item) => item.code)).toEqual([
      'SUPER_ADMIN',
      'SCHOOL_ADMIN',
      'CURRICULUM_SUPERVISOR',
      'TEACHER',
      'AUDITOR',
    ]);
  });
});