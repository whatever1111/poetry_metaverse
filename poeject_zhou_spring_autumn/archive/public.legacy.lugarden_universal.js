// ================================
// PUBLIC.JS 模块完全注释化记录 (2025-08-29)
// ================================
// 注释原因: Vue前端迁移完成，传统HTML前端已完全弃用
// 架构演进: 从多前端支持转向Vue-only架构
// 功能替代: 所有功能已被portal.js完全替代且优化
// 影响分析: 唯一使用者是已弃用的传统HTML前端，无真实用户影响
// 重复功能: /api/universes系列端点与/api/portal/universes重复
// 技术优势: portal.js在数据格式、错误处理、缓存策略等各方面都优于public.js
// 保留原因: 保留代码结构便于历史追溯和紧急恢复
// 恢复说明: 如需恢复，取消注释以下代码并确保相关依赖正常工作
// 
// Vue迁移里程碑 (2025-08-29):
// - E.1-E.6: 完成Vue前端迁移和API架构重构
// - E.7: 清理传统前端遗留代码，完成架构纯净化
// ================================

// import { Router } from 'express';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { getPrismaClient } from '../persistence/prismaClient.js';
// import {
//   mapZhouProjectsToPublicProjects,
//   mapZhouQAToPublicQuestions,
//   mapZhouMappingToPublicMappings,
//   mapZhouPoemsToPublicPoems,
//   mapZhouPoemsToStructuredPoems,
//   mapPoemArchetypesForFrontend,
//   mapUniverseContent,
// } from '../services/mappers.js';
// import { getCache, setCache, invalidate } from '../utils/cache.js';

// ================================
// 路由器和工具函数注释化 (2025-08-29)
// ================================
// 注释原因: Vue前端迁移完成，无需通用API路由器
// 功能替代: portal.js提供更优的专用路由和错误处理
// ================================

// const router = Router();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // 统一文件回退策略：默认关闭（与 server.js 保持一致）。
// // 如需启用文件回退（紧急应急），设置环境变量 FALLBACK_TO_FS=1
// const FALLBACK_TO_FS = (process.env.FALLBACK_TO_FS ?? '0') !== '0';

// function fileFallbackError(message) {
//   const err = new Error(message);
//   err.statusCode = 500;
//   err.code = 'INTERNAL_SERVER_ERROR';
//   return err;
// }

// ================================
// /api/universes 端点注释化记录 (2025-08-29)
// ================================
// 注释原因: Vue前端迁移完成，与portal.js功能重复
// 唯一用户: 已弃用的传统HTML前端
// 功能替代: 使用 /api/portal/universes 获取优化格式的宇宙列表
// 技术优势对比: portal.js提供前端友好ID、状态转换、增强字段等优化
// ================================
// router.get('/universes', async (req, res, next) => {
//   const cacheKey = '/api/universes';
//   if (req.query.refresh === 'true') invalidate([cacheKey]);
//   const cached = getCache(cacheKey);
//   if (cached !== undefined) return res.json(cached);
//   
//   try {
//     const prisma = getPrismaClient();
//     const universes = await prisma.universe.findMany({
//       where: {
//         status: 'published'
//       },
//       select: {
//         id: true,
//         code: true,
//         name: true,
//         type: true,
//         description: true,
//         status: true,
//         createdAt: true,
//         updatedAt: true
//       },
//       orderBy: {
//         createdAt: 'asc'
//       }
//     });
//     
//     setCache(cacheKey, universes);
//     return res.json(universes);
//   } catch (dbErr) {
//     return next(fileFallbackError('无法加载宇宙列表'));
//   }
// });

