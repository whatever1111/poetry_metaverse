<template>
  <teleport to="body">
    <div v-if="visible" class="toast-container" :class="containerClass">
      <transition
        :name="transitionName"
        appear
        @after-enter="handleAfterEnter"
        @before-leave="handleBeforeLeave"
      >
        <div
          v-if="showToast"
          class="toast flex items-start gap-sm leading-6"
          :class="toastClass"
          :style="toastStyle"
          @click="handleToastClick"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        >
          <!-- 图标 -->
          <div v-if="showIcon" class="toast-icon" :class="iconClass">
            <slot name="icon">
              <component 
                :is="iconComponent" 
                class="icon-svg"
                :class="iconSvgClass"
              />
            </slot>
          </div>
          
          <!-- 内容区域 -->
          <div class="toast-content">
            <!-- 标题 -->
            <div v-if="title" class="toast-title font-semibold mb-xs">{{ title }}</div>
            
            <!-- 消息内容 -->
            <div class="toast-message opacity-90 break-words">
              <slot>{{ message }}</slot>
            </div>
            
            <!-- 可选的操作按钮 -->
            <div v-if="showActions || $slots.actions" class="toast-actions flex gap-sm mt-sm">
              <slot name="actions">
                <button 
                  v-for="action in actions"
                  :key="action.key"
                  class="toast-action-button text-xs font-medium px-sm py-xs border rounded-sm bg-transparent transition-all cursor-pointer"
                  :class="action.class"
                  @click="handleActionClick(action)"
                >
                  {{ action.label }}
                </button>
              </slot>
            </div>
          </div>
          
          <!-- 关闭按钮 -->
          <button 
            v-if="closable && !hideCloseButton"
            class="toast-close"
            :class="closeButtonClass"
            @click="handleClose"
            aria-label="关闭通知"
          >
            <slot name="close-icon">
              <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </slot>
          </button>
          
          <!-- 进度条（如果有自动关闭） -->
          <div 
            v-if="showProgress && duration > 0"
            class="toast-progress"
            :style="progressStyle"
          ></div>
        </div>
      </transition>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

// 操作按钮接口
interface ToastAction {
  key: string
  label: string
  class?: string
  handler?: () => void
}

// 组件Props
interface Props {
  // 基础内容
  title?: string
  message?: string
  visible?: boolean
  
  // 类型和样式
  type?: 'success' | 'info' | 'warning' | 'error' | 'custom'
  variant?: 'filled' | 'outlined' | 'minimal'
  size?: 'small' | 'medium' | 'large'
  
  // 位置配置
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center' | 'center'
  
  // 行为配置
  duration?: number // 0 表示不自动关闭
  closable?: boolean
  hideCloseButton?: boolean
  pauseOnHover?: boolean
  clickToClose?: boolean
  
  // 图标配置
  showIcon?: boolean
  customIcon?: string
  
  // 操作按钮
  actions?: ToastAction[]
  showActions?: boolean
  
  // 动画配置
  animation?: 'slide' | 'fade' | 'bounce' | 'zoom'
  
  // 高级选项
  showProgress?: boolean
  persistent?: boolean
  zIndex?: number
  customClass?: string
  
  // 自定义样式
  customColor?: string
  customBackgroundColor?: string
}

// 组件Emits
interface Emits {
  close: []
  'update:visible': [visible: boolean]
  action: [actionKey: string]
  click: [event: MouseEvent]
  timeout: []
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  message: '',
  visible: false,
  type: 'info',
  variant: 'filled',
  size: 'medium',
  position: 'top-right',
  duration: 4000,
  closable: true,
  hideCloseButton: false,
  pauseOnHover: true,
  clickToClose: false,
  showIcon: true,
  customIcon: '',
  actions: () => [],
  showActions: false,
  animation: 'slide',
  showProgress: true,
  persistent: false,
  zIndex: 1000,
  customClass: '',
  customColor: '',
  customBackgroundColor: ''
})

const emit = defineEmits<Emits>()

