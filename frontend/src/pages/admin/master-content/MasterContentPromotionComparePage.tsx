import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import type { MasterContentPromotionCompareResult } from '../../../types/curriculum';

const toMessage = (error: unknown): string => (error instanceof Error ? error.message : 'Request failed.');

export const MasterContentPromotionComparePage = () => {
  const { session } = useAuth();
  const { promotionId } = useParams<{ promotionId: string }>();

  const [data, setData] = useState<MasterContentPromotionCompareResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    if (!promotionId) {
      setLoading(false);
      setError('Missing promotion id route parameter.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const compare = await curriculumClient.getMasterContentPromotionCompare(session, promotionId);
      setData(compare);
    } catch (caught) {
      setError(toMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promotionId]);

  return (
    <PermissionGate permission="master_content.promotion.view">
      <section>
        <header className="page-header">
          <p className="eyebrow">Master-content promotion</p>
          <h2>Promotion comparison</h2>
          <p>Compare selected mapped items and resulting linked targets.</p>
        </header>

        {loading ? <LoadingState label="Loading comparison..." /> : null}
        {error ? <ErrorState title="Could not load comparison" body={error} onRetry={() => void load()} /> : null}

        {!loading && !error && data ? (
          <div className="card">
            <p>
              Promotion <strong>{data.promotion.id}</strong> status: <strong>{data.promotion.status}</strong>
            </p>
            <p className="muted">Source revision: {data.promotion.sourceRevisionNumber}</p>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Target type</th>
                  <th>Action</th>
                  <th>Linked master id</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {data.itemSummary.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.targetMasterContentType}</td>
                    <td>{item.action}</td>
                    <td>{item.linkedMasterId ?? '-'}</td>
                    <td>{item.duplicateDecision ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </PermissionGate>
  );
};