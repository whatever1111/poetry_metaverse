// Prisma Client singleton (ESM)
// 标准导入方式，避免自定义生成路径不一致的风险

import { PrismaClient } from '@prisma/client';

let prismaInstance = null;

export function getPrismaClient() {
  if (prismaInstance) return prismaInstance;
  try {
    prismaInstance = new PrismaClient();
    return prismaInstance;
  } catch (err) {
    // 在未生成 Prisma Client 时给出明确提示
    throw new Error('Prisma Client 未生成或初始化失败。请先运行: npx prisma generate');
  }
}