// 响应式状态
const showToast = ref(false)
const isPaused = ref(false)
const progress = ref(100)
const timeoutId = ref<number | null>(null)
const startTime = ref<number>(0)
const remainingTime = ref<number>(0)

// 计算容器类名
const containerClass = computed(() => ({
  [`toast-container--${props.position}`]: true,
  [`toast-container--z-${props.zIndex}`]: true
}))

// 计算Toast类名
const toastClass = computed(() => ({
  [`toast--${props.type}`]: props.type !== 'custom',
  [`toast--${props.variant}`]: true,
  [`toast--${props.size}`]: true,
  
  // Typography shortcuts - D.1.12 字体大小标准化 + 响应式处理
  'text-xs max-sm:text-xs': props.size === 'small',
  'text-sm max-md:text-xs': props.size === 'medium',
  'text-base max-md:text-sm': props.size === 'large',
  
  'toast--clickable': props.clickToClose,
  'toast--persistent': props.persistent,
  [props.customClass]: props.customClass
}))

// 计算Toast样式
const toastStyle = computed(() => {
  const style: Record<string, string> = {
    zIndex: props.zIndex.toString()
  }
  
  if (props.type === 'custom') {
    if (props.customColor) {
      style.color = props.customColor
    }
    if (props.customBackgroundColor) {
      style.backgroundColor = props.customBackgroundColor
    }
  }
  
  return style
})

// 计算图标类名
const iconClass = computed(() => ({
  [`toast-icon--${props.type}`]: props.type !== 'custom'
}))

// 计算图标SVG类名
const iconSvgClass = computed(() => ({
  [`icon--${props.type}`]: props.type !== 'custom'
}))

// 计算关闭按钮类名
const closeButtonClass = computed(() => ({
  [`toast-close--${props.type}`]: props.type !== 'custom'
}))

// 计算过渡名称
const transitionName = computed(() => {
  const position = props.position
  switch (props.animation) {
    case 'slide':
      if (position.includes('right')) return 'slide-right'
      if (position.includes('left')) return 'slide-left'
      if (position.includes('top')) return 'slide-down'
      if (position.includes('bottom')) return 'slide-up'
      return 'slide-down'
    case 'bounce':
      return 'bounce'
    case 'zoom':
      return 'zoom'
    case 'fade':
    default:
      return 'fade'
  }
})

// 计算图标组件
const iconComponent = computed(() => {
  if (props.customIcon) return props.customIcon
  
  switch (props.type) {
    case 'success':
      return 'CheckCircleIcon'
    case 'warning':
      return 'ExclamationTriangleIcon'
    case 'error':
      return 'XCircleIcon'
    case 'info':
    default:
      return 'InformationCircleIcon'
  }
})

// 计算进度条样式
const progressStyle = computed(() => ({
  width: `${progress.value}%`,
  backgroundColor: getProgressColor()
}))

// 获取进度条颜色
const getProgressColor = () => {
  switch (props.type) {
    case 'success': return '#22c55e'
    case 'warning': return '#f59e0b'
    case 'error': return '#ef4444'
    case 'info': return '#3b82f6'
    default: return props.customColor || '#3b82f6'
  }
}

// 开始自动关闭计时器
const startTimer = () => {
  if (props.duration <= 0 || props.persistent) return
  
  startTime.value = Date.now()
  remainingTime.value = props.duration
  
  const updateProgress = () => {
    if (isPaused.value) return
    
    const elapsed = Date.now() - startTime.value
    const remaining = Math.max(0, props.duration - elapsed)
    progress.value = (remaining / props.duration) * 100
    
    if (remaining <= 0) {
      handleTimeout()
    } else {
      timeoutId.value = requestAnimationFrame(updateProgress)
    }
  }
  
  timeoutId.value = requestAnimationFrame(updateProgress)
}

