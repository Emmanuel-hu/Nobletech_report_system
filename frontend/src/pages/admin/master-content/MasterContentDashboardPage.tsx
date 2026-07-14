import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { masterContentClient } from '../../../api/masterContentClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import type { MasterDashboardCounts } from '../../../types/master-content';

const ENTITY_LINKS: Array<{ label: string; to: string; key: keyof MasterDashboardCounts['entities'] }> = [
  { label: 'Master Units', to: '/admin/master-content/units', key: 'units' },
  { label: 'Master Topics', to: '/admin/master-content/topics', key: 'topics' },
  { label: 'Master Concepts', to: '/admin/master-content/concepts', key: 'concepts' },
  { label: 'Master Skills', to: '/admin/master-content/skills', key: 'skills' },
  { label: 'Master Outcomes', to: '/admin/master-content/outcomes', key: 'outcomes' },
  { label: 'Master Activities', to: '/admin/master-content/activities', key: 'activities' },
  { label: 'Master Projects', to: '/admin/master-content/projects', key: 'projects' },
  { label: 'Master Resources', to: '/admin/master-content/resources', key: 'resources' },
  { label: 'Assessment Templates', to: '/admin/master-content/assessments', key: 'assessments' },
  { label: 'Master Rubrics', to: '/admin/master-content/rubrics', key: 'rubrics' },
];

export const MasterContentDashboardPage = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<MasterDashboardCounts | null>(null);

  const load = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await masterContentClient.getDashboard(session);
      setMetrics(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PermissionGate permission="master_content.view">
      <section>
        <header className="page-header">
          <p className="eyebrow">Phase 2K.2</p>
          <h2>Master-content administration dashboard</h2>
          <p>Manual administration of reusable master content. AI extraction, OCR, and file upload remain deferred.</p>
        </header>

        {loading ? <LoadingState label="Loading dashboard metrics..." /> : null}
        {error ? <ErrorState title="Dashboard load failed" body={error} onRetry={() => void load()} /> : null}

        {!loading && !error && metrics ? (
          <>
            <div className="card-grid two-up" role="list" aria-label="Lifecycle metrics">
              <article className="card" role="listitem">
                <h3>Draft</h3>
                <p className="metric-value">{metrics.lifecycle.draft}</p>
              </article>
              <article className="card" role="listitem">
                <h3>Under Review</h3>
                <p className="metric-value">{metrics.lifecycle.underReview}</p>
              </article>
              <article className="card" role="listitem">
                <h3>Revision Required</h3>
                <p className="metric-value">{metrics.lifecycle.revisionRequired}</p>
              </article>
              <article className="card" role="listitem">
                <h3>Approved</h3>
                <p className="metric-value">{metrics.lifecycle.approved}</p>
              </article>
              <article className="card" role="listitem">
                <h3>Archived</h3>
                <p className="metric-value">{metrics.lifecycle.archived}</p>
              </article>
            </div>

            <div className="card">
              <h3>Entity administration</h3>
              <div className="card-grid two-up" role="list" aria-label="Master content entities">
                {ENTITY_LINKS.map((item) => (
                  <article className="card" key={item.to} role="listitem">
                    <h4>{item.label}</h4>
                    <p className="metric-value">{metrics.entities[item.key]}</p>
                    <Link className="button-link" to={item.to}>
                      Open
                    </Link>
                  </article>
                ))}
              </div>
            </div>

            <div className="card">
              <h3>Review and moderation</h3>
              <p>Open submitted master-content records and perform approval actions in a review-only flow.</p>
              <Link className="button-link" to="/admin/master-content/review-queue">
                Open review queue
              </Link>
            </div>
          </>
        ) : null}
      </section>
    </PermissionGate>
  );
};