// ================================
// /api/universes/:universeCode/content 端点注释化记录 (2025-08-29)
// ================================
// 注释原因: Vue前端迁移完成，功能与portal.js重复
// 唯一用户: 已弃用的传统HTML前端
// 功能替代: portal.js提供更专业的宇宙详情和内容API
// 技术优势对比: portal.js提供更好的错误处理、数据格式优化、访问记录等
// ================================
// router.get('/universes/:universeCode/content', async (req, res, next) => {
//   const { universeCode } = req.params;
//   const { format } = req.query; // 支持format查询参数
//   const isLegacyFormat = format === 'legacy';
//   
//   const cacheKey = `/api/universes/${universeCode}/content${isLegacyFormat ? '?format=legacy' : ''}`;
//   if (req.query.refresh === 'true') invalidate([cacheKey]);
//   const cached = getCache(cacheKey);
//   if (cached !== undefined) return res.json(cached);
//   
//   try {
//     const prisma = getPrismaClient();
//     
//     // 获取宇宙信息
//     const universe = await prisma.universe.findFirst({
//       where: {
//         code: universeCode,
//         status: 'published'
//       }
//     });
//     
//     if (!universe) {
//       return res.status(404).json({ error: '宇宙不存在或未发布' });
//     }
//     
//     // 根据宇宙类型聚合内容
//     if (universe.type === 'zhou_spring_autumn') {
//       // 获取周与春秋宇宙的内容
//       const [projects, qas, mappings, poems, poemArchetypes] = await Promise.all([
//         prisma.zhouProject.findMany({
//           where: { universeId: universe.id },
//           include: { subProjects: { select: { name: true, description: true } } }
//         }),
//         prisma.zhouQA.findMany({
//           where: { universeId: universe.id }
//         }),
//         prisma.zhouMapping.findMany({
//           where: { universeId: universe.id }
//         }),
//         prisma.zhouPoem.findMany({
//           where: { universeId: universe.id }
//         }),
//         prisma.zhouPoem.findMany({
//           where: { universeId: universe.id }
//         })
//       ]);
//       
//       // 映射数据 - 根据format参数选择不同的映射函数
//       const mappedProjects = mapZhouProjectsToPublicProjects(projects).filter(
//         (p) => (p.status || '').toLowerCase() === 'published'
//       );
//       const mappedQAs = mapZhouQAToPublicQuestions(qas);
//       const mappedMappings = mapZhouMappingToPublicMappings(mappings);
//       
//       // 诗歌映射：根据format参数选择聚合字符串或结构化数据
//       const mappedPoems = isLegacyFormat 
//         ? mapZhouPoemsToPublicPoems(poems)     // legacy格式：聚合字符串 
//         : mapZhouPoemsToStructuredPoems(poems); // 默认格式：结构化数据
//         
//       const mappedArchetypes = mapPoemArchetypesForFrontend(poemArchetypes);
//       
//       const result = mapUniverseContent(
//         universe,
//         mappedProjects,
//         mappedQAs,
//         mappedMappings,
//         mappedPoems,
//         mappedArchetypes
//       );
//       
//       setCache(cacheKey, result);
//       return res.json(result);
//     } else {
//       // 其他宇宙类型的占位符
//       const result = mapUniverseContent(universe, [], {}, { defaultUnit: '', units: {} }, {}, { poems: [] });
//       setCache(cacheKey, result);
//       return res.json(result);
//     }
//   } catch (dbErr) {
//     return next(fileFallbackError(`无法加载宇宙 ${universeCode} 的内容`));
//   }
// });

// ================================
// /api/projects 端点移除记录 (2025-08-29)
// ================================
// 移除内容: GET /api/projects 接口 (项目列表API)
// 删除原因: Vue前端迁移完成，legacy前端已弃用，该API仅供传统HTML前端使用
// 功能替代: 使用 GET /api/universes/universe_zhou_spring_autumn/content 获取项目数据
// 删除的接口:
// router.get('/projects', async (req, res, next) => {
//   // 返回废弃提示，但保持向后兼容
//   res.set('Warning', '299 - "This API is deprecated. Use /api/universes/universe_zhou_spring_autumn/content instead."');
//   const cacheKey = '/api/projects';
//   if (req.query.refresh === 'true') invalidate([cacheKey]);
//   const cached = getCache(cacheKey);
//   if (cached !== undefined) return res.json(cached);
//   try {
//     const prisma = getPrismaClient();
//     const zhouProjects = await prisma.zhouProject.findMany({
//       include: { subProjects: { select: { name: true, description: true } } },
//     });
//     const mapped = mapZhouProjectsToPublicProjects(zhouProjects).filter(
//       (p) => (p.status || '').toLowerCase() === 'published'
//     );
//     setCache(cacheKey, mapped);
//     return res.json(mapped);
//   } catch (dbErr) {
//     if (!FALLBACK_TO_FS) return next(fileFallbackError('无法加载项目结构'));
//     try {
//       const projectsData = await fs.readFile(PROJECTS_PATH, 'utf-8');
//       const projectsJson = JSON.parse(projectsData);
//       const all = projectsJson.projects || [];
//       const publishedOnly = all.filter((p) => (p.status || '').toLowerCase() === 'published');
//       setCache(cacheKey, publishedOnly);
//       return res.json(publishedOnly);
//     } catch (fsErr) {
//       return next(fileFallbackError('无法加载项目结构'));
//     }
//   }
// });
// 接口功能: 获取周与春秋宇宙的项目列表，支持数据库和文件系统双重回退
// 恢复说明: 如需恢复此API，取消注释上述代码并确保相关mapper函数正常工作
// ================================

