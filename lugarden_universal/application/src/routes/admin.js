import { Router } from 'express';
import crypto from 'node:crypto';
import { getPrismaClient } from '../persistence/prismaClient.js';
import { mapZhouProjectsToPublicProjects } from '../services/mappers.js';
import { invalidate } from '../utils/cache.js';

const router = Router();

// 简易鉴权中间件（与 server.js 约定一致的 401 envelope）
router.use((req, res, next) => {
  if (req.session && req.session.isAuthenticated) return next();
  return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '需要认证' } });
});
// ============ Universe 管理（Phase 2 - New） ============

// GET /api/admin/universes
router.get('/universes', async (_req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const universes = await prisma.universe.findMany({ orderBy: { createdAt: 'asc' } });
    return res.json(universes.map(u => ({
      id: u.id,
      name: u.name,
      code: u.code,
      type: u.type,
      description: u.description ?? '',
      status: u.status ?? 'draft',
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    })));
  } catch (err) { return next(err); }
});

// POST /api/admin/universes
router.post('/universes', async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const { name, code, type, description } = req.body || {};
    if (!name || !code || !type) {
      const e = new Error('name, code, type 为必填字段'); e.statusCode = 400; e.code = 'BAD_REQUEST'; throw e;
    }
    const created = await prisma.universe.create({
      data: { id: crypto.randomUUID(), name, code, type, description: description ?? '' },
    });
    return res.status(201).json({
      id: created.id,
      name: created.name,
      code: created.code,
      type: created.type,
      description: created.description ?? '',
      status: created.status ?? 'draft',
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  } catch (err) {
    // Prisma 唯一键冲突
    if (err?.code === 'P2002') {
      err.statusCode = 400; err.code = 'BAD_REQUEST'; err.message = 'code 已存在';
    }
    return next(err);
  }
});

// PUT /api/admin/universes/:id
router.put('/universes/:id', async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const { id } = req.params;
    const { name, code, type, description, status } = req.body || {};
    const data = {};
    if (name !== undefined) data.name = name;
    if (code !== undefined) data.code = code;
    if (type !== undefined) data.type = type;
    if (description !== undefined) data.description = description ?? '';
    if (status !== undefined) {
      const allowed = ['draft', 'published'];
      if (!allowed.includes(String(status))) { const e = new Error('无效的 status'); e.statusCode=400; e.code='BAD_REQUEST'; throw e; }
      data.status = status;
    }
    const updated = await prisma.universe.update({ where: { id }, data });
    return res.json({
      id: updated.id,
      name: updated.name,
      code: updated.code,
      type: updated.type,
      description: updated.description ?? '',
      status: updated.status ?? 'draft',
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (err) {
    if (err?.code === 'P2025') { err.statusCode = 404; err.code = 'NOT_FOUND'; err.message = 'Universe 不存在'; }
    if (err?.code === 'P2002') { err.statusCode = 400; err.code = 'BAD_REQUEST'; err.message = 'code 已存在'; }
    return next(err);
  }
});

// DELETE /api/admin/universes/:id
router.delete('/universes/:id', async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const { id } = req.params;
    const { superAdminPassword } = req.body || {};
    
    // 验证超级管理员密码
    if (!superAdminPassword) {
      const e = new Error('需要超级管理员密码'); e.statusCode = 400; e.code = 'SUPER_ADMIN_PASSWORD_REQUIRED'; throw e;
    }
    
    // 超级管理员密码验证（这里使用环境变量或配置文件中的密码）
    const expectedPassword = process.env.SUPER_ADMIN_PASSWORD || 'lu_garden_super_admin_2024';
    if (superAdminPassword !== expectedPassword) {
      const e = new Error('超级管理员密码错误'); e.statusCode = 403; e.code = 'SUPER_ADMIN_PASSWORD_INCORRECT'; throw e;
    }
    
    // 获取宇宙信息用于日志
    const universe = await prisma.universe.findUnique({ where: { id } });
    if (!universe) {
      const e = new Error('Universe 不存在'); e.statusCode = 404; e.code = 'NOT_FOUND'; throw e;
    }
    
    // 检查是否有关联数据
    const relatedDataCounts = await Promise.all([
      prisma.zhouProject.count({ where: { universeId: id } }),
      prisma.maoxiaodouPoem.count({ where: { universeId: id } }),
      prisma.crossUniverseContentLink.count({ 
        where: { 
          OR: [
            { sourceUniverseId: id },
            { targetUniverseId: id }
          ]
        } 
      })
    ]);
    
    const [zhouProjects, maoxiaodouPoems, crossLinks] = relatedDataCounts;
    const totalRelatedData = zhouProjects + maoxiaodouPoems + crossLinks;
    
    if (totalRelatedData > 0) {
      console.warn(`删除宇宙 ${universe.name} (${id}) 将同时删除 ${totalRelatedData} 条关联数据`);
    }
    
    // 执行删除（Prisma 会自动处理外键约束）
    await prisma.universe.delete({ where: { id } });
    
    console.log(`宇宙 ${universe.name} (${id}) 已删除，同时删除了 ${totalRelatedData} 条关联数据`);
    return res.status(204).send();
  } catch (err) {
    if (err?.code === 'P2025') { err.statusCode = 404; err.code = 'NOT_FOUND'; err.message = 'Universe 不存在'; }
    if (err?.code === 'P2003') { err.statusCode = 400; err.code = 'FOREIGN_KEY_CONSTRAINT'; err.message = '无法删除：存在关联数据，请先清理关联数据'; }
    return next(err);
  }
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
    for (const m of mappings) {
      // 支持新的meaning字段，保持向后兼容
      resultMap[m.combination] = {
        poemTitle: m.poemTitle,
        ...(m.meaning && { meaning: m.meaning })
      };
    }

    const poems = await prisma.zhouPoem.findMany({ where: { chapter: subProjectName }, orderBy: { title: 'asc' } });
    const poemsArr = poems.map((p) => {
      // 处理新的JSON格式body字段
      let bodyContent = '';
      if (p.body) {
        if (typeof p.body === 'string') {
          // 向后兼容：如果body仍然是字符串格式
          bodyContent = p.body;
        } else if (typeof p.body === 'object' && p.body !== null) {
          // 新的JSON格式：提取主要文本内容
          const { quote_text, quote_citation, main_text } = p.body;
          const parts = [];
          if (quote_text) parts.push(quote_text);
          if (quote_citation) parts.push(`——${quote_citation}`);
          if (main_text) parts.push(main_text);
          bodyContent = parts.join('\n\n');
        }
      }
      return { id: p.title, title: p.title, body: bodyContent };
    });

    return res.json({ name: subProjectName, questions, resultMap, poems: poemsArr });
  } catch (err) { return next(err); }
});

