import request from 'supertest';
import express from 'express';
import adminRouter from '../src/routes/admin.js';

const app = express();
app.use(express.json());
// 不注入会话，直接挂载路由，预期返回统一 401 envelope
app.use('/api/admin', adminRouter);

describe('Admin Universes API auth contract', () => {
  test('GET /api/admin/universes requires auth', async () => {
    const res = await request(app).get('/api/admin/universes');
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: { code: 'UNAUTHORIZED', message: expect.any(String) } });
  });

  test('POST /api/admin/universes requires auth', async () => {
    const res = await request(app)
      .post('/api/admin/universes')
      .send({ name: '测试宇宙', code: 'test_uni', type: 'POEM_PROJECT' });
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: { code: 'UNAUTHORIZED', message: expect.any(String) } });
  });
});


