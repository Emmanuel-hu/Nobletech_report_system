import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { isCurriculumEditable, type CurriculumDetail } from '../../../types/curriculum';

export const CurriculumStructurePage = () => {
  const { curriculumId = '' } = useParams();
  const { session } = useAuth();
  const { pushNotification } = useNotification();

  const [record, setRecord] = useState<CurriculumDetail | null>(null);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canMutateStructure = record ? isCurriculumEditable(record.status) : false;

  const load = async () => {
    if (!curriculumId) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await curriculumClient.getCurriculum(session, curriculumId);
      setRecord(data);
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Failed to load curriculum structure.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [curriculumId, session.userId, session.schoolId]);

  const onCreateUnit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!record || !newUnitTitle.trim() || !canMutateStructure) {
      return;
    }

    try {
      const updated = await curriculumClient.createUnit(session, record.id, {
        title: newUnitTitle.trim(),
        sequenceOrder: record.units.length + 1,
      });
      setRecord(updated);
      setNewUnitTitle('');
      pushNotification({
        title: 'Unit added',
        message: 'The curriculum structure has been updated.',
        tone: 'success',
      });
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Failed to add unit.');
    }
  };

  const onReorder = async () => {
    if (!record || !canMutateStructure) {
      return;
    }

    const reversedIds = [...record.units].sort((a, b) => b.sequenceOrder - a.sequenceOrder).map((unit) => unit.id);

    try {
      const updated = await curriculumClient.reorderUnits(session, record.id, reversedIds);
      setRecord(updated);
      pushNotification({
        title: 'Unit order updated',
        message: 'Foundation reorder action completed.',
        tone: 'info',
      });
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Failed to reorder units.');
    }
  };

  return (
    <PermissionGate permission="curriculum.edit">
      <section>
        <header className="page-header">
          <h2>Structure editor</h2>
          <p>Units, topics, project associations, and sequence management foundation.</p>
        </header>

        {isLoading ? <LoadingState label="Loading structure..." /> : null}
        {error ? <ErrorState title="Structure operation failed" body={error} onRetry={() => void load()} /> : null}
        {record && !canMutateStructure ? (
          <ErrorState
            title="Curriculum structure is immutable"
            body="Structure updates are disabled for UNDER_REVIEW, APPROVED, PUBLISHED, and ARCHIVED curricula."
          />
        ) : null}

        {record ? (
          <>
            <form className="card inline-form" onSubmit={onCreateUnit}>
              <label>
                New unit title
                <input
                  value={newUnitTitle}
                  onChange={(event) => setNewUnitTitle(event.target.value)}
                  required
                  disabled={!canMutateStructure}
                />
              </label>
              <button type="submit" disabled={!canMutateStructure}>Add unit</button>
              <button type="button" onClick={() => void onReorder()} disabled={!canMutateStructure}>
                Reorder units
              </button>
            </form>

            <article className="card">
              <h3>Units and topics</h3>
              {record.units.length === 0 ? <p className="muted">No units yet.</p> : null}
              {record.units.map((unit) => (
                <div key={unit.id} className="structure-block">
                  <header>
                    <h4>
                      {unit.sequenceOrder}. {unit.title}
                    </h4>
                    <p className="muted">{unit.code ?? 'No code'} </p>
                  </header>
                  <p>{unit.description ?? 'No description.'}</p>

                  <details>
                    <summary>{unit.topics.length} topic(s)</summary>
                    {unit.topics.map((topic) => (
                      <article key={topic.id} className="nested-item">
                        <h5>
                          {topic.sequenceOrder}. {topic.title}
                        </h5>
                        <p>{topic.description ?? 'No topic description.'}</p>
                        <p className="muted">Concept links: {topic.conceptLinks.length}</p>
                      </article>
                    ))}
                  </details>

                  <details>
                    <summary>{unit.projects.length} project(s)</summary>
                    {unit.projects.map((project) => (
                      <article key={project.id} className="nested-item">
                        <h5>
                          {project.sequenceOrder}. {project.title}
                        </h5>
                        <p>{project.description}</p>
                        <p className="muted">Implementation variants: {project.implementations.length}</p>
                      </article>
                    ))}
                  </details>
                </div>
              ))}
            </article>
          </>
        ) : null}
      </section>
    </PermissionGate>
  );
};
