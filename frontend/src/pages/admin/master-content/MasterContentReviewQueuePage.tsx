import { useEffect, useMemo, useState } from 'react';

import { masterContentClient } from '../../../api/masterContentClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import type { MasterReviewQueueItem } from '../../../types/master-content';

const titleForQueueItem = (item: MasterReviewQueueItem): string => {
  if (item.title) {
    return item.title;
  }
  if (item.name) {
    return item.name;
  }
  if (item.statement) {
    return item.statement;
  }
  return item.id;
};

export const MasterContentReviewQueuePage = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<MasterReviewQueueItem[]>([]);

  const load = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await masterContentClient.listReviewQueue(session);
      setItems(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load review queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [items]);

  return (
    <PermissionGate permission="master_content.view">
      <section>
        <header className="page-header">
          <p className="eyebrow">Master-content review</p>
          <h2>Review queue</h2>
          <p>Records currently under review. Review actions remain separate from editing actions.</p>
        </header>

        {loading ? <LoadingState label="Loading review queue..." /> : null}
        {error ? <ErrorState title="Review queue load failed" body={error} onRetry={() => void load()} /> : null}

        {!loading && !error ? (
          <div className="card">
            {sorted.length === 0 ? (
              <p className="muted">No records are currently under review.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Entity type</th>
                    <th>Title</th>
                    <th>Ownership</th>
                    <th>Submitted by</th>
                    <th>Submission date</th>
                    <th>Version</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((item) => (
                    <tr key={item.id}>
                      <td>{item.entityType}</td>
                      <td>{titleForQueueItem(item)}</td>
                      <td>{item.schoolId ? 'School' : 'Global'}</td>
                      <td>{item.createdById ?? '-'}</td>
                      <td>{new Date(item.updatedAt).toLocaleString()}</td>
                      <td>{item.versionNumber ?? '-'}</td>
                      <td>{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : null}
      </section>
    </PermissionGate>
  );
};
