import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import type { CurriculumSourceProcessingAuditItem, CurriculumSourceProcessingSession } from '../../../types/curriculum';

const toMessage = (error: unknown): string => (error instanceof Error ? error.message : 'Request failed.');

export const CurriculumSourceProcessingReviewPage = () => {
  const { session } = useAuth();
  const { pushNotification } = useNotification();
  const { sourceId, sessionId } = useParams<{ sourceId: string; sessionId: string }>();

  const [processingSession, setProcessingSession] = useState<CurriculumSourceProcessingSession | null>(null);
  const [audit, setAudit] = useState<CurriculumSourceProcessingAuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    if (!sourceId || !sessionId) {
      setError('Missing route parameters.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [sessionData, auditData] = await Promise.all([
        curriculumClient.getProcessingSession(session, sourceId, sessionId),
        curriculumClient.getProcessingAuditHistory(session, sessionId),
      ]);
      setProcessingSession(sessionData);
      setAudit(auditData);
    } catch (caught) {
      setError(toMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceId, sessionId]);

  const performAction = async (action: 'submit' | 'request-revision' | 'approve' | 'reject' | 'complete' | 'archive') => {
    if (!sourceId || !sessionId || !processingSession) {
      return;
    }

    try {
      if (action === 'submit') {
        await curriculumClient.submitProcessingSessionReview(session, sourceId, sessionId, {
          lastKnownUpdatedAt: processingSession.updatedAt,
          comment: 'Submitted from manual review page.',
        });
      }

      if (action === 'request-revision') {
        const requestedChanges = window.prompt('Enter requested changes for this session:');
        if (!requestedChanges?.trim()) {
          return;
        }
        await curriculumClient.requestProcessingSessionRevision(session, sourceId, sessionId, {
          requestedChanges: requestedChanges.trim(),
          lastKnownUpdatedAt: processingSession.updatedAt,
        });
      }

      if (action === 'approve') {
        await curriculumClient.approveProcessingSession(session, sourceId, sessionId, {
          lastKnownUpdatedAt: processingSession.updatedAt,
          comment: 'Approved from manual review page.',
        });
      }

      if (action === 'reject') {
        const rejectionReason = window.prompt('Enter rejection reason for this processing session:');
        if (!rejectionReason?.trim()) {
          return;
        }
        await curriculumClient.rejectProcessingSession(session, sourceId, sessionId, {
          rejectionReason: rejectionReason.trim(),
          lastKnownUpdatedAt: processingSession.updatedAt,
        });
      }

      if (action === 'complete') {
        await curriculumClient.completeProcessingSession(session, sourceId, sessionId, {
          lastKnownUpdatedAt: processingSession.updatedAt,
          comment: 'Completed from manual review page.',
        });
      }

      if (action === 'archive') {
        const reason = window.prompt('Archive reason:');
        if (!reason?.trim()) {
          return;
        }
        await curriculumClient.archiveProcessingSession(session, sourceId, sessionId, {
          reason: reason.trim(),
          lastKnownUpdatedAt: processingSession.updatedAt,
        });
      }

      pushNotification({ title: 'Processing status updated', message: 'Session lifecycle action completed.', tone: 'success' });
      await load();
    } catch (caught) {
      pushNotification({ title: 'Action failed', message: toMessage(caught), tone: 'danger' });
    }
  };

  return (
    <PermissionGate permission="curriculum_source.processing.view">
      <section>
        <header className="page-header">
          <p className="eyebrow">Curriculum source processing</p>
          <h2>Review session</h2>
          <p>Manual processing only. No OCR or AI extraction was used in this workflow.</p>
        </header>

        {loading ? <LoadingState label="Loading review session..." /> : null}
        {error ? <ErrorState title="Could not load review session" body={error} onRetry={() => void load()} /> : null}

        {!loading && !error && processingSession ? (
          <>
            <div className="card" style={{ marginBottom: 16 }}>
              <p>
                Session <strong>R{processingSession.revisionNumber}</strong> status: <strong>{processingSession.status}</strong>
              </p>
              <p className="muted">Notes: {processingSession.notes ?? 'No notes'}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="button button-secondary" onClick={() => void performAction('submit')}>
                  Submit review
                </button>
                <button type="button" className="button button-secondary" onClick={() => void performAction('request-revision')}>
                  Request revision
                </button>
                <button type="button" className="button button-primary" onClick={() => void performAction('approve')}>
                  Approve
                </button>
                <button type="button" className="button button-secondary" onClick={() => void performAction('reject')}>
                  Reject
                </button>
                <button type="button" className="button button-primary" onClick={() => void performAction('complete')}>
                  Complete
                </button>
                <button type="button" className="button button-danger" onClick={() => void performAction('archive')}>
                  Archive
                </button>
                <Link to={`/admin/curriculum-sources/${processingSession.curriculumSourceId}/processing/${processingSession.id}`}>
                  Back to workspace
                </Link>
              </div>
            </div>

            <div className="card">
              <h3>Audit history</h3>
              {audit.length === 0 ? (
                <p className="muted">No audit actions captured yet.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Action</th>
                      <th>Entity</th>
                      <th>Actor</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.map((entry) => (
                      <tr key={entry.id}>
                        <td>{new Date(entry.createdAt).toLocaleString()}</td>
                        <td>{entry.action}</td>
                        <td>{entry.entityType}</td>
                        <td>{entry.actorUserId ?? '-'}</td>
                        <td>{entry.reason ?? '-'}</td>
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
