import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import type { CurriculumAssignment, CurriculumVersion } from '../../../types/curriculum';

type AssignmentForm = {
  curriculumVersionId: string;
  academicSessionId: string;
  termId: string;
  academicClassId: string;
  schoolProgrammeComponentId: string;
  teacherUserId: string;
  effectiveFrom: string;
  effectiveTo: string;
};

const initialForm: AssignmentForm = {
  curriculumVersionId: '',
  academicSessionId: '',
  termId: '',
  academicClassId: '',
  schoolProgrammeComponentId: '',
  teacherUserId: '',
  effectiveFrom: '',
  effectiveTo: '',
};

export const CurriculumAssignmentsPage = () => {
  const { curriculumId = '' } = useParams();
  const { session } = useAuth();
  const { pushNotification } = useNotification();

  const [assignments, setAssignments] = useState<CurriculumAssignment[]>([]);
  const [publishedVersions, setPublishedVersions] = useState<CurriculumVersion[]>([]);
  const [form, setForm] = useState<AssignmentForm>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!curriculumId) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [assignmentData, versionData] = await Promise.all([
        curriculumClient.getAssignments(session, curriculumId),
        curriculumClient.getVersions(session, curriculumId),
      ]);
      const published = versionData.filter((version) => version.isPublished);
      setAssignments(assignmentData);
      setPublishedVersions(published);
      setForm((current) => ({
        ...current,
        curriculumVersionId:
          current.curriculumVersionId && published.some((version) => version.id === current.curriculumVersionId)
            ? current.curriculumVersionId
            : published[0]?.id ?? '',
      }));
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Failed to load assignments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [curriculumId, session.userId, session.schoolId]);

  const createAssignment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!curriculumId || !form.curriculumVersionId) {
      return;
    }

    try {
      await curriculumClient.createAssignment(session, curriculumId, {
        curriculumVersionId: form.curriculumVersionId,
        academicSessionId: form.academicSessionId,
        termId: form.termId,
        academicClassId: form.academicClassId,
        schoolProgrammeComponentId: form.schoolProgrammeComponentId,
        teacherUserId: form.teacherUserId || undefined,
        effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo || undefined,
      });

      setForm(initialForm);
      pushNotification({
        title: 'Assignment created',
        message: 'Curriculum assignment saved for deployment timeline.',
        tone: 'success',
      });

      await load();
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Unable to create assignment.');
    }
  };

  const updateStatus = async (assignmentId: string, action: 'activate' | 'complete' | 'suspend' | 'archive') => {
    try {
      await curriculumClient.updateAssignmentStatus(session, assignmentId, action, `Action ${action} initiated from portal.`);
      await load();
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Unable to update assignment status.');
    }
  };

  return (
    <PermissionGate permission="curriculum.assign">
      <section>
        <header className="page-header">
          <h2>Assignments</h2>
          <p>Create and transition curriculum assignments across class delivery contexts.</p>
        </header>

        {isLoading ? <LoadingState label="Loading assignments..." /> : null}
        {error ? <ErrorState title="Assignment operation failed" body={error} onRetry={() => void load()} /> : null}

        <form className="card form-grid" onSubmit={createAssignment}>
          <label>
            Published curriculum version
            <select
              value={form.curriculumVersionId}
              onChange={(event) => setForm((current) => ({ ...current, curriculumVersionId: event.target.value }))}
              required
              disabled={publishedVersions.length === 0}
            >
              <option value="">Select published version</option>
              {publishedVersions.map((version) => (
                <option key={version.id} value={version.id}>
                  {version.versionNumber}
                </option>
              ))}
            </select>
          </label>
          <label>
            Academic session ID
            <input
              value={form.academicSessionId}
              onChange={(event) => setForm((current) => ({ ...current, academicSessionId: event.target.value }))}
              required
            />
          </label>
          <label>
            Term ID
            <input value={form.termId} onChange={(event) => setForm((current) => ({ ...current, termId: event.target.value }))} required />
          </label>
          <label>
            Academic class ID
            <input
              value={form.academicClassId}
              onChange={(event) => setForm((current) => ({ ...current, academicClassId: event.target.value }))}
              required
            />
          </label>
          <label>
            Programme component ID
            <input
              value={form.schoolProgrammeComponentId}
              onChange={(event) => setForm((current) => ({ ...current, schoolProgrammeComponentId: event.target.value }))}
              required
            />
          </label>
          <label>
            Teacher user ID (optional)
            <input
              value={form.teacherUserId}
              onChange={(event) => setForm((current) => ({ ...current, teacherUserId: event.target.value }))}
            />
          </label>
          <label>
            Effective from
            <input
              type="date"
              value={form.effectiveFrom}
              onChange={(event) => setForm((current) => ({ ...current, effectiveFrom: event.target.value }))}
              required
            />
          </label>
          <label>
            Effective to
            <input
              type="date"
              value={form.effectiveTo}
              onChange={(event) => setForm((current) => ({ ...current, effectiveTo: event.target.value }))}
            />
          </label>

          <div className="form-actions">
            <button type="submit" disabled={publishedVersions.length === 0}>Create assignment</button>
          </div>
        </form>

        {publishedVersions.length === 0 ? (
          <p className="muted">Assignments can only be created from published curriculum versions.</p>
        ) : null}

        <article className="card">
          <h3>Assignment queue</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Class</th>
                <th>From</th>
                <th>To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.id}</td>
                  <td>{assignment.status}</td>
                  <td>{assignment.academicClassId}</td>
                  <td>{assignment.effectiveFrom}</td>
                  <td>{assignment.effectiveTo ?? 'Open-ended'}</td>
                  <td>
                    <button type="button" onClick={() => void updateStatus(assignment.id, 'activate')}>
                      Activate
                    </button>
                    <button type="button" onClick={() => void updateStatus(assignment.id, 'suspend')}>
                      Suspend
                    </button>
                    <button type="button" onClick={() => void updateStatus(assignment.id, 'complete')}>
                      Complete
                    </button>
                    <button type="button" onClick={() => void updateStatus(assignment.id, 'archive')}>
                      Archive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </PermissionGate>
  );
};