// 暂停计时器
const pauseTimer = () => {
  if (!props.pauseOnHover || props.duration <= 0) return
  
  isPaused.value = true
  if (timeoutId.value) {
    cancelAnimationFrame(timeoutId.value)
    timeoutId.value = null
  }
  
  const elapsed = Date.now() - startTime.value
  remainingTime.value = Math.max(0, props.duration - elapsed)
}

// 恢复计时器
const resumeTimer = () => {
  if (!props.pauseOnHover || props.duration <= 0) return
  
  isPaused.value = false
  startTime.value = Date.now()
  // 使用剩余时间重新开始计时器
  startTimer()
}

// 清除计时器
const clearTimer = () => {
  if (timeoutId.value) {
    cancelAnimationFrame(timeoutId.value)
    timeoutId.value = null
  }
}

// 处理超时
const handleTimeout = () => {
  clearTimer()
  emit('timeout')
  handleClose()
}

// 处理关闭
const handleClose = () => {
  clearTimer()
  showToast.value = false
  emit('close')
  emit('update:visible', false)
}

// 处理Toast点击
const handleToastClick = (event: MouseEvent) => {
  emit('click', event)
  if (props.clickToClose) {
    handleClose()
  }
}

// 处理鼠标悬停
const handleMouseEnter = () => {
  if (props.pauseOnHover) {
    pauseTimer()
  }
}

// 处理鼠标离开
const handleMouseLeave = () => {
  if (props.pauseOnHover) {
    resumeTimer()
  }
}

// 处理操作按钮点击
const handleActionClick = (action: ToastAction) => {
  emit('action', action.key)
  if (action.handler) {
    action.handler()
  }
}

// 处理进入动画完成
const handleAfterEnter = () => {
  startTimer()
}

// 处理离开动画开始
const handleBeforeLeave = () => {
  clearTimer()
}

// 监听visible属性
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    showToast.value = true
    progress.value = 100
  } else {
    handleClose()
  }
}, { immediate: true })

// 组件销毁时清理
onUnmounted(() => {
  clearTimer()
})

// 暴露方法
defineExpose({
  close: handleClose,
  pause: pauseTimer,
  resume: resumeTimer
})
</script>

<style scoped>
/* 容器定位 */
.toast-container {
  position: fixed;
  pointer-events: none;
  z-index: 1000;
}

.toast-container--top-right {
  top: var(--spacing-lg);
  right: var(--spacing-lg);
}

.toast-container--top-left {
  top: var(--spacing-lg);
  left: var(--spacing-lg);
}

.toast-container--top-center {
  top: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
}

.toast-container--bottom-right {
  bottom: var(--spacing-lg);
  right: var(--spacing-lg);
}

.toast-container--bottom-left {
  bottom: var(--spacing-lg);
  left: var(--spacing-lg);
}

.toast-container--bottom-center {
  bottom: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
}

.toast-container--center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* NotificationToast基础样式已迁移至UnoCSS utility类 - D.1.12 标准化 */
/* Typography迁移: text-xs/text-sm/text-base (尺寸变体), font-semibold (标题), font-medium (按钮) */
/* 布局迁移: flex items-start gap-sm, leading-6, mb-xs, mt-sm */
/* 文本迁移: opacity-90 break-words (消息样式), px-sm py-xs (按钮间距) */
/* 保留传统CSS: 复杂类型样式, 动画效果, 定位系统 */

.toast {
  min-width: 300px;
  max-width: 500px;
  padding: var(--spacing-base);
  
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  
  font-family: var(--font-family-serif);
  
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  
  backdrop-filter: blur(8px);
  
  transition: all var(--transition-duration-normal) var(--transition-ease);
}

/* Toast尺寸 - 字体大小已迁移至Typography shortcuts */
.toast--small {
  min-width: 240px;
  max-width: 360px;
  padding: var(--spacing-sm);
}

.toast--medium {
  min-width: 300px;
  max-width: 500px;
  padding: var(--spacing-base);
}

.toast--large {
  min-width: 360px;
  max-width: 600px;
  padding: var(--spacing-lg);
}

