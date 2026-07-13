import { describe, expect, it } from 'vitest';

import {
  conceptIdParamSchema,
  conceptMappingIdParamSchema,
  createConceptSchema,
  createProjectImplementationSchema,
  implementationIdParamSchema,
  projectOutcomeLinkIdParamSchema,
  reorderProjectImplementationsSchema,
  reorderTopicConceptsSchema,
  topicOutcomeLinkIdParamSchema,
  topicProjectLinkIdParamSchema,
  updateConceptSchema,
  updateProjectImplementationSchema,
  updateTopicConceptSchema,
  updateVisibilitySchema,
} from '../src/validators/curriculum.validator';

describe('curriculum phase 2J validators', () => {
  it('accepts valid project implementation payload', () => {
    const result = createProjectImplementationSchema.parse({
      title: 'Hands-on build',
      implementationType: 'GROUP',
      sequenceOrder: 1,
      requiredInternet: false,
      requiredDeviceCount: 10,
      estimatedDurationMinutes: 60,
    });

    expect(result.title).toBe('Hands-on build');
    expect(result.implementationType).toBe('GROUP');
  });

  it('requires optimistic concurrency token for implementation updates', () => {
    const parsed = updateProjectImplementationSchema.parse({
      title: 'Updated title',
      lastKnownUpdatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(parsed.title).toBe('Updated title');
    expect(parsed.lastKnownUpdatedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('validates topic concept update payload and id schemas', () => {
    const update = updateTopicConceptSchema.parse({
      sequenceOrder: 2,
      importanceLevel: 'HIGH',
      lastKnownUpdatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(update.sequenceOrder).toBe(2);

    const uuid = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    expect(conceptMappingIdParamSchema.parse({ mappingId: uuid }).mappingId).toBe(uuid);
    expect(implementationIdParamSchema.parse({ implementationId: uuid }).implementationId).toBe(uuid);
    expect(topicProjectLinkIdParamSchema.parse({ linkId: uuid }).linkId).toBe(uuid);
    expect(topicOutcomeLinkIdParamSchema.parse({ linkId: uuid }).linkId).toBe(uuid);
    expect(projectOutcomeLinkIdParamSchema.parse({ linkId: uuid }).linkId).toBe(uuid);
    expect(conceptIdParamSchema.parse({ conceptId: uuid }).conceptId).toBe(uuid);
  });

  it('validates concept CRUD and reorder schema payloads', () => {
    const concept = createConceptSchema.parse({
      name: 'Operational concept',
      definition: 'Explain friction in local context.',
      code: 'OP-C1',
    });

    expect(concept.name).toBe('Operational concept');

    const updated = updateConceptSchema.parse({
      definition: 'Updated definition',
      lastKnownUpdatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(updated.definition).toBe('Updated definition');

    const reordered = reorderTopicConceptsSchema.parse({
      orderedMappingIds: ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'],
      lastKnownTopicUpdatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(reordered.orderedMappingIds).toHaveLength(1);
  });

  it('validates project implementation reorder and visibility concurrency payloads', () => {
    const reordered = reorderProjectImplementationsSchema.parse({
      orderedImplementationIds: ['bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'],
      lastKnownProjectUpdatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(reordered.orderedImplementationIds).toHaveLength(1);

    const visibility = updateVisibilitySchema.parse({
      showProgrammeComponents: true,
      showTools: true,
      showResources: true,
      showProjects: true,
      showLearningOutcomes: true,
      showTeacherNotes: true,
      showStudentNotes: true,
      visibleToTeachers: true,
      visibleToLearners: false,
      visibleToGuardians: false,
      lastKnownUpdatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(visibility.showResources).toBe(true);
  });
});
