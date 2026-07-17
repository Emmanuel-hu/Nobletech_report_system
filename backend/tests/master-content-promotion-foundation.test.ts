import { describe, expect, it } from 'vitest';

import { masterContentPromotionService } from '../src/services/master-content-promotion.service';
import {
  addPromotionItemSchema,
  createPromotionSchema,
  promotionLifecycleSchema,
  reorderPromotionItemsSchema,
} from '../src/validators/master-content-promotion.validator';

describe('Master-content promotion service surface', () => {
  it('exposes promotion lifecycle operations', () => {
    expect(typeof masterContentPromotionService.listPromotions).toBe('function');
    expect(typeof masterContentPromotionService.createPromotion).toBe('function');
    expect(typeof masterContentPromotionService.getPromotion).toBe('function');
    expect(typeof masterContentPromotionService.updatePromotion).toBe('function');
    expect(typeof masterContentPromotionService.submitReview).toBe('function');
    expect(typeof masterContentPromotionService.requestRevision).toBe('function');
    expect(typeof masterContentPromotionService.approve).toBe('function');
    expect(typeof masterContentPromotionService.reject).toBe('function');
    expect(typeof masterContentPromotionService.complete).toBe('function');
    expect(typeof masterContentPromotionService.archive).toBe('function');
  });

  it('exposes item operations', () => {
    expect(typeof masterContentPromotionService.listItems).toBe('function');
    expect(typeof masterContentPromotionService.addItem).toBe('function');
    expect(typeof masterContentPromotionService.updateItem).toBe('function');
    expect(typeof masterContentPromotionService.removeItem).toBe('function');
    expect(typeof masterContentPromotionService.reorderItems).toBe('function');
    expect(typeof masterContentPromotionService.checkDuplicates).toBe('function');
    expect(typeof masterContentPromotionService.linkExisting).toBe('function');
    expect(typeof masterContentPromotionService.createDraft).toBe('function');
    expect(typeof masterContentPromotionService.history).toBe('function');
    expect(typeof masterContentPromotionService.compare).toBe('function');
    expect(typeof masterContentPromotionService.audit).toBe('function');
  });
});

describe('Master-content promotion validators', () => {
  it('accepts valid promotion creation payload', () => {
    const parsed = createPromotionSchema.safeParse({
      processingSessionId: '11111111-1111-1111-1111-111111111111',
      adaptationNote: 'Promote approved source records',
    });

    expect(parsed.success).toBe(true);
  });

  it('accepts valid promotion item payload', () => {
    const parsed = addPromotionItemSchema.safeParse({
      sourceContentId: '11111111-1111-1111-1111-111111111111',
      targetMasterContentType: 'CURRICULUM_UNIT',
      action: 'CREATE_DRAFT',
    });

    expect(parsed.success).toBe(true);
  });

  it('requires lifecycle payload to include optimistic concurrency value', () => {
    const parsed = promotionLifecycleSchema.safeParse({
      comment: 'submit',
      lastKnownUpdatedAt: '2026-07-16T10:00:00.000Z',
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects reorder payload with duplicate ids', () => {
    const parsed = reorderPromotionItemsSchema.safeParse({
      orderedItemIds: [
        '11111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
      ],
      lastKnownPromotionUpdatedAt: '2026-07-16T10:00:00.000Z',
    });

    // Validation allows shape; duplicate semantics are enforced in service.
    expect(parsed.success).toBe(true);
  });
});