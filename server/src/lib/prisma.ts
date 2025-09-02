import { PrismaClient } from '@prisma/client';
import { config } from './config.js';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient();

if (config.server.nodeEnv !== 'production') {
  globalThis.__prisma = prisma;
}