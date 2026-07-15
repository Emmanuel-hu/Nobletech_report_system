import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import type { CurriculumSource, CurriculumSourceProcessingSession } from '../../../types/curriculum';

type QueueItem = {
  source: CurriculumSource;
  session: CurriculumSourceProcessingSession;
};

const toMessage = (error: unknown): string => (error instanceof Error ? error.message : 'Request failed.');

export const CurriculumSourceProcessingReviewQueuePage = () => {
  const { session } = useAuth();

  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const sources = await curriculumClient.listSources(session, { ownership: 'all', includeGlobal: true });
      const queue: QueueItem[] = [];

      await Promise.all(
        sources.map(async (source) => {
          const sessions = await curriculumClient.listProcessingSessions(session, source.id);
          sessions
            .filter((item) => item.status === 'PENDING_REVIEW')
            .forEach((item) => {
              queue.push({ source, session: item });
            });
        }),
      );

      setItems(queue);
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

  const ordered = useMemo(
    () => [...items].sort((a, b) => b.session.submittedAt?.localeCompare(a.session.submittedAt ?? '') || 0),
    [items],
  );

  return (
    <PermissionGate permission="curriculum_source.processing.view">
      <section>
        <header className="page-header">
          <p className="eyebrow">Curriculum source processing</p>
          <h2>Manual processing review queue</h2>
          <p>Sessions waiting for review and approval in the manual extraction pipeline.</p>
        </header>

        {loading ? <LoadingState label="Loading processing review queue..." /> : null}
        {error ? <ErrorState title="Could not load review queue" body={error} onRetry={() => void load()} /> : null}

        {!loading && !error ? (
          <div className="card">
            {ordered.length === 0 ? (
              <p className="muted">No manual processing sessions are pending review.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Revision</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordered.map((item) => (
                    <tr key={item.session.id}>
                      <td>{item.source.title}</td>
                      <td>R{item.session.revisionNumber}</td>
                      <td>{item.session.status}</td>
                      <td>{item.session.submittedAt ? new Date(item.session.submittedAt).toLocaleString() : '-'}</td>
                      <td>
                        <Link to={`/admin/curriculum-sources/${item.source.id}/processing/${item.session.id}/review`}>
                          Open review
                        </Link>
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
