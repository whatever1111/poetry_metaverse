/**
 * API请求拦截器
 * 统一处理认证、错误处理、加载状态等
 */

import type { IApiError, RequestConfig } from '@/shared/types/api'

// 请求拦截器类型
export type RequestInterceptor = (config: ExtendedRequestConfig) => ExtendedRequestConfig | Promise<ExtendedRequestConfig>
export type ResponseInterceptor = (response: Response) => Response | Promise<Response>
export type ErrorInterceptor = (error: IApiError) => IApiError | Promise<IApiError>

// 扩展的请求配置接口（增加拦截器特有字段）
export interface ExtendedRequestConfig extends RequestConfig {
  url: string
  method: string
  headers?: Record<string, string>
  body?: any
  cache?: boolean
  cacheKey?: string
  cacheDuration?: number
}

// 拦截器管理器
export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []

  // 添加请求拦截器
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor)
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor)
      if (index > -1) {
        this.requestInterceptors.splice(index, 1)
      }
    }
  }

  // 添加响应拦截器
  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor)
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor)
      if (index > -1) {
        this.responseInterceptors.splice(index, 1)
      }
    }
  }

  // 添加错误拦截器
  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor)
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor)
      if (index > -1) {
        this.errorInterceptors.splice(index, 1)
      }
    }
  }

  // 执行请求拦截器
  async executeRequestInterceptors(config: ExtendedRequestConfig): Promise<ExtendedRequestConfig> {
    let result = config
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result)
    }
    return result
  }

  // 执行响应拦截器
  async executeResponseInterceptors(response: Response): Promise<Response> {
    let result = response
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result)
    }
    return result
  }

  // 执行错误拦截器
  async executeErrorInterceptors(error: IApiError): Promise<IApiError> {
    let result = error
    for (const interceptor of this.errorInterceptors) {
      result = await interceptor(result)
    }
    return result
  }
}

// ================================
// 预定义拦截器
// ================================

/**
 * 认证拦截器
 * 自动添加认证头
 */
export const authInterceptor: RequestInterceptor = (config) => {
  // 检查是否需要认证（Admin API）
  if (config.url.includes('/admin/')) {
    // 这里可以添加session或token处理
    config.headers!['X-Requested-With'] = 'XMLHttpRequest'
  }
  return config
}

/**
 * 加载状态拦截器
 * 全局管理加载状态
 */
export function createLoadingInterceptor(
  showLoading: () => void,
  hideLoading: () => void
) {
  const requestInterceptor: RequestInterceptor = (config) => {
    showLoading()
    return config
  }

  const responseInterceptor: ResponseInterceptor = (response) => {
    hideLoading()
    return response
  }

  const errorInterceptor: ErrorInterceptor = (error) => {
    hideLoading()
    return error
  }

  return { requestInterceptor, responseInterceptor, errorInterceptor }
}

/**
 * 日志拦截器
 * 记录请求和响应
 */
export const logInterceptor = {
  request: ((config: ExtendedRequestConfig) => {
    console.log(`[API Request] ${config.method} ${config.url}`, {
      headers: config.headers,
      body: config.body
    })
    return config
  }) as RequestInterceptor,

  response: ((response: Response) => {
    console.log(`[API Response] ${response.status} ${response.url}`)
    return response
  }) as ResponseInterceptor,

  error: ((error: IApiError) => {
    console.error(`[API Error] ${error.code}: ${error.message}`, {
      statusCode: error.statusCode,
      details: error.details
    })
    return error
  }) as ErrorInterceptor
}

/**
 * 错误处理拦截器
 * 统一处理特定错误
 */
export function createErrorHandlingInterceptor(
  onNetworkError?: () => void,
  onServerError?: () => void,
  onUnauthorized?: () => void
): ErrorInterceptor {
  return (error: IApiError) => {
    switch (error.code) {
      case 'NETWORK_ERROR':
        onNetworkError?.()
        break
      case 'HTTP_401':
        onUnauthorized?.()
        break
      case 'HTTP_500':
      case 'HTTP_502':
      case 'HTTP_503':
        onServerError?.()
        break
    }
    return error
  }
}

/**
 * 缓存拦截器
 * 简单的内存缓存实现
 */
export function createCacheInterceptor(cacheDuration: number = 5 * 60 * 1000) {
  const cache = new Map<string, { data: any; timestamp: number }>()

  const requestInterceptor: RequestInterceptor = (config) => {
    // 只缓存GET请求
    if (config.method === 'GET') {
      const cacheKey = config.url
      const cached = cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        // 返回缓存的数据（这需要特殊处理）
        ;(config as any).__cached = cached.data
      }
    }
    return config
  }

  const responseInterceptor: ResponseInterceptor = async (response) => {
    // 缓存成功的GET响应
    if (response.status === 200 && response.url) {
      const url = new URL(response.url)
      if (url.searchParams.get('refresh') !== 'true') {
        try {
          const clonedResponse = response.clone()
          const data = await clonedResponse.json()
          cache.set(response.url, {
            data,
            timestamp: Date.now()
          })
        } catch {
          // 忽略缓存错误
        }
      }
    }
    return response
  }

  return { requestInterceptor, responseInterceptor }
}

// ================================
// 工具函数
// ================================

/**
 * 清除缓存
 */
export function clearCache(): void {
  // 这里可以实现缓存清除逻辑
  console.log('API缓存已清除')
}

/**
 * 创建取消令牌
 */
export function createCancelToken(): { token: AbortController; cancel: () => void } {
  const controller = new AbortController()
  return {
    token: controller,
    cancel: () => controller.abort()
  }
}
