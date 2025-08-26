/**
 * 统一API客户端
 * 封装所有后端API调用，提供类型安全的接口和统一的错误处理
 */

import type { UniverseContentResponse } from '../types/zhou'

// API错误类型定义
export interface IApiError {
  name: string
  code: string
  message: string
  statusCode: number
  details?: any
}

// 请求配置接口
interface RequestConfig {
  timeout?: number
  retries?: number
  retryDelay?: number
  signal?: AbortSignal
}

// 默认配置
const DEFAULT_CONFIG: Required<RequestConfig> = {
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  signal: new AbortController().signal
}

/**
 * API客户端类
 * 提供统一的HTTP请求封装和错误处理
 */
export class ApiClient {
  private baseURL: string
  private defaultConfig: Required<RequestConfig>

  constructor(baseURL: string = '/api', config: Partial<RequestConfig> = {}) {
    this.baseURL = baseURL.replace(/\/$/, '') // 移除尾部斜杠
    this.defaultConfig = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * 执行HTTP请求
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
    config: Partial<RequestConfig> = {}
  ): Promise<T> {
    const requestConfig = { ...this.defaultConfig, ...config }
    const url = `${this.baseURL}${endpoint}`
    
    // 设置默认headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options.headers
    })

    // 创建AbortController用于超时控制
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), requestConfig.timeout)
    
    const requestOptions: RequestInit = {
      ...options,
      headers,
      signal: config.signal || abortController.signal
    }

    let lastError: Error

    // 重试逻辑
    for (let attempt = 0; attempt <= requestConfig.retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions)
        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorBody = await this.parseErrorResponse(response)
          throw new ApiError(
            errorBody.code || `HTTP_${response.status}`,
            errorBody.message || response.statusText,
            response.status,
            errorBody
          )
        }

        return await response.json()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        // 如果是最后一次尝试，或者是致命错误，直接抛出
        if (attempt === requestConfig.retries || !this.shouldRetry(error)) {
          throw this.createApiError(lastError, url)
        }

        // 等待后重试
        await this.delay(requestConfig.retryDelay * Math.pow(2, attempt))
      }
    }

    throw this.createApiError(lastError!, url)
  }

  /**
   * 解析错误响应
   */
  private async parseErrorResponse(response: Response): Promise<any> {
    try {
      return await response.json()
    } catch {
      return { message: response.statusText }
    }
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: any): boolean {
    // 网络错误或5xx错误才重试
    if (error.name === 'AbortError') return false // 超时不重试
    if (error instanceof ApiError) {
      return error.statusCode >= 500 || error.statusCode === 0
    }
    return true // 网络错误等
  }

  /**
   * 创建标准化的API错误
   */
  private createApiError(error: Error, url: string): ApiError {
    if (error instanceof ApiError) return error
    
    if (error.name === 'AbortError') {
      return new ApiError('REQUEST_TIMEOUT', '请求超时', 408, { url })
    }
    
    return new ApiError(
      'NETWORK_ERROR',
      '网络连接失败，请检查网络连接',
      0,
      { originalError: error.message, url }
    )
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // ================================
  // 公共HTTP方法
  // ================================

  async get<T>(endpoint: string, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, config)
  }

  async post<T>(endpoint: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }, config)
  }

  async put<T>(endpoint: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    }, config)
  }

  async delete<T>(endpoint: string, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, config)
  }
}

/**
 * 自定义API错误类
 */
export class ApiError extends Error implements IApiError {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// 创建默认的API客户端实例
export const apiClient = new ApiClient()

// ================================
// 宇宙内容API
// ================================

/**
 * 获取所有已发布的宇宙列表
 */
export async function getUniverses(): Promise<any[]> {
  return apiClient.get('/universes')
}

/**
 * 获取特定宇宙的内容聚合
 */
export async function getUniverseContent(universeCode: string): Promise<UniverseContentResponse> {
  return apiClient.get(`/universes/${universeCode}/content`)
}

// ================================
// AI功能API（需要后端实现）
// ================================

/**
 * 请求解诗服务
 */
export async function interpretPoem(poem: string, title: string): Promise<{ interpretation: string }> {
  return apiClient.post('/interpret', { poem, title })
}

// ================================
// 读诗功能移除记录 (2025-08-26)
// ================================
// 移除内容: listenPoem函数
// 删除的函数:
// export async function listenPoem(poem: string, title: string): Promise<{ audioContent: string }>
// 函数功能: 调用后端/api/listen接口，获取Google TTS音频内容
// 恢复说明: 如需恢复读诗功能，需要恢复listenPoem函数，调用/api/listen接口
// ================================



// ================================
// 错误处理辅助函数
// ================================

/**
 * 判断是否为API错误
 */
export function isApiError(error: any): error is ApiError {
  return error instanceof ApiError
}

/**
 * 获取用户友好的错误消息
 */
export function getUserFriendlyErrorMessage(error: any): string {
  if (isApiError(error)) {
    switch (error.code) {
      case 'REQUEST_TIMEOUT':
        return '请求超时，请检查网络连接后重试'
      case 'NETWORK_ERROR':
        return '网络连接失败，请检查网络后重试'
      case 'HTTP_404':
        return '请求的资源不存在'
      case 'HTTP_500':
        return '服务器内部错误，请稍后重试'
      default:
        return error.message || '未知错误'
    }
  }
  
  return error?.message || '操作失败，请重试'
}
