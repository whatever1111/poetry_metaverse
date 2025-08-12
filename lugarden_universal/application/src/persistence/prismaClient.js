// Prisma Client singleton (ESM)
// 延后在路由真正接入前不会被引用，避免对现有行为造成影响

let prismaInstance = null;

export function getPrismaClient() {
  if (prismaInstance) return prismaInstance;
  // 动态导入以避免在未生成客户端时抛错
  // 生成路径：application/generated/prisma (见 prisma/schema.prisma)
  // 注意：首次真正使用前需确保已执行 `npm run db:generate`
  const { PrismaClient } = requireGeneratedClient();
  prismaInstance = new PrismaClient();
  return prismaInstance;
}

function requireGeneratedClient() {
  try {
    // ESM 环境下允许省略后缀
    // 相对当前文件：../../generated/prisma
    // eslint-disable-next-line import/no-unresolved
    // 动态构造避免在构建期解析
    return requireFrom('../../generated/prisma/index.js');
  } catch (err) {
    throw new Error('Prisma Client 未生成。请先运行: npx prisma generate');
  }
}

function requireFrom(path) {
  // 在 ESM 中使用动态 import 以避免静态解析
  // 这里返回一个“同步”外观的对象，仅在 getPrismaClient 调用时执行
  // 调用方在实际接入时应改为直接静态 import
  // 为当前占位阶段最小改动
  // eslint-disable-next-line no-eval
  const mod = eval('require');
  return mod(path);
}


