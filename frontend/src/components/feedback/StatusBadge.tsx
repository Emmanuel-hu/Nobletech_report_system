import type { CurriculumStatus } from '../../types/curriculum';

const statusLabel: Record<CurriculumStatus, string> = {
  GENERATED_DRAFT: 'Generated draft',
  DRAFT: 'Draft',
  UNDER_REVIEW: 'Under review',
  REVISION_REQUIRED: 'Revision required',
  APPROVED: 'Approved',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

const statusSymbol: Record<CurriculumStatus, string> = {
  GENERATED_DRAFT: 'GD',
  DRAFT: 'DR',
  UNDER_REVIEW: 'UR',
  REVISION_REQUIRED: 'RR',
  APPROVED: 'AP',
  PUBLISHED: 'PB',
  ARCHIVED: 'AR',
};

export const StatusBadge = ({ status }: { status: CurriculumStatus }) => {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`} role="status" aria-label={`Status ${statusLabel[status]}`}>
      <span className="status-symbol" aria-hidden="true">{statusSymbol[status]}</span>
      <span>{statusLabel[status]}</span>
    </span>
  );
};
