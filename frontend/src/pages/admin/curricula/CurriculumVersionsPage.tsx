import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { VersionComparisonView } from '../../../components/curriculum/VersionComparisonView';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import type { CurriculumVersion } from '../../../types/curriculum';

type ComparisonPayload = {
  left: Record<string, unknown>;
  right: Record<string, unknown>;
  metadata: Record<string, unknown>;
};

export const CurriculumVersionsPage = () => {
  const { curriculumId = '' } = useParams();
  const { session } = useAuth();

  const [versions, setVersions] = useState<CurriculumVersion[]>([]);
  const [leftVersionId, setLeftVersionId] = useState('');
  const [rightVersionId, setRightVersionId] = useState('');
  const [comparison, setComparison] = useState<ComparisonPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
                <th>Status</th>
                <th>Current</th>
                <th>Published</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((version) => (
                <tr key={version.id}>
                  <td>{version.versionNumber}</td>
                  <td>{version.status}</td>
                  <td>{version.isCurrent ? 'Yes' : 'No'}</td>
                  <td>{version.isPublished ? 'Yes' : 'No'}</td>
                  <td>{new Date(version.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
      </section>
    </PermissionGate>
  );
};
