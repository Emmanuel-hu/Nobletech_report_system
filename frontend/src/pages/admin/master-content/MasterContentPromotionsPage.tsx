import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import type { MasterContentPromotion } from '../../../types/curriculum';

const toMessage = (error: unknown): string => (error instanceof Error ? error.message : 'Request failed.');

export const MasterContentPromotionsPage = () => {
  const { session } = useAuth();
  const [items, setItems] = useState<MasterContentPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await curriculumClient.listMasterContentPromotions(session, { page: 1, pageSize: 50 });
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

  return (
    <PermissionGate permission="master_content.promotion.view">
      <section>
        <header className="page-header">
          <p className="eyebrow">Master-content promotion</p>
          <h2>Promotion workspace</h2>
          <p>Promote approved Phase 2M structured records into editable master-content drafts.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link className="button button-primary" to="/admin/master-content-promotions/new">
              New promotion
            </Link>
            <Link className="button button-secondary" to="/admin/master-content-promotions/review-queue">
              Review queue
            </Link>
          </div>
        </header>

        {loading ? <LoadingState label="Loading promotions..." /> : null}
        {error ? <ErrorState title="Could not load promotions" body={error} onRetry={() => void load()} /> : null}

        {!loading && !error ? (
          <div className="card">
            <h3>Promotion requests</h3>
            {items.length === 0 ? (
              <p className="muted">No promotions created yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Promotion</th>
                    <th>Status</th>
                    <th>Session</th>
                    <th>Source revision</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.status}</td>
                      <td>{item.processingSessionId}</td>
                      <td>{item.sourceRevisionNumber}</td>
                      <td style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/admin/master-content-promotions/${item.id}`}>Open</Link>
                        <Link to={`/admin/master-content-promotions/${item.id}/review`}>Review</Link>
                        <Link to={`/admin/master-content-promotions/${item.id}/compare`}>Compare</Link>
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