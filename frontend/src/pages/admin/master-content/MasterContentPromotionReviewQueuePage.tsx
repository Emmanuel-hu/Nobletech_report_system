import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import type { MasterContentPromotion } from '../../../types/curriculum';

const toMessage = (error: unknown): string => (error instanceof Error ? error.message : 'Request failed.');

export const MasterContentPromotionReviewQueuePage = () => {
  const { session } = useAuth();

  const [items, setItems] = useState<MasterContentPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await curriculumClient.listMasterContentPromotions(session, { page: 1, pageSize: 100 });
      setItems(data.items);
    } catch (caught) {
      setError(toMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const queue = useMemo(
    () => items.filter((item) => item.status === 'READY_FOR_REVIEW' || item.status === 'UNDER_REVIEW'),
    [items],
  );

  return (
    <PermissionGate permission="master_content.promotion.view">
      <section>
        <header className="page-header">
          <p className="eyebrow">Master-content promotion</p>
          <h2>Promotion review queue</h2>
          <p>Pending promotions awaiting reviewer action.</p>
        </header>

        {loading ? <LoadingState label="Loading review queue..." /> : null}
        {error ? <ErrorState title="Could not load review queue" body={error} onRetry={() => void load()} /> : null}

        {!loading && !error ? (
          <div className="card">
            {queue.length === 0 ? (
              <p className="muted">No promotion requests are currently in review queue.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Promotion</th>
                    <th>Status</th>
                    <th>Requested</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.status}</td>
                      <td>{new Date(item.requestedAt).toLocaleString()}</td>
                      <td>
                        <Link to={`/admin/master-content-promotions/${item.id}/review`}>Review</Link>
                      </td>
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