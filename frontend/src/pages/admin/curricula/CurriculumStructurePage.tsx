import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { curriculumClient } from '../../../api/curriculumClient';
import { EmptyState, ErrorState, LoadingState } from '../../../components/feedback/DataState';
import { PermissionGate } from '../../../components/layout/PermissionGate';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { ApiClientError } from '../../../types/api';
import {
  isCurriculumEditable,
  type CurriculumConcept,
  type CurriculumDetail,
  type CurriculumEditorLookups,
  type CurriculumProject,
  type CurriculumProjectImplementation,
  type CurriculumTopic,
  type CurriculumTopicConcept,
} from '../../../types/curriculum';

const implementationTypes = [
  'PHYSICAL_ROBOTICS',
  'SIMULATION_ONLY',
  'LOW_RESOURCE',
  'NO_LAPTOP',
  'INDIVIDUAL',
  'GROUP',
  'OTHER',
] as const;

const resourceTypes = ['SOFTWARE', 'WEBSITE', 'HARDWARE', 'KIT', 'DOCUMENT', 'VIDEO', 'AUDIO', 'IMAGE', 'OTHER'] as const;

const moveId = (ids: string[], id: string, direction: -1 | 1): string[] => {
  const index = ids.findIndex((item) => item === id);
  if (index < 0) {
    return ids;
  }

  const target = index + direction;
  if (target < 0 || target >= ids.length) {
    return ids;
  }

  const next = [...ids];
  const current = next[index] as string;
  const destination = next[target] as string;
  next[index] = destination;
  next[target] = current;
  return next;
};

const formatError = (error: unknown): string => {
  if (error instanceof ApiClientError) {
    if (error.details.length > 0) {
      const detailText = error.details
        .map((detail) => detail.message)
        .filter(Boolean)
        .join('; ');
      if (detailText) {
        return `${error.message} ${detailText}`;
      }
    }
    return error.message;
  }

  return error instanceof Error ? error.message : 'Request failed.';
};

