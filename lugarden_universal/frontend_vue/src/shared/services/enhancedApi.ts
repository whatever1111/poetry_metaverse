/**
 * 增强的API客户端
 * 集成拦截器、错误处理、重试机制等高级功能
 */

import { ApiClient, ApiError, type IApiError } from './api'
import { 
  InterceptorManager, 
  authInterceptor, 
  logInterceptor,
  createLoadingInterceptor,
  createErrorHandlingInterceptor,
  createCacheInterceptor,
  type RequestConfig
} from './interceptors'
import type { UniverseContentResponse } from '@/modules/zhou/types/zhou'

/**
 * 增强的API客户端类
 * 在基础ApiClient上添加拦截器功能
 */
export class EnhancedApiClient extends ApiClient {
  private interceptors: InterceptorManager
  private loadingRequests = new Set<string>()
  private onLoadingChange?: (loading: boolean) => void
  private onError?: (error: IApiError) => void

  constructor(
    baseURL: string = '/api',
    options: {
      onLoadingChange?: (loading: boolean) => void
      onError?: (error: IApiError) => void
      enableLogging?: boolean
      enableCaching?: boolean
      cacheDuration?: number
    } = {}
  ) {
    super(baseURL)
    this.interceptors = new InterceptorManager()
    this.onLoadingChange = options.onLoadingChange
    this.onError = options.onError

    this.setupDefaultInterceptors(options)
  }

  /**
   * 设置默认拦截器
   */
  private setupDefaultInterceptors(options: any): void {
    // 认证拦截器
    this.interceptors.addRequestInterceptor(authInterceptor)

    // 加载状态拦截器
    if (this.onLoadingChange) {
      const loadingInterceptors = createLoadingInterceptor(
        () => this.updateLoadingState(true),
        () => this.updateLoadingState(false)
      )
      this.interceptors.addRequestInterceptor(loadingInterceptors.requestInterceptor)
      this.interceptors.addResponseInterceptor(loadingInterceptors.responseInterceptor)
      this.interceptors.addErrorInterceptor(loadingInterceptors.errorInterceptor)
    }

    // 日志拦截器
    if (options.enableLogging !== false) {
      this.interceptors.addRequestInterceptor(logInterceptor.request)
      this.interceptors.addResponseInterceptor(logInterceptor.response)
      this.interceptors.addErrorInterceptor(logInterceptor.error)
    }

    // 缓存拦截器
    if (options.enableCaching) {
      const cacheInterceptors = createCacheInterceptor(options.cacheDuration)
      this.interceptors.addRequestInterceptor(cacheInterceptors.requestInterceptor)
      this.interceptors.addResponseInterceptor(cacheInterceptors.responseInterceptor)
    }

    // 错误处理拦截器
    if (this.onError) {
      const errorInterceptor = createErrorHandlingInterceptor(
        () => this.onError?.(new ApiError('NETWORK_ERROR', '网络连接失败', 0)),
        () => this.onError?.(new ApiError('SERVER_ERROR', '服务器错误', 500)),
        () => this.onError?.(new ApiError('UNAUTHORIZED', '认证失败', 401))
      )
      this.interceptors.addErrorInterceptor(errorInterceptor)
    }
  }

  /**
   * 更新加载状态
   */
  private updateLoadingState(loading: boolean): void {
    if (loading) {
      this.loadingRequests.add('request')
    } else {
      this.loadingRequests.delete('request')
    }
    
    const isLoading = this.loadingRequests.size > 0
    this.onLoadingChange?.(isLoading)
  }

