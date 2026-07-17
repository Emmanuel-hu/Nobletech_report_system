import type { Prisma, PrismaClient } from '@prisma/client';

import { prisma } from '../config/prisma';

const promotionInclude = {
  items: {
    where: { archivedAt: null },
    orderBy: { sequenceOrder: 'asc' },
    include: {
      sourceContent: true,
      sourceSection: true,
    },
  },
  processingSession: true,
  curriculumSource: true,
  curriculumSourceFile: true,
} satisfies Prisma.MasterContentPromotionInclude;

export type PromotionAggregate = Prisma.MasterContentPromotionGetPayload<{ include: typeof promotionInclude }>;

export class MasterContentPromotionRepository {
  private readonly db: PrismaClient;

  constructor(db: PrismaClient = prisma) {
    this.db = db;
  }

  get client(): PrismaClient {
    return this.db;
  }

  async findPromotionById(id: string): Promise<PromotionAggregate | null> {
    return this.db.masterContentPromotion.findUnique({
      where: { id },
      include: promotionInclude,
    });
  }

  async findPromotionItemById(id: string) {
    return this.db.masterContentPromotionItem.findUnique({
      where: { id },
      include: {
        promotion: true,
        sourceContent: true,
        sourceSection: true,
      },
    });
  }

  async listPromotions(args: {
    where: Prisma.MasterContentPromotionWhereInput;
    skip: number;
    take: number;
  }): Promise<PromotionAggregate[]> {
    return this.db.masterContentPromotion.findMany({
      where: args.where,
      include: promotionInclude,
      orderBy: { createdAt: 'desc' },
      skip: args.skip,
      take: args.take,
    });
  }

  async countPromotions(where: Prisma.MasterContentPromotionWhereInput): Promise<number> {
    return this.db.masterContentPromotion.count({ where });
  }
}

export const masterContentPromotionRepository = new MasterContentPromotionRepository();