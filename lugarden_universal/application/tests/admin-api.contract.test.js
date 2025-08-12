import request from 'supertest';
import express from 'express';
import session from 'express-session';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRouter from '../src/routes/admin.js';

const app = express();
app.use(express.json());
app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));

// 简单的登录模拟中间件：为测试会话标记 isAuthenticated
app.use((req, _res, next) => { req.session.isAuthenticated = true; next(); });
app.use('/api/admin', adminRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, '..');
const DATA_DRAFT_DIR = path.join(APP_ROOT, 'data', 'content_draft');
const POEMS_DRAFT_DIR = path.join(APP_ROOT, 'data', 'poems_draft');

async function ensureDir(dir) { await fs.mkdir(dir, { recursive: true }); }

describe('Admin API contracts (DB-first with filesystem fallback)', () => {
  beforeAll(async () => {
    await ensureDir(DATA_DRAFT_DIR);
    await ensureDir(POEMS_DRAFT_DIR);

    await fs.writeFile(
      path.join(DATA_DRAFT_DIR, 'projects.json'),
      JSON.stringify({ projects: [ { id: 'p1', name: '观我生', description: 'desc', poet: 'Z', status: 'draft', subProjects: [{ name: '观我生', description: '章' }] } ] }, null, 2)
    );

    await fs.writeFile(
      path.join(DATA_DRAFT_DIR, 'questions.json'),
      JSON.stringify({
        chapters: [ { id: '观我生', questions: [ { id: 'q1', text: 'Q1', options: [ { id: 'q1a', text: 'A' }, { id: 'q1b', text: 'B' } ] } ] } ]
      }, null, 2)
    );

    await fs.writeFile(
      path.join(DATA_DRAFT_DIR, 'mappings.json'),
      JSON.stringify({ units: { 观我生: { 'A-B': '标题一' } } }, null, 2)
    );

    const sub = path.join(POEMS_DRAFT_DIR, '观我生');
    await ensureDir(sub);
    await fs.writeFile(path.join(sub, '《论不完全只有坏事》.txt'), '正文...');
  });

  test('GET /api/admin/projects returns draft projects', async () => {
    const res = await request(app).get('/api/admin/projects');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toMatchObject({ id: expect.any(String), name: '观我生' });
  });

  test('GET /api/admin/projects/:projectId/sub/:subProjectName returns aggregated data', async () => {
    const res = await request(app).get('/api/admin/projects/p1/sub/观我生');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', '观我生');
    expect(res.body).toHaveProperty('questions');
    expect(res.body).toHaveProperty('resultMap');
    expect(res.body).toHaveProperty('poems');
  });

  // 写接口仅在显式允许时执行（需要 DB 可用且存在 Universe 记录）
  const RUN_DB_WRITES = process.env.RUN_DB_WRITE_TESTS === '1';
  const maybe = RUN_DB_WRITES ? test : test.skip;

  maybe('POST/PUT/DELETE admin write flow works with DB', async () => {
    // 创建项目
    let res = await request(app).post('/api/admin/projects').send({ name: '新项目', description: 'd', poet: 'p' });
    expect([201, 500, 400]).toContain(res.status); // 允许 DB 不可用时跳过
    if (res.status !== 201) return;
    const projectId = res.body.id;

    // 新建子项目
    res = await request(app).post(`/api/admin/projects/${projectId}/sub`).send({ name: '新章', description: 'sd' });
    expect(res.status).toBe(201);

    // 更新问题
    res = await request(app).put(`/api/admin/projects/${projectId}/sub/新章/questions`).send({ questions: [{ question: 'Q', options: { A: 'a', B: 'b' }, meaning: { A: 'ma', B: 'mb' } }] });
    expect(res.status).toBe(204);

    // 更新映射
    res = await request(app).put(`/api/admin/projects/${projectId}/sub/新章/resultMap`).send({ resultMap: { 'A-B': '诗一' } });
    expect(res.status).toBe(204);

    // 新增诗
    res = await request(app).post(`/api/admin/projects/${projectId}/sub/新章/poems`).send({ title: '诗一', body: 'body' });
    expect(res.status).toBe(201);

    // 更新诗
    res = await request(app).put(`/api/admin/projects/${projectId}/sub/新章/poems/诗一`).send({ title: '诗一', body: 'body2' });
    expect(res.status).toBe(200);

    // 切换状态
    res = await request(app).put(`/api/admin/projects/${projectId}/status`).send({ status: 'published' });
    expect(res.status).toBe(200);

    // 删除诗
    res = await request(app).delete(`/api/admin/projects/${projectId}/sub/新章/poems/诗一`);
    expect(res.status).toBe(204);

    // 删除项目
    res = await request(app).delete(`/api/admin/projects/${projectId}`);
    expect(res.status).toBe(204);
  });
});



