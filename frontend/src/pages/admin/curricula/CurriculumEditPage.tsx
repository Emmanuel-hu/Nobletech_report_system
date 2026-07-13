import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard';
import { isCurriculumEditable, type CurriculumDetail } from '../../../types/curriculum';

type FormState = {
  title: string;
  code: string;
  description: string;
  schoolProgrammeComponentId: string;
};

const toFormState = (record: CurriculumDetail): FormState => ({
  title: record.title,
  code: record.code,
  description: record.description ?? '',
  schoolProgrammeComponentId: record.schoolProgrammeComponentId,
});

export const CurriculumEditPage = () => {
  const { curriculumId = '' } = useParams();
  const { session } = useAuth();
  const { pushNotification } = useNotification();

  const [record, setRecord] = useState<CurriculumDetail | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
      setForm(toFormState(data));
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Failed to load curriculum.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [curriculumId, session.userId, session.schoolId]);

  const isDirty = useMemo(() => {
    if (!record || !form) {
      return false;
    }

    return (
      record.title !== form.title ||
      record.code !== form.code ||
      (record.description ?? '') !== form.description ||
      record.schoolProgrammeComponentId !== form.schoolProgrammeComponentId
    );
  }, [record, form]);

  const canEditRecord = record ? isCurriculumEditable(record.status) : false;

  useUnsavedChangesGuard(isDirty && !isSaving && canEditRecord, 'You have unsaved curriculum changes.');

  const onSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!record || !form || !canEditRecord) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const updated = await curriculumClient.updateCurriculum(session, record.id, {
        title: form.title,
        code: form.code,
        description: form.description,
        schoolProgrammeComponentId: form.schoolProgrammeComponentId,
        lastKnownUpdatedAt: record.updatedAt,
      });
      setRecord(updated);
      setForm(toFormState(updated));
      pushNotification({
        title: 'Curriculum saved',
        message: 'Metadata updates are now stored as draft changes.',
        tone: 'success',
      });
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Failed to save curriculum.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PermissionGate permission="curriculum.edit">
      <section>
        <header className="page-header">
          <h2>Edit curriculum</h2>
          <p>Update metadata and continue into structure operations.</p>
        </header>

        {isLoading ? <LoadingState label="Loading editable curriculum..." /> : null}
        {error ? <ErrorState title="Unable to save changes" body={error} onRetry={() => void load()} /> : null}

        {record && !canEditRecord ? (
          <ErrorState
            title="Curriculum is immutable"
            body="Editing is disabled for UNDER_REVIEW, APPROVED, PUBLISHED, and ARCHIVED curricula."
          />
        ) : null}

        {record && form ? (
          <form className="card form-grid" onSubmit={onSave}>
            <label>
              Title
              <input
                value={form.title}
                onChange={(event) => setForm((current) => current ? { ...current, title: event.target.value } : current)}
                required
                disabled={!canEditRecord}
              />
            </label>

            <label>
              Code
              <input
                value={form.code}
                onChange={(event) => setForm((current) => current ? { ...current, code: event.target.value } : current)}
                required
                disabled={!canEditRecord}
              />
            </label>

            <label>
              Programme component ID
              <input
                value={form.schoolProgrammeComponentId}
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? {
                          ...current,
                          schoolProgrammeComponentId: event.target.value,
                        }
                      : current,
                  )
                }
                required
                disabled={!canEditRecord}
              />
            </label>

            <label>
              Description
              <textarea
                rows={5}
                value={form.description}
                onChange={(event) => setForm((current) => current ? { ...current, description: event.target.value } : current)}
                disabled={!canEditRecord}
              />
            </label>

            {isDirty ? <p className="dirty-indicator">Unsaved changes are present.</p> : null}

            <div className="form-actions">
              <button type="submit" disabled={isSaving || !canEditRecord}>
                {isSaving ? 'Saving...' : 'Save metadata'}
              </button>
              <Link to={`/admin/curricula/${record.id}/structure`}>Open structure editor</Link>
              <Link to={`/admin/curricula/${record.id}/review`}>Open review actions</Link>
            </div>
          </form>
        ) : null}
      </section>
    </PermissionGate>
  );
};
