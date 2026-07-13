import { describe, expect, it } from 'vitest';

import {
  conceptMappingIdParamSchema,
  createProjectImplementationSchema,
  implementationIdParamSchema,
  projectOutcomeLinkIdParamSchema,
  topicOutcomeLinkIdParamSchema,
  topicProjectLinkIdParamSchema,
  updateProjectImplementationSchema,
  updateTopicConceptSchema,
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
  });
});
