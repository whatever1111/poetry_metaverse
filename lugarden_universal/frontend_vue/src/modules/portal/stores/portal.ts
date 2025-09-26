import { computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import { getApiServices, type ApiServiceFactory } from '@/shared/services/enhancedApi'
import { isApiError, getUserFriendlyErrorMessage } from '@/shared/services/api'
import type {
  Universe,
  PortalState,
  UniverseStatus,
  UniverseNavigation
} from '../types/portal'
import type { ID } from '@/shared/types/common'

export const usePortalStore = defineStore('portal', () => {
  // ================================
  // API服务初始化
  // ================================
  let apiServices: ApiServiceFactory | null = null

  const initializeApiServices = () => {
    if (!apiServices) {
      apiServices = getApiServices({
        onLoadingChange: (loading: boolean) => {
          console.log('[Portal API] Loading状态变化:', loading, '当前手动状态:', state.loading)
          
          // 防护机制：避免API回调与手动状态控制冲突
          // 只有当前不在手动控制loading状态时，才接受API回调的状态变化
          if (!state.loading || loading === false) {
            console.log('[Portal API] 接受状态变化')
            state.loading = loading
          } else {
            console.log('[Portal API] 忽略状态变化，避免冲突')
          }
        },
        onError: (error: unknown) => {
          console.error('Portal API错误:', error)
          state.error.hasError = true
          state.error.message = getUserFriendlyErrorMessage(error)
        },
        enableLogging: true,
        enableCaching: true,
        cacheDuration: 10 * 60 * 1000 // 10分钟缓存
      })
    }
    return apiServices
  }

  // ================================
  // 状态管理
  // ================================
  const state = reactive<PortalState>({
    universes: [],
    loading: false,
    error: {
      hasError: false,
      message: '',
      code: undefined
    },
    selectedUniverse: undefined
  })

  // 宇宙导航配置（将来可从API获取）
  const navigationConfig: UniverseNavigation = {
    zhou: '/zhou',
    maoxiaodou: '/maoxiaodou',
    // 可扩展其他宇宙
  }

  // ================================
  // 计算属性 (Getters)
  // ================================

  // 活跃的宇宙列表
  const activeUniverses = computed(() => {
    return state.universes.filter(universe => universe.status === 'active')
  })

  // 开发中的宇宙列表
  const developingUniverses = computed(() => {
    return state.universes.filter(universe => universe.status === 'developing')
  })

  // 所有可显示的宇宙（排除归档的）
  const visibleUniverses = computed(() => {
    return state.universes.filter(universe => universe.status !== 'archived')
  })

  // 宇宙总数统计
  const universeStats = computed(() => {
    const stats = {
      total: state.universes.length,
      active: 0,
      developing: 0,
      maintenance: 0,
      archived: 0
    }

    state.universes.forEach(universe => {
      stats[universe.status]++
    })

    return stats
  })

  // 是否有可用的宇宙
  const hasActiveUniverses = computed(() => {
    return activeUniverses.value.length > 0
  })

  // 是否正在加载或有错误
  const isLoading = computed(() => state.loading)
  const hasError = computed(() => state.error.hasError)
  const errorMessage = computed(() => state.error.message)

  // ================================
  // Actions - 数据获取
  // ================================

  // 加载宇宙列表
  async function loadUniverses(refresh = false): Promise<void> {
    if (state.loading) {
      console.log('[Portal] 已在加载中，跳过重复请求')
      return
    }

    try {
      console.log('[Portal] 开始加载宇宙列表, refresh:', refresh)
      state.loading = true
      clearError()

      // 如果有缓存且不需要强制刷新，返回
      if (!refresh && state.universes.length > 0) {
        console.log('[Portal] 缓存数据存在且不需要刷新，直接返回')
        state.loading = false
        return
      }

      const api = initializeApiServices()
      const portalService = api.getPortalService()
      
      try {
        // 尝试调用真实API
        const response = await portalService.getUniverseList({ 
          refresh,
          includeAnalytics: false 
        })
        
        if (response.status === 'success' && response.universes) {
          state.universes = response.universes
        } else {
          throw new Error(response.message || '获取宇宙列表失败')
        }
      } catch (apiError) {
        // 如果API调用失败，使用硬编码数据作为降级方案
        console.warn('API调用失败，使用硬编码数据作为降级方案:', apiError)
        
        // 模拟API调用延迟
        await simulateApiCall()
        
        // 硬编码数据（降级方案）
        state.universes = [
          {
            id: 'zhou',
            name: '周与春秋练习',
            description: '基于吴任几《周与春秋练习》系列诗歌的互动体验，通过问答与解诗探索古典诗歌的现代意义。',
            status: 'active',
            meta: '诗歌问答 · 古典解读',
            version: '2.0.0',
            lastUpdated: '2025-08-28'
          },
          {
            id: 'maoxiaodou',
            name: '毛小豆故事演绎',
            description: '毛小豆宇宙的奇幻冒险，包含前篇、正篇、番外的完整故事体系。',
            status: 'developing',
            meta: '故事世界 · 角色扮演',
            version: '0.8.0',
            lastUpdated: '2025-08-15'
          },
          {
            id: 'poet_universe',
            name: '诗人宇宙',
            description: '探索多位诗人的世界观和创作理念，通过AI对话体验不同的诗歌美学。',
            status: 'developing',
            meta: '诗人对话 · AI体验',
            version: '0.3.0',
            lastUpdated: '2025-08-01'
          }
        ]
      }

      console.log('[Portal] 宇宙列表加载成功:', {
        total: state.universes.length,
        active: activeUniverses.value.length,
        developing: developingUniverses.value.length
      })

    } catch (error) {
      console.error('加载宇宙列表失败:', error)
      
      if (isApiError(error)) {
        state.error.hasError = true
        state.error.message = error.message
        state.error.code = error.code
      } else {
        state.error.hasError = true
        state.error.message = error instanceof Error ? error.message : '加载宇宙列表失败'
      }
    } finally {
      console.log('[Portal] 加载完成，重置loading状态')
      state.loading = false
    }
  }

  // 模拟API调用延迟
  async function simulateApiCall(): Promise<void> {
    const delay = Math.random() * 1000 + 500 // 500-1500ms随机延迟
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  // 刷新宇宙列表
  async function refreshUniverses(): Promise<void> {
    return loadUniverses(true)
  }

  // ================================
  // Actions - 宇宙操作
  // ================================

  // 选择宇宙
  async function selectUniverse(universe: Universe): Promise<void> {
    state.selectedUniverse = universe
    console.log('选择宇宙:', universe.name)

    // 记录宇宙访问（异步，不阻塞UI）
    try {
      const api = initializeApiServices()
      const portalService = api.getPortalService()
      await portalService.recordUniverseVisit(universe.id, 'portal')
    } catch (error) {
      console.warn('记录宇宙访问失败:', error)
      // 不影响用户体验，静默失败
    }
  }

  // 获取宇宙导航路径
  function getUniverseNavigationPath(universeId: ID): string {
    const id = String(universeId) // 转换为字符串
    return navigationConfig[id] || '/'
  }

  // 检查宇宙是否可访问
  function isUniverseAccessible(universe: Universe): boolean {
    return universe.status === 'active'
  }

  // 检查宇宙访问权限（异步版本，更准确）
  async function checkUniverseAccessPermission(universeId: ID): Promise<{
    accessible: boolean
    reason?: string
    requirements?: string[]
  }> {
    try {
      const api = initializeApiServices()
      const portalService = api.getPortalService()
      return await portalService.checkUniverseAccess(universeId)
    } catch (error) {
      console.warn('检查宇宙访问权限失败:', error)
      // 降级到基本检查
      const universe = findUniverseById(universeId)
      return {
        accessible: universe ? isUniverseAccessible(universe) : false,
        reason: universe?.status !== 'active' ? `宇宙状态：${getUniverseStatusText(universe?.status || 'archived')}` : undefined
      }
    }
  }

  // 获取宇宙状态文本
  function getUniverseStatusText(status: UniverseStatus): string {
    const statusMap: Record<UniverseStatus, string> = {
      active: '已上线',
      developing: '开发中',
      maintenance: '维护中',
      archived: '已归档'
    }
    return statusMap[status] || '未知'
  }

  // 根据ID查找宇宙
  function findUniverseById(id: ID): Universe | undefined {
    return state.universes.find(universe => universe.id === id)
  }

  // ================================
  // Actions - 错误处理
  // ================================

  // 清除错误状态
  function clearError(): void {
    state.error.hasError = false
    state.error.message = ''
    state.error.code = undefined
  }

  // 设置错误信息
  function setError(message: string, code?: string): void {
    state.error.hasError = true
    state.error.message = message
    state.error.code = code
  }

  // 重试加载
  async function retryLoad(): Promise<void> {
    clearError()
    return loadUniverses(true)
  }

  // ================================
  // Actions - 状态管理
  // ================================

  // 重置Portal状态
  function resetPortalState(): void {
    state.universes = []
    state.selectedUniverse = undefined
    clearError()
    console.log('Portal状态已重置')
  }

  // 更新宇宙信息（用于实时更新）
  function updateUniverse(universeId: ID, updates: Partial<Universe>): void {
    const index = state.universes.findIndex(u => u.id === universeId)
    if (index !== -1) {
      state.universes[index] = { ...state.universes[index], ...updates }
      console.log('宇宙信息已更新:', universeId, updates)
    }
  }

  // 添加新宇宙（用于动态扩展）
  function addUniverse(universe: Universe): void {
    const exists = state.universes.some(u => u.id === universe.id)
    if (!exists) {
      state.universes.push(universe)
      console.log('新宇宙已添加:', universe.name)
    }
  }

  // ================================
  // Actions - 缓存管理
  // ================================

  // 检查数据是否过期
  function isDataStale(): boolean {
    // 简单的过期检查，实际项目中可以更复杂
    return state.universes.length === 0
  }

  // 预加载宇宙数据
  async function preloadUniverseData(): Promise<void> {
    console.log('[Portal] 预加载宇宙数据开始, isDataStale:', isDataStale(), 'currentLoading:', state.loading)
    
    // 如果数据过期，需要加载
    if (isDataStale()) {
      console.log('[Portal] 数据过期，开始加载')
      await loadUniverses()
    } else {
      // 数据不过期，但需要确保loading状态正确
      console.log('[Portal] 数据新鲜，确保loading状态正确')
      
      // 防护机制：如果当前是loading状态但数据已存在，重置loading状态
      if (state.loading && state.universes.length > 0) {
        console.log('[Portal] 检测到状态冲突，重置loading状态')
        state.loading = false
      }
    }
    
    console.log('[Portal] 预加载完成, finalLoading:', state.loading, 'universes:', state.universes.length)
  }

  // ================================
  // 导出状态和方法
  // ================================
  return {
    // 状态
    state,

    // 计算属性
    activeUniverses,
    developingUniverses,
    visibleUniverses,
    universeStats,
    hasActiveUniverses,
    isLoading,
    hasError,
    errorMessage,

    // 数据获取
    loadUniverses,
    refreshUniverses,
    preloadUniverseData,

    // 宇宙操作
    selectUniverse,
    getUniverseNavigationPath,
    isUniverseAccessible,
    checkUniverseAccessPermission,
    getUniverseStatusText,
    findUniverseById,

    // 错误处理
    clearError,
    setError,
    retryLoad,

    // 状态管理
    resetPortalState,
    updateUniverse,
    addUniverse,

    // 工具方法
    isDataStale
  }
})