// ============ AI功能API路由已移至server.js实现 ============
// 注：/api/interpret 和 /api/listen 现在由server.js处理，使用真实的Gemini和Google TTS API

// ================================
// /api/questions 端点移除记录 (2025-08-29)
// ================================
// 移除内容: GET /api/questions 接口 (问答列表API)
// 删除原因: Vue前端迁移完成，legacy前端已弃用，该API仅供传统HTML前端使用
// 功能替代: 使用 GET /api/universes/universe_zhou_spring_autumn/content 获取问答数据
// 删除的接口:
// router.get('/questions', async (req, res, next) => {
//   // 返回废弃提示，但保持向后兼容
//   res.set('Warning', '299 - "This API is deprecated. Use /api/universes/zhou/content instead."');
//   const cacheKey = '/api/questions';
//   if (req.query.refresh === 'true') invalidate([cacheKey]);
//   const cached = getCache(cacheKey);
//   if (cached !== undefined) return res.json(cached);
//   try {
//     const prisma = getPrismaClient();
//     const qas = await prisma.zhouQA.findMany();
//     const mapped = mapZhouQAToPublicQuestions(qas);
//     setCache(cacheKey, mapped);
//     return res.json(mapped);
//   } catch (dbErr) {
//     if (!FALLBACK_TO_FS) return next(fileFallbackError('Failed to read questions'));
//     try {
//       const questionsData = await fs.readFile(QUESTIONS_PATH, 'utf-8');
//       const json = JSON.parse(questionsData);
//       setCache(cacheKey, json);
//       return res.json(json);
//     } catch (fsErr) {
//       return next(fileFallbackError('Failed to read questions'));
//     }
//   }
// });
// 接口功能: 获取周与春秋宇宙的问答数据，支持数据库和文件系统双重回退
// 恢复说明: 如需恢复此API，取消注释上述代码并确保mapZhouQAToPublicQuestions函数正常工作
// ================================

// ================================
// /api/mappings 端点移除记录 (2025-08-29)
// ================================
// 移除内容: GET /api/mappings 接口 (映射关系API)
// 删除原因: Vue前端迁移完成，legacy前端已弃用，该API仅供传统HTML前端使用
// 功能替代: 使用 GET /api/universes/universe_zhou_spring_autumn/content 获取映射数据
// 删除的接口:
// router.get('/mappings', async (req, res, next) => {
//   // 返回废弃提示，但保持向后兼容
//   res.set('Warning', '299 - "This API is deprecated. Use /api/universes/zhou/content instead."');
//   const cacheKey = '/api/mappings';
//   if (req.query.refresh === 'true') invalidate([cacheKey]);
//   const cached = getCache(cacheKey);
//   if (cached !== undefined) return res.json(cached);
//   try {
//     const prisma = getPrismaClient();
//     const mappings = await prisma.zhouMapping.findMany();
//     const mapped = mapZhouMappingToPublicMappings(mappings);
//     setCache(cacheKey, mapped);
//     return res.json(mapped);
//   } catch (dbErr) {
//     if (!FALLBACK_TO_FS) return next(fileFallbackError('Failed to read mappings'));
//     try {
//       const mappingsData = await fs.readFile(MAPPINGS_PATH, 'utf-8');
//       const json = JSON.parse(mappingsData);
//       setCache(cacheKey, json);
//       return res.json(json);
//     } catch (fsErr) {
//       return next(fileFallbackError('Failed to read mappings'));
//     }
//   }
// });
// 接口功能: 获取周与春秋宇宙的映射关系数据，支持数据库和文件系统双重回退
// 恢复说明: 如需恢复此API，取消注释上述代码并确保mapZhouMappingToPublicMappings函数正常工作
// ================================

