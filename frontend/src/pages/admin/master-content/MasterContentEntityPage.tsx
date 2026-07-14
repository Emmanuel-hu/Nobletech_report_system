import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { masterContentClient } from '../../../api/masterContentClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import type { MasterContentStatus, MasterEntityListResponse, MasterEntityType } from '../../../types/master-content';

const ENTITY_OPTIONS: Array<{ value: MasterEntityType; label: string }> = [
  { value: 'units', label: 'Master Units' },
  { value: 'topics', label: 'Master Topics' },
  { value: 'concepts', label: 'Master Concepts' },
  { value: 'skills', label: 'Master Skills' },
  { value: 'outcomes', label: 'Master Outcomes' },
  { value: 'activities', label: 'Master Activities' },
  { value: 'projects', label: 'Master Projects' },
  { value: 'project-implementations', label: 'Master Project Implementations' },
  { value: 'resources', label: 'Master Resources' },
  { value: 'assessments', label: 'Master Assessment Templates' },
  { value: 'rubrics', label: 'Master Rubrics' },
  { value: 'rubric-criteria', label: 'Rubric Criteria' },
  { value: 'rubric-levels', label: 'Rubric Levels' },
];

const statusOptions: Array<MasterContentStatus> = ['DRAFT', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'APPROVED', 'ARCHIVED'];

const readDisplay = (row: Record<string, unknown>): string => {
  const candidate =
    (typeof row.title === 'string' && row.title) ||
    (typeof row.name === 'string' && row.name) ||
    (typeof row.statement === 'string' && row.statement) ||
    row.id;
  return String(candidate);
};

const lifecycleActions: Array<'submit-review' | 'request-revision' | 'approve' | 'archive'> = [
  'submit-review',
  'request-revision',
  'approve',
  'archive',
];

