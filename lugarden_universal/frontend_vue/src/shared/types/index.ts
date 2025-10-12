/**
 * 共享类型定义统一导出
 * 提供项目中所有通用类型的统一入口
 */

// API相关类型
export * from './api'

// UI组件相关类型  
export * from './ui'

// 通用基础类型
export * from './common'

// 重新导出常用类型（便于使用）
export type {
  // API类型
  IApiError,
  RequestConfig,
  ApiResponse,
  UniverseContentResponse
} from './api'

export type {
  // UI类型
  ComponentSize,
  ComponentVariant,
  ComponentColor,
  LoadingState,
  ErrorState,
  EmptyState,
  UIState
} from './ui'

export type {
  // 基础类型
  ID,
  Status,
  Timestamp,
  Option,
  PaginationInfo,
  EventHandler,
  Callback
} from './common'
