import { describe, expect, it } from 'vitest';

import {
  conceptIdParamSchema,
  conceptMappingIdParamSchema,
  createSourceSchema,
  createSourceContentSchema,
  deleteSourceContentSchema,
  createSourceMasterLinkSchema,
  createConceptSchema,
  createProjectImplementationSchema,
  implementationIdParamSchema,
  listMasterCatalogQuerySchema,
  listSourcesQuerySchema,
  projectOutcomeLinkIdParamSchema,
  reorderSourceContentsSchema,
  reorderProjectImplementationsSchema,
  reorderTopicConceptsSchema,
  sourceContentIdParamSchema,
  sourceIdParamSchema,
  sourceRejectActionSchema,
  sourceRevisionActionSchema,
  sourceMasterLinkIdParamSchema,
  updateSourceSchema,
  updateSourceContentSchema,
  updateSourceMasterLinkSchema,
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

  it('validates curriculum source and source content payloads', () => {
    const source = createSourceSchema.parse({
      isGlobal: true,
      title: 'Primary robotics source',
      sourceType: 'SCHOOL_SCHEME_OF_WORK',
      sourceFormat: 'PDF',
      usageRights: 'Internal educational use',
    });

    expect(source.title).toBe('Primary robotics source');

    const update = updateSourceSchema.parse({
      title: 'Updated source title',
      lastKnownUpdatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(update.title).toBe('Updated source title');

    const content = createSourceContentSchema.parse({
      contentType: 'TOPIC',
      heading: 'Week 1 orientation',
      rawText: 'Learners identify robotics components.',
      confidenceScore: 90,
    });

    expect(content.contentType).toBe('TOPIC');

    const contentUpdate = updateSourceContentSchema.parse({
      reviewed: true,
      lastKnownUpdatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(contentUpdate.reviewed).toBe(true);
  });

  it('validates source/master link and catalog query schemas', () => {
    const link = createSourceMasterLinkSchema.parse({
      masterContentType: 'concept',
      masterContentId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      sourcePage: '12',
    });

    expect(link.masterContentType).toBe('concept');

    const linkUpdate = updateSourceMasterLinkSchema.parse({
      reviewStatus: 'APPROVED',
      lastKnownUpdatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(linkUpdate.reviewStatus).toBe('APPROVED');

    const query = listMasterCatalogQuerySchema.parse({ type: 'resource', q: 'kit' });
    expect(query.type).toBe('resource');

    const sourceQuery = listSourcesQuerySchema.parse({ includeGlobal: 'true' });
    expect(sourceQuery.includeGlobal).toBe('true');

    const scopedQuery = listSourcesQuerySchema.parse({
      ownership: 'school',
      sourceFormat: 'DOCX',
      page: '2',
      pageSize: '25',
    });
    expect(scopedQuery.ownership).toBe('school');
    expect(scopedQuery.page).toBe(2);

    const revision = sourceRevisionActionSchema.parse({ requestedChanges: 'Clarify unit sequencing.' });
    expect(revision.requestedChanges).toContain('Clarify');

    const rejection = sourceRejectActionSchema.parse({ rejectionReason: 'Source does not match scope.' });
    expect(rejection.rejectionReason).toContain('scope');

    const deleteContent = deleteSourceContentSchema.parse({
      lastKnownUpdatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(deleteContent.lastKnownUpdatedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('validates source params and source content reorder payload', () => {
    const uuid = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    expect(sourceIdParamSchema.parse({ sourceId: uuid }).sourceId).toBe(uuid);
    expect(sourceContentIdParamSchema.parse({ contentId: uuid }).contentId).toBe(uuid);
    expect(sourceMasterLinkIdParamSchema.parse({ linkId: uuid }).linkId).toBe(uuid);

    const reorder = reorderSourceContentsSchema.parse({
      orderedContentIds: [uuid],
      lastKnownUpdatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(reorder.orderedContentIds).toHaveLength(1);
  });
});
