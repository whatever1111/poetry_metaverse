import { Router } from 'express';
import { getPrismaClient } from '../persistence/prismaClient.js';
import { mapZhouProjectsToPublicProjects } from '../services/mappers.js';
import { invalidate } from '../utils/cache.js';

const router = Router();

// 简易鉴权中间件（与 server.js 约定一致的 401 envelope）
router.use((req, res, next) => {
  if (req.session && req.session.isAuthenticated) return next();
  return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '需要认证' } });
});

// 移除所有文件回退相关常量与逻辑

// GET /api/admin/projects （DB）
router.get('/projects', async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const projects = await prisma.zhouProject.findMany({
      orderBy: { name: 'asc' },
      include: {
        subProjects: {
          select: { name: true, description: true },
          orderBy: { name: 'asc' },
        },
      },
    });
    const mapped = mapZhouProjectsToPublicProjects(projects);
    return res.json(mapped);
  } catch (err) { return next(err); }
});

// GET /api/admin/projects/:projectId/sub/:subProjectName （DB 优先，失败回退到草稿文件）
router.get('/projects/:projectId/sub/:subProjectName', async (req, res, next) => {
  const { subProjectName } = req.params;
  try {
    const prisma = getPrismaClient();
    const qas = await prisma.zhouQA.findMany({ where: { chapter: subProjectName }, orderBy: { index: 'asc' } });
    const questions = qas.map((q) => ({
      question: q.question,
      options: { A: q.optionA ?? '', B: q.optionB ?? '' },
      meaning: { A: q.meaningA ?? '', B: q.meaningB ?? '' },
    }));

    const mappings = await prisma.zhouMapping.findMany({ where: { chapter: subProjectName } });
    const resultMap = {};
    for (const m of mappings) resultMap[m.combination] = m.poemTitle;

    const poems = await prisma.zhouPoem.findMany({ where: { chapter: subProjectName }, orderBy: { title: 'asc' } });
    const poemsArr = poems.map((p) => ({ id: p.title, title: p.title, body: p.body ?? '' }));

    return res.json({ name: subProjectName, questions, resultMap, poems: poemsArr });
  } catch (err) { return next(err); }
});

export default router;

// ============ 写接口（DB 落库，移除文件写） ============

async function getZhouUniverseId(prisma) {
  // 优先通过 code 查找；若不存在，退化采用第一条 Universe 或抛错
  const universe = await prisma.universe.findFirst({ where: { code: { in: ['universe_zhou_spring_autumn', 'zhou_spring_autumn', 'zhou'] } } });
  if (universe) return universe.id;
  const any = await prisma.universe.findFirst();
  if (any) return any.id;
  const err = new Error('未找到可用的 Universe');
  err.statusCode = 500;
  err.code = 'INTERNAL_SERVER_ERROR';
  throw err;
}

async function getAdminProjectShape(prisma, projectId) {
  const project = await prisma.zhouProject.findUnique({
    where: { id: projectId },
    include: {
      subProjects: {
        select: { name: true, description: true },
        orderBy: { name: 'asc' },
      },
    },
  });
  const [mapped] = mapZhouProjectsToPublicProjects([project]);
  return mapped;
}

// 创建项目
router.post('/projects', async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const { name, description, poet } = req.body;
    if (!name) {
      const err = new Error('项目名称不能为空');
      err.statusCode = 400; err.code = 'BAD_REQUEST';
      throw err;
    }
    const universeId = await getZhouUniverseId(prisma);
    const created = await prisma.zhouProject.create({
      data: { id: crypto.randomUUID(), name, description: description ?? '', poet: poet ?? '', status: 'draft', universeId },
    });
    res.status(201).json({ id: created.id, name: created.name, description: created.description, poet: created.poet, status: created.status, subProjects: [] });
  } catch (err) { next(err); }
});

// 更新项目
router.put('/projects/:projectId', async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const { projectId } = req.params;
    const { name, description, poet } = req.body;
    if (!name) { const e = new Error('项目名称不能为空'); e.statusCode=400; e.code='BAD_REQUEST'; throw e; }
    await prisma.zhouProject.update({ where: { id: projectId }, data: { name, description: description ?? '', poet: poet ?? '' } });
    const shaped = await getAdminProjectShape(prisma, projectId);
    res.json(shaped);
  } catch (err) { next(err); }
});

