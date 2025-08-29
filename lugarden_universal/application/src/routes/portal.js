/**
 * Portal API路由 - 宇宙门户相关接口
 * 
 * 基于E.2 API合同规范实现
 * 解决前端Portal模块与后端API脱节问题
 * 
 * @file src/routes/portal.js
 * @version 1.0.0
 * @date 2025-08-28
 */

import { Router } from 'express';
import { getPrismaClient } from '../persistence/prismaClient.js';
import { getCache, setCache } from '../utils/cache.js';

const router = Router();

// ================================
// 工具函数
// ================================

/**
 * 映射数据库状态到前端期望的状态
 * @param {string} dbStatus - 数据库状态
 * @returns {string} 前端期望的状态
 */
function mapStatusToFrontend(dbStatus) {
  const statusMapping = {
    'published': 'active',        // 已发布 → 活跃
    'draft': 'developing',        // 草稿 → 开发中
    'maintenance': 'maintenance', // 维护 → 维护中
    'archived': 'archived'        // 归档 → 已归档
  };
  
  return statusMapping[dbStatus] || 'developing';
}

/**
 * 映射数据库ID到前端友好的ID
 * @param {string} dbId - 数据库完整ID
 * @returns {string} 前端友好的短ID
 */
function mapIdToFrontend(dbId) {
  const idMapping = {
    'universe_zhou_spring_autumn': 'zhou',
    'universe_maoxiaodou': 'maoxiaodou'
  };
  
  return idMapping[dbId] || dbId;
}

/**
 * 映射Universe数据库模型到Portal API响应格式
 * @param {Object} universe - 数据库Universe对象
 * @param {boolean} includeAnalytics - 是否包含统计数据
 * @returns {Object} Portal API格式的Universe对象
 */
function mapUniverseToPortalFormat(universe, includeAnalytics = false) {
  const mapped = {
    id: mapIdToFrontend(universe.id),  // 🔧 映射为前端友好ID
    code: universe.code,
    name: universe.name,
    description: universe.description || '',
    status: mapStatusToFrontend(universe.status || 'draft'),
    meta: getUniverseMeta(universe),  // 添加meta字段
    coverImage: null, // TODO: 实现封面图片功能
    tags: [], // TODO: 实现标签功能
    version: getUniverseVersion(universe), // 添加version字段
    lastUpdated: universe.updatedAt.toISOString().split('T')[0], // 格式化日期
    createdAt: universe.createdAt.toISOString(),
    updatedAt: universe.updatedAt.toISOString()
  };

  // 如果需要统计数据，添加stats字段
  if (includeAnalytics) {
    mapped.stats = {
      visitCount: 0, // TODO: 实现访问统计
      lastVisit: new Date().toISOString()
    };
  }

  return mapped;
}

/**
 * 获取宇宙的元信息描述
 * @param {Object} universe - 数据库Universe对象
 * @returns {string} 元信息描述
 */
function getUniverseMeta(universe) {
  const metaMapping = {
    'universe_zhou_spring_autumn': '诗歌问答 · 古典解读',
    'universe_maoxiaodou': '故事世界 · 角色扮演'
  };
  
  return metaMapping[universe.code] || '探索发现 · 未知领域';
}

/**
 * 获取宇宙版本信息
 * @param {Object} universe - 数据库Universe对象
 * @returns {string} 版本号
 */
function getUniverseVersion(universe) {
  const versionMapping = {
    'universe_zhou_spring_autumn': '2.0.0',
    'universe_maoxiaodou': '0.8.0'
  };
  
  return versionMapping[universe.code] || '1.0.0';
}

/**
 * 映射前端友好ID回数据库ID
 * @param {string} frontendId - 前端简短ID
 * @returns {string} 数据库完整ID
 */
function mapIdToDatabase(frontendId) {
  const idMapping = {
    'zhou': 'universe_zhou_spring_autumn',
    'maoxiaodou': 'universe_maoxiaodou'
  };
  
  return idMapping[frontendId] || frontendId;
}

/**
 * 映射Universe到详细信息格式
 * @param {Object} universe - 数据库Universe对象
 * @returns {Object} Portal API格式的UniverseDetail对象
 */
function mapUniverseToDetailFormat(universe) {
  const base = mapUniverseToPortalFormat(universe, true);
  
  return {
    ...base,
    accessibility: {
      isAccessible: universe.status === 'published' || universe.status === 'active',
      accessMessage: universe.status !== 'published' && universe.status !== 'active' 
        ? '此宇宙正在开发中，暂时无法访问' 
        : undefined,
      requiresAuth: false
    },
    navigation: {
      entryPath: getUniverseEntryPath(universe.code),
      fallbackPath: '/'
    },
    content: {
      featuredItems: [], // TODO: 实现特色内容
      summary: universe.description || `欢迎来到${universe.name}宇宙`
    }
  };
}

/**
 * 根据宇宙代码获取入口路径
 * @param {string} universeCode - 宇宙代码
 * @returns {string} 入口路径
 */
function getUniverseEntryPath(universeCode) {
  const pathMapping = {
    'universe_zhou_spring_autumn': '/zhou',
    'universe_maoxiaodou': '/maoxiaodou'
  };
  
  return pathMapping[universeCode] || '/';
}

// ================================
// Portal API端点实现
// ================================

/**
 * GET /api/portal/universes
 * 获取Portal页面展示的宇宙列表
 */
