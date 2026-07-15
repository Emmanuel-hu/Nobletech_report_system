import { describe, expect, it } from 'vitest';

import { sourceProcessingService } from '../src/services/source-processing.service';
import {
  createProcessingSessionSchema,
  createSectionSchema,
  createStructuredRecordSchema,
  reorderSectionsSchema,
} from '../src/validators/source-processing.validator';

describe('Source processing service surface', () => {
  it('exposes session lifecycle operations', () => {
    expect(typeof sourceProcessingService.listProcessingSessions).toBe('function');
    expect(typeof sourceProcessingService.createProcessingSession).toBe('function');
    expect(typeof sourceProcessingService.getProcessingSession).toBe('function');
    expect(typeof sourceProcessingService.updateProcessingSession).toBe('function');
    expect(typeof sourceProcessingService.submitForReview).toBe('function');
    expect(typeof sourceProcessingService.requestRevision).toBe('function');
    expect(typeof sourceProcessingService.approve).toBe('function');
    expect(typeof sourceProcessingService.reject).toBe('function');
    expect(typeof sourceProcessingService.complete).toBe('function');
    expect(typeof sourceProcessingService.archive).toBe('function');
  });

  it('exposes section and structured-record operations', () => {
    expect(typeof sourceProcessingService.listSections).toBe('function');
    expect(typeof sourceProcessingService.createSection).toBe('function');
    expect(typeof sourceProcessingService.updateSection).toBe('function');
    expect(typeof sourceProcessingService.deleteSection).toBe('function');
    expect(typeof sourceProcessingService.reorderSections).toBe('function');
    expect(typeof sourceProcessingService.moveSection).toBe('function');
    expect(typeof sourceProcessingService.createStructuredRecordFromSection).toBe('function');
    expect(typeof sourceProcessingService.listStructuredRecords).toBe('function');
  });
});

describe('Source processing validators', () => {
  it('accepts valid session creation payload', () => {
    const parsed = createProcessingSessionSchema.safeParse({
      curriculumSourceFileId: '11111111-1111-1111-1111-111111111111',
      notes: 'Manual extraction kickoff',
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects section payload with invalid page range', () => {
    const parsed = createSectionSchema.safeParse({
      sectionType: 'UNIT',
      heading: 'Unit 1',
      rawText: 'Foundational ideas',
      pageStart: 10,
      pageEnd: 2,
    });

    expect(parsed.success).toBe(false);
  });

  it('requires full section id set for reorder payload', () => {
    const parsed = reorderSectionsSchema.safeParse({
      orderedSectionIds: ['11111111-1111-1111-1111-111111111111'],
      lastKnownSessionUpdatedAt: '2026-07-15T12:00:00.000Z',
    });

    expect(parsed.success).toBe(true);
  });

  it('accepts typed-record creation payload for manual extraction', () => {
    const parsed = createStructuredRecordSchema.safeParse({
      contentType: 'UNIT',
      heading: 'Unit 2',
      rawText: 'Manual extraction text',
      lastKnownSectionUpdatedAt: '2026-07-15T12:00:00.000Z',
    });

    expect(parsed.success).toBe(true);
  });
});
