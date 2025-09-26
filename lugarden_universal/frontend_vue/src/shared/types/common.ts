/**
 * 通用基础类型定义
 * 包含项目中常用的基础类型和工具类型
 */

// 通用ID类型
export type ID = string | number

// 通用时间戳类型
export type Timestamp = string | number | Date

// 通用状态类型
export type Status = 'idle' | 'pending' | 'loading' | 'success' | 'error' | 'complete'

// 通用可选字段类型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// 通用必填字段类型
export type Required<T, K extends keyof T> = Omit<T, K> & Pick<T, K>

// 深度只读类型
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

// 深度可选类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// 排除空值类型
export type NonNullable<T> = T extends null | undefined ? never : T

// 通用键值对类型
export interface KeyValuePair<K = string, V = any> {
  key: K
  value: V
}

// 通用选项类型
export interface Option<T = any> {
  label: string
  value: T
  disabled?: boolean
}

// 通用分页信息
export interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages?: number
  hasNext?: boolean
  hasPrev?: boolean
}

// 通用排序信息
export interface SortInfo {
  field: string
  order: 'asc' | 'desc'
}

// 通用筛选信息
export interface FilterInfo {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between'
  value: any
}

// 通用查询参数
export interface QueryParams {
  pagination?: PaginationInfo
  sort?: SortInfo | SortInfo[]
  filter?: FilterInfo | FilterInfo[]
  search?: string
  [key: string]: any
}

// 通用事件处理器类型
export type EventHandler<T = Event> = (event: T) => void | Promise<void>

// 通用回调函数类型
export type Callback<T = any, R = void> = (data: T) => R | Promise<R>

// 通用异步函数类型
export type AsyncFunction<T = any, R = any> = (...args: T[]) => Promise<R>

// 通用构造函数类型
export type Constructor<T = any> = new (...args: any[]) => T

// 通用工厂函数类型
export type Factory<T = any> = (...args: any[]) => T

// 环境类型
export type Environment = 'development' | 'production' | 'test' | 'staging'

// 主题类型
export type Theme = 'light' | 'dark' | 'auto'

// 语言类型
export type Language = 'zh-CN' | 'en-US' | 'ja-JP'

// 设备类型
export type DeviceType = 'desktop' | 'tablet' | 'mobile'

// 浏览器类型
export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'ie' | 'other'

// 通用配置接口
export interface BaseConfig {
  environment: Environment
  theme: Theme
  language: Language
  debug: boolean
  [key: string]: any
}

// 通用元数据接口
export interface Metadata {
  createdAt?: Timestamp
  updatedAt?: Timestamp
  createdBy?: string
  updatedBy?: string
  version?: string | number
  tags?: string[]
  description?: string
  [key: string]: any
}

// 通用审计信息
export interface AuditInfo extends Metadata {
  id: ID
  status: Status
  history?: AuditInfo[]
}
