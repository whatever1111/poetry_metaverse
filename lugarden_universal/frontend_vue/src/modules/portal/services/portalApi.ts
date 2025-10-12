/**
 * Portal模块API服务
 * 专门处理宇宙门户相关的API调用
 */

import { EnhancedApiClient } from '@/shared/services/enhancedApi'
import type { Universe, UniverseStatus } from '@/modules/portal/types/portal'
import type { ID } from '@/shared/types/common'

// Portal API响应类型定义
export interface UniverseListResponse {
  universes: Universe[]
  total: number
  status: 'success' | 'error'
  message?: string
}

export interface UniverseDetailResponse {
  universe: Universe
  analytics?: {
    totalVisits: number
    activeUsers: number
    lastActivity: string
  }
  status: 'success' | 'error'
  message?: string
}

export interface UniverseStatusUpdateResponse {
  success: boolean
  universe: Universe
  message: string
}

/**
 * Portal API服务类
 * 处理宇宙门户的所有API操作
 */
export class PortalApiService {
  constructor(private apiClient: EnhancedApiClient) {}

  // ================================
  // 宇宙列表管理
  // ================================

  /**
   * 获取宇宙列表
   * @param options 查询选项
   * @returns 宇宙列表响应
   */
  async getUniverseList(options: {
    status?: UniverseStatus[]
    refresh?: boolean
    includeAnalytics?: boolean
  } = {}): Promise<UniverseListResponse> {
    const queryParams = new URLSearchParams()
    
    if (options.status && options.status.length > 0) {
      queryParams.append('status', options.status.join(','))
    }
    
    if (options.refresh) {
      queryParams.append('refresh', 'true')
    }
    
    if (options.includeAnalytics) {
      queryParams.append('analytics', 'true')
    }

    const endpoint = `/portal/universes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.apiClient.get(endpoint)
  }

  /**
   * 获取单个宇宙详情
   * @param universeId 宇宙ID
   * @param includeAnalytics 是否包含分析数据
   * @returns 宇宙详情响应
   */
  async getUniverseDetail(universeId: ID, includeAnalytics = false): Promise<UniverseDetailResponse> {
    const queryParams = includeAnalytics ? '?analytics=true' : ''
    const endpoint = `/portal/universes/${String(universeId)}${queryParams}`
    return this.apiClient.get(endpoint)
  }

  /**
   * 搜索宇宙
   * @param query 搜索关键词
   * @param filters 筛选条件
   * @returns 搜索结果
   */
  async searchUniverses(query: string, filters: {
    status?: UniverseStatus[]
    category?: string
  } = {}): Promise<UniverseListResponse> {
    const queryParams = new URLSearchParams()
    queryParams.append('q', query)
    
    if (filters.status && filters.status.length > 0) {
      queryParams.append('status', filters.status.join(','))
    }
    
    if (filters.category) {
      queryParams.append('category', filters.category)
    }

    const endpoint = `/portal/universes/search?${queryParams.toString()}`
    return this.apiClient.get(endpoint)
  }

  // ================================
  // 宇宙状态管理
  // ================================

  /**
   * 更新宇宙状态
   * @param universeId 宇宙ID
   * @param status 新状态
   * @param reason 更新原因（可选）
   * @returns 更新结果
   */
  async updateUniverseStatus(
    universeId: ID, 
    status: UniverseStatus, 
    reason?: string
  ): Promise<UniverseStatusUpdateResponse> {
    return this.apiClient.put(`/portal/universes/${String(universeId)}/status`, {
      status,
      reason
    })
  }

  /**
   * 批量更新宇宙状态
   * @param updates 批量更新数据
   * @returns 批量更新结果
   */
  async batchUpdateUniverseStatus(updates: Array<{
    universeId: ID
    status: UniverseStatus
    reason?: string
  }>): Promise<{
    success: boolean
    results: UniverseStatusUpdateResponse[]
    failed: Array<{ universeId: ID; error: string }>
  }> {
    return this.apiClient.put('/portal/universes/batch-status', { updates })
  }

  // ================================
  // 宇宙访问控制
  // ================================

  /**
   * 检查宇宙访问权限
   * @param universeId 宇宙ID
   * @param userId 用户ID（可选，默认当前用户）
   * @returns 访问权限信息
   */
  async checkUniverseAccess(universeId: ID, userId?: string): Promise<{
    accessible: boolean
    reason?: string
    requirements?: string[]
  }> {
    let endpoint = `/portal/universes/${String(universeId)}/access`
    if (userId) {
      endpoint += `?userId=${encodeURIComponent(userId)}`
    }
    return this.apiClient.get(endpoint)
  }

  /**
   * 记录宇宙访问
   * @param universeId 宇宙ID
   * @param source 访问来源
   * @returns 访问记录结果
   */
  async recordUniverseVisit(universeId: ID, source = 'portal'): Promise<{
    success: boolean
    visitId?: string
  }> {
    return this.apiClient.post(`/portal/universes/${String(universeId)}/visit`, {
      source,
      timestamp: new Date().toISOString()
    })
  }

  // ================================
  // 宇宙统计和分析
  // ================================

  /**
   * 获取宇宙统计数据
   * @param universeId 宇宙ID（可选，获取所有宇宙的统计）
   * @param timeRange 时间范围
   * @returns 统计数据
   */
  async getUniverseAnalytics(universeId?: ID, timeRange = '7d'): Promise<{
    stats: {
      totalVisits: number
      uniqueUsers: number
      averageSessionTime: number
      popularUniverses: Array<{ universeId: ID; visits: number }>
    }
    charts: {
      visitsTrend: Array<{ date: string; visits: number }>
      userActivity: Array<{ hour: number; users: number }>
    }
  }> {
    const baseEndpoint = universeId 
      ? `/portal/universes/${String(universeId)}/analytics`
      : '/portal/analytics'
    
    const endpoint = `${baseEndpoint}?timeRange=${encodeURIComponent(timeRange)}`
    return this.apiClient.get(endpoint)
  }

  // ================================
  // 系统状态和健康检查
  // ================================

  /**
   * 检查Portal系统健康状态
   * @returns 系统状态信息
   */
  async getPortalHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down'
    services: Record<string, {
      status: 'up' | 'down'
      responseTime?: number
      lastChecked: string
    }>
    uptime: number
  }> {
    return this.apiClient.get('/portal/health')
  }

  /**
   * 获取Portal配置信息
   * @returns 配置信息
   */
  async getPortalConfig(): Promise<{
    features: {
      analytics: boolean
      userTracking: boolean
      caching: boolean
    }
    limits: {
      maxUniverses: number
      cacheDuration: number
    }
    version: string
  }> {
    return this.apiClient.get('/portal/config')
  }

  // ================================
  // 用户个性化
  // ================================

  /**
   * 获取用户的宇宙偏好
   * @param userId 用户ID（可选）
   * @returns 用户偏好设置
   */
  async getUserPreferences(userId?: string): Promise<{
    favoriteUniverses: ID[]
    recentlyVisited: Array<{ universeId: ID; visitedAt: string }>
    settings: {
      theme: 'light' | 'dark' | 'auto'
      language: string
      notifications: boolean
    }
  }> {
    const endpoint = userId 
      ? `/portal/users/${userId}/preferences`
      : '/portal/user/preferences'
    
    return this.apiClient.get(endpoint)
  }

  /**
   * 更新用户偏好设置
   * @param preferences 偏好设置
   * @param userId 用户ID（可选）
   * @returns 更新结果
   */
  async updateUserPreferences(preferences: {
    favoriteUniverses?: ID[]
    settings?: {
      theme?: 'light' | 'dark' | 'auto'
      language?: string
      notifications?: boolean
    }
  }, userId?: string): Promise<{
    success: boolean
    preferences: any
  }> {
    const endpoint = userId 
      ? `/portal/users/${userId}/preferences`
      : '/portal/user/preferences'
    
    return this.apiClient.put(endpoint, preferences)
  }
}
