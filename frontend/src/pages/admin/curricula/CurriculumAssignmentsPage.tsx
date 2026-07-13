import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { EmptyState, ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import type { CurriculumAssignment, CurriculumEditorLookups } from '../../../types/curriculum';

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
  const [lookups, setLookups] = useState<CurriculumEditorLookups | null>(null);
  const [form, setForm] = useState<AssignmentForm>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const load = async () => {
    if (!curriculumId) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [assignmentData, lookupData] = await Promise.all([
        curriculumClient.getAssignments(session, curriculumId),
        curriculumClient.getEditorLookups(session, curriculumId, form.academicSessionId || undefined),
      ]);
      setAssignments(assignmentData);
      setLookups(lookupData);
      setForm((current) => ({
        ...current,
        curriculumVersionId:
          current.curriculumVersionId &&
          lookupData.publishedVersions.some((version) => version.id === current.curriculumVersionId)
            ? current.curriculumVersionId
            : lookupData.publishedVersions[0]?.id ?? '',
        schoolProgrammeComponentId: lookupData.curriculum.schoolProgrammeComponentId,
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

    setFormError(null);
    if (form.effectiveTo && form.effectiveTo < form.effectiveFrom) {
      setFormError('Effective end date cannot be earlier than the start date.');
      return;
    }

    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
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

  const filteredTerms = (lookups?.terms ?? []).filter((term) =>
    form.academicSessionId ? term.academicSessionId === form.academicSessionId : true,
  );

  const canCreateAssignment = Boolean(lookups && lookups.publishedVersions.length > 0);

  return (
    <PermissionGate permission="curriculum.assign">
      <section>
        <header className="page-header">
          <h2>Assignments</h2>
          <p>Create and transition curriculum assignments across class delivery contexts.</p>
        </header>

        {isLoading ? <LoadingState label="Loading assignments..." /> : null}
        {error ? <ErrorState title="Assignment operation failed" body={error} onRetry={() => void load()} /> : null}
        {formError ? <ErrorState title="Assignment validation" body={formError} /> : null}

        {!isLoading && !error && lookups && lookups.publishedVersions.length === 0 ? (
          <EmptyState
            title="No published versions"
            body="Assignments can only be created from published curriculum versions. Publish a version first."
          />
        ) : null}

        <form className="card form-grid" onSubmit={createAssignment}>
          <label>
            Published curriculum version
            <select
              value={form.curriculumVersionId}
              onChange={(event) => setForm((current) => ({ ...current, curriculumVersionId: event.target.value }))}
              required
              disabled={!canCreateAssignment || isSaving}
            >
              <option value="">Select published version</option>
              {(lookups?.publishedVersions ?? []).map((version) => (
                <option key={version.id} value={version.id}>
                  {version.versionLabel ?? version.versionNumber}
                </option>
              ))}
            </select>
          </label>
          <label>
            Academic session
            <select
              value={form.academicSessionId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  academicSessionId: event.target.value,
                  termId: '',
                }))
              }
              required
              disabled={isSaving}
            >
              <option value="">Select academic session</option>
              {(lookups?.sessions ?? []).map((sessionLookup) => (
                <option key={sessionLookup.id} value={sessionLookup.id}>
                  {sessionLookup.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Term
            <select
              value={form.termId}
              onChange={(event) => setForm((current) => ({ ...current, termId: event.target.value }))}
              required
              disabled={isSaving || !form.academicSessionId}
            >
              <option value="">Select term</option>
              {filteredTerms.map((termLookup) => (
                <option key={termLookup.id} value={termLookup.id}>
                  {termLookup.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Academic class
            <select
              value={form.academicClassId}
              onChange={(event) => setForm((current) => ({ ...current, academicClassId: event.target.value }))}
              required
              disabled={isSaving}
            >
              <option value="">Select class</option>
              {(lookups?.academicClasses ?? []).map((classLookup) => (
                <option key={classLookup.id} value={classLookup.id}>
                  {classLookup.displayName ?? classLookup.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Programme component ID
            <select
              value={form.schoolProgrammeComponentId}
              onChange={(event) => setForm((current) => ({ ...current, schoolProgrammeComponentId: event.target.value }))}
              required
              disabled
            >
              <option value="">Select programme component</option>
              {(lookups?.schoolProgrammeComponents ?? []).map((component) => (
                <option key={component.id} value={component.id}>
                  {component.displayName ?? component.localCode ?? component.id}
                </option>
              ))}
            </select>
          </label>
          <label>
            Teacher (optional)
            <select
              value={form.teacherUserId}
              onChange={(event) => setForm((current) => ({ ...current, teacherUserId: event.target.value }))}
              disabled={isSaving}
            >
              <option value="">No teacher selected</option>
              {(lookups?.teachers ?? []).map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Effective from
            <input
              type="date"
              value={form.effectiveFrom}
              onChange={(event) => setForm((current) => ({ ...current, effectiveFrom: event.target.value }))}
              required
              disabled={isSaving}
            />
          </label>
          <label>
            Effective to
            <input
              type="date"
              value={form.effectiveTo}
              onChange={(event) => setForm((current) => ({ ...current, effectiveTo: event.target.value }))}
              min={form.effectiveFrom || undefined}
              disabled={isSaving}
            />
          </label>

          <div className="form-actions">
            <button type="submit" disabled={!canCreateAssignment || isSaving}>{isSaving ? 'Saving...' : 'Create assignment'}</button>
          </div>
        </form>

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
