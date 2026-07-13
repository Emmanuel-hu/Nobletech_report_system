import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard';

type CreateFormState = {
  title: string;
  code: string;
  description: string;
  schoolProgrammeComponentId: string;
};

const initialState: CreateFormState = {
  title: '',
  code: '',
  description: '',
  schoolProgrammeComponentId: '',
};

export const CurriculumCreatePage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { pushNotification } = useNotification();

  const [form, setForm] = useState<CreateFormState>(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDirty = Boolean(form.title || form.code || form.description || form.schoolProgrammeComponentId);

  useUnsavedChangesGuard(isDirty && !isSaving, 'You have unsaved curriculum metadata changes.');

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSaving(true);
    setError(null);

    try {
      const created = await curriculumClient.createCurriculum(session, {
        title: form.title.trim(),
        code: form.code.trim(),
        description: form.description.trim() || undefined,
        schoolProgrammeComponentId: form.schoolProgrammeComponentId.trim(),
      });

      pushNotification({
        title: 'Curriculum created',
        message: `${created.title} is now ready for authoring and review workflows.`,
        tone: 'success',
      });

      navigate(`/admin/curricula/${created.id}/edit`);
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Failed to create curriculum.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PermissionGate permission="curriculum.create">
      <section>
        <header className="page-header">
          <h2>Create curriculum</h2>
          <p>Metadata foundation for manual authoring workflows.</p>
        </header>

        <form className="card form-grid" onSubmit={onSubmit}>
          <label>
            Title
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
              minLength={3}
            />
          </label>

          <label>
            Code
            <input
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
              required
              minLength={2}
            />
          </label>

          <label>
            School programme component ID
            <input
              value={form.schoolProgrammeComponentId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  schoolProgrammeComponentId: event.target.value,
                }))
              }
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={4}
            />
          </label>

          <div className="form-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Create curriculum'}
            </button>
          </div>
        </form>

        {error ? <ErrorState title="Creation failed" body={error} /> : null}
      </section>
    </PermissionGate>
  );
};
