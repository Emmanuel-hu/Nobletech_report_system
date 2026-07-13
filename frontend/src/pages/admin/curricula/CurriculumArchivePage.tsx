import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';

export const CurriculumArchivePage = () => {
  const { curriculumId = '' } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { pushNotification } = useNotification();

  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const archive = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!curriculumId || !reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await curriculumClient.archiveCurriculum(session, curriculumId, reason.trim());
      pushNotification({
        title: 'Curriculum archived',
        message: 'Archive transition has been recorded.',
        tone: 'warning',
      });
      navigate('/admin/curricula/list');
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Archive action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PermissionGate permission="curriculum.archive">
      <section>
        <header className="page-header">
          <h2>Archive curriculum</h2>
          <p>Archive is irreversible in this flow and must include a rationale.</p>
        </header>

        <form className="card form-grid" onSubmit={archive}>
          <label>
            Archive reason
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} required rows={5} />
          </label>

          <div className="form-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Archiving...' : 'Confirm archive'}
            </button>
          </div>
        </form>

        {error ? <ErrorState title="Archive failed" body={error} /> : null}
      </section>
    </PermissionGate>
  );
};
