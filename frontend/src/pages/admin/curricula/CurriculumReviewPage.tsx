import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { StatusBadge } from '../../../components/feedback/StatusBadge';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import type { CurriculumDetail, CurriculumStatus } from '../../../types/curriculum';

const canSubmitForReview = (status: CurriculumStatus): boolean =>
  status === 'DRAFT' || status === 'REVISION_REQUIRED';

const canRequestRevision = (status: CurriculumStatus): boolean => status === 'UNDER_REVIEW';

const canApprove = (status: CurriculumStatus): boolean => status === 'UNDER_REVIEW';

const canPublish = (status: CurriculumStatus): boolean => status === 'APPROVED';

export const CurriculumReviewPage = () => {
  const { curriculumId = '' } = useParams();
  const { session, can } = useAuth();
  const { pushNotification } = useNotification();

  const [record, setRecord] = useState<CurriculumDetail | null>(null);
  const [comment, setComment] = useState('');
  const [requestedChanges, setRequestedChanges] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    if (!curriculumId) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await curriculumClient.getCurriculum(session, curriculumId);
      setRecord(data);
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Failed to load review workspace.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [curriculumId, session.userId, session.schoolId]);

  const runAction = async (action: 'submit' | 'request-revision' | 'approve' | 'publish') => {
    if (!record) {
      return;
    }

    try {
      const updated =
        action === 'submit'
          ? await curriculumClient.submitReview(session, record.id, comment)
          : action === 'request-revision'
            ? await curriculumClient.requestRevision(session, record.id, requestedChanges || 'Please refine content sequencing.', comment)
            : action === 'approve'
              ? await curriculumClient.approve(session, record.id, comment)
              : await curriculumClient.publish(session, record.id, record.currentVersionId ?? undefined, comment);

      setRecord(updated);
      pushNotification({
        title: 'Review action completed',
        message: `Curriculum is now in ${updated.status}.`,
        tone: 'success',
      });
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Review action failed.');
    }
  };

  return (
    <PermissionGate permission="curriculum.view">
      <section>
        <header className="page-header">
          <h2>Review and publication actions</h2>
          <p>Clear separation of submit, revision, approve, and publish actions.</p>
        </header>

        {isLoading ? <LoadingState label="Loading review state..." /> : null}
        {error ? <ErrorState title="Review workflow failed" body={error} onRetry={() => void load()} /> : null}

        {record ? (
          <article className="card form-grid">
            <div className="split-header">
              <div>
                <h3>{record.title}</h3>
                <p className="muted">Current lifecycle status</p>
              </div>
              <StatusBadge status={record.status} />
            </div>

            <label>
              Action comment
              <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} />
            </label>

            <label>
              Requested changes (for revision requests)
              <textarea value={requestedChanges} onChange={(event) => setRequestedChanges(event.target.value)} rows={4} />
            </label>

            <div className="form-actions">
              {can('curriculum.submit_review') && canSubmitForReview(record.status) ? (
                <button type="button" onClick={() => void runAction('submit')}>
                  Submit for review
                </button>
              ) : null}
              {can('curriculum.request_revision') && canRequestRevision(record.status) ? (
                <button type="button" onClick={() => void runAction('request-revision')}>
                  Request revision
                </button>
              ) : null}
              {can('curriculum.approve') && canApprove(record.status) ? (
                <button type="button" onClick={() => void runAction('approve')}>
                  Approve
                </button>
              ) : null}
              {can('curriculum.publish') && canPublish(record.status) ? (
                <button type="button" onClick={() => void runAction('publish')} disabled={!record.currentVersionId}>
                  Publish approved version
                </button>
              ) : null}
            </div>

            {record.status === 'PUBLISHED' ? (
              <p className="muted">This curriculum is published and immutable. Use version history for traceability.</p>
            ) : null}
          </article>
        ) : null}
      </section>
    </PermissionGate>
  );
};
