import request from 'supertest';
import express from 'express';
import adminRouter from '../src/routes/admin.js';

function createAuthedApp() {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { req.session = { isAuthenticated: true }; next(); });
  app.use('/api/admin', adminRouter);
  return app;
}

describe('Admin Universes API CRUD (authorized)', () => {
  const app = createAuthedApp();

  let createdId = null;
  const randomCode = `test_uni_${Date.now()}`;
  
  // 测试结束后清理
  afterAll(async () => {
    if (createdId) {
      const { PrismaClient } = await import('../generated/prisma/index.js');
      const prisma = new PrismaClient();
      try {
        await prisma.universe.delete({
          where: { id: createdId }
        });
      } catch (error) {
        console.warn('清理测试宇宙失败:', error.message);
      } finally {
        await prisma.$disconnect();
      }
    }
  });

  test('POST create universe', async () => {
    const res = await request(app)
      .post('/api/admin/universes')
      .send({ name: '测试宇宙A1', code: randomCode, type: 'POEM_PROJECT', description: '由测试创建' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ code: randomCode, name: '测试宇宙A1', type: 'POEM_PROJECT' });
    expect(res.body).toHaveProperty('id');
    createdId = res.body.id;
  });

  test('GET list universes includes created one', async () => {
    const res = await request(app).get('/api/admin/universes');
    expect(res.status).toBe(200);
    const found = res.body.find((u) => u.id === createdId);
    expect(found).toBeTruthy();
    expect(found).toMatchObject({ code: randomCode });
  });

  test('PUT update universe fields (name/status)', async () => {
    const res = await request(app)
      .put(`/api/admin/universes/${createdId}`)
      .send({ name: '测试宇宙A1_已改', status: 'published' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: createdId, name: '测试宇宙A1_已改', status: 'published' });
  });

  test('DELETE universe', async () => {
    const del = await request(app)
      .delete(`/api/admin/universes/${createdId}`)
      .send({ superAdminPassword: 'lu_garden_super_admin_2024' });
    expect(del.status).toBe(204);
  });
});


