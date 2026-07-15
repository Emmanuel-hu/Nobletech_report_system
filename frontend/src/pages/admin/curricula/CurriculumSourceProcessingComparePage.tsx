import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import type { CurriculumSourceProcessingSession, CurriculumSourceRevisionComparison } from '../../../types/curriculum';

const toMessage = (error: unknown): string => (error instanceof Error ? error.message : 'Request failed.');

export const CurriculumSourceProcessingComparePage = () => {
  const { session } = useAuth();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [revisions, setRevisions] = useState<CurriculumSourceProcessingSession[]>([]);
  const [comparison, setComparison] = useState<CurriculumSourceRevisionComparison | null>(null);
  const [leftRevisionId, setLeftRevisionId] = useState<string>('');
  const [rightRevisionId, setRightRevisionId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    if (!sessionId) {
      setError('Missing session id.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [revisionData, comparisonData] = await Promise.all([
        curriculumClient.listProcessingRevisions(session, sessionId),
        curriculumClient.compareProcessingRevisions(session, sessionId),
      ]);
      setRevisions(revisionData);
      setComparison(comparisonData);
      setLeftRevisionId(comparisonData.leftRevisionId ?? '');
      setRightRevisionId(comparisonData.rightRevisionId);
    } catch (caught) {
      setError(toMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const runComparison = async (): Promise<void> => {
    if (!sessionId) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await curriculumClient.compareProcessingRevisions(
        session,
        sessionId,
        leftRevisionId || undefined,
        rightRevisionId || undefined,
      );
      setComparison(result);
    } catch (caught) {
      setError(toMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionGate permission="curriculum_source.processing.compare_versions">
      <section>
        <header className="page-header">
          <p className="eyebrow">Curriculum source processing</p>
          <h2>Compare manual revisions</h2>
          <p>Review structural differences between manual extraction revisions for the selected source session.</p>
        </header>

        {loading ? <LoadingState label="Loading revision comparison..." /> : null}
        {error ? <ErrorState title="Could not compare revisions" body={error} onRetry={() => void load()} /> : null}

        {!loading && !error ? (
          <>
            <div className="card" style={{ marginBottom: 16 }}>
              <label className="field">
                <span>Left revision</span>
                <select value={leftRevisionId} onChange={(event) => setLeftRevisionId(event.target.value)}>
                  <option value="">Auto (previous revision)</option>
                  {revisions.map((item) => (
                    <option key={item.id} value={item.id}>
                      R{item.revisionNumber} - {item.status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Right revision</span>
                <select value={rightRevisionId} onChange={(event) => setRightRevisionId(event.target.value)}>
                  <option value="">Auto (anchor session)</option>
                  {revisions.map((item) => (
                    <option key={item.id} value={item.id}>
                      R{item.revisionNumber} - {item.status}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="button button-primary" onClick={() => void runComparison()}>
                Compare revisions
              </button>
            </div>

            {comparison ? (
              <div className="card">
                <h3>Comparison result</h3>
                <p>
                  Left: <strong>{comparison.leftRevisionId ?? 'none'}</strong> | Right: <strong>{comparison.rightRevisionId}</strong>
                </p>
                <p>
                  Added: <strong>{comparison.addedSections.length}</strong> | Removed:{' '}
                  <strong>{comparison.removedSections.length}</strong> | Changed: <strong>{comparison.changedSections.length}</strong>
                </p>
              </div>
            ) : null}
          </>
        ) : null}
      </section>
    </PermissionGate>
  );
};
