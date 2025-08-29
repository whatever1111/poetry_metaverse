import { getPrismaClient } from '../persistence/prismaClient.js';
import { getCache, setCache, invalidate } from '../utils/cache.js';
import {
  mapZhouProjectsToPublicProjects,
  mapZhouQAToPublicQuestions,
  mapZhouMappingToPublicMappings,
  mapZhouPoemsToPublicPoems,
  mapZhouPoemsToStructuredPoems,
  mapPoemArchetypesForFrontend,
  mapUniverseContent,
} from './mappers.js';

function fileFallbackError(message) {
  const err = new Error(message);
  err.statusCode = 500;
  err.code = 'INTERNAL_SERVER_ERROR';
  return err;
}

export class UniverseService {
  
  async getUniverseContent(universeCode, options = {}) {
    const { format, refresh } = options;
    const isLegacyFormat = format === 'legacy';
    
    const cacheKey = `/api/universes/${universeCode}/content${isLegacyFormat ? '?format=legacy' : ''}`;
    if (refresh === 'true') invalidate([cacheKey]);
    const cached = getCache(cacheKey);
    if (cached !== undefined) return cached;
    
    try {
      const prisma = getPrismaClient();
      
      // 获取宇宙信息 - 100%复制原有逻辑
      const universe = await prisma.universe.findFirst({
        where: {
          code: universeCode,
          status: 'published'
        }
      });
      
      if (!universe) {
        const error = new Error('宇宙不存在或未发布');
        error.statusCode = 404;
        throw error;
      }
      
      // 根据宇宙类型聚合内容 - 100%复制原有逻辑
      if (universe.type === 'zhou_spring_autumn') {
        // 获取周与春秋宇宙的内容 - 100%复制原有查询
        const [projects, qas, mappings, poems, poemArchetypes] = await Promise.all([
          prisma.zhouProject.findMany({
            where: { universeId: universe.id },
            include: { subProjects: { select: { name: true, description: true } } }
          }),
          prisma.zhouQA.findMany({
            where: { universeId: universe.id }
          }),
          prisma.zhouMapping.findMany({
            where: { universeId: universe.id }
          }),
          prisma.zhouPoem.findMany({
            where: { universeId: universe.id }
          }),
          prisma.zhouPoem.findMany({
            where: { universeId: universe.id }
          })
        ]);

        // 映射数据 - 100%复制原有映射逻辑
        const mappedProjects = mapZhouProjectsToPublicProjects(projects).filter(
          (p) => (p.status || '').toLowerCase() === 'published'
        );
        const mappedQAs = mapZhouQAToPublicQuestions(qas);
        const mappedMappings = mapZhouMappingToPublicMappings(mappings);

        // 诗歌映射：根据format参数选择聚合字符串或结构化数据 - 100%复制原有逻辑
        const mappedPoems = isLegacyFormat
          ? mapZhouPoemsToPublicPoems(poems)     // legacy格式：聚合字符串
          : mapZhouPoemsToStructuredPoems(poems); // 默认格式：结构化数据

        const mappedArchetypes = mapPoemArchetypesForFrontend(poemArchetypes);

        const result = mapUniverseContent(
          universe,
          mappedProjects,
          mappedQAs,
          mappedMappings,
          mappedPoems,
          mappedArchetypes
        );

        setCache(cacheKey, result);
        return result;
      } else {
        // 其他宇宙类型的占位符 - 100%复制原有逻辑
        const result = mapUniverseContent(universe, [], {}, { defaultUnit: '', units: {} }, {}, { poems: [] });
        setCache(cacheKey, result);
        return result;
      }
    } catch (dbErr) {
      if (dbErr.statusCode) throw dbErr; // 重新抛出已处理的错误
      throw fileFallbackError(`无法加载宇宙 ${universeCode} 的内容`);
    }
  }
}

export const universeService = new UniverseService();
