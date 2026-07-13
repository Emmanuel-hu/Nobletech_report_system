import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { EmptyState, ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { StatusBadge } from '../../../components/feedback/StatusBadge';
import { CurriculumStatusTimeline } from '../../../components/curriculum/CurriculumStatusTimeline';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import { isCurriculumEditable, type CurriculumDetail } from '../../../types/curriculum';

export const CurriculumDetailPage = () => {
  const { curriculumId = '' } = useParams();
  const { session } = useAuth();
  const [record, setRecord] = useState<CurriculumDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(unknownError instanceof Error ? unknownError.message : 'Failed to load curriculum.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [curriculumId, session.userId, session.schoolId]);

  return (
    <PermissionGate permission="curriculum.view">
      <section>
        <header className="page-header">
          <h2>Curriculum detail</h2>
          <p>Inspect structure, versioning context, review traceability, and assignment readiness.</p>
        </header>

        {isLoading ? <LoadingState label="Loading curriculum detail..." /> : null}
        {error ? <ErrorState title="Unable to load curriculum" body={error} onRetry={() => void load()} /> : null}

        {!isLoading && !error && !record ? (
          <EmptyState title="No curriculum selected" body="Select a curriculum from the list to continue." />
        ) : null}

        {!isLoading && !error && record ? (
          <>
            <article className="card">
              <div className="split-header">
                <div>
                  <h3>{record.title}</h3>
                  <p className="muted">{record.code}</p>
                </div>
                <StatusBadge status={record.status} />
              </div>

              <p>{record.description ?? 'No description supplied.'}</p>

              <div className="meta-grid">
                <p>
                  <strong>Current version:</strong> {record.currentVersionNumber ?? 'N/A'}
                </p>
                <p>
                  <strong>Programme component:</strong> {record.schoolProgrammeComponentId}
                </p>
                <p>
                  <strong>Submitted:</strong> {record.submittedAt ? new Date(record.submittedAt).toLocaleString() : 'Not submitted'}
                </p>
                <p>
                  <strong>Published:</strong> {record.publishedAt ? new Date(record.publishedAt).toLocaleString() : 'Not published'}
                </p>
              </div>

              <div className="inline-actions">
                {isCurriculumEditable(record.status) ? (
                  <>
                    <Link to={`/admin/curricula/${record.id}/edit`}>Edit metadata and structure</Link>
                    <Link to={`/admin/curricula/${record.id}/structure`}>Structure editor</Link>
                  </>
                ) : (
                  <p className="muted">This curriculum is immutable in its current lifecycle state.</p>
                )}
                <Link to={`/admin/curricula/${record.id}/review`}>Review actions</Link>
                <Link to={`/admin/curricula/${record.id}/versions`}>Version history</Link>
                <Link to={`/admin/curricula/${record.id}/assignments`}>Assignments</Link>
              </div>
            </article>

            <PermissionGate permission="curriculum.view_audit">
              <article className="card">
                <h3>Status and audit timeline</h3>
                <CurriculumStatusTimeline history={record.statusHistory} />
              </article>
            </PermissionGate>
          </>
        ) : null}
      </section>
    </PermissionGate>
  );
};
