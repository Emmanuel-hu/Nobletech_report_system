import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import type { CurriculumSource, CurriculumSourceFile } from '../../../types/curriculum';

const toMessage = (error: unknown): string => (error instanceof Error ? error.message : 'Request failed.');

export const CurriculumSourceProcessingCreatePage = () => {
  const { session } = useAuth();
  const { pushNotification } = useNotification();
  const navigate = useNavigate();
  const { sourceId } = useParams<{ sourceId: string }>();

  const [source, setSource] = useState<CurriculumSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedFileId, setSelectedFileId] = useState('');

  const load = async (): Promise<void> => {
    if (!sourceId) {
      setError('Missing source id.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await curriculumClient.getSource(session, sourceId);
      setSource(data);
      const firstFile = data.sourceFiles
        .filter((item) => item.status === 'ACTIVE' && item.uploadStatus === 'READY')
        .sort((a, b) => a.sequenceOrder - b.sequenceOrder)[0];
      if (firstFile) {
        setSelectedFileId(firstFile.id);
      }
    } catch (caught) {
      setError(toMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceId]);

  const readyFiles = useMemo<CurriculumSourceFile[]>(() => {
    return (source?.sourceFiles ?? [])
      .filter((item) => item.status === 'ACTIVE' && item.uploadStatus === 'READY')
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  }, [source]);

  const handleCreate = async (): Promise<void> => {
    if (!sourceId || !selectedFileId) {
      pushNotification({ title: 'Validation error', message: 'Select a source file first.', tone: 'warning' });
      return;
    }

    try {
      const created = await curriculumClient.createProcessingSession(session, sourceId, {
        curriculumSourceFileId: selectedFileId,
        notes: notes.trim() || undefined,
      });

      pushNotification({
        title: 'Session created',
        message: 'Manual processing session created. No OCR or AI extraction was used.',
        tone: 'success',
      });
      navigate(`/admin/curriculum-sources/${sourceId}/processing/${created.id}`);
    } catch (caught) {
      pushNotification({ title: 'Creation failed', message: toMessage(caught), tone: 'danger' });
    }
  };

  return (
    <PermissionGate permission="curriculum_source.processing.create">
      <section>
        <header className="page-header">
          <p className="eyebrow">Curriculum source processing</p>
          <h2>Start manual processing session</h2>
          <p>Manual processing only. OCR, AI extraction, and automatic generation are not part of this workflow.</p>
        </header>

        {loading ? <LoadingState label="Loading source details..." /> : null}
        {error ? <ErrorState title="Could not load source" body={error} onRetry={() => void load()} /> : null}

        {!loading && !error && source ? (
          <div className="card">
            <h3>{source.title}</h3>
            <label className="field">
              <span>Source file</span>
              <select value={selectedFileId} onChange={(event) => setSelectedFileId(event.target.value)}>
                <option value="">Select file</option>
                {readyFiles.map((file) => (
                  <option key={file.id} value={file.id}>
                    v{file.documentVersion ?? file.sequenceOrder} - {file.originalFileName}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Session notes</span>
              <textarea
                rows={6}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Describe extraction scope, assumptions, and review handoff context."
              />
            </label>
            <button type="button" className="button button-primary" onClick={() => void handleCreate()}>
              Create session
            </button>
          </div>
        ) : null}
      </section>
    </PermissionGate>
  );
};
