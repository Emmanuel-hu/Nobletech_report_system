import type { CurriculumStatus } from '@prisma/client';

const transitions: Record<CurriculumStatus, Set<CurriculumStatus>> = {
  GENERATED_DRAFT: new Set(['ARCHIVED']),
  DRAFT: new Set(['UNDER_REVIEW', 'ARCHIVED']),
  UNDER_REVIEW: new Set(['REVISION_REQUIRED', 'APPROVED', 'DRAFT']),
  REVISION_REQUIRED: new Set(['UNDER_REVIEW', 'ARCHIVED']),
  APPROVED: new Set(['PUBLISHED', 'ARCHIVED']),
  PUBLISHED: new Set(['ARCHIVED']),
  ARCHIVED: new Set([]),
};

export const isEditableCurriculumStatus = (status: CurriculumStatus): boolean =>
  status === 'DRAFT' || status === 'REVISION_REQUIRED';

export const canTransitionCurriculumStatus = (
  from: CurriculumStatus,
  to: CurriculumStatus,
): boolean => {
  return transitions[from].has(to);
};
