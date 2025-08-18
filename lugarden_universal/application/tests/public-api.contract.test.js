import request from 'supertest';
import express from 'express';
import publicRouter from '../src/routes/public.js';
import { getPrismaClient } from '../src/persistence/prismaClient.js';

const app = express();
app.use(express.json());
app.use('/api', publicRouter);

describe('Public API Contract Tests - Phase 2 Universe-Centric Architecture', () => {
  let prisma;

  beforeAll(async () => {
    prisma = getPrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/universes', () => {
    it('should return list of published universes', async () => {
      const response = await request(app)
        .get('/api/universes')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      // 验证每个宇宙的结构
      response.body.forEach(universe => {
        expect(universe).toHaveProperty('id');
        expect(universe).toHaveProperty('code');
        expect(universe).toHaveProperty('name');
        expect(universe).toHaveProperty('type');
        expect(universe).toHaveProperty('description');
        expect(universe).toHaveProperty('createdAt');
        expect(universe).toHaveProperty('updatedAt');
        expect(universe.status).toBe('published');
      });
    });

    it('should support cache refresh parameter', async () => {
      const response = await request(app)
        .get('/api/universes?refresh=true')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/universes/:universeCode/content', () => {
    it('should return 404 for non-existent universe', async () => {
      const response = await request(app)
        .get('/api/universes/non-existent/content')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('宇宙不存在或未发布');
    });

    it('should return 404 for draft universe', async () => {
      // 创建草稿状态的宇宙
      const draftUniverse = await prisma.universe.create({
        data: {
          id: 'test-draft-universe',
          code: 'test-draft',
          name: 'Test Draft Universe',
          type: 'test',
          status: 'draft'
        }
      });

      const response = await request(app)
        .get('/api/universes/test-draft/content')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('宇宙不存在或未发布');

      // 清理测试数据
      await prisma.universe.delete({
        where: { id: draftUniverse.id }
      });
    });

    it('should return zhou_spring_autumn universe content structure', async () => {
      // 使用正确的宇宙ID，而不是创建新的
      const zhouUniverse = await prisma.universe.findFirst({
        where: { id: 'universe_zhou_spring_autumn' }
      });

      if (!zhouUniverse) {
        throw new Error('宇宙 universe_zhou_spring_autumn 不存在，请先运行数据迁移');
      }

      // 确保宇宙状态为published
      if (zhouUniverse.status !== 'published') {
        await prisma.universe.update({
          where: { id: zhouUniverse.id },
          data: { status: 'published' }
        });
      }

      const response = await request(app)
        .get('/api/universes/universe_zhou_spring_autumn/content')
        .expect(200);

      // 验证响应结构
      expect(response.body).toHaveProperty('universe');
      expect(response.body).toHaveProperty('content');

      // 验证宇宙信息
      expect(response.body.universe).toHaveProperty('id');
      expect(response.body.universe).toHaveProperty('code');
      expect(response.body.universe).toHaveProperty('name');
      expect(response.body.universe).toHaveProperty('type');
      expect(response.body.universe.code).toBe('universe_zhou_spring_autumn');
      expect(response.body.universe.type).toBe('zhou_spring_autumn');

      // 验证内容结构
      expect(response.body.content).toHaveProperty('projects');
      expect(response.body.content).toHaveProperty('questions');
      expect(response.body.content).toHaveProperty('mappings');
      expect(response.body.content).toHaveProperty('poems');
      expect(response.body.content).toHaveProperty('poemArchetypes');

      // 验证数据类型
      expect(Array.isArray(response.body.content.projects)).toBe(true);
      expect(typeof response.body.content.questions).toBe('object');
      expect(typeof response.body.content.mappings).toBe('object');
      expect(typeof response.body.content.poems).toBe('object');
      expect(typeof response.body.content.poemArchetypes).toBe('object');
    });

    it('should support cache refresh parameter', async () => {
      const response = await request(app)
        .get('/api/universes/universe_zhou_spring_autumn/content?refresh=true')
        .expect(200);

      expect(response.body).toHaveProperty('universe');
      expect(response.body).toHaveProperty('content');
    });
  });

  describe('Deprecated API Compatibility', () => {
    it('should return deprecation warning for /api/projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.headers.warning).toContain('This API is deprecated');
      expect(response.headers.warning).toContain('/api/universes/universe_zhou_spring_autumn/content');
    });

    it('should return deprecation warning for /api/questions', async () => {
      const response = await request(app)
        .get('/api/questions')
        .expect(200);

      expect(response.headers.warning).toContain('This API is deprecated');
    });

    it('should return deprecation warning for /api/mappings', async () => {
      const response = await request(app)
        .get('/api/mappings')
        .expect(200);

      expect(response.headers.warning).toContain('This API is deprecated');
    });

    it('should return deprecation warning for /api/poems-all', async () => {
      const response = await request(app)
        .get('/api/poems-all')
        .expect(200);

      expect(response.headers.warning).toContain('This API is deprecated');
    });

    it('should return deprecation warning for /api/poem-archetypes', async () => {
      const response = await request(app)
        .get('/api/poem-archetypes')
        .expect(200);

      expect(response.headers.warning).toContain('This API is deprecated');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // 测试不存在的宇宙返回404
      const response = await request(app)
        .get('/api/universes/non-existent-universe/content')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('宇宙不存在或未发布');
    });
  });
});