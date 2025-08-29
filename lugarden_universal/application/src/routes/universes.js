import { Router } from 'express';
import { universeService } from '../services/universeService.js';

const router = Router();

// GET /api/universes/:universeCode/content - 获取特定宇宙的内容聚合
// 100%复制原有public.js的逻辑，只是通过服务层调用
router.get('/:universeCode/content', async (req, res, next) => {
  try {
    const { universeCode } = req.params;
    const { format, refresh } = req.query;

    const result = await universeService.getUniverseContent(universeCode, {
      format,
      refresh
    });

    // 100%复制原有响应格式 - 直接返回result
    return res.json(result);
  } catch (error) {
    // 100%复制原有错误处理
    if (error.statusCode === 404) {
      return res.status(404).json({ error: error.message });
    }
    return next(error);
  }
});

export default router;