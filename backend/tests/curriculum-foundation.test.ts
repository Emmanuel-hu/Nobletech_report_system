import { describe, expect, it } from 'vitest';

import { createAssignmentSchema } from '../src/validators/curriculum.validator';
import { canTransitionCurriculumStatus, isEditableCurriculumStatus } from '../src/utils/lifecycle.util';
import { checksumSnapshot, serializeStableSnapshot } from '../src/utils/snapshot.util';

describe('Curriculum lifecycle rules', () => {
  it('accepts only allowed workflow transitions', () => {
    expect(canTransitionCurriculumStatus('DRAFT', 'UNDER_REVIEW')).toBe(true);
    expect(canTransitionCurriculumStatus('UNDER_REVIEW', 'APPROVED')).toBe(true);
    expect(canTransitionCurriculumStatus('APPROVED', 'PUBLISHED')).toBe(true);

    expect(canTransitionCurriculumStatus('DRAFT', 'PUBLISHED')).toBe(false);
    expect(canTransitionCurriculumStatus('PUBLISHED', 'DRAFT')).toBe(false);
  });

  it('marks only editable statuses as editable', () => {
    expect(isEditableCurriculumStatus('DRAFT')).toBe(true);
    expect(isEditableCurriculumStatus('REVISION_REQUIRED')).toBe(true);
    expect(isEditableCurriculumStatus('APPROVED')).toBe(false);
    expect(isEditableCurriculumStatus('PUBLISHED')).toBe(false);
  });
});

describe('Stable curriculum snapshots', () => {
  it('produces the same serialization and checksum for equivalent objects', () => {
    const a = {
      unit: { title: 'Intro', sequenceOrder: 1 },
      visibility: { showResources: true, showTools: false },
      outcomes: [{ code: 'LO-001' }, { code: 'LO-002' }],
    };

    const b = {
      outcomes: [{ code: 'LO-001' }, { code: 'LO-002' }],
      visibility: { showTools: false, showResources: true },
      unit: { sequenceOrder: 1, title: 'Intro' },
    };

    expect(serializeStableSnapshot(a)).toEqual(serializeStableSnapshot(b));
    expect(checksumSnapshot(a)).toEqual(checksumSnapshot(b));
  });
});

describe('Curriculum assignment validation', () => {
  it('rejects assignments where effectiveTo is before effectiveFrom', () => {
    const parsed = createAssignmentSchema.safeParse({
      curriculumVersionId: '11111111-1111-1111-1111-111111111111',
      academicSessionId: '22222222-2222-2222-2222-222222222222',
      termId: '33333333-3333-3333-3333-333333333333',
      academicClassId: '44444444-4444-4444-4444-444444444444',
      schoolProgrammeComponentId: '55555555-5555-5555-5555-555555555555',
      effectiveFrom: '2026-09-01',
      effectiveTo: '2026-08-01',
    });

    expect(parsed.success).toBe(false);
  });

  it('accepts assignments with a valid date window', () => {
    const parsed = createAssignmentSchema.safeParse({
      curriculumVersionId: '11111111-1111-1111-1111-111111111111',
      academicSessionId: '22222222-2222-2222-2222-222222222222',
      termId: '33333333-3333-3333-3333-333333333333',
      academicClassId: '44444444-4444-4444-4444-444444444444',
      schoolProgrammeComponentId: '55555555-5555-5555-5555-555555555555',
      effectiveFrom: '2026-09-01',
      effectiveTo: '2026-10-01',
    });

    expect(parsed.success).toBe(true);
  });
});
