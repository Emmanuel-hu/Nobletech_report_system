import { useEffect, useMemo, useState } from 'react';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import type { ApiClientError } from '../../../types/api';
import type { CurriculumSource, MasterCatalogType } from '../../../types/curriculum';

const SOURCE_TYPES = [
  'GOVERNMENT_CURRICULUM',
  'SCHOOL_SCHEME_OF_WORK',
  'INTERNATIONAL_FRAMEWORK',
  'TEXTBOOK',
  'TEACHER_MATERIAL',
  'WEBSITE',
  'INTERNAL_NOBLETECH_CONTENT',
  'UPLOADED_DOCUMENT',
  'OTHER',
] as const;

const CATALOG_TYPES: MasterCatalogType[] = ['concept', 'learning_outcome', 'resource', 'project', 'unit'];

type SourceDraftState = {
  title: string;
  sourceType: (typeof SOURCE_TYPES)[number];
  sourceFormat: 'PDF' | 'DOCX' | 'XLSX' | 'CSV' | 'HTML' | 'URL' | 'TEXT' | 'IMAGE' | 'OTHER';
  usageRights: string;
  isGlobal: boolean;
};

const formatApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Request failed.';
};

export const CurriculumSourceAdminPage = () => {
  const { session, can } = useAuth();
  const { pushNotification } = useNotification();

  const [sources, setSources] = useState<CurriculumSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [catalogType, setCatalogType] = useState<MasterCatalogType>('concept');
  const [catalogEntries, setCatalogEntries] = useState<Array<Record<string, unknown>>>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [createDraft, setCreateDraft] = useState<SourceDraftState>({
    title: '',
    sourceType: 'SCHOOL_SCHEME_OF_WORK',
    sourceFormat: 'PDF',
    usageRights: 'Internal educational use',
    isGlobal: false,
  });

  const [sourceFilters, setSourceFilters] = useState<{
    q: string;
    reviewStatus: '' | 'DRAFT' | 'PENDING_REVIEW' | 'REVISION_REQUIRED' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
    sourceType: '' | (typeof SOURCE_TYPES)[number];
    ownership: 'all' | 'school' | 'global';
  }>({
    q: '',
    reviewStatus: '',
    sourceType: '',
    ownership: 'all',
  });

  const loadSources = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await curriculumClient.listSources(session, {
        q: sourceFilters.q.trim() || undefined,
        reviewStatus: sourceFilters.reviewStatus || undefined,
        sourceType: sourceFilters.sourceType || undefined,
        ownership: sourceFilters.ownership,
      });
      setSources(result);
    } catch (caught) {
      setError(formatApiError(caught));
    } finally {
      setLoading(false);
    }
  };

  const loadCatalog = async (type: MasterCatalogType): Promise<void> => {
    setCatalogLoading(true);

    try {
      const entries = await curriculumClient.listMasterCatalog(session, type);
      setCatalogEntries(entries);
    } catch (caught) {
      pushNotification({
        title: 'Catalog load failed',
        message: formatApiError(caught),
        tone: 'danger',
      });
      setCatalogEntries([]);
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    void loadSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFilters]);

  useEffect(() => {
    void loadCatalog(catalogType);
    // catalogType is loaded by explicit user action through select handler.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedSources = useMemo(() => {
    return [...sources].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [sources]);

  const handleCreateSource = async (): Promise<void> => {
    if (!createDraft.title.trim()) {
      pushNotification({
        title: 'Validation error',
        message: 'Source title is required.',
        tone: 'warning',
      });
      return;
    }

    try {
      await curriculumClient.createSource(session, {
        title: createDraft.title.trim(),
        sourceType: createDraft.sourceType,
        sourceFormat: createDraft.sourceFormat,
        usageRights: createDraft.usageRights,
        isGlobal: createDraft.isGlobal,
      });

      pushNotification({
        title: 'Source created',
        message: 'Curriculum source draft was created.',
        tone: 'success',
      });

      setCreateDraft((previous) => ({ ...previous, title: '' }));
      await loadSources();
    } catch (caught) {
      const apiError = caught as ApiClientError;
      pushNotification({
        title: 'Creation failed',
        message: apiError.message,
        tone: 'danger',
      });
    }
  };

  const handleSubmitReview = async (source: CurriculumSource): Promise<void> => {
    try {
      await curriculumClient.submitSourceReview(session, source.id, 'Submitted from source administration page.');
      pushNotification({
        title: 'Review submitted',
        message: `${source.title} moved to pending review.`,
        tone: 'success',
      });
      await loadSources();
    } catch (caught) {
      pushNotification({
        title: 'Action failed',
        message: formatApiError(caught),
        tone: 'danger',
      });
    }
  };

  const handleApprove = async (source: CurriculumSource): Promise<void> => {
    try {
      await curriculumClient.approveSource(session, source.id, 'Approved from source administration page.');
      pushNotification({
        title: 'Source approved',
        message: `${source.title} is approved.`,
        tone: 'success',
      });
      await loadSources();
    } catch (caught) {
      pushNotification({
        title: 'Action failed',
        message: formatApiError(caught),
        tone: 'danger',
      });
    }
  };

  const handleRequestRevision = async (source: CurriculumSource): Promise<void> => {
    const requestedChanges = window.prompt('Enter requested changes for revision:');
    if (!requestedChanges?.trim()) {
      return;
    }

    try {
      await curriculumClient.requestSourceRevision(session, source.id, {
        requestedChanges: requestedChanges.trim(),
        comment: 'Revision requested from source administration page.',
        lastKnownUpdatedAt: source.updatedAt,
      });
      pushNotification({
        title: 'Revision requested',
        message: `${source.title} was moved to revision required.`,
        tone: 'success',
      });
      await loadSources();
    } catch (caught) {
      pushNotification({
        title: 'Action failed',
        message: formatApiError(caught),
        tone: 'danger',
      });
    }
  };

  const handleReject = async (source: CurriculumSource): Promise<void> => {
    const rejectionReason = window.prompt('Enter rejection reason:');
    if (!rejectionReason?.trim()) {
      return;
    }

    try {
      await curriculumClient.rejectSource(session, source.id, {
        rejectionReason: rejectionReason.trim(),
        comment: 'Rejected from source administration page.',
        lastKnownUpdatedAt: source.updatedAt,
      });
      pushNotification({
        title: 'Source rejected',
        message: `${source.title} was rejected for revision.`,
        tone: 'warning',
      });
      await loadSources();
    } catch (caught) {
      pushNotification({
        title: 'Action failed',
        message: formatApiError(caught),
        tone: 'danger',
      });
    }
  };

  const handleArchive = async (source: CurriculumSource): Promise<void> => {
    const reason = window.prompt('Enter archive reason:');
    if (!reason?.trim()) {
      return;
    }

    try {
      await curriculumClient.archiveSource(session, source.id, reason.trim());
      pushNotification({
        title: 'Source archived',
        message: `${source.title} was archived.`,
        tone: 'success',
      });
      await loadSources();
    } catch (caught) {
      pushNotification({
        title: 'Action failed',
        message: formatApiError(caught),
        tone: 'danger',
      });
    }
  };

  const handleDeleteFirstContent = async (source: CurriculumSource): Promise<void> => {
    const firstContent = source.sourceContents[0];
    if (!firstContent) {
      pushNotification({
        title: 'No source content',
        message: 'This source has no content records to delete.',
        tone: 'warning',
      });
      return;
    }

    try {
      await curriculumClient.deleteSourceContent(session, firstContent.id, firstContent.updatedAt);
      pushNotification({
        title: 'Content deleted',
        message: `Removed content #${firstContent.sequenceOrder} from ${source.title}.`,
        tone: 'success',
      });
      await loadSources();
    } catch (caught) {
      pushNotification({
        title: 'Delete failed',
        message: formatApiError(caught),
        tone: 'danger',
      });
    }
  };

  return (
    <section>
      <header className="page-header">
        <p className="eyebrow">Phase 2K</p>
        <h2>Curriculum source and master-content administration</h2>
        <p>
          Manage curriculum source intake, review lifecycle, and source-to-master lineage links. AI extraction and generation remain
          deferred in this milestone.
        </p>
      </header>

      <PermissionGate permission="curriculum.view">
        <div className="card form-grid">
          <h3>Create source draft</h3>
          <label>
            Source title
            <input
              value={createDraft.title}
              onChange={(event) => setCreateDraft((previous) => ({ ...previous, title: event.target.value }))}
              placeholder="Primary 4 Integrated Robotics Scheme"
            />
          </label>
          <label>
            Source type
            <select
              value={createDraft.sourceType}
              onChange={(event) =>
                setCreateDraft((previous) => ({ ...previous, sourceType: event.target.value as (typeof SOURCE_TYPES)[number] }))
              }
            >
              {SOURCE_TYPES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Source format
            <select
              value={createDraft.sourceFormat}
              onChange={(event) =>
                setCreateDraft((previous) => ({ ...previous, sourceFormat: event.target.value as 'PDF' | 'DOCX' | 'XLSX' | 'CSV' | 'HTML' | 'URL' | 'TEXT' | 'IMAGE' | 'OTHER' }))
              }
            >
              <option value="PDF">PDF</option>
              <option value="DOCX">DOCX</option>
              <option value="URL">URL</option>
              <option value="TEXT">TEXT</option>
              <option value="OTHER">OTHER</option>
            </select>
          </label>
          <label>
            Usage rights
            <input
              value={createDraft.usageRights}
              onChange={(event) => setCreateDraft((previous) => ({ ...previous, usageRights: event.target.value }))}
            />
          </label>
          <label>
            Create as global source
            <input
              type="checkbox"
              checked={createDraft.isGlobal}
              onChange={(event) => setCreateDraft((previous) => ({ ...previous, isGlobal: event.target.checked }))}
              disabled={!can('curriculum.approve')}
            />
          </label>
          <div className="form-actions">
            <button type="button" onClick={() => void handleCreateSource()} disabled={!can('curriculum.edit')}>
              Create source
            </button>
          </div>
        </div>

        <div className="card form-grid">
          <h3>Master content catalog</h3>
          <label>
            Catalog type
            <select
              value={catalogType}
              onChange={(event) => {
                const next = event.target.value as MasterCatalogType;
                setCatalogType(next);
                void loadCatalog(next);
              }}
            >
              {CATALOG_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          {catalogLoading ? (
            <LoadingState label="Loading master content catalog..." />
          ) : (
            <p className="muted">Loaded {catalogEntries.length} records for {catalogType}.</p>
          )}
        </div>

        <div className="card">
          <h3>Source register</h3>
          <div className="form-grid">
            <div className="grid-two">
              <label>
                Search
                <input
                  value={sourceFilters.q}
                  onChange={(event) => setSourceFilters((previous) => ({ ...previous, q: event.target.value }))}
                  placeholder="Search title, code, or description"
                />
              </label>
              <label>
                Review status
                <select
                  value={sourceFilters.reviewStatus}
                  onChange={(event) =>
                    setSourceFilters((previous) => ({
                      ...previous,
                      reviewStatus: event.target.value as typeof sourceFilters.reviewStatus,
                    }))
                  }
                >
                  <option value="">All</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                  <option value="REVISION_REQUIRED">REVISION_REQUIRED</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </label>
              <label>
                Source type
                <select
                  value={sourceFilters.sourceType}
                  onChange={(event) =>
                    setSourceFilters((previous) => ({
                      ...previous,
                      sourceType: event.target.value as typeof sourceFilters.sourceType,
                    }))
                  }
                >
                  <option value="">All</option>
                  {SOURCE_TYPES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Ownership
                <select
                  value={sourceFilters.ownership}
                  onChange={(event) =>
                    setSourceFilters((previous) => ({
                      ...previous,
                      ownership: event.target.value as typeof sourceFilters.ownership,
                    }))
                  }
                >
                  <option value="all">All</option>
                  <option value="school">School</option>
                  <option value="global">Global</option>
                </select>
              </label>
            </div>
          </div>

          {loading ? <LoadingState label="Loading sources..." /> : null}
          {error ? <ErrorState title="Unable to load sources" body={error} onRetry={() => void loadSources()} /> : null}

          {!loading && !error ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Review status</th>
                  <th>Linked master records</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedSources.map((source) => (
                  <tr key={source.id}>
                    <td>
                      <strong>{source.title}</strong>
                      <p className="muted">{source.sourceCode ?? 'No source code'}</p>
                      <p className="muted">Ownership: {source.schoolId ? 'School' : 'Global'}</p>
                    </td>
                    <td>{source.sourceType}</td>
                    <td>{source.reviewStatus}</td>
                    <td>
                      {source.masterContentLinks.length}
                      <p className="muted">Contents: {source.sourceContents.length}</p>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => void handleSubmitReview(source)}
                        disabled={
                          !can('curriculum.submit_review') ||
                          (source.reviewStatus !== 'DRAFT' && source.reviewStatus !== 'REVISION_REQUIRED')
                        }
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleApprove(source)}
                        disabled={!can('curriculum.approve') || source.reviewStatus !== 'PENDING_REVIEW'}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleRequestRevision(source)}
                        disabled={!can('curriculum.request_revision') || source.reviewStatus !== 'PENDING_REVIEW'}
                      >
                        Request revision
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleReject(source)}
                        disabled={!can('curriculum.approve') || source.reviewStatus !== 'PENDING_REVIEW'}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleArchive(source)}
                        disabled={!can('curriculum.archive') || source.reviewStatus === 'ARCHIVED'}
                      >
                        Archive
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteFirstContent(source)}
                        disabled={!can('curriculum.edit') || source.sourceContents.length === 0}
                      >
                        Delete first content
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </PermissionGate>
    </section>
  );
};
