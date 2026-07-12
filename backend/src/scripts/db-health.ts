import { Prisma } from '@prisma/client';

import { env } from '../config/env';
import { prisma } from '../config/prisma';

const run = async (): Promise<void> => {
  void env;

  await prisma.$connect();
  await prisma.$queryRaw(Prisma.sql`SELECT 1`);
  await prisma.$disconnect();

  console.log('[NEMP] Database connection check passed.');
};

run().catch(async (error: unknown) => {
  await prisma.$disconnect();
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[NEMP] Database connection check failed: ${message}`);
  process.exit(1);
});
