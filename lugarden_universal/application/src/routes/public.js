import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPrismaClient } from '../persistence/prismaClient.js';
import {
  mapZhouProjectsToPublicProjects,
  mapZhouQAToPublicQuestions,
  mapZhouMappingToPublicMappings,
  mapZhouPoemsToPublicPoems,
  mapPoemArchetypesForFrontend,
  mapUniverseContent,
} from '../services/mappers.js';
import { getCache, setCache, invalidate } from '../utils/cache.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'data', 'content');
const POEMS_DIR = path.join(ROOT, 'data', 'poems');
const DATA_DRAFT_DIR = path.join(ROOT, 'data', 'content_draft');
const POEMS_DRAFT_DIR = path.join(ROOT, 'data', 'poems_draft');
const PROJECTS_PATH = path.join(DATA_DIR, 'projects.json');
const QUESTIONS_PATH = path.join(DATA_DIR, 'questions.json');
const MAPPINGS_PATH = path.join(DATA_DIR, 'mappings.json');
const POEM_ARCHETYPES_PATH = path.join(DATA_DRAFT_DIR, 'poem_archetypes.json');

// 统一文件回退策略：默认关闭（与 server.js 保持一致）。
// 如需启用文件回退（紧急应急），设置环境变量 FALLBACK_TO_FS=1
const FALLBACK_TO_FS = (process.env.FALLBACK_TO_FS ?? '0') !== '0';

function fileFallbackError(message) {
  const err = new Error(message);
  err.statusCode = 500;
  err.code = 'INTERNAL_SERVER_ERROR';
  return err;
}

