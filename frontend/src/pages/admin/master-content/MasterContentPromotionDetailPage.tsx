import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import type {
  MasterContentPromotion,
  MasterContentPromotionAction,
  MasterContentPromotionDuplicateDecision,
  MasterContentPromotionItem,
  MasterContentPromotionTargetType,
} from '../../../types/curriculum';

const toMessage = (error: unknown): string => (error instanceof Error ? error.message : 'Request failed.');

const TARGETS: MasterContentPromotionTargetType[] = [
  'CURRICULUM_UNIT',
  'TOPIC',
  'CONCEPT',
  'SKILL',
  'LEARNING_OUTCOME',
  'ACTIVITY',
  'PROJECT',
  'PROJECT_IMPLEMENTATION',
  'RESOURCE',
  'ASSESSMENT_TEMPLATE',
];

const ACTIONS: MasterContentPromotionAction[] = ['CREATE_DRAFT', 'LINK_EXISTING', 'SKIP', 'MARK_DUPLICATE', 'ADAPT'];
const DECISIONS: MasterContentPromotionDuplicateDecision[] = ['CREATE_NEW', 'LINK_EXISTING', 'REVISE_MAPPING', 'SKIP', 'MARK_DUPLICATE'];

export const MasterContentPromotionDetailPage = () => {
  const { session } = useAuth();
  const { pushNotification } = useNotification();
  const { promotionId } = useParams<{ promotionId: string }>();

  const [promotion, setPromotion] = useState<MasterContentPromotion | null>(null);
  const [items, setItems] = useState<MasterContentPromotionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sourceContentId, setSourceContentId] = useState('');
  const [targetType, setTargetType] = useState<MasterContentPromotionTargetType>('CURRICULUM_UNIT');
  const [itemAction, setItemAction] = useState<MasterContentPromotionAction>('CREATE_DRAFT');

  const load = async (): Promise<void> => {
    if (!promotionId) {
      setLoading(false);
      setError('Missing promotion id route parameter.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [promotionData, itemData] = await Promise.all([
        curriculumClient.getMasterContentPromotion(session, promotionId),
        curriculumClient.listMasterContentPromotionItems(session, promotionId),
      ]);
      setPromotion(promotionData);
      setItems(itemData);
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

  const canEdit = useMemo(
    () => promotion?.status === 'DRAFT' || promotion?.status === 'REVISION_REQUIRED',
    [promotion?.status],
  );

  const addItem = async (): Promise<void> => {
    if (!promotion || !promotionId) {
      return;
    }

    if (!sourceContentId.trim()) {
      pushNotification({ title: 'Validation error', message: 'Source content id is required.', tone: 'warning' });
      return;
    }

    try {
      await curriculumClient.addMasterContentPromotionItem(session, promotionId, {
        sourceContentId: sourceContentId.trim(),
        targetMasterContentType: targetType,
        action: itemAction,
      });
      setSourceContentId('');
      pushNotification({ title: 'Item added', message: 'Promotion item added successfully.', tone: 'success' });
      await load();
    } catch (caught) {
      pushNotification({ title: 'Add failed', message: toMessage(caught), tone: 'danger' });
    }
  };

  const submitReview = async (): Promise<void> => {
    if (!promotion || !promotionId) {
      return;
    }

    try {
      await curriculumClient.submitMasterContentPromotionReview(session, promotionId, {
        comment: 'Submitted for review',
        lastKnownUpdatedAt: promotion.updatedAt,
      });
      pushNotification({ title: 'Submitted', message: 'Promotion submitted for review.', tone: 'success' });
      await load();
    } catch (caught) {
      pushNotification({ title: 'Submit failed', message: toMessage(caught), tone: 'danger' });
    }
  };

  const createDraft = async (item: MasterContentPromotionItem): Promise<void> => {
    if (!promotionId) {
      return;
    }

    try {
      await curriculumClient.createMasterContentPromotionItemDraft(session, promotionId, item.id, {
        lastKnownUpdatedAt: item.updatedAt,
      });
      pushNotification({ title: 'Draft created', message: 'Master-content draft created from promotion item.', tone: 'success' });
      await load();
    } catch (caught) {
      pushNotification({ title: 'Create draft failed', message: toMessage(caught), tone: 'danger' });
    }
  };

  const checkDuplicates = async (item: MasterContentPromotionItem): Promise<void> => {
    if (!promotionId) {
      return;
    }

    try {
      await curriculumClient.checkMasterContentPromotionItemDuplicates(session, promotionId, item.id);
      pushNotification({ title: 'Duplicate check complete', message: 'Deterministic duplicate check completed.', tone: 'success' });
      await load();
    } catch (caught) {
      pushNotification({ title: 'Duplicate check failed', message: toMessage(caught), tone: 'danger' });
    }
  };

  return (
    <PermissionGate permission="master_content.promotion.view">
      <section>
        <header className="page-header">
          <p className="eyebrow">Master-content promotion</p>
          <h2>Promotion detail</h2>
          <p>Map approved source records to master-content drafts while preserving lineage.</p>
        </header>

        {loading ? <LoadingState label="Loading promotion..." /> : null}
        {error ? <ErrorState title="Could not load promotion" body={error} onRetry={() => void load()} /> : null}

        {!loading && !error && promotion ? (
          <>
            <div className="card" style={{ marginBottom: 16 }}>
              <p>
                Promotion <strong>{promotion.id}</strong>
              </p>
              <p>
                Status: <strong>{promotion.status}</strong>
              </p>
              <p className="muted">Processing session: {promotion.processingSessionId}</p>
              <p className="muted">Source checksum: {promotion.sourceChecksum}</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="button button-primary" onClick={() => void submitReview()} disabled={!canEdit}>
                  Submit review
                </button>
                <Link className="button button-secondary" to={`/admin/master-content-promotions/${promotion.id}/review`}>
                  Review
                </Link>
                <Link className="button button-secondary" to={`/admin/master-content-promotions/${promotion.id}/compare`}>
                  Compare
                </Link>
              </div>
            </div>

            {canEdit ? (
              <div className="card" style={{ marginBottom: 16 }}>
                <h3>Add promotion item</h3>
                <label className="field">
                  <span>Source content id</span>
                  <input value={sourceContentId} onChange={(event) => setSourceContentId(event.target.value)} />
                </label>
                <label className="field">
                  <span>Target type</span>
                  <select value={targetType} onChange={(event) => setTargetType(event.target.value as MasterContentPromotionTargetType)}>
                    {TARGETS.map((target) => (
                      <option key={target} value={target}>
                        {target}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Action</span>
                  <select value={itemAction} onChange={(event) => setItemAction(event.target.value as MasterContentPromotionAction)}>
                    {ACTIONS.map((action) => (
                      <option key={action} value={action}>
                        {action}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" className="button button-primary" onClick={() => void addItem()}>
                  Add item
                </button>
              </div>
            ) : null}

            <div className="card">
              <h3>Promotion items</h3>
              {items.length === 0 ? (
                <p className="muted">No items in this promotion yet.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Source content</th>
                      <th>Target type</th>
                      <th>Action</th>
                      <th>Status</th>
                      <th>Duplicate decision</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.sequenceOrder}</td>
                        <td>{item.sourceContentId}</td>
                        <td>{item.targetMasterContentType}</td>
                        <td>{item.action}</td>
                        <td>{item.status}</td>
                        <td>{item.duplicateDecision ?? '-'}</td>
                        <td style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            className="button button-secondary"
                            onClick={() => void createDraft(item)}
                            disabled={!canEdit}
                          >
                            Create draft
                          </button>
                          <button
                            type="button"
                            className="button button-secondary"
                            onClick={() => void checkDuplicates(item)}
                          >
                            Check duplicates
                          </button>
                          <select
                            value={item.duplicateDecision ?? 'CREATE_NEW'}
                            onChange={(event) => {
                              void curriculumClient
                                .updateMasterContentPromotionItem(session, promotion.id, item.id, {
                                  duplicateDecision: event.target.value as MasterContentPromotionDuplicateDecision,
                                  lastKnownUpdatedAt: item.updatedAt,
                                })
                                .then(() => load())
                                .catch((caught) => {
                                  pushNotification({
                                    title: 'Update failed',
                                    message: toMessage(caught),
                                    tone: 'danger',
                                  });
                                });
                            }}
                            disabled={!canEdit}
                          >
                            {DECISIONS.map((decision) => (
                              <option key={decision} value={decision}>
                                {decision}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : null}
      </section>
    </PermissionGate>
  );
};