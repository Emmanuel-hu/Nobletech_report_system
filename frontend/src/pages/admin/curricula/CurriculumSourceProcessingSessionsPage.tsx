import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import type { CurriculumSource, CurriculumSourceProcessingSession } from '../../../types/curriculum';

const toMessage = (error: unknown): string => (error instanceof Error ? error.message : 'Request failed.');

export const CurriculumSourceProcessingSessionsPage = () => {
  const { session } = useAuth();
  const { sourceId } = useParams<{ sourceId: string }>();

  const [source, setSource] = useState<CurriculumSource | null>(null);
  const [sessions, setSessions] = useState<CurriculumSourceProcessingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    if (!sourceId) {
      setError('Missing source id.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [sourceData, sessionData] = await Promise.all([
        curriculumClient.getSource(session, sourceId),
        curriculumClient.listProcessingSessions(session, sourceId),
      ]);
      setSource(sourceData);
      setSessions(sessionData);
    } catch (caught) {
      setError(toMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceId]);

  const ordered = useMemo(
    () => [...sessions].sort((a, b) => b.revisionNumber - a.revisionNumber || b.createdAt.localeCompare(a.createdAt)),
    [sessions],
  );

  return (
    <PermissionGate permission="curriculum_source.processing.view">
      <section>
        <header className="page-header">
          <p className="eyebrow">Curriculum source processing</p>
          <h2>Manual extraction sessions</h2>
          <p>Manual processing only. OCR, AI extraction, and automatic generation are intentionally excluded.</p>
        </header>

        {source ? (
          <div className="card" style={{ marginBottom: 16 }}>
            <h3>{source.title}</h3>
            <p className="muted">Source id: {source.id}</p>
            <Link className="button button-primary" to={`/admin/curriculum-sources/${source.id}/processing/new`}>
              Start processing session
            </Link>
          </div>
        ) : null}

        {loading ? <LoadingState label="Loading processing sessions..." /> : null}
        {error ? <ErrorState title="Could not load processing sessions" body={error} onRetry={() => void load()} /> : null}

        {!loading && !error ? (
          <div className="card">
            {ordered.length === 0 ? (
              <p className="muted">No processing sessions have been created for this source yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Revision</th>
                    <th>Status</th>
                    <th>Method</th>
                    <th>Started</th>
                    <th>Sections</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordered.map((item) => (
                    <tr key={item.id}>
                      <td>R{item.revisionNumber}</td>
                      <td>{item.status}</td>
                      <td>{item.processingMethod}</td>
                      <td>{new Date(item.startedAt).toLocaleString()}</td>
                      <td>{item.sections?.length ?? 0}</td>
                      <td style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/admin/curriculum-sources/${item.curriculumSourceId}/processing/${item.id}`}>Workspace</Link>
                        <Link to={`/admin/curriculum-sources/${item.curriculumSourceId}/processing/${item.id}/review`}>Review</Link>
                        <Link to={`/admin/curriculum-sources/${item.curriculumSourceId}/processing/${item.id}/compare`}>Compare</Link>
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
