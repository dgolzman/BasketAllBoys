import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query'],
    });

import { startScheduler } from './scheduler';

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Start background cron jobs exactly once in the DB client instantiation
if (typeof window === 'undefined') {
    startScheduler();
}
