import { PrismaClient } from '@prisma/client';

// Create and export a single Prisma Client instance
export const prisma = new PrismaClient();

export default prisma;
