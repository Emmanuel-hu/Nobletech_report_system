import { describe, expect, it } from 'vitest';

import {
  phase2mRequiredPermissions,
  phase2mRoleMappings,
  phase2mRoleMappingsByCode,
} from '../src/scripts/phase2m-rbac-policy';

describe('Phase 2M RBAC policy', () => {
  it('defines exactly 15 permission codes', () => {
    expect(phase2mRequiredPermissions).toHaveLength(15);
    expect(new Set(phase2mRequiredPermissions.map((item) => item.code)).size).toBe(15);
  });

  it('grants all Phase 2M permissions to super admin', () => {
    const superAdmin = phase2mRoleMappingsByCode.get('SUPER_ADMIN');
    expect(superAdmin).toBeDefined();
    expect(new Set(superAdmin?.permissions ?? []).size).toBe(15);
  });

  it('keeps teacher free of approval and archive permissions', () => {
    const teacher = phase2mRoleMappingsByCode.get('TEACHER');
    expect(teacher).toBeDefined();
    expect(teacher?.permissions).not.toContain('curriculum_source.processing.approve');
    expect(teacher?.permissions).not.toContain('curriculum_source.processing.reject');
    expect(teacher?.permissions).not.toContain('curriculum_source.processing.complete');
    expect(teacher?.permissions).not.toContain('curriculum_source.processing.archive');
    expect(teacher?.permissions).not.toContain('curriculum_source.processing.request_revision');
    expect(teacher?.permissions).not.toContain('curriculum_source.processing.view_audit');
  });

  it('keeps auditor read-only', () => {
    const auditor = phase2mRoleMappingsByCode.get('AUDITOR');
    expect(auditor).toBeDefined();
    expect(auditor?.permissions).toEqual([
      'curriculum_source.processing.view',
      'curriculum_source.processing.compare_versions',
      'curriculum_source.processing.view_audit',
    ]);
  });

  it('uses approved role codes only', () => {
    expect(phase2mRoleMappings.map((item) => item.code)).toEqual([
      'SUPER_ADMIN',
      'SCHOOL_ADMIN',
      'CURRICULUM_SUPERVISOR',
      'TEACHER',
      'AUDITOR',
    ]);
  });
});