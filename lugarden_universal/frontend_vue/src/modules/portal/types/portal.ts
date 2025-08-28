// Portal模块类型定义
// 包含Universe、PortalState等Portal特定的类型定义

import type { ID, Status } from '@/shared/types/common'

// 宇宙状态类型
export type UniverseStatus = 'active' | 'developing' | 'maintenance' | 'archived'

// 宇宙基础信息接口
export interface Universe {
  id: ID
  name: string
  description: string
  status: UniverseStatus
  meta: string
  icon?: string
  coverImage?: string
  version?: string
  lastUpdated?: string
}

// Portal状态管理接口
export interface PortalState {
  universes: Universe[]
  loading: boolean
  error: {
    hasError: boolean
    message: string
    code?: string
  }
  selectedUniverse?: Universe
}

// 宇宙卡片事件类型
export interface UniverseCardEvents {
  click: [universe: Universe]
  enter: [universe: Universe]
}

// 宇宙导航配置
export interface UniverseNavigation {
  [key: string]: string
}
