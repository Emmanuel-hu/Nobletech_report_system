import { describe, expect, it } from 'vitest';

import { versionComparisonUtils } from '../src/components/curriculum/VersionComparisonView';

describe('versionComparisonUtils', () => {
  it('detects added, removed, and changed entities by stable signature', () => {
    const before = [
      { id: 'u1', title: 'Unit 1', sequenceOrder: 1 },
      { id: 'u2', title: 'Unit 2', sequenceOrder: 2 },
    ];
    const after = [
      { id: 'u2', title: 'Unit Two', sequenceOrder: 2 },
      { id: 'u3', title: 'Unit 3', sequenceOrder: 3 },
    ];

    const result = versionComparisonUtils.diffCollection(before, after);

    expect(result.added).toEqual([{ id: 'u3', title: 'Unit 3', sequenceOrder: 3 }]);
    expect(result.removed).toEqual([{ id: 'u1', title: 'Unit 1', sequenceOrder: 1 }]);
    expect(result.changed).toHaveLength(1);
    const changedEntry = result.changed[0];
    expect(changedEntry).toBeDefined();
    expect(changedEntry?.before).toEqual({ id: 'u2', title: 'Unit 2', sequenceOrder: 2 });
    expect(changedEntry?.after).toEqual({ id: 'u2', title: 'Unit Two', sequenceOrder: 2 });
  });

  it('returns empty snapshot shape for non-object input', () => {
    expect(versionComparisonUtils.toSnapshotShape(null)).toEqual({});
    expect(versionComparisonUtils.toSnapshotShape('invalid')).toEqual({});
  });
});
