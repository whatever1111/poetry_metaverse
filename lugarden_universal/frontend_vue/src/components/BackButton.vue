<template>
  <button
    class="back-button inline-flex items-center justify-center"
    :class="buttonClass"
    :style="buttonStyle"
    :disabled="disabled"
    @click="handleClick"
    :aria-label="ariaLabel"
  >
    <!-- 图标插槽或默认箭头 -->
    <span class="back-icon" :class="iconClass">
      <slot name="icon">
        <svg 
          class="back-arrow"
          :class="arrowClass"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          :width="iconSize"
          :height="iconSize"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            :stroke-width="strokeWidth" 
            :d="arrowPath" 
          />
        </svg>
      </slot>
    </span>
    
    <!-- 文本内容 -->
    <span v-if="showText" class="back-text" :class="textClass">
      <slot>{{ text }}</slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 组件Props
interface Props {
  // 基础功能
  text?: string
  showText?: boolean
  disabled?: boolean
  
  // 样式配置
  variant?: 'default' | 'minimal' | 'outlined' | 'filled' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  color?: 'default' | 'primary' | 'secondary' | 'danger' | 'custom'
  customColor?: string
  
  // 图标配置
  iconPosition?: 'left' | 'right' | 'top' | 'bottom'
  iconSize?: number | string
  strokeWidth?: number
  arrowType?: 'left' | 'up' | 'chevron-left' | 'chevron-up'
  
  // 布局配置
  block?: boolean
  rounded?: boolean
  shadow?: boolean
  
  // 可访问性
  ariaLabel?: string
  
  // 高级选项
  rippleEffect?: boolean
  hoverAnimation?: boolean
}

// 组件Emits
interface Emits {
  click: [event: MouseEvent]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}

const props = withDefaults(defineProps<Props>(), {
  text: '返回',
  showText: true,
  disabled: false,
  variant: 'default',
  size: 'medium',
  color: 'default',
  customColor: '',
  iconPosition: 'left',
  iconSize: 20,
  strokeWidth: 2,
  arrowType: 'left',
  block: false,
  rounded: false,
  shadow: false,
  ariaLabel: '返回上一页',
  rippleEffect: false,
  hoverAnimation: true
})

const emit = defineEmits<Emits>()

// 计算按钮类名
const buttonClass = computed(() => ({
  // 基础变体
  [`back-button--${props.variant}`]: true,
  [`back-button--${props.size}`]: true,
  [`back-button--${props.color}`]: props.color !== 'custom',
  
  // 布局选项
  'back-button--block': props.block,
  'back-button--rounded': props.rounded,
  'back-button--shadow': props.shadow,
  'back-button--disabled': props.disabled,
  
  // 图标位置
  [`back-button--icon-${props.iconPosition}`]: props.showText,
  'back-button--icon-only': !props.showText,
  
  // 特效选项
  'back-button--ripple': props.rippleEffect,
  'back-button--hover-animation': props.hoverAnimation && !props.disabled
}))

// 计算按钮样式
const buttonStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.color === 'custom' && props.customColor) {
    style.color = props.customColor
    style.borderColor = props.customColor
  }
  
  return style
})

// 计算图标类名
const iconClass = computed(() => ({
  [`back-icon--${props.iconPosition}`]: props.showText
}))

// 计算箭头类名
const arrowClass = computed(() => ({
  [`back-arrow--${props.arrowType}`]: true
}))

// 计算文本类名
const textClass = computed(() => ({
  [`back-text--${props.iconPosition}`]: true
}))

// 计算箭头路径
const arrowPath = computed(() => {
  switch (props.arrowType) {
    case 'left':
      return 'M15 19l-7-7 7-7'
    case 'up':
      return 'M19 15l-7-7-7 7'
    case 'chevron-left':
      return 'M15 18l-6-6 6-6'
    case 'chevron-up':
      return 'M18 15l-6-6-6 6'
    default:
      return 'M15 19l-7-7 7-7'
  }
})

// 事件处理
const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}

// 暴露焦点方法
defineExpose({
  focus: () => {
    // 这里可以通过ref获取DOM元素并调用focus
  },
  blur: () => {
    // 这里可以通过ref获取DOM元素并调用blur
  }
})
</script>

<style scoped>
/* 基础布局样式已迁移至UnoCSS: inline-flex items-center justify-center */
.back-button {
  gap: var(--spacing-sm);
  
  font-family: var(--font-family-serif);
  font-weight: 500;
  text-decoration: none;
  
  border: 1px solid transparent;
  border-radius: var(--border-radius-base);
  
  cursor: pointer;
  transition: all var(--transition-duration-fast) var(--transition-ease);
  
  /* 防止文本选择 */
  user-select: none;
  -webkit-user-select: none;
  
  /* 确保触摸目标足够大 */
  min-height: 44px;
  min-width: 44px;
  
  /* 基础样式 */
  position: relative;
  overflow: hidden;
}

/* 尺寸变体 */
.back-button--small {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  min-height: 36px;
  min-width: 36px;
}

