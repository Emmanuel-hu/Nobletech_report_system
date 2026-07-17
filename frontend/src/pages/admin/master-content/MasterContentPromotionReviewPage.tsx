import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import type { MasterContentPromotion } from '../../../types/curriculum';

const toMessage = (error: unknown): string => (error instanceof Error ? error.message : 'Request failed.');

export const MasterContentPromotionReviewPage = () => {
  const { session } = useAuth();
  const { pushNotification } = useNotification();
  const { promotionId } = useParams<{ promotionId: string }>();

  const [promotion, setPromotion] = useState<MasterContentPromotion | null>(null);
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
      const data = await curriculumClient.getMasterContentPromotion(session, promotionId);
      setPromotion(data);
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

  const perform = async (
    action: 'request-revision' | 'approve' | 'reject' | 'complete' | 'archive',
    payload: { comment?: string; requestedChanges?: string; reason?: string; lastKnownUpdatedAt: string },
  ): Promise<void> => {
    if (!promotionId) {
      return;
    }

    try {
      if (action === 'request-revision') {
        await curriculumClient.requestMasterContentPromotionRevision(session, promotionId, payload);
      } else if (action === 'approve') {
        await curriculumClient.approveMasterContentPromotion(session, promotionId, payload);
      } else if (action === 'reject') {
        await curriculumClient.rejectMasterContentPromotion(session, promotionId, payload);
      } else if (action === 'complete') {
        await curriculumClient.completeMasterContentPromotion(session, promotionId, payload);
      } else {
        await curriculumClient.archiveMasterContentPromotion(session, promotionId, payload);
      }

      pushNotification({ title: 'Lifecycle updated', message: `Action ${action} completed.`, tone: 'success' });
      await load();
    } catch (caught) {
      pushNotification({ title: 'Action failed', message: toMessage(caught), tone: 'danger' });
    }
  };

  return (
    <PermissionGate permission="master_content.promotion.view">
      <section>
        <header className="page-header">
          <p className="eyebrow">Master-content promotion</p>
          <h2>Promotion review</h2>
          <p>Review and lifecycle actions remain separate from master-content approval lifecycle.</p>
        </header>

        {loading ? <LoadingState label="Loading promotion review..." /> : null}
        {error ? <ErrorState title="Could not load promotion review" body={error} onRetry={() => void load()} /> : null}

        {!loading && !error && promotion ? (
          <div className="card">
            <p>
              Status: <strong>{promotion.status}</strong>
            </p>
            <p className="muted">Requested at: {new Date(promotion.requestedAt).toLocaleString()}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                type="button"
                className="button button-secondary"
                onClick={() =>
                  void perform('request-revision', {
                    requestedChanges: 'Please update mapped fields and duplicate decision notes.',
                    lastKnownUpdatedAt: promotion.updatedAt,
                  })
                }
              >
                Request revision
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={() => void perform('approve', { comment: 'Promotion approved.', lastKnownUpdatedAt: promotion.updatedAt })}
              >
                Approve
              </button>
              <button
                type="button"
                className="button button-danger"
                onClick={() =>
                  void perform('reject', {
                    reason: 'Insufficient mapping quality.',
                    comment: 'Revise mapping and retry.',
                    lastKnownUpdatedAt: promotion.updatedAt,
                  })
                }
              >
                Reject
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => void perform('complete', { comment: 'Promotion completed.', lastKnownUpdatedAt: promotion.updatedAt })}
              >
                Complete
              </button>
              <button
                type="button"
                className="button button-danger"
                onClick={() =>
                  void perform('archive', {
                    reason: 'Closed for record retention.',
                    comment: 'Archived promotion.',
                    lastKnownUpdatedAt: promotion.updatedAt,
                  })
                }
              >
                Archive
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </PermissionGate>
  );
};