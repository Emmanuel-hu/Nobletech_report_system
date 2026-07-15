import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import type { CurriculumSourceProcessingSession, CurriculumSourceSection, CurriculumSourceSectionType } from '../../../types/curriculum';

const SECTION_TYPES: CurriculumSourceSectionType[] = [
  'DOCUMENT_HEADING',
  'INTRODUCTION',
  'CLASS_LEVEL',
  'TERM',
  'SUBJECT',
  'UNIT',
  'TOPIC',
  'CONCEPT',
  'SKILL',
  'LEARNING_OUTCOME',
  'ACTIVITY',
  'PROJECT',
  'RESOURCE',
  'ASSESSMENT',
  'NOTE',
  'OTHER',
];

const toMessage = (error: unknown): string => (error instanceof Error ? error.message : 'Request failed.');

export const CurriculumSourceProcessingWorkspacePage = () => {
  const { session } = useAuth();
  const { pushNotification } = useNotification();
  const { sourceId, sessionId } = useParams<{ sourceId: string; sessionId: string }>();

  const [processingSession, setProcessingSession] = useState<CurriculumSourceProcessingSession | null>(null);
  const [sections, setSections] = useState<CurriculumSourceSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heading, setHeading] = useState('');
  const [rawText, setRawText] = useState('');
  const [sectionType, setSectionType] = useState<CurriculumSourceSectionType>('UNIT');

  const load = async (): Promise<void> => {
    if (!sourceId || !sessionId) {
      setError('Missing route parameters.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [sessionData, sectionData] = await Promise.all([
        curriculumClient.getProcessingSession(session, sourceId, sessionId),
        curriculumClient.listProcessingSections(session, sessionId),
      ]);
      setProcessingSession(sessionData);
      setSections(sectionData);
    } catch (caught) {
      setError(toMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceId, sessionId]);

  const orderedSections = useMemo(
    () => [...sections].filter((item) => !item.archivedAt).sort((a, b) => a.sequenceOrder - b.sequenceOrder),
    [sections],
  );

  const isEditable =
    processingSession?.status === 'DRAFT' ||
    processingSession?.status === 'IN_PROGRESS' ||
    processingSession?.status === 'REVISION_REQUIRED';

  const handleCreateSection = async (): Promise<void> => {
    if (!sessionId || !heading.trim() || !rawText.trim()) {
      pushNotification({ title: 'Validation error', message: 'Section type, heading, and raw text are required.', tone: 'warning' });
      return;
    }

    try {
      await curriculumClient.createProcessingSection(session, sessionId, {
        sectionType,
        heading: heading.trim(),
        rawText: rawText.trim(),
      });
      setHeading('');
      setRawText('');
      pushNotification({ title: 'Section created', message: 'Manual extraction section added.', tone: 'success' });
      await load();
    } catch (caught) {
      pushNotification({ title: 'Create failed', message: toMessage(caught), tone: 'danger' });
    }
  };

  const handleCreateStructuredRecord = async (item: CurriculumSourceSection): Promise<void> => {
    if (!sessionId) {
      return;
    }

    try {
      await curriculumClient.createStructuredRecordFromSection(session, sessionId, item.id, {
        lastKnownSectionUpdatedAt: item.updatedAt,
      });
      pushNotification({
        title: 'Structured record created',
        message: 'Record persisted from manual extraction section.',
        tone: 'success',
      });
      await load();
    } catch (caught) {
      pushNotification({ title: 'Record creation failed', message: toMessage(caught), tone: 'danger' });
    }
  };

  const handleDeleteSection = async (item: CurriculumSourceSection): Promise<void> => {
    if (!sessionId) {
      return;
    }

    try {
      await curriculumClient.deleteProcessingSection(session, sessionId, item.id, item.updatedAt);
      pushNotification({ title: 'Section deleted', message: 'Section removed from session.', tone: 'success' });
      await load();
    } catch (caught) {
      pushNotification({ title: 'Delete failed', message: toMessage(caught), tone: 'danger' });
    }
  };

  return (
    <PermissionGate permission="curriculum_source.processing.view">
      <section>
        <header className="page-header">
          <p className="eyebrow">Curriculum source processing</p>
          <h2>Manual extraction workspace</h2>
          <p>Manual processing only. This workspace does not run OCR or AI extraction.</p>
        </header>

        {processingSession ? (
          <div className="card" style={{ marginBottom: 16 }}>
            <p>
              Session <strong>R{processingSession.revisionNumber}</strong> status: <strong>{processingSession.status}</strong>
            </p>
            <p className="muted">Notes: {processingSession.notes ?? 'No notes'}</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to={`/admin/curriculum-sources/${processingSession.curriculumSourceId}/processing/${processingSession.id}/review`}>
                Review
              </Link>
              <Link to={`/admin/curriculum-sources/${processingSession.curriculumSourceId}/processing/${processingSession.id}/compare`}>
                Compare revisions
              </Link>
            </div>
          </div>
        ) : null}

        {loading ? <LoadingState label="Loading processing workspace..." /> : null}
        {error ? <ErrorState title="Could not load processing workspace" body={error} onRetry={() => void load()} /> : null}

        {!loading && !error && isEditable ? (
          <div className="card" style={{ marginBottom: 16 }}>
            <h3>Add extracted section</h3>
            <label className="field">
              <span>Section type</span>
              <select value={sectionType} onChange={(event) => setSectionType(event.target.value as CurriculumSourceSectionType)}>
                {SECTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Heading</span>
              <input value={heading} onChange={(event) => setHeading(event.target.value)} />
            </label>
            <label className="field">
              <span>Raw text</span>
              <textarea rows={5} value={rawText} onChange={(event) => setRawText(event.target.value)} />
            </label>
            <button type="button" className="button button-primary" onClick={() => void handleCreateSection()}>
              Add section
            </button>
          </div>
        ) : null}

        {!loading && !error ? (
          <div className="card">
            <h3>Extracted sections</h3>
            {orderedSections.length === 0 ? (
              <p className="muted">No sections extracted yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Type</th>
                    <th>Heading</th>
                    <th>Review status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedSections.map((item) => (
                    <tr key={item.id}>
                      <td>{item.sequenceOrder}</td>
                      <td>{item.sectionType}</td>
                      <td>{item.heading}</td>
                      <td>{item.reviewStatus}</td>
                      <td style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => void handleCreateStructuredRecord(item)}
                          disabled={processingSession?.status !== 'APPROVED' && processingSession?.status !== 'COMPLETED'}
                        >
                          Create record
                        </button>
                        <button
                          type="button"
                          className="button button-danger"
                          onClick={() => void handleDeleteSection(item)}
                          disabled={!isEditable}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : null}
      </section>
    </PermissionGate>
  );
};
