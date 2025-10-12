/**
 * 共享API类型定义
 * 包含所有通用的API接口、错误类型和请求配置
 */

// API错误类型定义
export interface IApiError {
  name: string
  code: string
  message: string
  statusCode: number
  details?: any
}

// 请求配置接口
export interface RequestConfig {
  timeout?: number
  retries?: number
  retryDelay?: number
  signal?: AbortSignal
}

// 通用API响应结构
export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  error?: IApiError
}

// 通用分页响应
export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// 通用列表响应（适配现有API结构）
export interface ListResponse<T = any> {
  data: T[]
  count?: number
  [key: string]: any
}

// HTTP方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// API端点基础结构
export interface ApiEndpoint {
  method: HttpMethod
  url: string
  params?: Record<string, any>
  data?: Record<string, any>
}

// 通用宇宙内容响应接口（替代zhou特定类型）
export interface UniverseContentResponse {
  projects?: any[]
  questions?: Record<string, any>
  mappings?: any[]
  poems?: any[]
  [key: string]: any
}
