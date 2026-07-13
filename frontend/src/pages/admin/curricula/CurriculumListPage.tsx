import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { StatusBadge } from '../../../components/feedback/StatusBadge';
import { useAuth } from '../../../context/AuthContext';
import { isCurriculumEditable, type CurriculumListFilters, type CurriculumSummary } from '../../../types/curriculum';

const defaultFilters: CurriculumListFilters = {
  includeArchived: false,
};

export const CurriculumListPage = () => {
  const { session, can } = useAuth();
  const [filters, setFilters] = useState<CurriculumListFilters>(defaultFilters);
  const [items, setItems] = useState<CurriculumSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await curriculumClient.listCurricula(session, filters);
      setItems(data);
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Failed to fetch curricula.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchItems();
  }, [session.userId, session.schoolId, filters.status, filters.includeArchived]);

  const subtitle = useMemo(() => {
    if (items.length === 0) {
      return 'No curriculum records match the selected filters yet.';
    }

    return `${items.length} curriculum record${items.length > 1 ? 's' : ''} found.`;
  }, [items.length]);

  return (
    <section>
      <header className="page-header">
        <h2>Curriculum list</h2>
        <p>{subtitle}</p>
      </header>

      <div className="card filter-row">
        <label>
          Status
          <select
            value={filters.status ?? ''}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: event.target.value ? (event.target.value as CurriculumSummary['status']) : undefined,
              }))
            }
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="UNDER_REVIEW">Under review</option>
            <option value="REVISION_REQUIRED">Revision required</option>
            <option value="APPROVED">Approved</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </label>

        <label className="checkbox-inline">
          <input
            type="checkbox"
            checked={Boolean(filters.includeArchived)}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                includeArchived: event.target.checked,
              }))
            }
          />
          Include archived
        </label>

        <button type="button" onClick={() => void fetchItems()}>
          Refresh
        </button>
      </div>

      {isLoading ? <LoadingState label="Loading curriculum records..." /> : null}

      {error ? <ErrorState title="Unable to load curricula" body={error} onRetry={() => void fetchItems()} /> : null}

      {!isLoading && !error ? (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Code</th>
                <th>Status</th>
                <th>Version</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.code}</td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>{item.currentVersionNumber ?? 'N/A'}</td>
                  <td>{new Date(item.updatedAt).toLocaleString()}</td>
                  <td>
                    <Link to={`/admin/curricula/${item.id}`}>Open</Link>
                    {can('curriculum.edit') && isCurriculumEditable(item.status) ? (
                      <Link to={`/admin/curricula/${item.id}/edit`}>Edit</Link>
                    ) : null}
                    {can('curriculum.compare_versions') ? <Link to={`/admin/curricula/${item.id}/versions`}>Versions</Link> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
};
