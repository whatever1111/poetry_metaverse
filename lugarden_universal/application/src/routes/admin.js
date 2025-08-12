import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPrismaClient } from '../persistence/prismaClient.js';
import { mapZhouProjectsToPublicProjects } from '../services/mappers.js';

const router = Router();

// 简易鉴权中间件（与 server.js 约定一致的 401 envelope）
router.use((req, res, next) => {
  if (req.session && req.session.isAuthenticated) return next();
  return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '需要认证' } });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..', '..');
const DATA_DRAFT_DIR = path.join(ROOT, 'data', 'content_draft');
const POEMS_DRAFT_DIR = path.join(ROOT, 'data', 'poems_draft');
const PROJECTS_DRAFT_PATH = path.join(DATA_DRAFT_DIR, 'projects.json');
const QUESTIONS_DRAFT_PATH = path.join(DATA_DRAFT_DIR, 'questions.json');
const MAPPINGS_DRAFT_PATH = path.join(DATA_DRAFT_DIR, 'mappings.json');

function fallbackError(message) {
  const err = new Error(message);
  err.statusCode = 500;
  err.code = 'INTERNAL_SERVER_ERROR';
  return err;
}

// GET /api/admin/projects （DB 优先，失败回退到草稿文件）
router.get('/projects', async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const projects = await prisma.zhouProject.findMany({
      include: { subProjects: { select: { name: true, description: true } } },
    });
    const mapped = mapZhouProjectsToPublicProjects(projects);
    return res.json(mapped);
  } catch (dbErr) {
    try {
      const projectsData = await fs.readFile(PROJECTS_DRAFT_PATH, 'utf-8');
      const projectsJson = JSON.parse(projectsData);
      return res.json(projectsJson.projects || []);
    } catch (fsErr) {
      return next(fallbackError('读取草稿项目失败'));
    }
  }
});

// GET /api/admin/projects/:projectId/sub/:subProjectName （DB 优先，失败回退到草稿文件）
router.get('/projects/:projectId/sub/:subProjectName', async (req, res, next) => {
  const { subProjectName } = req.params;
  try {
    const prisma = getPrismaClient();
    const qas = await prisma.zhouQA.findMany({ where: { chapter: subProjectName } });
    const questions = qas.map((q, index) => ({
      question: q.question,
      options: { A: q.optionA ?? '', B: q.optionB ?? '' },
      meaning: { A: q.meaningA ?? '', B: q.meaningB ?? '' },
    }));

    const mappings = await prisma.zhouMapping.findMany({ where: { chapter: subProjectName } });
    const resultMap = {};
    for (const m of mappings) resultMap[m.combination] = m.poemTitle;

    const poems = await prisma.zhouPoem.findMany({ where: { chapter: subProjectName } });
    const poemsArr = poems.map((p) => ({ id: p.title, title: p.title, body: p.body ?? '' }));

    return res.json({ name: subProjectName, questions, resultMap, poems: poemsArr });
  } catch (dbErr) {
    try {
      const questionsData = await fs.readFile(QUESTIONS_DRAFT_PATH, 'utf-8');
      const questionsJson = JSON.parse(questionsData);
      let questions = [];
      if (questionsJson.chapters) {
        const chapter = questionsJson.chapters.find((ch) => ch.id === subProjectName);
        if (chapter && chapter.questions) {
          questions = chapter.questions.map((q) => ({
            question: q.text,
            options: { A: q.options.find((opt) => opt.id.endsWith('a'))?.text || '', B: q.options.find((opt) => opt.id.endsWith('b'))?.text || '' },
          }));
        }
      } else {
        questions = questionsJson[subProjectName] || [];
      }

      const mappingsData = await fs.readFile(MAPPINGS_DRAFT_PATH, 'utf-8');
      const mappingsJson = JSON.parse(mappingsData);
      const resultMap = mappingsJson.units ? mappingsJson.units[subProjectName] || {} : (mappingsJson[subProjectName] || {});

      const subDir = path.join(POEMS_DRAFT_DIR, subProjectName);
      const poemsArr = [];
      try {
        const files = await fs.readdir(subDir);
        for (const file of files) {
          if (file.endsWith('.txt')) {
            const full = path.join(subDir, file);
            const content = await fs.readFile(full, 'utf-8');
            const base = path.basename(file, '.txt');
            poemsArr.push({ id: base, title: base, body: content });
          }
        }
      } catch (dirErr) {
        // ignore missing dir
      }

      return res.json({ name: subProjectName, questions, resultMap, poems: poemsArr });
    } catch (fsErr) {
      return next(fallbackError('获取草稿子项目数据失败'));
    }
  }
});

export default router;