// 切换项目状态（发布/下架）
router.put('/projects/:projectId/status', async (req, res, next) => {
  const prisma = getPrismaClient();
  const { projectId } = req.params;
  const { status } = req.body;
  if (!status || !['draft','published'].includes(status)) {
    const e = new Error('无效的状态值'); e.statusCode=400; e.code='BAD_REQUEST'; return next(e);
  }
  try {
    await prisma.$transaction(async (tx) => {
      await tx.zhouProject.update({ where: { id: projectId }, data: { status } });
    });
    // 失效相关缓存键（公开 projects、admin projects、questions/mappings/poems）
    invalidate(['/api/projects', '/api/admin/projects', '/api/questions', '/api/mappings', '/api/poems-all']);
    const shaped = await getAdminProjectShape(prisma, projectId);
    return res.json(shaped);
  } catch (err) { return next(err); }
});

// 删除项目（级联删除子表）
router.delete('/projects/:projectId', async (req, res, next) => {
  const prisma = getPrismaClient();
  const { projectId } = req.params;
  try {
    await prisma.$transaction(async (tx) => {
      const subs = await tx.zhouSubProject.findMany({ where: { projectId }, select: { id: true, name: true } });
      const subIds = subs.map(s => s.id);
      if (subIds.length) {
        await tx.zhouQA.deleteMany({ where: { subProjectId: { in: subIds } } });
        await tx.zhouMapping.deleteMany({ where: { subProjectId: { in: subIds } } });
        await tx.zhouPoem.deleteMany({ where: { subProjectId: { in: subIds } } });
        await tx.zhouSubProject.deleteMany({ where: { id: { in: subIds } } });
      }
      await tx.zhouProject.delete({ where: { id: projectId } });
    });
    invalidate(['/api/projects', '/api/admin/projects', '/api/questions', '/api/mappings', '/api/poems-all']);
    res.status(204).send();
  } catch (err) { next(err); }
});

// 创建子项目
router.post('/projects/:projectId/sub', async (req, res, next) => {
  const prisma = getPrismaClient();
  const { projectId } = req.params;
  const { name, description } = req.body;
  if (!name) { const e=new Error('篇章名称不能为空'); e.statusCode=400; e.code='BAD_REQUEST'; return next(e); }
  try {
    const universeId = await getZhouUniverseId(prisma);
    const created = await prisma.zhouSubProject.create({ data: { id: crypto.randomUUID(), projectId, name, description: description ?? '', universeId } });
    invalidate(['/api/admin/projects']);
    res.status(201).json({ name: created.name, description: created.description ?? '' });
  } catch (err) { next(err); }
});

// 更新子项目基本信息
router.put('/projects/:projectId/sub/:subProjectName', async (req, res, next) => {
  const prisma = getPrismaClient();
  const { projectId, subProjectName } = req.params;
  const { name, description } = req.body;
  if (!name) { const e=new Error('篇章名称不能为空'); e.statusCode=400; e.code='BAD_REQUEST'; return next(e); }
  try {
    const sub = await prisma.zhouSubProject.findFirst({ where: { projectId, name: subProjectName } });
    if (!sub) { const e=new Error('子项目不存在'); e.statusCode=404; e.code='NOT_FOUND'; throw e; }
    const updated = await prisma.zhouSubProject.update({ where: { id: sub.id }, data: { name, description: description ?? '' } });
    invalidate(['/api/admin/projects']);
    res.json({ name: updated.name, description: updated.description ?? '' });
  } catch (err) { next(err); }
});

// 覆盖更新问题列表
router.put('/projects/:projectId/sub/:subProjectName/questions', async (req, res, next) => {
  const prisma = getPrismaClient();
  const { projectId, subProjectName } = req.params;
  const { questions } = req.body;
  try {
    const sub = await prisma.zhouSubProject.findFirst({ where: { projectId, name: subProjectName } });
    if (!sub) { const e=new Error('子项目不存在'); e.statusCode=404; e.code='NOT_FOUND'; throw e; }
    const universeId = await getZhouUniverseId(prisma);
    await prisma.$transaction(async (tx) => {
      await tx.zhouQA.deleteMany({ where: { subProjectId: sub.id } });
      for (let i = 0; i < (questions || []).length; i++) {
        const q = questions[i];
        await tx.zhouQA.create({ data: {
          id: crypto.randomUUID(), chapter: sub.name, index: i + 1, question: q.question ?? '', optionA: q.options?.A ?? '', optionB: q.options?.B ?? '', meaningA: q.meaning?.A ?? '', meaningB: q.meaning?.B ?? '',
          universeId, subProjectId: sub.id,
        }});
      }
    });
    invalidate(['/api/admin/projects', '/api/questions']);
    res.status(204).send();
  } catch (err) { next(err); }
});