export const CurriculumStructurePage = () => {
  const { curriculumId = '' } = useParams();
  const { session, can } = useAuth();
  const { pushNotification } = useNotification();

  const [record, setRecord] = useState<CurriculumDetail | null>(null);
  const [lookups, setLookups] = useState<CurriculumEditorLookups | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [savedLabel, setSavedLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [conceptSearch, setConceptSearch] = useState('');

  const [newTopicByUnit, setNewTopicByUnit] = useState<Record<string, Partial<CurriculumTopic>>>({});
  const [newProjectByUnit, setNewProjectByUnit] = useState<Record<string, Partial<CurriculumProject>>>({});
  const [newOperationalConcept, setNewOperationalConcept] = useState({ name: '', code: '', definition: '', explanation: '' });
  const [newOutcome, setNewOutcome] = useState({ statement: '', code: '', bloomLevel: '', measurableVerb: '', masterLearningOutcomeId: '' });
  const [newResource, setNewResource] = useState({
    curriculumTopicId: '',
    title: '',
    description: '',
    resourceType: 'DOCUMENT',
    quantityRequired: '',
    requiresInternet: false,
    requiresLogin: false,
    safetyNote: '',
    externalUrl: '',
    internalFileReference: '',
    masterResourceId: '',
  });

  const editableByLifecycle = record ? isCurriculumEditable(record.status) : false;
  const canEdit = can('curriculum.edit') && editableByLifecycle;
  const canReorder = can('curriculum.reorder') && editableByLifecycle;

  const topicNameById = useMemo(() => {
    const map = new Map<string, string>();
    record?.units.forEach((unit) => {
      unit.topics.forEach((topic) => map.set(topic.id, topic.title));
    });
    return map;
  }, [record]);

  const load = async () => {
    if (!curriculumId) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setConflictError(null);
    try {
      const [detail, editorLookups] = await Promise.all([
        curriculumClient.getCurriculum(session, curriculumId),
        curriculumClient.getEditorLookups(session, curriculumId),
      ]);
      setRecord(detail);
      setLookups(editorLookups);
      if (!newResource.curriculumTopicId && detail.units[0]?.topics[0]?.id) {
        setNewResource((current) => ({ ...current, curriculumTopicId: detail.units[0]?.topics[0]?.id ?? '' }));
      }
    } catch (unknownError) {
      setError(formatError(unknownError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curriculumId, session.schoolId, session.userId]);

  const runMutation = async (label: string, action: () => Promise<CurriculumDetail>) => {
    setIsSaving(label);
    setSavedLabel(null);
    setError(null);
    setConflictError(null);

    try {
      const updated = await action();
      setRecord(updated);
      setSavedLabel(label);
      pushNotification({ title: 'Saved', message: `${label} updated.`, tone: 'success' });
    } catch (unknownError) {
      if (unknownError instanceof ApiClientError && unknownError.code === 'VERSION_CONFLICT') {
        setConflictError(`${unknownError.message} Your local values remain on-screen. Reload latest before retrying.`);
      } else {
        setError(formatError(unknownError));
      }
    } finally {
      setIsSaving(null);
    }
  };

  const findConceptLabel = (mapping: CurriculumTopicConcept): string => {
    if (!record) {
      return 'Unknown concept';
    }

    const localConcept = mapping.curriculumConceptId
      ? record.concepts.find((concept) => concept.id === mapping.curriculumConceptId)
      : undefined;
    if (localConcept) {
      return `Adapted operational concept: ${localConcept.name}`;
    }

    const masterConcept = mapping.masterConceptId
      ? lookups?.masterConcepts.find((concept) => concept.id === mapping.masterConceptId)
      : undefined;
    if (masterConcept) {
      return `Master concept: ${masterConcept.name}`;
    }

    return 'Unknown concept';
  };

  return (
    <PermissionGate permission="curriculum.view">
      <section>
        <header className="page-header">
          <h2>Curriculum structure editor</h2>
          <p>
            Complete manual workflows for topics, concepts, projects, implementations, learning outcomes, resources,
            and visibility controls.
          </p>
        </header>

        {isLoading ? <LoadingState label="Loading structure editor..." /> : null}
        {error ? <ErrorState title="Structure update failed" body={error} onRetry={() => void load()} /> : null}
        {conflictError ? (
          <ErrorState
            title="Concurrency conflict"
            body={conflictError}
            onRetry={() => {
              void load();
            }}
          />
        ) : null}
        {isSaving ? <LoadingState label={`Saving ${isSaving}...`} /> : null}
        {savedLabel ? <p className="dirty-indicator">Saved: {savedLabel}</p> : null}

        {record && !editableByLifecycle ? (
          <ErrorState
            title="Read-only lifecycle state"
            body="Structure editing is allowed only in DRAFT and REVISION_REQUIRED."
          />
        ) : null}
        {record && !can('curriculum.edit') ? (
          <ErrorState title="Permission denied" body="You need curriculum.edit to change structure." />
        ) : null}

        {!record || !lookups ? null : (
          <>
            <article className="card">
              <div className="split-header">
                <h3>Topics</h3>
                <p className="muted">Create, update, delete, reorder, and manage week/duration/difficulty metadata.</p>
              </div>
              {record.units.length === 0 ? (
                <EmptyState title="No units" body="Create units first before adding topics." />
              ) : null}
              {record.units.map((unit) => {
                const draft = newTopicByUnit[unit.id] ?? {};
                return (
                  <section key={unit.id} className="structure-block">
                    <h4>{unit.sequenceOrder}. {unit.title}</h4>
                    <p className="muted">Code: {unit.code ?? 'N/A'} | Estimated weeks: {unit.estimatedWeeks ?? 'Not set'}</p>
                    <form
                      className="form-grid"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (!canEdit) {
                          return;
                        }
                        void runMutation('topic', () =>
                          curriculumClient.createTopic(session, unit.id, {
                            title: String(draft.title ?? '').trim(),
                            code: draft.code ? String(draft.code) : undefined,
                            description: draft.description ? String(draft.description) : undefined,
                            weekNumber: draft.weekNumber ? Number(draft.weekNumber) : undefined,
                            recommendedDurationMinutes: draft.recommendedDurationMinutes
                              ? Number(draft.recommendedDurationMinutes)
                              : undefined,
                            difficultyLevel: draft.difficultyLevel ? String(draft.difficultyLevel) : undefined,
                            teacherNote: draft.teacherNote ? String(draft.teacherNote) : undefined,
                            sequenceOrder: unit.topics.length + 1,
                          }),
                        ).then(() => {
                          setNewTopicByUnit((current) => ({ ...current, [unit.id]: {} }));
                        });
                      }}
                    >
                      <div className="grid-two">
                        <label>
                          Topic title
                          <input
                            value={String(draft.title ?? '')}
                            onChange={(event) =>
                              setNewTopicByUnit((current) => ({
                                ...current,
                                [unit.id]: { ...current[unit.id], title: event.target.value },
                              }))
                            }
                            required
                            disabled={!canEdit}
                          />
                        </label>
                        <label>
                          Topic code
                          <input
                            value={String(draft.code ?? '')}
                            onChange={(event) =>
                              setNewTopicByUnit((current) => ({
                                ...current,
                                [unit.id]: { ...current[unit.id], code: event.target.value },
                              }))
                            }
                            disabled={!canEdit}
                          />
                        </label>
                        <label>
                          Week number
                          <input
                            type="number"
                            min={1}
                            value={String(draft.weekNumber ?? '')}
                            onChange={(event) =>
                              setNewTopicByUnit((current) => ({
                                ...current,
                                [unit.id]: {
                                  ...current[unit.id],
                                  weekNumber: event.target.value ? Number(event.target.value) : undefined,
                                },
                              }))
                            }
                            disabled={!canEdit}
                          />
                        </label>
                        <label>
                          Duration (minutes)
                          <input
                            type="number"
                            min={1}
                            value={String(draft.recommendedDurationMinutes ?? '')}
                            onChange={(event) =>
                              setNewTopicByUnit((current) => ({
                                ...current,
                                [unit.id]: {
                                  ...current[unit.id],
                                  recommendedDurationMinutes: event.target.value
                                    ? Number(event.target.value)
                                    : undefined,
                                },
                              }))
                            }
                            disabled={!canEdit}
                          />
                        </label>
                        <label>
                          Difficulty
                          <input
                            value={String(draft.difficultyLevel ?? '')}
                            onChange={(event) =>
                              setNewTopicByUnit((current) => ({
                                ...current,
                                [unit.id]: { ...current[unit.id], difficultyLevel: event.target.value },
                              }))
                            }
                            disabled={!canEdit}
                          />
                        </label>
                        <label>
                          Teacher note
                          <textarea
                            value={String(draft.teacherNote ?? '')}
                            onChange={(event) =>
                              setNewTopicByUnit((current) => ({
                                ...current,
                                [unit.id]: { ...current[unit.id], teacherNote: event.target.value },
                              }))
                            }
                            disabled={!canEdit}
                          />
                        </label>
                      </div>
                      <label>
                        Description
                        <textarea
                          value={String(draft.description ?? '')}
                          onChange={(event) =>
                            setNewTopicByUnit((current) => ({
                              ...current,
                              [unit.id]: { ...current[unit.id], description: event.target.value },
                            }))
                          }
                          disabled={!canEdit}
                        />
                      </label>
                      <div className="form-actions">
                        <button type="submit" disabled={!canEdit}>Create topic</button>
                      </div>
                    </form>

                    {unit.topics.length === 0 ? <p className="muted">No topics in this unit.</p> : null}
                    {unit.topics.map((topic) => (
                      <article key={topic.id} className="nested-item">
                        <div className="split-header">
                          <h5>{topic.sequenceOrder}. {topic.title}</h5>
                          <div className="inline-actions">
                            <button
                              type="button"
                              disabled={!canReorder}
                              aria-label={`Move ${topic.title} up`}
                              onClick={() => {
                                const orderedTopicIds = moveId(
                                  unit.topics.map((item) => item.id),
                                  topic.id,
                                  -1,
                                );
                                void runMutation('topic order', () =>
                                  curriculumClient.reorderTopics(session, unit.id, orderedTopicIds),
                                );
                              }}
                            >
                              Move up
                            </button>
                            <button
                              type="button"
                              disabled={!canReorder}
                              aria-label={`Move ${topic.title} down`}
                              onClick={() => {
                                const orderedTopicIds = moveId(
                                  unit.topics.map((item) => item.id),
                                  topic.id,
                                  1,
                                );
                                void runMutation('topic order', () =>
                                  curriculumClient.reorderTopics(session, unit.id, orderedTopicIds),
                                );
                              }}
                            >
                              Move down
                            </button>
                            <button
                              type="button"
                              disabled={!canEdit}
                              onClick={() =>
                                void runMutation('topic', () =>
                                  curriculumClient.deleteTopic(session, unit.id, topic.id),
                                )
                              }
                            >
                              Delete topic
                            </button>
                          </div>
                        </div>
                        <p>{topic.description ?? 'No description.'}</p>
                        <p className="muted">
                          Week: {topic.weekNumber ?? 'N/A'} | Duration: {topic.recommendedDurationMinutes ?? 'N/A'} mins | Difficulty:{' '}
                          {topic.difficultyLevel ?? 'N/A'}
                        </p>
                        <p className="muted">Master lineage: {topic.masterTopicId ?? 'No master topic lineage.'}</p>

                        <details>
                          <summary>Topic details and concept mappings</summary>
                          <form
                            className="form-grid"
                            onSubmit={(event) => {
                              event.preventDefault();
                              const form = new FormData(event.currentTarget);
                              if (!canEdit) {
                                return;
                              }
                              void runMutation('topic', () =>
                                curriculumClient.updateTopic(session, unit.id, topic.id, {
                                  title: String(form.get('title') ?? '').trim(),
                                  code: String(form.get('code') ?? '').trim() || undefined,
                                  description: String(form.get('description') ?? '').trim() || undefined,
                                  weekNumber: String(form.get('weekNumber') ?? '').trim()
                                    ? Number(form.get('weekNumber'))
                                    : undefined,
                                  recommendedDurationMinutes: String(form.get('recommendedDurationMinutes') ?? '').trim()
                                    ? Number(form.get('recommendedDurationMinutes'))
                                    : undefined,
                                  difficultyLevel: String(form.get('difficultyLevel') ?? '').trim() || undefined,
                                  teacherNote: String(form.get('teacherNote') ?? '').trim() || undefined,
                                  sequenceOrder: String(form.get('sequenceOrder') ?? '').trim()
                                    ? Number(form.get('sequenceOrder'))
                                    : undefined,
                                  lastKnownUpdatedAt: topic.updatedAt,
                                }),
                              );
                            }}
                          >
                            <div className="grid-two">
                              <label>
                                Title
                                <input name="title" defaultValue={topic.title} required disabled={!canEdit} />
                              </label>
                              <label>
                                Code
                                <input name="code" defaultValue={topic.code ?? ''} disabled={!canEdit} />
                              </label>
                              <label>
                                Sequence order
                                <input name="sequenceOrder" type="number" min={1} defaultValue={topic.sequenceOrder} disabled={!canEdit} />
                              </label>
                              <label>
                                Week
                                <input name="weekNumber" type="number" min={1} defaultValue={topic.weekNumber ?? ''} disabled={!canEdit} />
                              </label>
                              <label>
                                Duration minutes
                                <input name="recommendedDurationMinutes" type="number" min={1} defaultValue={topic.recommendedDurationMinutes ?? ''} disabled={!canEdit} />
                              </label>
                              <label>
                                Difficulty
                                <input name="difficultyLevel" defaultValue={topic.difficultyLevel ?? ''} disabled={!canEdit} />
                              </label>
                            </div>
                            <label>
                              Description
                              <textarea name="description" defaultValue={topic.description ?? ''} disabled={!canEdit} />
                            </label>
                            <label>
                              Teacher note
                              <textarea name="teacherNote" defaultValue={topic.teacherNote ?? ''} disabled={!canEdit} />
                            </label>
                            <button type="submit" disabled={!canEdit}>Update topic</button>
                          </form>

                          <section className="card">
                            <h6>Master concept search and linking</h6>
                            <label>
                              Search concepts
                              <input
                                value={conceptSearch}
                                onChange={(event) => setConceptSearch(event.target.value)}
                                placeholder="Search approved master concepts"
                              />
                            </label>
                            <form
                              className="inline-form"
                              onSubmit={(event) => {
                                event.preventDefault();
                                const form = new FormData(event.currentTarget);
                                const masterConceptId = String(form.get('masterConceptId') ?? '');
                                if (!masterConceptId || !canEdit) {
                                  return;
                                }
                                void runMutation('topic concept', () =>
                                  curriculumClient.addTopicConcept(session, topic.id, {
                                    masterConceptId,
                                    sequenceOrder: topic.conceptLinks.length + 1,
                                  }),
                                );
                              }}
                            >
                              <label>
                                Approved master concept
                                <select name="masterConceptId" disabled={!canEdit}>
                                  <option value="">Select approved concept</option>
                                  {lookups.masterConcepts
                                    .filter((item) => item.name.toLowerCase().includes(conceptSearch.toLowerCase()))
                                    .map((item) => (
                                      <option key={item.id} value={item.id}>
                                        {item.name} {item.code ? `(${item.code})` : ''}
                                      </option>
                                    ))}
                                </select>
                              </label>
                              <button type="submit" disabled={!canEdit}>Link master concept</button>
                            </form>

                            <form
                              className="inline-form"
                              onSubmit={(event) => {
                                event.preventDefault();
                                const form = new FormData(event.currentTarget);
                                const conceptId = String(form.get('curriculumConceptId') ?? '');
                                if (!conceptId || !canEdit) {
                                  return;
                                }
                                void runMutation('topic concept', () =>
                                  curriculumClient.addTopicConcept(session, topic.id, {
                                    curriculumConceptId: conceptId,
                                    sequenceOrder: topic.conceptLinks.length + 1,
                                  }),
                                );
                              }}
                            >
                              <label>
                                Adapted operational concept
                                <select name="curriculumConceptId" disabled={!canEdit}>
                                  <option value="">Select operational concept</option>
                                  {record.concepts.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.name} {item.code ? `(${item.code})` : ''}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <button type="submit" disabled={!canEdit}>Link operational concept</button>
                            </form>

                            {topic.conceptLinks.length === 0 ? (
                              <p className="muted">No concept mappings yet.</p>
                            ) : (
                              topic.conceptLinks.map((mapping) => (
                                <article key={mapping.id} className="nested-item">
                                  <div className="split-header">
                                    <strong>{findConceptLabel(mapping)}</strong>
                                    <div className="inline-actions">
                                      <button
                                        type="button"
                                        disabled={!canReorder}
                                        aria-label="Move concept mapping up"
                                        onClick={() => {
                                          const orderedMappingIds = moveId(
                                            topic.conceptLinks.map((item) => item.id),
                                            mapping.id,
                                            -1,
                                          );
                                          void runMutation('topic concept order', () =>
                                            curriculumClient.reorderTopicConcepts(
                                              session,
                                              topic.id,
                                              orderedMappingIds,
                                              topic.updatedAt,
                                            ),
                                          );
                                        }}
                                      >
                                        Move up
                                      </button>
                                      <button
                                        type="button"
                                        disabled={!canReorder}
                                        aria-label="Move concept mapping down"
                                        onClick={() => {
                                          const orderedMappingIds = moveId(
                                            topic.conceptLinks.map((item) => item.id),
                                            mapping.id,
                                            1,
                                          );
                                          void runMutation('topic concept order', () =>
                                            curriculumClient.reorderTopicConcepts(
                                              session,
                                              topic.id,
                                              orderedMappingIds,
                                              topic.updatedAt,
                                            ),
                                          );
                                        }}
                                      >
                                        Move down
                                      </button>
                                      <button
                                        type="button"
                                        disabled={!canEdit}
                                        onClick={() =>
                                          void runMutation('topic concept', () =>
                                            curriculumClient.deleteTopicConcept(session, mapping.id),
                                          )
                                        }
                                      >
                                        Remove mapping
                                      </button>
                                    </div>
                                  </div>
                                  <form
                                    className="grid-two"
                                    onSubmit={(event) => {
                                      event.preventDefault();
                                      const form = new FormData(event.currentTarget);
                                      if (!canEdit) {
                                        return;
                                      }
                                      void runMutation('topic concept', () =>
                                        curriculumClient.updateTopicConcept(session, mapping.id, {
                                          sequenceOrder: String(form.get('sequenceOrder') ?? '').trim()
                                            ? Number(form.get('sequenceOrder'))
                                            : undefined,
                                          importanceLevel: String(form.get('importanceLevel') ?? '').trim() || undefined,
                                          expectedDepth: String(form.get('expectedDepth') ?? '').trim() || undefined,
                                          instructionalEmphasis:
                                            String(form.get('instructionalEmphasis') ?? '').trim() || undefined,
                                          isCore: Boolean(form.get('isCore')),
                                          assessmentRelevance:
                                            String(form.get('assessmentRelevance') ?? '').trim() || undefined,
                                          teacherNote: String(form.get('teacherNote') ?? '').trim() || undefined,
                                          lastKnownUpdatedAt: mapping.updatedAt,
                                        }),
                                      );
                                    }}
                                  >
                                    <label>
                                      Sequence order
                                      <input name="sequenceOrder" type="number" min={1} defaultValue={mapping.sequenceOrder ?? ''} disabled={!canEdit} />
                                    </label>
                                    <label>
                                      Importance level
                                      <input name="importanceLevel" defaultValue={mapping.importanceLevel ?? ''} disabled={!canEdit} />
                                    </label>
                                    <label>
                                      Expected depth
                                      <input name="expectedDepth" defaultValue={mapping.expectedDepth ?? ''} disabled={!canEdit} />
                                    </label>
                                    <label>
                                      Instructional emphasis
                                      <input name="instructionalEmphasis" defaultValue={mapping.instructionalEmphasis ?? ''} disabled={!canEdit} />
                                    </label>
                                    <label className="checkbox-inline">
                                      <input name="isCore" type="checkbox" defaultChecked={mapping.isCore} disabled={!canEdit} />
                                      Core concept
                                    </label>
                                    <label>
                                      Assessment relevance
                                      <input name="assessmentRelevance" defaultValue={mapping.assessmentRelevance ?? ''} disabled={!canEdit} />
                                    </label>
                                    <label>
                                      Teacher note
                                      <textarea name="teacherNote" defaultValue={mapping.teacherNote ?? ''} disabled={!canEdit} />
                                    </label>
                                    <button type="submit" disabled={!canEdit}>Update mapping</button>
                                  </form>
                                </article>
                              ))
                            )}
                          </section>
                        </details>
                      </article>
                    ))}
                  </section>
                );
              })}
            </article>

            <article className="card">
              <h3>Operational concept editor</h3>
              <form
                className="form-grid"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!canEdit) {
                    return;
                  }
                  void runMutation('operational concept', () =>
                    curriculumClient.createConcept(session, record.id, {
                      name: newOperationalConcept.name.trim(),
                      code: newOperationalConcept.code.trim() || undefined,
                      definition: newOperationalConcept.definition.trim(),
                      explanation: newOperationalConcept.explanation.trim() || undefined,
                    }),
                  ).then(() => {
                    setNewOperationalConcept({ name: '', code: '', definition: '', explanation: '' });
                  });
                }}
              >
                <div className="grid-two">
                  <label>
                    Name
                    <input
                      value={newOperationalConcept.name}
                      onChange={(event) => setNewOperationalConcept((current) => ({ ...current, name: event.target.value }))}
                      required
                      disabled={!canEdit}
                    />
                  </label>
                  <label>
                    Code
                    <input
                      value={newOperationalConcept.code}
                      onChange={(event) => setNewOperationalConcept((current) => ({ ...current, code: event.target.value }))}
                      disabled={!canEdit}
                    />
                  </label>
                </div>
                <label>
                  Definition
                  <textarea
                    value={newOperationalConcept.definition}
                    onChange={(event) => setNewOperationalConcept((current) => ({ ...current, definition: event.target.value }))}
                    required
                    disabled={!canEdit}
                  />
                </label>
                <label>
                  Explanation
                  <textarea
                    value={newOperationalConcept.explanation}
                    onChange={(event) => setNewOperationalConcept((current) => ({ ...current, explanation: event.target.value }))}
                    disabled={!canEdit}
                  />
                </label>
                <button type="submit" disabled={!canEdit}>Create operational concept</button>
              </form>

              {record.concepts.length === 0 ? (
                <EmptyState title="No operational concepts" body="Create adapted concepts when master concepts need local context." />
              ) : (
                record.concepts.map((concept: CurriculumConcept) => (
                  <details key={concept.id} className="nested-item">
                    <summary>{concept.name}</summary>
                    <form
                      className="form-grid"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const form = new FormData(event.currentTarget);
                        if (!canEdit) {
                          return;
                        }
                        void runMutation('operational concept', () =>
                          curriculumClient.updateConcept(session, concept.id, {
                            name: String(form.get('name') ?? '').trim(),
                            code: String(form.get('code') ?? '').trim() || undefined,
                            definition: String(form.get('definition') ?? '').trim(),
                            explanation: String(form.get('explanation') ?? '').trim() || undefined,
                            lastKnownUpdatedAt: concept.updatedAt,
                          }),
                        );
                      }}
                    >
                      <label>
                        Name
                        <input name="name" defaultValue={concept.name} required disabled={!canEdit} />
                      </label>
                      <label>
                        Code
                        <input name="code" defaultValue={concept.code ?? ''} disabled={!canEdit} />
                      </label>
                      <label>
                        Definition
                        <textarea name="definition" defaultValue={concept.definition} required disabled={!canEdit} />
                      </label>
                      <label>
                        Explanation
                        <textarea name="explanation" defaultValue={concept.explanation ?? ''} disabled={!canEdit} />
                      </label>
                      <div className="form-actions">
                        <button type="submit" disabled={!canEdit}>Update concept</button>
                        <button
                          type="button"
                          disabled={!canEdit}
                          onClick={() =>
                            void runMutation('operational concept', () =>
                              curriculumClient.deleteConcept(session, concept.id),
                            )
                          }
                        >
                          Delete concept
                        </button>
                      </div>
                    </form>
                  </details>
                ))
              )}
            </article>

            <article className="card">
              <h3>Projects and implementations</h3>
              {record.units.map((unit) => {
                const draft = newProjectByUnit[unit.id] ?? {};
                return (
                  <section key={unit.id} className="structure-block">
                    <h4>{unit.sequenceOrder}. {unit.title}</h4>
                    <form
                      className="form-grid"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (!canEdit) {
                          return;
                        }
                        void runMutation('project', () =>
                          curriculumClient.createProject(session, unit.id, {
                            title: String(draft.title ?? '').trim(),
                            description: String(draft.description ?? '').trim(),
                            sequenceOrder: unit.projects.length + 1,
                            objective: draft.objective ? String(draft.objective) : undefined,
                            expectedOutput: draft.expectedOutput ? String(draft.expectedOutput) : undefined,
                            estimatedDurationMinutes: draft.estimatedDurationMinutes
                              ? Number(draft.estimatedDurationMinutes)
                              : undefined,
                            difficultyLevel: draft.difficultyLevel ? String(draft.difficultyLevel) : undefined,
                            safetyNote: draft.safetyNote ? String(draft.safetyNote) : undefined,
                          }),
                        ).then(() => {
                          setNewProjectByUnit((current) => ({ ...current, [unit.id]: {} }));
                        });
                      }}
                    >
                      <div className="grid-two">
                        <label>
                          Project title
                          <input
                            value={String(draft.title ?? '')}
                            onChange={(event) =>
                              setNewProjectByUnit((current) => ({
                                ...current,
                                [unit.id]: { ...current[unit.id], title: event.target.value },
                              }))
                            }
                            required
                            disabled={!canEdit}
                          />
                        </label>
                        <label>
                          Duration (minutes)
                          <input
                            type="number"
                            min={1}
                            value={String(draft.estimatedDurationMinutes ?? '')}
                            onChange={(event) =>
                              setNewProjectByUnit((current) => ({
                                ...current,
                                [unit.id]: {
                                  ...current[unit.id],
                                  estimatedDurationMinutes: event.target.value ? Number(event.target.value) : undefined,
                                },
                              }))
                            }
                            disabled={!canEdit}
                          />
                        </label>
                        <label>
                          Difficulty
                          <input
                            value={String(draft.difficultyLevel ?? '')}
                            onChange={(event) =>
                              setNewProjectByUnit((current) => ({
                                ...current,
                                [unit.id]: { ...current[unit.id], difficultyLevel: event.target.value },
                              }))
                            }
                            disabled={!canEdit}
                          />
                        </label>
                        <label>
                          Safety note
                          <input
                            value={String(draft.safetyNote ?? '')}
                            onChange={(event) =>
                              setNewProjectByUnit((current) => ({
                                ...current,
                                [unit.id]: { ...current[unit.id], safetyNote: event.target.value },
                              }))
                            }
                            disabled={!canEdit}
                          />
                        </label>
                      </div>
                      <label>
                        Description
                        <textarea
                          value={String(draft.description ?? '')}
                          onChange={(event) =>
                            setNewProjectByUnit((current) => ({
                              ...current,
                              [unit.id]: { ...current[unit.id], description: event.target.value },
                            }))
                          }
                          required
                          disabled={!canEdit}
                        />
                      </label>
                      <label>
                        Objective
                        <textarea
                          value={String(draft.objective ?? '')}
                          onChange={(event) =>
                            setNewProjectByUnit((current) => ({
                              ...current,
                              [unit.id]: { ...current[unit.id], objective: event.target.value },
                            }))
                          }
                          disabled={!canEdit}
                        />
                      </label>
                      <label>
                        Expected output
                        <textarea
                          value={String(draft.expectedOutput ?? '')}
                          onChange={(event) =>
                            setNewProjectByUnit((current) => ({
                              ...current,
                              [unit.id]: { ...current[unit.id], expectedOutput: event.target.value },
                            }))
                          }
                          disabled={!canEdit}
                        />
                      </label>
                      <button type="submit" disabled={!canEdit}>Create project</button>
                    </form>

                    {unit.projects.length === 0 ? <p className="muted">No projects in this unit.</p> : null}
                    {unit.projects.map((project) => (
                      <article key={project.id} className="nested-item">
                        <h5>{project.sequenceOrder}. {project.title}</h5>
                        <form
                          className="form-grid"
                          onSubmit={(event) => {
                            event.preventDefault();
                            const form = new FormData(event.currentTarget);
                            if (!canEdit) {
                              return;
                            }
                            void runMutation('project', () =>
                              curriculumClient.updateProject(session, project.id, {
                                title: String(form.get('title') ?? '').trim(),
                                description: String(form.get('description') ?? '').trim(),
                                sequenceOrder: String(form.get('sequenceOrder') ?? '').trim()
                                  ? Number(form.get('sequenceOrder'))
                                  : undefined,
                                objective: String(form.get('objective') ?? '').trim() || undefined,
                                expectedOutput: String(form.get('expectedOutput') ?? '').trim() || undefined,
                                estimatedDurationMinutes: String(form.get('estimatedDurationMinutes') ?? '').trim()
                                  ? Number(form.get('estimatedDurationMinutes'))
                                  : undefined,
                                difficultyLevel: String(form.get('difficultyLevel') ?? '').trim() || undefined,
                                safetyNote: String(form.get('safetyNote') ?? '').trim() || undefined,
                                lastKnownUpdatedAt: project.updatedAt,
                              }),
                            );
                          }}
                        >
                          <div className="grid-two">
                            <label>
                              Title
                              <input name="title" defaultValue={project.title} required disabled={!canEdit} />
                            </label>
                            <label>
                              Sequence order
                              <input name="sequenceOrder" type="number" min={1} defaultValue={project.sequenceOrder} disabled={!canEdit} />
                            </label>
                            <label>
                              Duration minutes
                              <input name="estimatedDurationMinutes" type="number" min={1} defaultValue={project.estimatedDurationMinutes ?? ''} disabled={!canEdit} />
                            </label>
                            <label>
                              Difficulty
                              <input name="difficultyLevel" defaultValue={project.difficultyLevel ?? ''} disabled={!canEdit} />
                            </label>
                          </div>
                          <label>
                            Description
                            <textarea name="description" defaultValue={project.description} required disabled={!canEdit} />
                          </label>
                          <label>
                            Objective
                            <textarea name="objective" defaultValue={project.objective ?? ''} disabled={!canEdit} />
                          </label>
                          <label>
                            Expected output
                            <textarea name="expectedOutput" defaultValue={project.expectedOutput ?? ''} disabled={!canEdit} />
                          </label>
                          <label>
                            Safety note
                            <textarea name="safetyNote" defaultValue={project.safetyNote ?? ''} disabled={!canEdit} />
                          </label>
                          <div className="form-actions">
                            <button type="submit" disabled={!canEdit}>Update project</button>
                            <button
                              type="button"
                              disabled={!canEdit}
                              onClick={() => void runMutation('project', () => curriculumClient.deleteProject(session, project.id))}
                            >
                              Delete project
                            </button>
                          </div>
                        </form>

                        <details>
                          <summary>Project to topic mappings ({project.topicLinks?.length ?? 0})</summary>
                          <form
                            className="inline-form"
                            onSubmit={(event) => {
                              event.preventDefault();
                              const form = new FormData(event.currentTarget);
                              const topicId = String(form.get('topicId') ?? '');
                              if (!topicId || !canEdit) {
                                return;
                              }

                              const exists = (project.topicLinks ?? []).some((link) => link.curriculumTopicId === topicId);
                              if (exists) {
                                setError('Duplicate project-topic mappings are not allowed.');
                                return;
                              }

                              void runMutation('project mapping', () => curriculumClient.linkProjectTopic(session, project.id, topicId));
                            }}
                          >
                            <label>
                              Topic
                              <select name="topicId" disabled={!canEdit}>
                                <option value="">Select topic</option>
                                {record.units.flatMap((mappedUnit) => mappedUnit.topics).map((topic) => (
                                  <option key={topic.id} value={topic.id}>{topic.title}</option>
                                ))}
                              </select>
                            </label>
                            <button type="submit" disabled={!canEdit}>Link topic</button>
                          </form>
                          {(project.topicLinks ?? []).map((link) => (
                            <div key={link.id} className="inline-actions">
                              <span>{topicNameById.get(link.curriculumTopicId) ?? link.curriculumTopicId}</span>
                              <button
                                type="button"
                                disabled={!canEdit}
                                onClick={() =>
                                  void runMutation('project mapping', () =>
                                    curriculumClient.deleteProjectTopicLink(session, link.id),
                                  )
                                }
                              >
                                Unlink topic
                              </button>
                            </div>
                          ))}
                        </details>

                        <details>
                          <summary>Project implementations ({project.implementations.length})</summary>
                          <form
                            className="form-grid"
                            onSubmit={(event) => {
                              event.preventDefault();
                              const form = new FormData(event.currentTarget);
                              if (!canEdit) {
                                return;
                              }
                              void runMutation('project implementation', () =>
                                curriculumClient.createProjectImplementation(session, project.id, {
                                  title: String(form.get('title') ?? '').trim(),
                                  implementationType: String(form.get('implementationType') ?? '').trim(),
                                  description: String(form.get('description') ?? '').trim() || undefined,
                                  teacherInstructions: String(form.get('teacherInstructions') ?? '').trim() || undefined,
                                  learnerInstructions: String(form.get('learnerInstructions') ?? '').trim() || undefined,
                                  safetyInstructions: String(form.get('safetyInstructions') ?? '').trim() || undefined,
                                  requiredInternet: Boolean(form.get('requiredInternet')),
                                  requiredDeviceCount: String(form.get('requiredDeviceCount') ?? '').trim()
                                    ? Number(form.get('requiredDeviceCount'))
                                    : undefined,
                                  estimatedDurationMinutes: String(form.get('estimatedDurationMinutes') ?? '').trim()
                                    ? Number(form.get('estimatedDurationMinutes'))
                                    : undefined,
                                  sequenceOrder: project.implementations.length + 1,
                                }),
                              );
                            }}
                          >
                            <div className="grid-two">
                              <label>
                                Title
                                <input name="title" required disabled={!canEdit} />
                              </label>
                              <label>
                                Type
                                <select name="implementationType" defaultValue="GROUP" disabled={!canEdit}>
                                  {implementationTypes.map((typeValue) => (
                                    <option key={typeValue} value={typeValue}>{typeValue}</option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                Duration minutes
                                <input name="estimatedDurationMinutes" type="number" min={1} disabled={!canEdit} />
                              </label>
                              <label>
                                Required devices
                                <input name="requiredDeviceCount" type="number" min={0} disabled={!canEdit} />
                              </label>
                              <label className="checkbox-inline">
                                <input name="requiredInternet" type="checkbox" disabled={!canEdit} />
                                Requires internet
                              </label>
                            </div>
                            <label>
                              Description
                              <textarea name="description" disabled={!canEdit} />
                            </label>
                            <label>
                              Teacher instructions
                              <textarea name="teacherInstructions" disabled={!canEdit} />
                            </label>
                            <label>
                              Learner instructions
                              <textarea name="learnerInstructions" disabled={!canEdit} />
                            </label>
                            <label>
                              Safety instructions
                              <textarea name="safetyInstructions" disabled={!canEdit} />
                            </label>
                            <button type="submit" disabled={!canEdit}>Create implementation</button>
                          </form>

                          {project.implementations.map((implementation: CurriculumProjectImplementation) => (
                            <article key={implementation.id} className="nested-item">
                              <div className="split-header">
                                <strong>{implementation.sequenceOrder}. {implementation.title}</strong>
                                <div className="inline-actions">
                                  <button
                                    type="button"
                                    disabled={!canReorder}
                                    aria-label="Move implementation up"
                                    onClick={() => {
                                      const orderedImplementationIds = moveId(
                                        project.implementations.map((item) => item.id),
                                        implementation.id,
                                        -1,
                                      );
                                      void runMutation('implementation order', () =>
                                        curriculumClient.reorderProjectImplementations(
                                          session,
                                          project.id,
                                          orderedImplementationIds,
                                          project.updatedAt,
                                        ),
                                      );
                                    }}
                                  >
                                    Move up
                                  </button>
                                  <button
                                    type="button"
                                    disabled={!canReorder}
                                    aria-label="Move implementation down"
                                    onClick={() => {
                                      const orderedImplementationIds = moveId(
                                        project.implementations.map((item) => item.id),
                                        implementation.id,
                                        1,
                                      );
                                      void runMutation('implementation order', () =>
                                        curriculumClient.reorderProjectImplementations(
                                          session,
                                          project.id,
                                          orderedImplementationIds,
                                          project.updatedAt,
                                        ),
                                      );
                                    }}
                                  >
                                    Move down
                                  </button>
                                  <button
                                    type="button"
                                    disabled={!canEdit}
                                    onClick={() =>
                                      void runMutation('project implementation', () =>
                                        curriculumClient.deleteProjectImplementation(session, implementation.id),
                                      )
                                    }
                                  >
                                    Delete implementation
                                  </button>
                                </div>
                              </div>
                              <form
                                className="grid-two"
                                onSubmit={(event) => {
                                  event.preventDefault();
                                  const form = new FormData(event.currentTarget);
                                  if (!canEdit) {
                                    return;
                                  }
                                  void runMutation('project implementation', () =>
                                    curriculumClient.updateProjectImplementation(session, implementation.id, {
                                      title: String(form.get('title') ?? '').trim(),
                                      implementationType: String(form.get('implementationType') ?? '').trim(),
                                      description: String(form.get('description') ?? '').trim() || undefined,
                                      teacherInstructions: String(form.get('teacherInstructions') ?? '').trim() || undefined,
                                      learnerInstructions: String(form.get('learnerInstructions') ?? '').trim() || undefined,
                                      safetyInstructions: String(form.get('safetyInstructions') ?? '').trim() || undefined,
                                      requiredInternet: Boolean(form.get('requiredInternet')),
                                      requiredDeviceCount: String(form.get('requiredDeviceCount') ?? '').trim()
                                        ? Number(form.get('requiredDeviceCount'))
                                        : undefined,
                                      estimatedDurationMinutes: String(form.get('estimatedDurationMinutes') ?? '').trim()
                                        ? Number(form.get('estimatedDurationMinutes'))
                                        : undefined,
                                      sequenceOrder: String(form.get('sequenceOrder') ?? '').trim()
                                        ? Number(form.get('sequenceOrder'))
                                        : undefined,
                                      lastKnownUpdatedAt: implementation.updatedAt,
                                    }),
                                  );
                                }}
                              >
                                <label>
                                  Title
                                  <input name="title" defaultValue={implementation.title} required disabled={!canEdit} />
                                </label>
                                <label>
                                  Type
                                  <select name="implementationType" defaultValue={implementation.implementationType} disabled={!canEdit}>
                                    {implementationTypes.map((typeValue) => (
                                      <option key={typeValue} value={typeValue}>{typeValue}</option>
                                    ))}
                                  </select>
                                </label>
                                <label>
                                  Sequence order
                                  <input name="sequenceOrder" type="number" min={1} defaultValue={implementation.sequenceOrder} disabled={!canEdit} />
                                </label>
                                <label>
                                  Duration minutes
                                  <input
                                    name="estimatedDurationMinutes"
                                    type="number"
                                    min={1}
                                    defaultValue={implementation.estimatedDurationMinutes ?? ''}
                                    disabled={!canEdit}
                                  />
                                </label>
                                <label>
                                  Required devices
                                  <input name="requiredDeviceCount" type="number" min={0} defaultValue={implementation.requiredDeviceCount ?? ''} disabled={!canEdit} />
                                </label>
                                <label className="checkbox-inline">
                                  <input name="requiredInternet" type="checkbox" defaultChecked={Boolean(implementation.requiredInternet)} disabled={!canEdit} />
                                  Requires internet
                                </label>
                                <label>
                                  Description
                                  <textarea name="description" defaultValue={implementation.description ?? ''} disabled={!canEdit} />
                                </label>
                                <label>
                                  Teacher instructions
                                  <textarea name="teacherInstructions" defaultValue={implementation.teacherInstructions ?? ''} disabled={!canEdit} />
                                </label>
                                <label>
                                  Learner instructions
                                  <textarea name="learnerInstructions" defaultValue={implementation.learnerInstructions ?? ''} disabled={!canEdit} />
                                </label>
                                <label>
                                  Safety instructions
                                  <textarea name="safetyInstructions" defaultValue={implementation.safetyInstructions ?? ''} disabled={!canEdit} />
                                </label>
                                <button type="submit" disabled={!canEdit}>Update implementation</button>
                              </form>
                            </article>
                          ))}
                        </details>
                      </article>
                    ))}
                  </section>
                );
              })}
            </article>

            <article className="card">
              <h3>Learning outcomes and mappings</h3>
              <form
                className="form-grid"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!canEdit) {
                    return;
                  }
                  void runMutation('learning outcome', () =>
                    curriculumClient.createLearningOutcome(session, record.id, {
                      statement: newOutcome.statement.trim(),
                      code: newOutcome.code.trim() || undefined,
                      bloomLevel: newOutcome.bloomLevel.trim() || undefined,
                      measurableVerb: newOutcome.measurableVerb.trim() || undefined,
                      masterLearningOutcomeId: newOutcome.masterLearningOutcomeId || undefined,
                    }),
                  ).then(() => {
                    setNewOutcome({ statement: '', code: '', bloomLevel: '', measurableVerb: '', masterLearningOutcomeId: '' });
                  });
                }}
              >
                <label>
                  Statement
                  <textarea
                    value={newOutcome.statement}
                    onChange={(event) => setNewOutcome((current) => ({ ...current, statement: event.target.value }))}
                    required
                    disabled={!canEdit}
                  />
                </label>
                <div className="grid-two">
                  <label>
                    Code
                    <input
                      value={newOutcome.code}
                      onChange={(event) => setNewOutcome((current) => ({ ...current, code: event.target.value }))}
                      disabled={!canEdit}
                    />
                  </label>
                  <label>
                    Bloom level
                    <input
                      value={newOutcome.bloomLevel}
                      onChange={(event) => setNewOutcome((current) => ({ ...current, bloomLevel: event.target.value }))}
                      disabled={!canEdit}
                    />
                  </label>
                  <label>
                    Measurable verb
                    <input
                      value={newOutcome.measurableVerb}
                      onChange={(event) => setNewOutcome((current) => ({ ...current, measurableVerb: event.target.value }))}
                      disabled={!canEdit}
                    />
                  </label>
                  <label>
                    Master learning outcome linkage
                    <select
                      value={newOutcome.masterLearningOutcomeId}
                      onChange={(event) =>
                        setNewOutcome((current) => ({ ...current, masterLearningOutcomeId: event.target.value }))
                      }
                      disabled={!canEdit}
                    >
                      <option value="">No master lineage</option>
                      {lookups.masterLearningOutcomes.map((item) => (
                        <option key={item.id} value={item.id}>{item.statement}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <button type="submit" disabled={!canEdit}>Create learning outcome</button>
              </form>

              {record.learningOutcomes.map((outcome) => (
                <details key={outcome.id} className="nested-item">
                  <summary>
                    {outcome.code ?? 'No code'}: {outcome.statement}
                  </summary>
                  <p className="muted">Bloom: {outcome.bloomLevel ?? 'N/A'} | Verb: {outcome.measurableVerb ?? 'N/A'}</p>
                  <p className="muted">Master lineage: {outcome.masterLearningOutcomeId ?? 'Operational outcome'}</p>
                  <form
                    className="form-grid"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const form = new FormData(event.currentTarget);
                      if (!canEdit) {
                        return;
                      }
                      void runMutation('learning outcome', () =>
                        curriculumClient.updateLearningOutcome(session, outcome.id, {
                          statement: String(form.get('statement') ?? '').trim(),
                          code: String(form.get('code') ?? '').trim() || undefined,
                          bloomLevel: String(form.get('bloomLevel') ?? '').trim() || undefined,
                          measurableVerb: String(form.get('measurableVerb') ?? '').trim() || undefined,
                          lastKnownUpdatedAt: outcome.updatedAt,
                        }),
                      );
                    }}
                  >
                    <label>
                      Statement
                      <textarea name="statement" defaultValue={outcome.statement} required disabled={!canEdit} />
                    </label>
                    <div className="grid-two">
                      <label>
                        Code
                        <input name="code" defaultValue={outcome.code ?? ''} disabled={!canEdit} />
                      </label>
                      <label>
                        Bloom level
                        <input name="bloomLevel" defaultValue={outcome.bloomLevel ?? ''} disabled={!canEdit} />
                      </label>
                      <label>
                        Measurable verb
                        <input name="measurableVerb" defaultValue={outcome.measurableVerb ?? ''} disabled={!canEdit} />
                      </label>
                    </div>
                    <div className="form-actions">
                      <button type="submit" disabled={!canEdit}>Update outcome</button>
                      <button
                        type="button"
                        disabled={!canEdit}
                        onClick={() =>
                          void runMutation('learning outcome', () =>
                            curriculumClient.deleteLearningOutcome(session, outcome.id),
                          )
                        }
                      >
                        Delete outcome
                      </button>
                    </div>
                  </form>

                  <form
                    className="inline-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const form = new FormData(event.currentTarget);
                      const targetTopicId = String(form.get('topicId') ?? '');
                      if (!targetTopicId || !canEdit) {
                        return;
                      }

                      const duplicate = record.units
                        .flatMap((unit) => unit.topics)
                        .some((topic) =>
                          (topic.topicLearningOutcomes ?? []).some(
                            (mapping) => mapping.curriculumTopicId === targetTopicId && mapping.curriculumLearningOutcomeId === outcome.id,
                          ),
                        );

                      if (duplicate) {
                        setError('Duplicate topic-learning outcome mappings are not allowed.');
                        return;
                      }

                      void runMutation('outcome mapping', () =>
                        curriculumClient.linkTopicOutcome(session, targetTopicId, outcome.id),
                      );
                    }}
                  >
                    <label>
                      Link to topic
                      <select name="topicId" disabled={!canEdit}>
                        <option value="">Select topic</option>
                        {record.units.flatMap((unit) => unit.topics).map((topic) => (
                          <option key={topic.id} value={topic.id}>{topic.title}</option>
                        ))}
                      </select>
                    </label>
                    <button type="submit" disabled={!canEdit}>Link topic</button>
                  </form>

                  <form
                    className="inline-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const form = new FormData(event.currentTarget);
                      const projectId = String(form.get('projectId') ?? '');
                      if (!projectId || !canEdit) {
                        return;
                      }

                      const duplicate = record.units
                        .flatMap((unit) => unit.projects)
                        .some((project) =>
                          (project.projectLearningOutcomes ?? []).some(
                            (mapping) => mapping.curriculumProjectId === projectId && mapping.curriculumLearningOutcomeId === outcome.id,
                          ),
                        );

                      if (duplicate) {
                        setError('Duplicate project-learning outcome mappings are not allowed.');
                        return;
                      }

                      void runMutation('outcome mapping', () =>
                        curriculumClient.linkProjectOutcome(session, projectId, outcome.id),
                      );
                    }}
                  >
                    <label>
                      Link to project
                      <select name="projectId" disabled={!canEdit}>
                        <option value="">Select project</option>
                        {record.units.flatMap((unit) => unit.projects).map((project) => (
                          <option key={project.id} value={project.id}>{project.title}</option>
                        ))}
                      </select>
                    </label>
                    <button type="submit" disabled={!canEdit}>Link project</button>
                  </form>

                  <div className="grid-two">
                    {record.units.flatMap((unit) => unit.topics).flatMap((topic) =>
                      (topic.topicLearningOutcomes ?? [])
                        .filter((link) => link.curriculumLearningOutcomeId === outcome.id)
                        .map((link) => (
                          <div key={link.id} className="inline-actions">
                            <span>Topic link: {topic.title}</span>
                            <button
                              type="button"
                              disabled={!canEdit}
                              onClick={() =>
                                void runMutation('outcome mapping', () =>
                                  curriculumClient.deleteTopicOutcomeLink(session, link.id),
                                )
                              }
                            >
                              Remove
                            </button>
                          </div>
                        )),
                    )}
                    {record.units.flatMap((unit) => unit.projects).flatMap((project) =>
                      (project.projectLearningOutcomes ?? [])
                        .filter((link) => link.curriculumLearningOutcomeId === outcome.id)
                        .map((link) => (
                          <div key={link.id} className="inline-actions">
                            <span>Project link: {project.title}</span>
                            <button
                              type="button"
                              disabled={!canEdit}
                              onClick={() =>
                                void runMutation('outcome mapping', () =>
                                  curriculumClient.deleteProjectOutcomeLink(session, link.id),
                                )
                              }
                            >
                              Remove
                            </button>
                          </div>
                        )),
                    )}
                  </div>
                </details>
              ))}
            </article>

            <article className="card">
              <h3>Curriculum resources</h3>
              <form
                className="form-grid"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!canEdit) {
                    return;
                  }
                  void runMutation('resource', () =>
                    curriculumClient.createResource(session, record.id, {
                      curriculumTopicId: newResource.curriculumTopicId,
                      title: newResource.title.trim(),
                      resourceType: newResource.resourceType,
                      description: newResource.description.trim() || undefined,
                      quantityRequired: newResource.quantityRequired.trim() || undefined,
                      requiresInternet: newResource.requiresInternet,
                      requiresLogin: newResource.requiresLogin,
                      safetyNote: newResource.safetyNote.trim() || undefined,
                      externalUrl: newResource.externalUrl.trim() || undefined,
                      internalFileReference: newResource.internalFileReference.trim() || undefined,
                      masterResourceId: newResource.masterResourceId || undefined,
                    }),
                  ).then(() => {
                    setNewResource((current) => ({
                      ...current,
                      title: '',
                      description: '',
                      quantityRequired: '',
                      safetyNote: '',
                      externalUrl: '',
                      internalFileReference: '',
                    }));
                  });
                }}
              >
                <div className="grid-two">
                  <label>
                    Topic
                    <select
                      value={newResource.curriculumTopicId}
                      onChange={(event) => setNewResource((current) => ({ ...current, curriculumTopicId: event.target.value }))}
                      required
                      disabled={!canEdit}
                    >
                      <option value="">Select topic</option>
                      {record.units.flatMap((unit) => unit.topics).map((topic) => (
                        <option key={topic.id} value={topic.id}>{topic.title}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Master resource lineage
                    <select
                      value={newResource.masterResourceId}
                      onChange={(event) => setNewResource((current) => ({ ...current, masterResourceId: event.target.value }))}
                      disabled={!canEdit}
                    >
                      <option value="">No master lineage</option>
                      {lookups.masterResources.map((resource) => (
                        <option key={resource.id} value={resource.id}>{resource.title}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Title
                    <input
                      value={newResource.title}
                      onChange={(event) => setNewResource((current) => ({ ...current, title: event.target.value }))}
                      required
                      disabled={!canEdit}
                    />
                  </label>
                  <label>
                    Type
                    <select
                      value={newResource.resourceType}
                      onChange={(event) => setNewResource((current) => ({ ...current, resourceType: event.target.value }))}
                      disabled={!canEdit}
                    >
                      {resourceTypes.map((typeValue) => (
                        <option key={typeValue} value={typeValue}>{typeValue}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Quantity
                    <input
                      value={newResource.quantityRequired}
                      onChange={(event) => setNewResource((current) => ({ ...current, quantityRequired: event.target.value }))}
                      disabled={!canEdit}
                    />
                  </label>
                  <label>
                    External URL metadata
                    <input
                      type="url"
                      value={newResource.externalUrl}
                      onChange={(event) => setNewResource((current) => ({ ...current, externalUrl: event.target.value }))}
                      disabled={!canEdit}
                    />
                  </label>
                  <label>
                    Internal file reference metadata
                    <input
                      value={newResource.internalFileReference}
                      onChange={(event) => setNewResource((current) => ({ ...current, internalFileReference: event.target.value }))}
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="checkbox-inline">
                    <input
                      type="checkbox"
                      checked={newResource.requiresInternet}
                      onChange={(event) => setNewResource((current) => ({ ...current, requiresInternet: event.target.checked }))}
                      disabled={!canEdit}
                    />
                    Requires internet
                  </label>
                  <label className="checkbox-inline">
                    <input
                      type="checkbox"
                      checked={newResource.requiresLogin}
                      onChange={(event) => setNewResource((current) => ({ ...current, requiresLogin: event.target.checked }))}
                      disabled={!canEdit}
                    />
                    Requires login
                  </label>
                </div>
                <label>
                  Description
                  <textarea
                    value={newResource.description}
                    onChange={(event) => setNewResource((current) => ({ ...current, description: event.target.value }))}
                    disabled={!canEdit}
                  />
                </label>
                <label>
                  Safety note
                  <textarea
                    value={newResource.safetyNote}
                    onChange={(event) => setNewResource((current) => ({ ...current, safetyNote: event.target.value }))}
                    disabled={!canEdit}
                  />
                </label>
                <button type="submit" disabled={!canEdit}>Create resource</button>
              </form>

              {record.resources.length === 0 ? (
                <EmptyState title="No resources" body="Add resources linked to specific topics." />
              ) : (
                record.resources.map((resource) => (
                  <details key={resource.id} className="nested-item">
                    <summary>{resource.title}</summary>
                    <form
                      className="form-grid"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const form = new FormData(event.currentTarget);
                        if (!canEdit) {
                          return;
                        }
                        void runMutation('resource', () =>
                          curriculumClient.updateResource(session, resource.id, {
                            title: String(form.get('title') ?? '').trim(),
                            description: String(form.get('description') ?? '').trim() || undefined,
                            quantityRequired: String(form.get('quantityRequired') ?? '').trim() || undefined,
                            requiresInternet: Boolean(form.get('requiresInternet')),
                            requiresLogin: Boolean(form.get('requiresLogin')),
                            safetyNote: String(form.get('safetyNote') ?? '').trim() || undefined,
                            externalUrl: String(form.get('externalUrl') ?? '').trim() || undefined,
                            internalFileReference:
                              String(form.get('internalFileReference') ?? '').trim() || undefined,
                            lastKnownUpdatedAt: resource.updatedAt,
                          }),
                        );
                      }}
                    >
                      <div className="grid-two">
                        <label>
                          Title
                          <input name="title" defaultValue={resource.title} required disabled={!canEdit} />
                        </label>
                        <label>
                          Quantity
                          <input name="quantityRequired" defaultValue={resource.quantityRequired ?? ''} disabled={!canEdit} />
                        </label>
                        <label>
                          External URL metadata
                          <input name="externalUrl" type="url" defaultValue={resource.externalUrl ?? ''} disabled={!canEdit} />
                        </label>
                        <label>
                          Internal file reference metadata
                          <input name="internalFileReference" defaultValue={resource.internalFileReference ?? ''} disabled={!canEdit} />
                        </label>
                        <label className="checkbox-inline">
                          <input name="requiresInternet" type="checkbox" defaultChecked={resource.requiresInternet} disabled={!canEdit} />
                          Requires internet
                        </label>
                        <label className="checkbox-inline">
                          <input name="requiresLogin" type="checkbox" defaultChecked={resource.requiresLogin} disabled={!canEdit} />
                          Requires login
                        </label>
                      </div>
                      <label>
                        Description
                        <textarea name="description" defaultValue={resource.description ?? ''} disabled={!canEdit} />
                      </label>
                      <label>
                        Safety note
                        <textarea name="safetyNote" defaultValue={resource.safetyNote ?? ''} disabled={!canEdit} />
                      </label>
                      <div className="form-actions">
                        <button type="submit" disabled={!canEdit}>Update resource</button>
                        <button
                          type="button"
                          disabled={!canEdit}
                          onClick={() =>
                            void runMutation('resource', () =>
                              curriculumClient.deleteResource(session, resource.id),
                            )
                          }
                        >
                          Delete resource
                        </button>
                      </div>
                    </form>
                  </details>
                ))
              )}
            </article>

            <article className="card">
              <h3>Visibility settings</h3>
              {record.visibilitySetting ? (
                <form
                  className="grid-two"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    if (!canEdit) {
                      return;
                    }
                    void runMutation('visibility settings', () =>
                      curriculumClient.updateVisibility(session, record.id, {
                        showProgrammeComponents: Boolean(form.get('showProgrammeComponents')),
                        showTools: Boolean(form.get('showTools')),
                        showResources: Boolean(form.get('showResources')),
                        showProjects: Boolean(form.get('showProjects')),
                        showLearningOutcomes: Boolean(form.get('showLearningOutcomes')),
                        showTeacherNotes: Boolean(form.get('showTeacherNotes')),
                        showStudentNotes: Boolean(form.get('showStudentNotes')),
                        visibleToTeachers: Boolean(form.get('visibleToTeachers')),
                        visibleToLearners: Boolean(form.get('visibleToLearners')),
                        visibleToGuardians: Boolean(form.get('visibleToGuardians')),
                        lastKnownUpdatedAt: record.visibilitySetting?.updatedAt,
                      }),
                    );
                  }}
                >
                  {[
                    'showProgrammeComponents',
                    'showTools',
                    'showResources',
                    'showProjects',
                    'showLearningOutcomes',
                    'showTeacherNotes',
                    'showStudentNotes',
                    'visibleToTeachers',
                    'visibleToLearners',
                    'visibleToGuardians',
                  ].map((field) => (
                    <label key={field} className="checkbox-inline">
                      <input
                        name={field}
                        type="checkbox"
                        defaultChecked={Boolean((record.visibilitySetting as Record<string, unknown>)[field])}
                        disabled={!canEdit}
                      />
                      {field}
                    </label>
                  ))}
                  <button type="submit" disabled={!canEdit}>Save visibility settings</button>
                </form>
              ) : (
                <EmptyState title="No visibility settings" body="Visibility configuration is not available for this curriculum." />
              )}
            </article>
          </>
        )}
      </section>
    </PermissionGate>
  );
};
