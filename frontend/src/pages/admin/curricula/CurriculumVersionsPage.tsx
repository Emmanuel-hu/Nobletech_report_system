import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { VersionComparisonView } from '../../../components/curriculum/VersionComparisonView';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import type { CurriculumVersion, CurriculumVersionComparison, CurriculumVersionSnapshot } from '../../../types/curriculum';

export const CurriculumVersionsPage = () => {
  const { curriculumId = '' } = useParams();
  const { session } = useAuth();

  const [versions, setVersions] = useState<CurriculumVersion[]>([]);
  const [leftVersionId, setLeftVersionId] = useState('');
  const [rightVersionId, setRightVersionId] = useState('');
  const [comparison, setComparison] = useState<CurriculumVersionComparison | null>(null);
  const [snapshot, setSnapshot] = useState<CurriculumVersionSnapshot | null>(null);
  const [changeSummary, setChangeSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!curriculumId) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await curriculumClient.getVersions(session, curriculumId);
      setVersions(data);
      if (data.length >= 2) {
        const [first, second] = data;
        if (first && second) {
          setLeftVersionId(first.id);
          setRightVersionId(second.id);
        }
      }
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Failed to load versions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [curriculumId, session.userId, session.schoolId]);

  const compare = async () => {
    if (!curriculumId || !leftVersionId || !rightVersionId) {
      return;
    }

    try {
      const data = await curriculumClient.compareVersions(session, curriculumId, leftVersionId, rightVersionId);
      setComparison(data);
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Version comparison failed.');
    }
  };

  const loadSnapshot = async (versionId: string) => {
    if (!curriculumId) {
      return;
    }

    try {
      const data = await curriculumClient.getVersionSnapshot(session, curriculumId, versionId);
      setSnapshot(data);
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Snapshot fetch failed.');
    }
  };

  const createDraftVersion = async () => {
    if (!curriculumId) {
      return;
    }

    setIsCreatingVersion(true);
    try {
      await curriculumClient.createDraftVersion(session, curriculumId, {
        changeSummary: changeSummary.trim() || undefined,
      });
      setChangeSummary('');
      await load();
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Unable to create draft version.');
    } finally {
      setIsCreatingVersion(false);
    }
  };

  const canCreateDraft = versions.some((version) => version.status === 'APPROVED' || version.status === 'PUBLISHED');

  return (
    <PermissionGate permission="curriculum.compare_versions">
      <section>
        <header className="page-header">
          <h2>Version history and comparison</h2>
          <p>View stored snapshots and compare selected versions.</p>
        </header>

        {isLoading ? <LoadingState label="Loading versions..." /> : null}
        {error ? <ErrorState title="Version operation failed" body={error} onRetry={() => void load()} /> : null}

        <article className="card">
          <h3>Version list</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Label</th>
                <th>Status</th>
                <th>Based on</th>
                <th>Current</th>
                <th>Published</th>
                <th>Created by</th>
                <th>Change summary</th>
                <th>Approval</th>
                <th>Publication</th>
                <th>Snapshot</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((version) => (
                <tr key={version.id}>
                  <td>{version.versionNumber}</td>
                  <td>{version.versionLabel ?? '-'}</td>
                  <td>{version.status}</td>
                  <td>{version.basedOnVersionId ?? '-'}</td>
                  <td>{version.isCurrent ? 'Yes' : 'No'}</td>
                  <td>{version.isPublished ? 'Yes' : 'No'}</td>
                  <td>{version.createdById}</td>
                  <td>{version.changeSummary ?? '-'}</td>
                  <td>{version.approvedAt ? `${version.approvedAt} (${version.approvedById ?? 'N/A'})` : '-'}</td>
                  <td>{version.publishedAt ? `${version.publishedAt} (${version.publishedById ?? 'N/A'})` : '-'}</td>
                  <td>{version.snapshotChecksum ? 'Available' : 'Unavailable'}</td>
                  <td>{new Date(version.createdAt).toLocaleString()}</td>
                  <td>
                    <button type="button" onClick={() => void loadSnapshot(version.id)}>
                      View snapshot
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card form-grid">
          <h3>Create new draft version</h3>
          <p className="muted">Allowed after approved or published lifecycle states.</p>
          <label>
            Change summary
            <textarea
              value={changeSummary}
              onChange={(event) => setChangeSummary(event.target.value)}
              rows={3}
              disabled={!canCreateDraft || isCreatingVersion}
            />
          </label>
          <div className="form-actions">
            <button type="button" onClick={() => void createDraftVersion()} disabled={!canCreateDraft || isCreatingVersion}>
              {isCreatingVersion ? 'Creating...' : 'Create draft version'}
            </button>
          </div>
        </article>

        <article className="card inline-form">
          <label>
            Left version
            <select value={leftVersionId} onChange={(event) => setLeftVersionId(event.target.value)}>
              <option value="">Select version</option>
              {versions.map((version) => (
                <option key={version.id} value={version.id}>
                  {version.versionNumber}
                </option>
              ))}
            </select>
          </label>

          <label>
            Right version
            <select value={rightVersionId} onChange={(event) => setRightVersionId(event.target.value)}>
              <option value="">Select version</option>
              {versions.map((version) => (
                <option key={version.id} value={version.id}>
                  {version.versionNumber}
                </option>
              ))}
            </select>
          </label>

          <button type="button" onClick={() => void compare()}>
            Compare versions
          </button>
        </article>

        {comparison ? <VersionComparisonView left={comparison.left} right={comparison.right} metadata={comparison.metadata} /> : null}

        {snapshot ? (
          <article className="card">
            <h3>Snapshot preview ({snapshot.versionNumber})</h3>
            <pre>{JSON.stringify(snapshot.snapshotData, null, 2)}</pre>
          </article>
        ) : null}
      </section>
    </PermissionGate>
  );
};