.back-button--medium {
  padding: var(--spacing-sm) var(--spacing-base);
  font-size: var(--font-size-base);
}

.back-button--large {
  padding: var(--spacing-base) var(--spacing-lg);
  font-size: var(--font-size-lg);
  min-height: 52px;
  min-width: 52px;
}

/* 样式变体 */
.back-button--default {
  background: transparent;
  color: var(--text-secondary);
  border-color: transparent;
}

.back-button--default:hover:not(.back-button--disabled) {
  background: var(--color-primary-50);
  color: var(--text-primary);
}

.back-button--minimal {
  background: transparent;
  color: var(--text-tertiary);
  border: none;
  padding: var(--spacing-xs);
}

.back-button--minimal:hover:not(.back-button--disabled) {
  color: var(--text-secondary);
  background: rgba(0, 0, 0, 0.05);
}

.back-button--outlined {
  background: transparent;
  color: var(--text-secondary);
  border-color: var(--color-primary-300);
}

.back-button--outlined:hover:not(.back-button--disabled) {
  background: var(--color-primary-50);
  border-color: var(--color-primary-400);
  color: var(--text-primary);
}

.back-button--filled {
  background: var(--color-primary-600);
  color: white;
  border-color: var(--color-primary-600);
}

.back-button--filled:hover:not(.back-button--disabled) {
  background: var(--color-primary-700);
  border-color: var(--color-primary-700);
}

.back-button--ghost {
  background: transparent;
  color: var(--text-tertiary);
  border: none;
}

.back-button--ghost:hover:not(.back-button--disabled) {
  color: var(--text-secondary);
  transform: translateX(-2px);
}

/* 颜色变体 */
.back-button--primary {
  color: var(--color-info);
}

.back-button--primary:hover:not(.back-button--disabled) {
  color: #2563eb;
  background: rgba(59, 130, 246, 0.1);
}

.back-button--secondary {
  color: var(--color-primary-600);
}

.back-button--secondary:hover:not(.back-button--disabled) {
  color: var(--color-primary-700);
  background: var(--color-primary-50);
}

.back-button--danger {
  color: var(--color-error);
}

.back-button--danger:hover:not(.back-button--disabled) {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.1);
}

/* 布局选项 */
.back-button--block {
  width: 100%;
}

.back-button--rounded {
  border-radius: var(--border-radius-full);
}

.back-button--shadow {
  box-shadow: var(--shadow-sm);
}

.back-button--shadow:hover:not(.back-button--disabled) {
  box-shadow: var(--shadow-md);
}

/* 图标位置 */
.back-button--icon-only {
  padding: var(--spacing-sm);
  border-radius: 50%;
  aspect-ratio: 1;
}

.back-button--icon-right {
  flex-direction: row-reverse;
}

.back-button--icon-top {
  flex-direction: column;
}

.back-button--icon-bottom {
  flex-direction: column-reverse;
}

/* 图标样式 */
.back-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.back-arrow {
  transition: transform var(--transition-duration-fast) var(--transition-ease);
}

/* 文本样式 */
.back-text {
  line-height: 1;
  white-space: nowrap;
}

/* 禁用状态 */
.back-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* 悬停动画 */
.back-button--hover-animation:hover .back-arrow {
  transform: translateX(-2px);
}

.back-button--hover-animation:hover .back-arrow--up {
  transform: translateY(-2px);
}

.back-button--hover-animation:hover {
  transform: translateY(-1px);
}

/* 激活状态 */
.back-button:active:not(.back-button--disabled) {
  transform: translateY(0px);
}

.back-button--hover-animation:active:not(.back-button--disabled) .back-arrow {
  transform: translateX(0px);
}

/* 波纹效果 */
.back-button--ripple {
  position: relative;
  overflow: hidden;
}

.back-button--ripple::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.back-button--ripple:active::before {
  width: 200px;
  height: 200px;
}

/* 焦点状态 */
.back-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-info);
}

.back-button:focus:not(:focus-visible) {
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .back-button--large {
    padding: var(--spacing-sm) var(--spacing-base);
    font-size: var(--font-size-base);
    min-height: 48px;
  }
  
  .back-button--medium {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
    min-height: 44px;
  }
}

@media (max-width: 480px) {
  /* 移动端优化：增加触摸区域 */
  .back-button {
    min-height: 48px;
    min-width: 48px;
  }
  
  .back-button--small {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* 移动端：文本可能被隐藏以节省空间 */
  .back-button--mobile-icon-only .back-text {
    display: none;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .back-button {
    border-width: 2px;
  }
  
  .back-button--default {
    border-color: currentColor;
  }
  
  .back-button--minimal,
  .back-button--ghost {
    border: 1px solid currentColor;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .back-button {
    transition: none;
  }
  
  .back-arrow {
    transition: none;
  }
  
  .back-button--hover-animation:hover {
    transform: none;
  }
  
  .back-button--hover-animation:hover .back-arrow {
    transform: none;
  }
}

/* 打印样式 */
@media print {
  .back-button {
    display: none;
  }
}
</style>
