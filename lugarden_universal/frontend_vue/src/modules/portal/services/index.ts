// Portal模块API服务 - 统一导出
// 处理宇宙门户相关的所有API调用和数据服务

// 导出Portal API服务类
export { 
  PortalApiService,
  type UniverseListResponse,
  type UniverseDetailResponse, 
  type UniverseStatusUpdateResponse
} from './portalApi'

// 导出服务工厂和配置
// 注意：这里不直接导出ApiServiceFactory，而是通过shared层统一管理
// Portal模块通过shared/services/enhancedApi获取服务实例