router.get('/universes', async (req, res, next) => {
  try {
    const { status, refresh, analytics } = req.query;
    
    // 解析状态过滤器
    const statusFilter = status ? status.split(',') : null;
    const includeAnalytics = analytics === 'true';
    const forceRefresh = refresh === 'true';
    
    // 构建缓存键
    const cacheKey = `portal:universes:${status || 'all'}:${includeAnalytics}`;
    
    // 尝试从缓存获取数据（除非强制刷新）
    if (!forceRefresh) {
      const cached = getCache(cacheKey);
      if (cached) {
        console.log(`[Portal API] 从缓存返回宇宙列表: ${cacheKey}`);
        return res.json(cached);
      }
    }
    
    const prisma = getPrismaClient();
    
    // 构建查询条件
    const whereCondition = {};
    if (statusFilter && statusFilter.length > 0) {
      whereCondition.status = { in: statusFilter };
    }
    
    // 查询宇宙列表 - 使用业务优先级排序
    const universes = await prisma.universe.findMany({
      where: whereCondition,
      // 先查询所有数据，然后在应用层按业务优先级排序
      orderBy: { updatedAt: 'desc' }
    });

    // 应用层业务优先级排序
    const sortedUniverses = universes.sort((a, b) => {
      // 定义状态优先级权重：数值越小优先级越高
      const statusPriority = {
        'published': 1,   // 已发布(对应前端active) - 最高优先级
        'active': 1,      // 活跃状态 - 最高优先级
        'developing': 2,  // 开发中 - 第二优先级
        'draft': 2,       // 草稿(对应前端developing) - 第二优先级  
        'maintenance': 3, // 维护中 - 第三优先级
        'archived': 4     // 已归档 - 最低优先级
      };

      const aPriority = statusPriority[a.status] || 999;
      const bPriority = statusPriority[b.status] || 999;

      // 首先按状态优先级排序
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // 同优先级内按更新时间降序排序
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    
    console.log(`[Portal API] 从数据库查询到 ${universes.length} 个宇宙，已按业务优先级排序`);
    
    // 映射到Portal API格式
    const mappedUniverses = sortedUniverses.map(universe => 
      mapUniverseToPortalFormat(universe, includeAnalytics)
    );
    
    // 构建响应
    const response = {
      universes: mappedUniverses,
      total: mappedUniverses.length,
      status: 'success',
      metadata: {
        lastUpdated: new Date().toISOString(),
        cacheExpiry: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10分钟后过期
      }
    };
    
    // 缓存结果（10分钟）
    setCache(cacheKey, response, 10 * 60 * 1000);
    
    res.json(response);
  } catch (error) {
    console.error('[Portal API] 获取宇宙列表失败:', error);
    next(error);
  }
});

/**
 * GET /api/portal/universes/:universeId
 * 获取单个宇宙的详细信息
 */
router.get('/universes/:universeId', async (req, res, next) => {
  try {
    const { universeId } = req.params;
    
    // 构建缓存键
    const cacheKey = `portal:universe:${universeId}`;
    
    // 尝试从缓存获取
    const cached = getCache(cacheKey);
    if (cached) {
      console.log(`[Portal API] 从缓存返回宇宙详情: ${universeId}`);
      return res.json(cached);
    }
    
    const prisma = getPrismaClient();
    
    // 映射前端ID到数据库ID并支持通过ID或code查询
    const dbId = mapIdToDatabase(universeId);
    const universe = await prisma.universe.findFirst({
      where: {
        OR: [
          { id: dbId },
          { id: universeId },  // 直接传入的ID
          { code: universeId }  // 按code查询
        ]
      }
    });
    
    if (!universe) {
      return res.status(404).json({
        error: {
          code: 'UNIVERSE_NOT_FOUND',
          message: `宇宙 "${universeId}" 不存在`
        }
      });
    }
    
    console.log(`[Portal API] 找到宇宙: ${universe.name} (${universe.code})`);
    
    // 映射到详细格式
    const universeDetail = mapUniverseToDetailFormat(universe);
    
    // 构建响应
    const response = {
      universe: universeDetail,
      status: 'success'
    };
    
    // 缓存结果（5分钟）
    setCache(cacheKey, response, 5 * 60 * 1000);
    
    res.json(response);
  } catch (error) {
    console.error('[Portal API] 获取宇宙详情失败:', error);
    next(error);
  }
});

/**
 * POST /api/portal/universes/:universeId/visit
 * 记录宇宙访问
 */
router.post('/universes/:universeId/visit', async (req, res, next) => {
  try {
    const { universeId } = req.params;
    const { sessionId, referrer, userAgent } = req.body || {};
    
    const prisma = getPrismaClient();
    
    // 映射前端ID到数据库ID并验证宇宙是否存在
    const dbId = mapIdToDatabase(universeId);
    const universe = await prisma.universe.findFirst({
      where: {
        OR: [
          { id: dbId },
          { id: universeId },  // 直接传入的ID
          { code: universeId }  // 按code查询
        ]
      }
    });
    
    if (!universe) {
      return res.status(404).json({
        error: {
          code: 'UNIVERSE_NOT_FOUND',
          message: `宇宙 "${universeId}" 不存在`
        }
      });
    }
    
    // TODO: 实现访问记录存储到数据库
    // 当前简化实现：生成访问ID并记录日志
    const visitId = `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    console.log(`[Portal API] 记录宇宙访问:`, {
      visitId,
      universeId: universe.id,
      universeName: universe.name,
      sessionId,
      referrer,
      userAgent,
      timestamp
    });
    
    // 构建响应
    const response = {
      visitId,
      timestamp,
      status: 'success'
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('[Portal API] 记录访问失败:', error);
    next(error);
  }
});

export default router;
