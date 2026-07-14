import { describe, expect, it } from 'vitest';

import type { AuthContext } from '../src/types/auth.types';
import { masterContentService } from '../src/services/master-content.service';

const auth: AuthContext = {
  userId: '00000000-0000-0000-0000-000000000001',
  schoolId: '00000000-0000-0000-0000-000000000010',
  isSuperAdmin: true,
  permissions: new Set([
    'master_content.view',
    'master_content.create',
    'master_content.edit',
    'master_content.submit_review',
    'master_content.request_revision',
    'master_content.approve',
    'master_content.archive',
    'master_content.manage_mappings',
    'master_content.manage_lineage',
    'master_content.view_audit',
  ]),
};

describe('Master-content service surface', () => {
  it('exposes dashboard and review queue operations', () => {
    expect(typeof masterContentService.getDashboard).toBe('function');
    expect(typeof masterContentService.listReviewQueue).toBe('function');
  });

  it('exposes CRUD and lifecycle operations for entities', () => {
    expect(typeof masterContentService.listEntities).toBe('function');
    expect(typeof masterContentService.getEntity).toBe('function');
    expect(typeof masterContentService.createEntity).toBe('function');
    expect(typeof masterContentService.updateEntity).toBe('function');
    expect(typeof masterContentService.transitionLifecycle).toBe('function');
    expect(typeof masterContentService.createRevision).toBe('function');
    expect(auth.permissions.has('master_content.view')).toBe(true);
  });

  it('exposes mapping and lineage administration operations', () => {
    expect(typeof masterContentService.createMapping).toBe('function');
    expect(typeof masterContentService.removeMapping).toBe('function');
    expect(typeof masterContentService.createLineage).toBe('function');
    expect(typeof masterContentService.updateLineage).toBe('function');
    expect(typeof masterContentService.deleteLineage).toBe('function');
  });
});
