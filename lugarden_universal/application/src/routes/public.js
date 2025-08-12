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

function fileFallbackError(message) {
  const err = new Error(message);
  err.statusCode = 500;
  err.code = 'INTERNAL_SERVER_ERROR';
  return err;
}

// GET /api/projects
router.get('/projects', async (req, res, next) => {
  const prisma = getPrismaClient();
  try {
    const zhouProjects = await prisma.zhouProject.findMany({
      include: { subProjects: { select: { name: true, description: true } } },
    });
    const mapped = mapZhouProjectsToPublicProjects(zhouProjects).filter(
      (p) => (p.status || '').toLowerCase() === 'published'
    );
    return res.json(mapped);
  } catch (dbErr) {
    try {
      const projectsData = await fs.readFile(PROJECTS_PATH, 'utf-8');
      const projectsJson = JSON.parse(projectsData);
      return res.json(projectsJson.projects || []);
    } catch (fsErr) {
      return next(fileFallbackError('无法加载项目结构'));
    }
  }
});

// GET /api/questions
router.get('/questions', async (req, res, next) => {
  const prisma = getPrismaClient();
  try {
    const qas = await prisma.zhouQA.findMany();
    const mapped = mapZhouQAToPublicQuestions(qas);
    return res.json(mapped);
  } catch (dbErr) {
    try {
      const questionsData = await fs.readFile(QUESTIONS_PATH, 'utf-8');
      return res.json(JSON.parse(questionsData));
    } catch (fsErr) {
      return next(fileFallbackError('Failed to read questions'));
    }
  }
});

// GET /api/mappings
router.get('/mappings', async (req, res, next) => {
  const prisma = getPrismaClient();
  try {
    const mappings = await prisma.zhouMapping.findMany();
    const mapped = mapZhouMappingToPublicMappings(mappings);
    return res.json(mapped);
  } catch (dbErr) {
    try {
      const mappingsData = await fs.readFile(MAPPINGS_PATH, 'utf-8');
      return res.json(JSON.parse(mappingsData));
    } catch (fsErr) {
      return next(fileFallbackError('Failed to read mappings'));
    }
  }
});

// GET /api/poems-all
router.get('/poems-all', async (req, res, next) => {
  const prisma = getPrismaClient();
  try {
    const poems = await prisma.zhouPoem.findMany();
    const mapped = mapZhouPoemsToPublicPoems(poems);
    return res.json(mapped);
  } catch (dbErr) {
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
      return res.json(poemsObj);
    } catch (fsErr) {
      return next(fileFallbackError('Failed to read poems'));
    }
  }
});

// GET /api/poem-archetypes
router.get('/poem-archetypes', async (req, res, next) => {
  const prisma = getPrismaClient();
  try {
    const poems = await prisma.zhouPoem.findMany({
      select: { title: true, poetExplanation: true },
    });
    const mapped = mapPoemArchetypesForFrontend(poems);
    return res.json(mapped);
  } catch (dbErr) {
    try {
      const archetypesData = await fs.readFile(POEM_ARCHETYPES_PATH, 'utf-8');
      return res.json(JSON.parse(archetypesData));
    } catch (fsErr) {
      return next(fileFallbackError('Failed to read poem archetypes'));
    }
  }
});

export default router;


