import request from 'supertest';
import express from 'express';
import adminRouter from '../src/routes/admin.js';

const app = express();
app.use(express.json());
// 不注入会话，直接挂载路由
app.use('/api/admin', adminRouter);

describe('Admin API auth contract', () => {
  test('unauthorized requests return standardized 401 envelope', async () => {
    const res = await request(app).get('/api/admin/projects');
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: { code: 'UNAUTHORIZED', message: expect.any(String) } });
  });
});


