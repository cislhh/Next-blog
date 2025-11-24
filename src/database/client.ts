import { PrismaClient } from '../../node_modules/.prisma/client';
import { truncateExt } from './extensions/truncate';

const baseClient = new PrismaClient()

const prisma = baseClient.$extends(
    truncateExt('sqlite', {
        resetSequence: false,
    }),
);

export { prisma };