  /**
   * 重写请求方法以支持拦截器
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
    config: Partial<any> = {}
  ): Promise<T> {
    const requestId = `${options.method || 'GET'}_${endpoint}_${Date.now()}`
    
    try {
      // 构建请求配置
      let requestConfig: RequestConfig = {
        url: endpoint,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(new Headers(options.headers as any))
        },
        body: options.body,
        ...config
      }

      // 执行请求拦截器
      requestConfig = await this.interceptors.executeRequestInterceptors(requestConfig)

      // 执行实际请求
      const response = await super.request<T>(endpoint, {
        ...options,
        headers: requestConfig.headers,
        body: requestConfig.body
      }, config)

      return response
    } catch (error) {
      // 执行错误拦截器
      let apiError = error instanceof ApiError ? error : new ApiError(
        'UNKNOWN_ERROR',
        error instanceof Error ? error.message : String(error),
        0
      )

      apiError = await this.interceptors.executeErrorInterceptors(apiError)
      throw apiError
    } finally {
      this.loadingRequests.delete(requestId)
    }
  }

  // ================================
  // 拦截器管理方法
  // ================================

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(interceptor: any) {
    return this.interceptors.addRequestInterceptor(interceptor)
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor(interceptor: any) {
    return this.interceptors.addResponseInterceptor(interceptor)
  }

  /**
   * 添加错误拦截器
   */
  addErrorInterceptor(interceptor: any) {
    return this.interceptors.addErrorInterceptor(interceptor)
  }
}

// ================================
// 具体的API服务类
// ================================

/**
 * 宇宙内容服务
 */
export class UniverseService {
  constructor(private apiClient: EnhancedApiClient) {}

  /**
   * 获取所有宇宙列表
   */
  async getUniverses(): Promise<any[]> {
    return this.apiClient.get('/universes')
  }

  /**
   * 获取特定宇宙的内容
   */
  async getUniverseContent(universeCode: string, refresh = false): Promise<UniverseContentResponse> {
    const endpoint = `/universes/${universeCode}/content${refresh ? '?refresh=true' : ''}`
    return this.apiClient.get(endpoint)
  }
}

/**
 * AI功能服务
 */
export class AIService {
  constructor(private apiClient: EnhancedApiClient) {}

  /**
   * 请求诗歌解读
   * @returns 包含解读内容的Promise
   */
  async interpretPoem(poem: string, title: string, combination: string, chapter: string): Promise<{ 
    interpretation: string
    poem_title: string
    processed_at: string
  }> {
    return this.apiClient.post('/interpret', { poem, title, combination, chapter })
  }

  // ================================
  // 读诗功能移除记录 (2025-08-26)
  // ================================
  // 移除内容: AIService类中的listenPoem方法
  // 删除的方法:
  // async listenPoem(poem: string, title: string): Promise<{ audioContent: string }>
  // 方法功能: 调用后端/api/listen接口，获取Google TTS音频内容
  // 恢复说明: 如需恢复读诗功能，需要在AIService类中恢复listenPoem方法
  // ================================

}

// ================================
// 服务工厂
// ================================

/**
 * API服务工厂
 * 创建和管理所有API服务实例
 */
export class ApiServiceFactory {
  private apiClient: EnhancedApiClient
  private universeService: UniverseService
  private aiService: AIService

  constructor(options: {
    onLoadingChange?: (loading: boolean) => void
    onError?: (error: IApiError) => void
    enableLogging?: boolean
    enableCaching?: boolean
    cacheDuration?: number
  } = {}) {
    this.apiClient = new EnhancedApiClient('/api', options)
    this.universeService = new UniverseService(this.apiClient)
    this.aiService = new AIService(this.apiClient)
  }

  /**
   * 获取宇宙服务
   */
  getUniverseService(): UniverseService {
    return this.universeService
  }

  /**
   * 获取AI服务
   */
  getAIService(): AIService {
    return this.aiService
  }

  /**
   * 获取原始API客户端
   */
  getApiClient(): EnhancedApiClient {
    return this.apiClient
  }

  /**
   * 销毁所有服务
   */
  destroy(): void {
    // 清理资源，取消未完成的请求等
    console.log('API服务已销毁')
  }
}

// ================================
// 默认导出
// ================================

// 创建默认的API服务工厂实例
let defaultApiFactory: ApiServiceFactory | null = null

/**
 * 获取默认的API服务工厂
 */
export function getApiServices(options?: ConstructorParameters<typeof ApiServiceFactory>[0]): ApiServiceFactory {
  if (!defaultApiFactory || options) {
    defaultApiFactory = new ApiServiceFactory(options)
  }
  return defaultApiFactory
}

/**
 * 重置API服务（用于测试或重新配置）
 */
export function resetApiServices(): void {
  if (defaultApiFactory) {
    defaultApiFactory.destroy()
    defaultApiFactory = null
  }
}
