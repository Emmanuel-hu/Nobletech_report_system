import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';

const toMessage = (error: unknown): string => (error instanceof Error ? error.message : 'Request failed.');

export const MasterContentPromotionCreatePage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { pushNotification } = useNotification();

  const [processingSessionId, setProcessingSessionId] = useState('');
  const [adaptationNote, setAdaptationNote] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();

    if (!processingSessionId.trim()) {
      pushNotification({ title: 'Validation error', message: 'Processing session id is required.', tone: 'warning' });
      return;
    }

    setSaving(true);
    try {
      const promotion = await curriculumClient.createMasterContentPromotion(session, {
        processingSessionId: processingSessionId.trim(),
        adaptationNote: adaptationNote.trim() || undefined,
      });

      pushNotification({ title: 'Promotion created', message: 'Promotion request created.', tone: 'success' });
      navigate(`/admin/master-content-promotions/${promotion.id}`);
    } catch (caught) {
      pushNotification({ title: 'Create failed', message: toMessage(caught), tone: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PermissionGate permission="master_content.promotion.create">
      <section>
        <header className="page-header">
          <p className="eyebrow">Master-content promotion</p>
          <h2>Create promotion request</h2>
          <p>Select an approved or completed processing session to initialize a promotion request.</p>
        </header>

        <form className="card" onSubmit={(event) => void submit(event)}>
          <label className="field">
            <span>Processing session id</span>
            <input value={processingSessionId} onChange={(event) => setProcessingSessionId(event.target.value)} />
          </label>

          <label className="field">
            <span>Adaptation note</span>
            <textarea rows={4} value={adaptationNote} onChange={(event) => setAdaptationNote(event.target.value)} />
          </label>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create promotion'}
            </button>
            <Link className="button button-secondary" to="/admin/master-content-promotions">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </PermissionGate>
  );
};