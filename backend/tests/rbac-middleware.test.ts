import { describe, expect, it, vi } from 'vitest';

import { requirePermission } from '../src/middleware/rbac.middleware';

describe('RBAC middleware', () => {
  it('passes when the normalized permission is present', () => {
    const middleware = requirePermission('curriculum_source.processing.approve');
    const next = vi.fn();

    middleware(
      {
        auth: {
          userId: 'u-1',
          schoolId: 's-1',
          isSuperAdmin: false,
          permissions: new Set(['curriculum_source.processing.approve']),
        },
      } as never,
      {} as never,
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });

  it('denies when the permission is absent', () => {
    const middleware = requirePermission('curriculum_source.processing.archive');
    const next = vi.fn();

    middleware(
      {
        auth: {
          userId: 'u-1',
          schoolId: 's-1',
          isSuperAdmin: false,
          permissions: new Set(['curriculum_source.processing.view']),
        },
      } as never,
      {} as never,
      next,
    );

    expect(next).toHaveBeenCalledOnce();
    const [error] = next.mock.calls[0] ?? [];
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain('Missing permission: curriculum_source.processing.archive');
  });
});