/* Toast类型样式 - 填充变体 */
.toast--filled.toast--success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border: 1px solid #15803d;
}

.toast--filled.toast--info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: 1px solid #1d4ed8;
}

.toast--filled.toast--warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: 1px solid #b45309;
}

.toast--filled.toast--error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: 1px solid #b91c1c;
}

/* Toast类型样式 - 轮廓变体 */
.toast--outlined.toast--success {
  background: rgba(34, 197, 94, 0.1);
  color: #15803d;
  border: 1px solid #22c55e;
}

.toast--outlined.toast--info {
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
  border: 1px solid #3b82f6;
}

.toast--outlined.toast--warning {
  background: rgba(245, 158, 11, 0.1);
  color: #b45309;
  border: 1px solid #f59e0b;
}

.toast--outlined.toast--error {
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
  border: 1px solid #ef4444;
}

/* Toast类型样式 - 最小变体 */
.toast--minimal {
  background: rgba(255, 255, 255, 0.95);
  color: var(--text-primary);
  border: 1px solid var(--color-primary-200);
}

/* 图标样式 */
.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.icon-svg {
  width: 20px;
  height: 20px;
}

/* 内容区域 */
.toast-content {
  flex: 1;
  min-width: 0;
}

/* 标题和消息样式已迁移至UnoCSS shortcuts */
/* font-semibold mb-xs: 标题样式 */
/* opacity-90 break-words: 消息样式 */
.toast-title,
.toast-message {
  color: inherit;
}

/* 操作按钮样式已迁移至UnoCSS shortcuts */
/* flex gap-sm mt-sm: 操作按钮容器 */
/* text-xs font-medium px-sm py-xs: 按钮基础样式 */
/* border rounded-sm bg-transparent transition-all cursor-pointer: 按钮交互样式 */
.toast-action-button {
  border: 1px solid currentColor;
  color: inherit;
}

.toast-action-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 关闭按钮 */
.toast-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: inherit;
  opacity: 0.7;
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-duration-fast) var(--transition-ease);
}

.toast-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.2);
}

.close-icon {
  width: 16px;
  height: 16px;
}

/* 进度条 */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.7);
  transition: width 0.1s linear;
}

/* 可点击状态 */
.toast--clickable {
  cursor: pointer;
}

.toast--clickable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-2xl);
}

/* 持久化通知 */
.toast--persistent {
  border-left: 4px solid currentColor;
}

/* 动画效果 */
/* 滑动动画 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* 淡入动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 缩放动画 */
.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.zoom-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.zoom-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* 弹跳动画 */
.bounce-enter-active {
  animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.bounce-leave-active {
  animation: bounce-out 0.3s ease-in;
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.3);
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toast-container--top-right,
  .toast-container--top-left,
  .toast-container--bottom-right,
  .toast-container--bottom-left {
    left: var(--spacing-base);
    right: var(--spacing-base);
    transform: none;
  }
  
  .toast {
    min-width: auto;
    max-width: none;
    width: 100%;
  }
  
  .toast--large {
    padding: var(--spacing-base);
  }
}

@media (max-width: 480px) {
  .toast-container--top-right,
  .toast-container--top-left,
  .toast-container--bottom-right,
  .toast-container--bottom-left {
    left: var(--spacing-sm);
    right: var(--spacing-sm);
  }
  
  .toast {
    padding: var(--spacing-sm);
  }
  
  .toast-actions {
    flex-direction: column;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .toast {
    transition: none;
  }
  
  .slide-right-enter-active,
  .slide-right-leave-active,
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-down-enter-active,
  .slide-down-leave-active,
  .slide-up-enter-active,
  .slide-up-leave-active,
  .fade-enter-active,
  .fade-leave-active,
  .zoom-enter-active,
  .zoom-leave-active,
  .bounce-enter-active,
  .bounce-leave-active {
    transition: none;
    animation: none;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .toast {
    border-width: 2px;
  }
  
  .toast--minimal {
    border-color: var(--text-primary);
  }
}
</style>
