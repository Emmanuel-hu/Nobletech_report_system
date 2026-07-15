import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

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
  const [pendingFileBySourceId, setPendingFileBySourceId] = useState<Record<string, File | null>>({});
  const [replacingFileById, setReplacingFileById] = useState<Record<string, File | null>>({});

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

  const handleUploadFile = async (source: CurriculumSource): Promise<void> => {
    const selected = pendingFileBySourceId[source.id];
    if (!selected) {
      pushNotification({ title: 'Select a file', message: 'Choose a file before uploading.', tone: 'warning' });
      return;
    }

    try {
      await curriculumClient.uploadSourceFile(session, source.id, selected, source.updatedAt);
      pushNotification({ title: 'File uploaded', message: `${selected.name} uploaded successfully.`, tone: 'success' });
      setPendingFileBySourceId((previous) => ({ ...previous, [source.id]: null }));
      await loadSources();
    } catch (caught) {
      pushNotification({ title: 'Upload failed', message: formatApiError(caught), tone: 'danger' });
    }
  };

  const handleReplaceFile = async (source: CurriculumSource, fileId: string): Promise<void> => {
    const replacement = replacingFileById[fileId];
    if (!replacement) {
      pushNotification({ title: 'Select replacement file', message: 'Choose a replacement file first.', tone: 'warning' });
      return;
    }

    try {
      await curriculumClient.replaceSourceFile(session, source.id, fileId, replacement, source.updatedAt);
      pushNotification({ title: 'File replaced', message: `${replacement.name} replaced the selected file.`, tone: 'success' });
      setReplacingFileById((previous) => ({ ...previous, [fileId]: null }));
      await loadSources();
    } catch (caught) {
      pushNotification({ title: 'Replace failed', message: formatApiError(caught), tone: 'danger' });
    }
  };

  const handleSetPrimaryFile = async (source: CurriculumSource, fileId: string): Promise<void> => {
    try {
      await curriculumClient.makePrimarySourceFile(session, source.id, fileId, source.updatedAt);
      pushNotification({ title: 'Primary file updated', message: 'Selected file is now primary.', tone: 'success' });
      await loadSources();
    } catch (caught) {
      pushNotification({ title: 'Action failed', message: formatApiError(caught), tone: 'danger' });
    }
  };

  const handleArchiveFile = async (source: CurriculumSource, fileId: string): Promise<void> => {
    const reason = window.prompt('Enter archive reason for this source file:');
    if (!reason?.trim()) {
      return;
    }

    try {
      await curriculumClient.archiveSourceFile(session, source.id, fileId, reason.trim(), source.updatedAt);
      pushNotification({ title: 'File archived', message: 'Source file archived.', tone: 'success' });
      await loadSources();
    } catch (caught) {
      pushNotification({ title: 'Action failed', message: formatApiError(caught), tone: 'danger' });
    }
  };

  const handleDeleteFile = async (source: CurriculumSource, fileId: string): Promise<void> => {
    const reason = window.prompt('Enter deletion reason for this source file:');
    if (!reason?.trim()) {
      return;
    }

    try {
      await curriculumClient.deleteSourceFile(session, source.id, fileId, reason.trim(), source.updatedAt);
      pushNotification({ title: 'File deleted', message: 'Source file was removed.', tone: 'success' });
      await loadSources();
    } catch (caught) {
      pushNotification({ title: 'Action failed', message: formatApiError(caught), tone: 'danger' });
    }
  };

  const handleDownloadOrPreview = async (
    source: CurriculumSource,
    fileId: string,
    mode: 'download' | 'preview',
  ): Promise<void> => {
    try {
      const result = await curriculumClient.downloadSourceFileBlob(session, source.id, fileId, mode);
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.target = mode === 'preview' ? '_blank' : '_self';
      anchor.rel = 'noopener noreferrer';
      anchor.download = result.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (caught) {
      pushNotification({ title: 'File access failed', message: formatApiError(caught), tone: 'danger' });
    }
  };

  const handleMoveFile = async (source: CurriculumSource, index: number, direction: -1 | 1): Promise<void> => {
    const files = [...source.sourceFiles]
      .filter((item) => item.status !== 'DELETED')
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder);

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= files.length) {
      return;
    }

    const current = files[index];
    const replacement = files[targetIndex];
    if (!current || !replacement) {
      return;
    }
    files[index] = replacement;
    files[targetIndex] = current;

    try {
      await curriculumClient.reorderSourceFiles(
        session,
        source.id,
        files.map((file) => file.id),
        source.updatedAt,
      );
      await loadSources();
    } catch (caught) {
      pushNotification({ title: 'Reorder failed', message: formatApiError(caught), tone: 'danger' });
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
                      <p className="muted">Files: {source.sourceFiles.filter((item) => item.status !== 'DELETED').length}</p>
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
                      <div style={{ marginTop: '0.5rem' }}>
                        <Link to={`/admin/curriculum-sources/${source.id}/processing`}>Open manual processing</Link>
                      </div>

                      <div className="stacked-actions" style={{ marginTop: '0.75rem' }}>
                        <input
                          type="file"
                          onChange={(event) =>
                            setPendingFileBySourceId((previous) => ({
                              ...previous,
                              [source.id]: event.target.files?.[0] ?? null,
                            }))
                          }
                          disabled={!can('curriculum.edit')}
                        />
                        <button type="button" onClick={() => void handleUploadFile(source)} disabled={!can('curriculum.edit')}>
                          Upload file
                        </button>
                      </div>

                      <div style={{ marginTop: '0.75rem' }}>
                        {source.sourceFiles
                          .filter((item) => item.status !== 'DELETED')
                          .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                          .map((sourceFile, index) => (
                            <div key={sourceFile.id} className="card" style={{ marginTop: '0.5rem', padding: '0.5rem' }}>
                              <p className="muted">
                                #{sourceFile.sequenceOrder} {sourceFile.originalFileName} ({sourceFile.mimeType})
                              </p>
                              <p className="muted">{sourceFile.isPrimary ? 'Primary' : 'Secondary'} - {sourceFile.status}</p>
                              <button type="button" onClick={() => void handleDownloadOrPreview(source, sourceFile.id, 'download')}>
                                Download
                              </button>
                              <button type="button" onClick={() => void handleDownloadOrPreview(source, sourceFile.id, 'preview')}>
                                Preview
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleSetPrimaryFile(source, sourceFile.id)}
                                disabled={!can('curriculum.edit') || sourceFile.status !== 'ACTIVE'}
                              >
                                Make primary
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleMoveFile(source, index, -1)}
                                disabled={!can('curriculum.reorder') || index === 0}
                              >
                                Move up
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleMoveFile(source, index, 1)}
                                disabled={!can('curriculum.reorder') || index === source.sourceFiles.filter((item) => item.status !== 'DELETED').length - 1}
                              >
                                Move down
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleArchiveFile(source, sourceFile.id)}
                                disabled={!can('curriculum.archive') || sourceFile.status !== 'ACTIVE'}
                              >
                                Archive file
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDeleteFile(source, sourceFile.id)}
                                disabled={!can('curriculum.archive')}
                              >
                                Delete file
                              </button>

                              <div className="stacked-actions" style={{ marginTop: '0.5rem' }}>
                                <input
                                  type="file"
                                  onChange={(event) =>
                                    setReplacingFileById((previous) => ({
                                      ...previous,
                                      [sourceFile.id]: event.target.files?.[0] ?? null,
                                    }))
                                  }
                                  disabled={!can('curriculum.edit')}
                                />
                                <button
                                  type="button"
                                  onClick={() => void handleReplaceFile(source, sourceFile.id)}
                                  disabled={!can('curriculum.edit')}
                                >
                                  Replace file
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
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