// GET /api/admin/projects/:projectId/sub - 获取项目的所有子项目
router.get('/projects/:projectId/sub', async (req, res, next) => {
  const { projectId } = req.params;
  try {
    const prisma = getPrismaClient();
    const subProjects = await prisma.zhouSubProject.findMany({
      where: { projectId },
      orderBy: { name: 'asc' }
    });
    
    // 构建子项目数据结构
    const result = {};
    for (const sub of subProjects) {
      result[sub.name] = {
        description: sub.description || '',
        poems: [],
        questions: [],
        mappings: []
      };
      
      // 获取诗歌
      const poems = await prisma.zhouPoem.findMany({
        where: { subProjectId: sub.id },
        orderBy: { title: 'asc' }
      });
      result[sub.name].poems = poems.map(p => {
        // 处理新的JSON格式body字段
        let bodyContent = '';
        if (p.body) {
          if (typeof p.body === 'string') {
            // 向后兼容：如果body仍然是字符串格式
            bodyContent = p.body;
          } else if (typeof p.body === 'object' && p.body !== null) {
            // 新的JSON格式：提取主要文本内容
            const { quote_text, quote_citation, main_text } = p.body;
            const parts = [];
            if (quote_text) parts.push(quote_text);
            if (quote_citation) parts.push(`——${quote_citation}`);
            if (main_text) parts.push(main_text);
            bodyContent = parts.join('\n\n');
          }
        }
        return {
          id: p.title,
          title: p.title,
          content: bodyContent
        };
      });
      
      // 获取问题
      const qas = await prisma.zhouQA.findMany({
        where: { subProjectId: sub.id },
        orderBy: { index: 'asc' }
      });
      result[sub.name].questions = qas.map(q => ({
        question: q.question,
        answer: q.optionA || q.optionB || ''
      }));
      
      // 获取映射
      const mappings = await prisma.zhouMapping.findMany({
        where: { subProjectId: sub.id }
      });
      result[sub.name].mappings = mappings.map(m => ({
        key: m.combination,
        value: m.poemTitle,
        ...(m.meaning && { meaning: m.meaning })
      }));
    }
    
    return res.json(result);
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
      for (const [combo, mappingData] of Object.entries(resultMap || {})) {
        // 支持新的meaning字段，保持向后兼容
        let poemTitle, meaning;
        if (typeof mappingData === 'string') {
          // 向后兼容：如果只是字符串（poemTitle）
          poemTitle = mappingData;
          meaning = null;
        } else if (typeof mappingData === 'object' && mappingData !== null) {
          // 新的格式：包含poemTitle和可选的meaning
          poemTitle = mappingData.poemTitle || mappingData.value || '';
          meaning = mappingData.meaning || null;
        } else {
          poemTitle = '';
          meaning = null;
        }
        
        await tx.zhouMapping.create({ 
          data: { 
            id: crypto.randomUUID(), 
            chapter: sub.name, 
            combination: combo, 
            poemTitle: poemTitle, 
            meaning: meaning,
            universeId, 
            subProjectId: sub.id 
          } 
        });
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
  const { title, body, quote_text, quote_citation, main_text } = req.body;
  if (!title) { const e=new Error('诗歌标题不能为空'); e.statusCode=400; e.code='BAD_REQUEST'; return next(e); }
  
  // 构建body数据：支持新的JSON格式或传统字符串格式
  let bodyData = null;
  if (quote_text || quote_citation || main_text) {
    // 新的JSON格式
    bodyData = {
      quote_text: quote_text || null,
      quote_citation: quote_citation || null,
      main_text: main_text || null
    };
  } else if (body) {
    // 传统字符串格式（向后兼容）
    bodyData = body;
  } else {
    const e = new Error('诗歌内容不能为空'); e.statusCode = 400; e.code = 'BAD_REQUEST'; return next(e);
  }
  
  try {
    const sub = await prisma.zhouSubProject.findFirst({ where: { projectId, name: subProjectName } });
    if (!sub) { const e=new Error('子项目不存在'); e.statusCode=404; e.code='NOT_FOUND'; throw e; }
    const universeId = await getZhouUniverseId(prisma);
    const created = await prisma.zhouPoem.create({ data: { id: crypto.randomUUID(), title, chapter: sub.name, body: bodyData, universeId, subProjectId: sub.id } });
    invalidate(['/api/admin/projects', '/api/poems-all']);
    res.status(201).json({ id: created.title, title: created.title, body: created.body ?? '' });
  } catch (err) { next(err); }
});

// 更新诗歌
router.put('/projects/:projectId/sub/:subProjectName/poems/:poemId', async (req, res, next) => {
  const prisma = getPrismaClient();
  const { projectId, subProjectName, poemId } = req.params;
  const { title, body, quote_text, quote_citation, main_text } = req.body;
  if (!title) { const e=new Error('诗歌标题不能为空'); e.statusCode=400; e.code='BAD_REQUEST'; return next(e); }
  
  // 构建body数据：支持新的JSON格式或传统字符串格式
  let bodyData = null;
  if (quote_text || quote_citation || main_text) {
    // 新的JSON格式
    bodyData = {
      quote_text: quote_text || null,
      quote_citation: quote_citation || null,
      main_text: main_text || null
    };
  } else if (body) {
    // 传统字符串格式（向后兼容）
    bodyData = body;
  } else {
    const e = new Error('诗歌内容不能为空'); e.statusCode = 400; e.code = 'BAD_REQUEST'; return next(e);
  }
  
  try {
    const sub = await prisma.zhouSubProject.findFirst({ where: { projectId, name: subProjectName } });
    if (!sub) { const e=new Error('子项目不存在'); e.statusCode=404; e.code='NOT_FOUND'; throw e; }
    // poemId 为旧标题
    const poem = await prisma.zhouPoem.findFirst({ where: { subProjectId: sub.id, title: poemId } });
    if (!poem) { const e=new Error('未找到诗歌'); e.statusCode=404; e.code='NOT_FOUND'; throw e; }
    const updated = await prisma.zhouPoem.update({ where: { id: poem.id }, data: { title, body: bodyData } });
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