// 覆盖更新结果映射
router.put('/projects/:projectId/sub/:subProjectName/resultMap', async (req, res, next) => {
  const prisma = getPrismaClient();
  const { projectId, subProjectName } = req.params;
  const { resultMap } = req.body;
  try {
    const sub = await prisma.zhouSubProject.findFirst({ where: { projectId, name: subProjectName } });
    if (!sub) { const e=new Error('子项目不存在'); e.statusCode=404; e.code='NOT_FOUND'; throw e; }
    const universeId = await getZhouUniverseId(prisma);
    await prisma.$transaction(async (tx) => {
      await tx.zhouMapping.deleteMany({ where: { subProjectId: sub.id } });
      for (const [combo, poemTitle] of Object.entries(resultMap || {})) {
        await tx.zhouMapping.create({ data: { id: crypto.randomUUID(), chapter: sub.name, combination: combo, poemTitle: poemTitle, universeId, subProjectId: sub.id } });
      }
    });
    invalidate(['/api/admin/projects', '/api/mappings']);
    res.status(204).send();
  } catch (err) { next(err); }
});

// 兼容性：发布所有（DB 模式为 no-op，用于避免前端按钮 404）
router.post('/publish-all', async (_req, res) => {
  return res.status(200).json({
    message: '发布机制已切换为按项目 status 控制（draft/published）。/api/admin/publish-all 为兼容接口，不执行任何写入。',
    next: '请通过 /api/admin/projects/:projectId/status 切换状态，前台 /api/projects 自动反映 published 项目',
  });
});

// 兼容性：单项目更新（DB 模式为 no-op）
router.post('/projects/:projectId/update', async (_req, res) => {
  return res.status(200).json({ message: 'DB 实时模式下无需单独“更新到线上”。若需展示到前台，请将项目状态切换为 published。' });
});

// 新增诗歌
router.post('/projects/:projectId/sub/:subProjectName/poems', async (req, res, next) => {
  const prisma = getPrismaClient();
  const { projectId, subProjectName } = req.params;
  const { title, body } = req.body;
  if (!title || !body) { const e=new Error('诗歌标题和内容不能为空'); e.statusCode=400; e.code='BAD_REQUEST'; return next(e); }
  try {
    const sub = await prisma.zhouSubProject.findFirst({ where: { projectId, name: subProjectName } });
    if (!sub) { const e=new Error('子项目不存在'); e.statusCode=404; e.code='NOT_FOUND'; throw e; }
    const universeId = await getZhouUniverseId(prisma);
    const created = await prisma.zhouPoem.create({ data: { id: crypto.randomUUID(), title, chapter: sub.name, body, universeId, subProjectId: sub.id } });
    invalidate(['/api/admin/projects', '/api/poems-all']);
    res.status(201).json({ id: created.title, title: created.title, body: created.body ?? '' });
  } catch (err) { next(err); }
});

// 更新诗歌
router.put('/projects/:projectId/sub/:subProjectName/poems/:poemId', async (req, res, next) => {
  const prisma = getPrismaClient();
  const { projectId, subProjectName, poemId } = req.params;
  const { title, body } = req.body;
  if (!title || !body) { const e=new Error('诗歌标题和内容不能为空'); e.statusCode=400; e.code='BAD_REQUEST'; return next(e); }
  try {
    const sub = await prisma.zhouSubProject.findFirst({ where: { projectId, name: subProjectName } });
    if (!sub) { const e=new Error('子项目不存在'); e.statusCode=404; e.code='NOT_FOUND'; throw e; }
    // poemId 为旧标题
    const poem = await prisma.zhouPoem.findFirst({ where: { subProjectId: sub.id, title: poemId } });
    if (!poem) { const e=new Error('未找到诗歌'); e.statusCode=404; e.code='NOT_FOUND'; throw e; }
    const updated = await prisma.zhouPoem.update({ where: { id: poem.id }, data: { title, body } });
    invalidate(['/api/admin/projects', '/api/poems-all']);
    res.json({ id: updated.title, title: updated.title, body: updated.body ?? '' });
  } catch (err) { next(err); }
});

// 删除诗歌
router.delete('/projects/:projectId/sub/:subProjectName/poems/:poemId', async (req, res, next) => {
  const prisma = getPrismaClient();
  const { projectId, subProjectName, poemId } = req.params;
  try {
    const sub = await prisma.zhouSubProject.findFirst({ where: { projectId, name: subProjectName } });
    if (!sub) { const e=new Error('子项目不存在'); e.statusCode=404; e.code='NOT_FOUND'; throw e; }
    const poem = await prisma.zhouPoem.findFirst({ where: { subProjectId: sub.id, title: poemId } });
    if (!poem) { const e=new Error('未找到要删除的诗歌'); e.statusCode=404; e.code='NOT_FOUND'; throw e; }
    await prisma.zhouPoem.delete({ where: { id: poem.id } });
    invalidate(['/api/admin/projects', '/api/poems-all']);
    res.status(204).send();
  } catch (err) { next(err); }
});


