// Prisma Client singleton (ESM)
// 使用 createRequire 以在 ESM 环境下安全加载 CJS 产物（Prisma Client）
import { createRequire } from 'module';

let prismaInstance = null;

export function getPrismaClient() {
  if (prismaInstance) return prismaInstance;
  try {
    const requireCjs = createRequire(import.meta.url);
    let PrismaClient;
    try {
      ({ PrismaClient } = requireCjs('../../generated/prisma'));
    } catch (_ignored) {
      ({ PrismaClient } = requireCjs('@prisma/client'));
    }
    prismaInstance = new PrismaClient();
    return prismaInstance;
  } catch (err) {
    const e = new Error('PRISMA_CLIENT_NOT_READY');
    e.code = 'PRISMA_CLIENT_NOT_READY';
    e.cause = err;
    throw e;
  }
}


