import request from 'supertest';
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import publicRouter from '../src/routes/public.js';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());
app.use('/api', publicRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(APP_ROOT, 'data', 'content');
const DATA_DRAFT_DIR = path.join(APP_ROOT, 'data', 'content_draft');
const POEMS_DIR = path.join(APP_ROOT, 'data', 'poems');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

describe('Public API contracts (DB-first with filesystem fallback)', () => {
  beforeAll(async () => {
    // 准备文件回退夹具
    await ensureDir(DATA_DIR);
    await ensureDir(DATA_DRAFT_DIR);
    await ensureDir(POEMS_DIR);

    await fs.writeFile(
      path.join(DATA_DIR, 'projects.json'),
      JSON.stringify({
        projects: [
          { id: 'id1', name: '观我生', description: 'desc', poet: '周春秋', status: 'published', subProjects: [{ name: '观我生', description: '章' }] },
          { id: 'id2', name: '草稿', description: 'desc2', poet: '周春秋', status: 'draft', subProjects: [] },
        ],
      }, null, 2)
    );

    await fs.writeFile(
      path.join(DATA_DIR, 'questions.json'),
      JSON.stringify({
        观我生: [
          { question: 'Q1', options: { A: 'a', B: 'b' }, meaning: { A: 'ma', B: 'mb' } },
        ],
      }, null, 2)
    );

    await fs.writeFile(
      path.join(DATA_DIR, 'mappings.json'),
      JSON.stringify({
        defaultUnit: '观我生',
        units: { 观我生: { 'A-B': '标题一' } },
      }, null, 2)
    );

    // poems-all: data/poems/观我生/《论不完全只有坏事》.txt
    const poemsSub = path.join(POEMS_DIR, '观我生');
    await ensureDir(poemsSub);
    await fs.writeFile(path.join(poemsSub, '《论不完全只有坏事》.txt'), '诗歌正文...');

    // poem-archetypes
    await fs.writeFile(
      path.join(DATA_DRAFT_DIR, 'poem_archetypes.json'),
      JSON.stringify({ poems: [{ title: '观我生·其一', poet_explanation: '诗人解读...' }] }, null, 2)
    );
  });

  test('GET /api/projects returns published projects only and proper shape', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toMatchObject({
      id: expect.any(String),
      name: '观我生',
      status: 'published',
      subProjects: expect.any(Array),
    });
  });

  test('GET /api/questions returns questions by chapter', async () => {
    const res = await request(app).get('/api/questions');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('观我生');
    expect(Array.isArray(res.body['观我生'])).toBe(true);
    expect(res.body['观我生'][0]).toHaveProperty('question');
    expect(res.body['观我生'][0]).toHaveProperty('options');
  });

  test('GET /api/mappings returns mapping structure', async () => {
    const res = await request(app).get('/api/mappings');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('defaultUnit');
    expect(res.body).toHaveProperty('units');
  });

  test('GET /api/poems-all returns poem map keyed by cleaned title', async () => {
    const res = await request(app).get('/api/poems-all');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('论不完全只有坏事');
    expect(typeof res.body['论不完全只有坏事']).toBe('string');
  });

  test('GET /api/poem-archetypes returns list shape', async () => {
    const res = await request(app).get('/api/poem-archetypes');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('poems');
    expect(Array.isArray(res.body.poems)).toBe(true);
  });
});