// GET /api/universes - 返回所有已发布的宇宙列表
router.get('/universes', async (req, res, next) => {
  const cacheKey = '/api/universes';
  if (req.query.refresh === 'true') invalidate([cacheKey]);
  const cached = getCache(cacheKey);
  if (cached !== undefined) return res.json(cached);
  
  try {
    const prisma = getPrismaClient();
    const universes = await prisma.universe.findMany({
      where: {
        status: 'published'
      },
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    setCache(cacheKey, universes);
    return res.json(universes);
  } catch (dbErr) {
    return next(fileFallbackError('无法加载宇宙列表'));
  }
});

// GET /api/universes/:universeCode/content - 获取特定宇宙的内容聚合
router.get('/universes/:universeCode/content', async (req, res, next) => {
  const { universeCode } = req.params;
  const cacheKey = `/api/universes/${universeCode}/content`;
  if (req.query.refresh === 'true') invalidate([cacheKey]);
  const cached = getCache(cacheKey);
  if (cached !== undefined) return res.json(cached);
  
  try {
    const prisma = getPrismaClient();
    
    // 获取宇宙信息
    const universe = await prisma.universe.findFirst({
      where: {
        code: universeCode,
        status: 'published'
      }
    });
    
    if (!universe) {
      return res.status(404).json({ error: '宇宙不存在或未发布' });
    }
    
    // 根据宇宙类型聚合内容
    if (universe.type === 'zhou_spring_autumn') {
      // 获取周与春秋宇宙的内容
      const [projects, qas, mappings, poems, poemArchetypes] = await Promise.all([
        prisma.zhouProject.findMany({
          where: { universeId: universe.id },
          include: { subProjects: { select: { name: true, description: true } } }
        }),
        prisma.zhouQA.findMany({
          where: { universeId: universe.id }
        }),
        prisma.zhouMapping.findMany({
          where: { universeId: universe.id }
        }),
        prisma.zhouPoem.findMany({
          where: { universeId: universe.id }
        }),
        prisma.zhouPoem.findMany({
          where: { universeId: universe.id },
          select: { title: true, poetExplanation: true }
        })
      ]);
      
      // 映射数据
      const mappedProjects = mapZhouProjectsToPublicProjects(projects).filter(
        (p) => (p.status || '').toLowerCase() === 'published'
      );
      const mappedQAs = mapZhouQAToPublicQuestions(qas);
      const mappedMappings = mapZhouMappingToPublicMappings(mappings);
      const mappedPoems = mapZhouPoemsToPublicPoems(poems);
      const mappedArchetypes = mapPoemArchetypesForFrontend(poemArchetypes);
      
      const result = mapUniverseContent(
        universe,
        mappedProjects,
        mappedQAs,
        mappedMappings,
        mappedPoems,
        mappedArchetypes
      );
      
      setCache(cacheKey, result);
      return res.json(result);
    } else {
      // 其他宇宙类型的占位符
      const result = mapUniverseContent(universe, [], {}, { defaultUnit: '', units: {} }, {}, { poems: [] });
      setCache(cacheKey, result);
      return res.json(result);
    }
  } catch (dbErr) {
    return next(fileFallbackError(`无法加载宇宙 ${universeCode} 的内容`));
  }
});

// GET /api/projects - [DEPRECATED] 使用 /api/universes/:universeCode/content 替代
router.get('/projects', async (req, res, next) => {
  // 返回废弃提示，但保持向后兼容
  res.set('Warning', '299 - "This API is deprecated. Use /api/universes/zhou/content instead."');
  
  const cacheKey = '/api/projects';
  if (req.query.refresh === 'true') invalidate([cacheKey]);
  const cached = getCache(cacheKey);
  if (cached !== undefined) return res.json(cached);
  try {
    const prisma = getPrismaClient();
    const zhouProjects = await prisma.zhouProject.findMany({
      include: { subProjects: { select: { name: true, description: true } } },
    });
    const mapped = mapZhouProjectsToPublicProjects(zhouProjects).filter(
      (p) => (p.status || '').toLowerCase() === 'published'
    );
    setCache(cacheKey, mapped);
    return res.json(mapped);
  } catch (dbErr) {
    if (!FALLBACK_TO_FS) return next(fileFallbackError('无法加载项目结构'));
    // 若 Prisma 客户端不可用或查询失败，回退至文件
    try {
      const projectsData = await fs.readFile(PROJECTS_PATH, 'utf-8');
      const projectsJson = JSON.parse(projectsData);
      const all = projectsJson.projects || [];
      const publishedOnly = all.filter((p) => (p.status || '').toLowerCase() === 'published');
      setCache(cacheKey, publishedOnly);
      return res.json(publishedOnly);
    } catch (fsErr) {
      return next(fileFallbackError('无法加载项目结构'));
    }
  }
});

// GET /api/questions - [DEPRECATED] 使用 /api/universes/:universeCode/content 替代
router.get('/questions', async (req, res, next) => {
  // 返回废弃提示，但保持向后兼容
  res.set('Warning', '299 - "This API is deprecated. Use /api/universes/zhou/content instead."');
  
  const cacheKey = '/api/questions';
  if (req.query.refresh === 'true') invalidate([cacheKey]);
  const cached = getCache(cacheKey);
  if (cached !== undefined) return res.json(cached);
  try {
    const prisma = getPrismaClient();
    const qas = await prisma.zhouQA.findMany();
    const mapped = mapZhouQAToPublicQuestions(qas);
    setCache(cacheKey, mapped);
    return res.json(mapped);
  } catch (dbErr) {
    if (!FALLBACK_TO_FS) return next(fileFallbackError('Failed to read questions'));
    try {
      const questionsData = await fs.readFile(QUESTIONS_PATH, 'utf-8');
      const json = JSON.parse(questionsData);
      setCache(cacheKey, json);
      return res.json(json);
    } catch (fsErr) {
      return next(fileFallbackError('Failed to read questions'));
    }
  }
});

// GET /api/mappings - [DEPRECATED] 使用 /api/universes/:universeCode/content 替代
router.get('/mappings', async (req, res, next) => {
  // 返回废弃提示，但保持向后兼容
  res.set('Warning', '299 - "This API is deprecated. Use /api/universes/zhou/content instead."');
  
  const cacheKey = '/api/mappings';
  if (req.query.refresh === 'true') invalidate([cacheKey]);
  const cached = getCache(cacheKey);
  if (cached !== undefined) return res.json(cached);
  try {
    const prisma = getPrismaClient();
    const mappings = await prisma.zhouMapping.findMany();
    const mapped = mapZhouMappingToPublicMappings(mappings);
    setCache(cacheKey, mapped);
    return res.json(mapped);
  } catch (dbErr) {
    if (!FALLBACK_TO_FS) return next(fileFallbackError('Failed to read mappings'));
    try {
      const mappingsData = await fs.readFile(MAPPINGS_PATH, 'utf-8');
      const json = JSON.parse(mappingsData);
      setCache(cacheKey, json);
      return res.json(json);
    } catch (fsErr) {
      return next(fileFallbackError('Failed to read mappings'));
    }
  }
});

// GET /api/poems-all - [DEPRECATED] 使用 /api/universes/:universeCode/content 替代
router.get('/poems-all', async (req, res, next) => {
  // 返回废弃提示，但保持向后兼容
  res.set('Warning', '299 - "This API is deprecated. Use /api/universes/zhou/content instead."');
  
  const cacheKey = '/api/poems-all';
  if (req.query.refresh === 'true') invalidate([cacheKey]);
  const cached = getCache(cacheKey);
  if (cached !== undefined) return res.json(cached);
  try {
    const prisma = getPrismaClient();
    const poems = await prisma.zhouPoem.findMany();
    const mapped = mapZhouPoemsToPublicPoems(poems);
    setCache(cacheKey, mapped);
    return res.json(mapped);
  } catch (dbErr) {
    if (!FALLBACK_TO_FS) return next(fileFallbackError('Failed to read poems'));
    try {
      const poemsObj = {};
      const items = await fs.readdir(POEMS_DIR, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory()) {
          const folder = path.join(POEMS_DIR, item.name);
          const files = await fs.readdir(folder);
          for (const file of files) {
            if (file.endsWith('.txt')) {
              const full = path.join(folder, file);
              const content = await fs.readFile(full, 'utf-8');
              const key = path.basename(file, '.txt').replace(/[《》]/g, '');
              poemsObj[key] = content;
            }
          }
        }
      }
      setCache(cacheKey, poemsObj);
      return res.json(poemsObj);
    } catch (fsErr) {
      return next(fileFallbackError('Failed to read poems'));
    }
  }
});

// GET /api/poem-archetypes - [DEPRECATED] 使用 /api/universes/:universeCode/content 替代
router.get('/poem-archetypes', async (req, res, next) => {
  // 返回废弃提示，但保持向后兼容
  res.set('Warning', '299 - "This API is deprecated. Use /api/universes/zhou/content instead."');
  
  const cacheKey = '/api/poem-archetypes';
  if (req.query.refresh === 'true') invalidate([cacheKey]);
  const cached = getCache(cacheKey);
  if (cached !== undefined) return res.json(cached);
  try {
    const prisma = getPrismaClient();
    const poems = await prisma.zhouPoem.findMany();
    const mapped = mapPoemArchetypesForFrontend(poems);
    setCache(cacheKey, mapped);
    return res.json(mapped);
  } catch (dbErr) {
    if (!FALLBACK_TO_FS) return next(fileFallbackError('Failed to read poem archetypes'));
    try {
      const archetypesData = await fs.readFile(POEM_ARCHETYPES_PATH, 'utf-8');
      const json = JSON.parse(archetypesData);
      setCache(cacheKey, json);
      return res.json(json);
    } catch (fsErr) {
      return next(fileFallbackError('Failed to read poem archetypes'));
    }
  }
});

export default router;


