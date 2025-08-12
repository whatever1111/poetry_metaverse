// Prisma Client singleton (ESM)
// 惰性动态加载，避免在未生成客户端时的模块导入报错，便于文件回退逻辑生效

let prismaInstance = null;

export function getPrismaClient() {
  if (prismaInstance) return prismaInstance;
  try {
    // 使用惰性 require 以避免静态导入时抛错
    // eslint-disable-next-line no-eval
    const req = eval('require');
    const { PrismaClient } = req('@prisma/client');
    prismaInstance = new PrismaClient();
    return prismaInstance;
  } catch (err) {
    const e = new Error('PRISMA_CLIENT_NOT_READY');
    e.code = 'PRISMA_CLIENT_NOT_READY';
    e.cause = err;
    throw e;
  }
}