// ================================
// /api/poems-all 端点移除记录 (2025-08-29)
// ================================
// 移除内容: GET /api/poems-all 接口 (诗歌集合API)
// 删除原因: Vue前端迁移完成，legacy前端已弃用，该API仅供传统HTML前端使用
// 功能替代: 使用 GET /api/universes/universe_zhou_spring_autumn/content 获取诗歌数据
// 删除的接口:
// router.get('/poems-all', async (req, res, next) => {
//   // 返回废弃提示，但保持向后兼容
//   res.set('Warning', '299 - "This API is deprecated. Use /api/universes/zhou/content instead."');
//   const cacheKey = '/api/poems-all';
//   if (req.query.refresh === 'true') invalidate([cacheKey]);
//   const cached = getCache(cacheKey);
//   if (cached !== undefined) return res.json(cached);
//   try {
//     const prisma = getPrismaClient();
//     const poems = await prisma.zhouPoem.findMany();
//     const mapped = mapZhouPoemsToPublicPoems(poems);
//     setCache(cacheKey, mapped);
//     return res.json(mapped);
//   } catch (dbErr) {
//     if (!FALLBACK_TO_FS) return next(fileFallbackError('Failed to read poems'));
//     try {
//       const poemsObj = {};
//       const items = await fs.readdir(POEMS_DIR, { withFileTypes: true });
//       for (const item of items) {
//         if (item.isDirectory()) {
//           const folder = path.join(POEMS_DIR, item.name);
//           const files = await fs.readdir(folder);
//           for (const file of files) {
//             if (file.endsWith('.txt')) {
//               const full = path.join(folder, file);
//               const content = await fs.readFile(full, 'utf-8');
//               const key = path.basename(file, '.txt').replace(/[《》]/g, '');
//               poemsObj[key] = content;
//             }
//           }
//         }
//       }
//       setCache(cacheKey, poemsObj);
//       return res.json(poemsObj);
//     } catch (fsErr) {
//       return next(fileFallbackError('Failed to read poems'));
//     }
//   }
// });
// 接口功能: 获取周与春秋宇宙的所有诗歌数据，支持数据库和文件系统双重回退
// 恢复说明: 如需恢复此API，取消注释上述代码并确保mapZhouPoemsToPublicPoems函数和文件读取逻辑正常工作
// ================================

// ================================
// /api/poem-archetypes 端点移除记录 (2025-08-29)
// ================================
// 移除内容: GET /api/poem-archetypes 接口 (诗歌原型API)
// 删除原因: Vue前端迁移完成，legacy前端已弃用，该API仅供传统HTML前端使用
// 功能替代: 使用 GET /api/universes/universe_zhou_spring_autumn/content 获取诗歌原型数据
// 删除的接口:
// router.get('/poem-archetypes', async (req, res, next) => {
//   // 返回废弃提示，但保持向后兼容
//   res.set('Warning', '299 - "This API is deprecated. Use /api/universes/zhou/content instead."');
//   const cacheKey = '/api/poem-archetypes';
//   if (req.query.refresh === 'true') invalidate([cacheKey]);
//   const cached = getCache(cacheKey);
//   if (cached !== undefined) return res.json(cached);
//   try {
//     const prisma = getPrismaClient();
//     const poems = await prisma.zhouPoem.findMany();
//     const mapped = mapPoemArchetypesForFrontend(poems);
//     setCache(cacheKey, mapped);
//     return res.json(mapped);
//   } catch (dbErr) {
//     if (!FALLBACK_TO_FS) return next(fileFallbackError('Failed to read poem archetypes'));
//     try {
//       const archetypesData = await fs.readFile(POEM_ARCHETYPES_PATH, 'utf-8');
//       const json = JSON.parse(archetypesData);
//       setCache(cacheKey, json);
//       return res.json(json);
//     } catch (fsErr) {
//       return next(fileFallbackError('Failed to read poem archetypes'));
//     }
//   }
// });
// 接口功能: 获取周与春秋宇宙的诗歌原型数据，支持数据库和文件系统双重回退
// 恢复说明: 如需恢复此API，取消注释上述代码并确保mapPoemArchetypesForFrontend函数正常工作
// ================================

// ================================
// 保留Export结构 (2025-08-29)
// ================================
// 保留原因: 避免server.js的import错误
// 实现方式: 创建空router，保持接口兼容性
// ================================

import { Router } from 'express';
const router = Router();

// 空路由器 - 所有实际路由已注释化
// 功能替代: 使用portal.js和其他专用路由模块

export default router;


