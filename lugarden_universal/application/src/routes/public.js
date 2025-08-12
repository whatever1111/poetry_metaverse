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

// GET /api/projects
router.get('/projects', async (req, res, next) => {
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

// GET /api/questions
router.get('/questions', async (req, res, next) => {
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

// GET /api/mappings
router.get('/mappings', async (req, res, next) => {
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

// GET /api/poems-all
router.get('/poems-all', async (req, res, next) => {
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

// GET /api/poem-archetypes
router.get('/poem-archetypes', async (req, res, next) => {
  const cacheKey = '/api/poem-archetypes';
  if (req.query.refresh === 'true') invalidate([cacheKey]);
  const cached = getCache(cacheKey);
  if (cached !== undefined) return res.json(cached);
  try {
    const prisma = getPrismaClient();
    const poems = await prisma.zhouPoem.findMany({
      select: { title: true, poetExplanation: true },
    });
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


