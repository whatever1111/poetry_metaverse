/**
 * 共享UI组件类型定义
 * 包含通用组件的Props、Emits和状态类型
 */

// 通用组件尺寸
export type ComponentSize = 'small' | 'medium' | 'large'

// 通用组件变体
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'

// 通用颜色类型
export type ComponentColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'custom'

// 加载状态类型
export interface LoadingState {
  loading: boolean
  message?: string
}

// 错误状态类型
export interface ErrorState {
  hasError: boolean
  error?: Error | string
  message?: string
  code?: string | number
}

// 空状态类型
export interface EmptyState {
  isEmpty: boolean
  message?: string
  icon?: string
  actionText?: string
}

// 通用UI状态组合
export interface UIState extends LoadingState, ErrorState, EmptyState {
  disabled?: boolean
  visible?: boolean
}

// 通用按钮Props接口
export interface BaseButtonProps {
  disabled?: boolean
  loading?: boolean
  size?: ComponentSize
  variant?: ComponentVariant
  color?: ComponentColor
  block?: boolean
  rounded?: boolean
  shadow?: boolean
}

// 通用表单控件Props接口  
export interface BaseFormControlProps {
  modelValue?: any
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  placeholder?: string
  error?: string
  helperText?: string
  size?: ComponentSize
}

// 通用卡片Props接口
export interface BaseCardProps {
  title?: string
  subtitle?: string
  shadow?: boolean
  border?: boolean
  rounded?: boolean
  padding?: ComponentSize
  header?: boolean
  footer?: boolean
}

// 通用模态框Props接口
export interface BaseModalProps {
  modelValue: boolean
  title?: string
  size?: ComponentSize
  closable?: boolean
  maskClosable?: boolean
  persistent?: boolean
  fullscreen?: boolean
}

// 通用列表项接口
export interface BaseListItem {
  id: string | number
  label: string
  value?: any
  disabled?: boolean
  icon?: string
  description?: string
}

// 通用选择器选项
export interface BaseSelectOption extends BaseListItem {
  selected?: boolean
  group?: string
}

// 通用导航项
export interface BaseNavigationItem extends BaseListItem {
  to?: string
  href?: string
  active?: boolean
  children?: BaseNavigationItem[]
}

// 通用操作按钮配置
export interface BaseActionButton {
  key: string
  label: string
  icon?: string
  variant?: ComponentVariant
  color?: ComponentColor
  disabled?: boolean
  loading?: boolean
  hidden?: boolean
  handler: () => void | Promise<void>
}

// 通用数据表格列配置
export interface BaseTableColumn {
  key: string
  title: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: any, index: number) => any
}

// 响应式断点类型
export type BreakPoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// 通用动画配置
export interface AnimationConfig {
  duration?: number
  easing?: string
  delay?: number
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
  iterationCount?: number | 'infinite'
}