export const MasterContentEntityPage = () => {
  const { entityType: routeEntityType } = useParams();
  const entityType = (routeEntityType as MasterEntityType | undefined) ?? 'units';
  const { session, can } = useAuth();
  const { pushNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<MasterEntityListResponse | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MasterContentStatus | ''>('');
  const [ownership, setOwnership] = useState<'all' | 'school' | 'global'>('all');
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');

  const entityLabel = useMemo(() => {
    return ENTITY_OPTIONS.find((option) => option.value === entityType)?.label ?? entityType;
  }, [entityType]);

  const load = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await masterContentClient.listEntities(session, entityType, {
        q: query.trim() || undefined,
        status: statusFilter || undefined,
        ownership,
        page,
        pageSize: 20,
      });
      setResult(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load master-content records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, page, ownership]);

  const onCreate = async (): Promise<void> => {
    if (!createTitle.trim()) {
      pushNotification({ title: 'Validation', message: 'Title is required.', tone: 'warning' });
      return;
    }

    try {
      await masterContentClient.createEntity(session, entityType, {
        title: createTitle.trim(),
        description: createDescription.trim(),
      });
      pushNotification({ title: 'Created', message: `${entityLabel} draft created.`, tone: 'success' });
      setCreateTitle('');
      setCreateDescription('');
      await load();
    } catch (caught) {
      pushNotification({
        title: 'Create failed',
        message: caught instanceof Error ? caught.message : 'Could not create record.',
        tone: 'danger',
      });
    }
  };

  const runAction = async (
    id: string,
    updatedAt: string,
    action: 'submit-review' | 'request-revision' | 'approve' | 'archive',
  ): Promise<void> => {
    try {
      await masterContentClient.lifecycleAction(session, entityType, id, action, {
        lastKnownUpdatedAt: updatedAt,
        comment: action === 'approve' ? 'Approved from master-content admin page.' : undefined,
        requestedChanges:
          action === 'request-revision' ? 'Revision requested from review workflow.' : undefined,
        reason: action === 'archive' ? 'Archived from admin workflow.' : undefined,
      });
      pushNotification({ title: 'Lifecycle updated', message: `${entityLabel} action ${action} completed.`, tone: 'success' });
      await load();
    } catch (caught) {
      pushNotification({
        title: 'Lifecycle failed',
        message: caught instanceof Error ? caught.message : 'Could not apply lifecycle action.',
        tone: 'danger',
      });
    }
  };

  return (
    <PermissionGate permission="master_content.view">
      <section>
        <header className="page-header">
          <p className="eyebrow">Master-content administration</p>
          <h2>{entityLabel}</h2>
          <p>Search, filter, create, edit-state transitions, and review actions for reusable master content records.</p>
        </header>

        <div className="card form-grid">
          <h3>Search and filters</h3>
          <label>
            Search
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, name, code" />
          </label>
          <label>
            Status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as MasterContentStatus | '')}>
              <option value="">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            Ownership
            <select value={ownership} onChange={(event) => setOwnership(event.target.value as 'all' | 'school' | 'global')}>
              <option value="all">All</option>
              <option value="school">School only</option>
              <option value="global">Global only</option>
            </select>
          </label>
          <button type="button" onClick={() => void load()}>
            Apply
          </button>
        </div>

        <PermissionGate permission="master_content.create">
          <div className="card form-grid">
            <h3>Create draft</h3>
            <label>
              Title
              <input value={createTitle} onChange={(event) => setCreateTitle(event.target.value)} />
            </label>
            <label>
              Description
              <textarea value={createDescription} onChange={(event) => setCreateDescription(event.target.value)} rows={4} />
            </label>
            <button type="button" onClick={() => void onCreate()}>
              Create draft
            </button>
          </div>
        </PermissionGate>

        {loading ? <LoadingState label="Loading master records..." /> : null}
        {error ? <ErrorState title="Could not load records" body={error} onRetry={() => void load()} /> : null}

        {!loading && !error && result ? (
          <div className="card">
            <h3>Results ({result.total})</h3>
            {result.items.length === 0 ? <p className="muted">No records found for this filter set.</p> : null}
            {result.items.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Title/Name</th>
                    <th>Status</th>
                    <th>Ownership</th>
                    <th>Version</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((row) => {
                    const status = String(row.status ?? 'DRAFT') as MasterContentStatus;
                    const updatedAt = String(row.updatedAt);
                    const id = String(row.id);
                    return (
                      <tr key={id}>
                        <td>{readDisplay(row)}</td>
                        <td>{status}</td>
                        <td>{row.schoolId ? 'School' : 'Global'}</td>
                        <td>{row.versionNumber ?? '-'}</td>
                        <td>
                          <div className="button-row">
                            {can('master_content.submit_review') && status !== 'UNDER_REVIEW' && status !== 'APPROVED' ? (
                              <button type="button" onClick={() => void runAction(id, updatedAt, 'submit-review')}>
                                Submit
                              </button>
                            ) : null}
                            {can('master_content.request_revision') && status === 'UNDER_REVIEW' ? (
                              <button type="button" onClick={() => void runAction(id, updatedAt, 'request-revision')}>
                                Request revision
                              </button>
                            ) : null}
                            {can('master_content.approve') && status === 'UNDER_REVIEW' ? (
                              <button type="button" onClick={() => void runAction(id, updatedAt, 'approve')}>
                                Approve
                              </button>
                            ) : null}
                            {can('master_content.archive') && status !== 'ARCHIVED' ? (
                              <button type="button" onClick={() => void runAction(id, updatedAt, 'archive')}>
                                Archive
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : null}

            <div className="button-row">
              <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                Previous
              </button>
              <span>
                Page {result.page} of {result.totalPages}
              </span>
              <button
                type="button"
                disabled={result.page >= result.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}

        <PermissionGate permission="master_content.manage_mappings">
          <div className="card">
            <h3>Typed mapping administration</h3>
            <p className="muted">
              Use backend-validated mapping APIs for subject/domain/component/topic/concept/skill/outcome/activity/project/resource links.
              Duplicate mapping and cross-tenant mapping are rejected by the backend.
            </p>
          </div>
        </PermissionGate>

        <PermissionGate permission="master_content.manage_lineage">
          <div className="card">
            <h3>Source-lineage administration</h3>
            <p className="muted">
              Link source lineage with source page, section, adaptation note, attribution, and usage restrictions for each master entity.
            </p>
          </div>
        </PermissionGate>
      </section>
    </PermissionGate>
  );
};
