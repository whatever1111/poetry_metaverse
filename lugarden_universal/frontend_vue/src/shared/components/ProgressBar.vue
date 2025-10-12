<template>
  <div class="progress-bar-container w-full" :class="containerClass">
    <!-- 可选的标签 -->
    <div v-if="showLabel || $slots.label" class="flex justify-between items-center mb-sm">
      <slot name="label">
        <span class="text-caption font-medium text-gray-700">{{ labelText }}</span>
        <span v-if="showPercentage" class="text-caption font-semibold text-gray-900">
          {{ displayPercentage }}%
        </span>
      </slot>
    </div>
    
    <!-- 进度条主体 -->
    <div 
      class="progress-track"
      :class="trackClass"
      :style="trackStyle"
      role="progressbar"
      :aria-valuenow="currentValue"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-label="ariaLabel"
    >
      <!-- 进度填充 -->
      <div 
        class="progress-fill"
        :class="fillClass"
        :style="fillStyle"
      >
        <!-- 可选的填充动画效果 -->
        <div v-if="animated" class="progress-shine"></div>
        
        <!-- 可选的进度文本（在填充内部） -->
        <div v-if="showInnerText" class="text-white text-label font-semibold text-shadow whitespace-nowrap overflow-hidden text-ellipsis">
          <slot name="inner-text">{{ innerText }}</slot>
        </div>
      </div>
      
      <!-- 可选的步骤指示器 -->
      <div v-if="showSteps && steps.length > 0" class="progress-steps">
        <div 
          v-for="(step, index) in steps"
          :key="index"
          class="progress-step"
          :class="stepClass(index)"
          :style="stepStyle(index)"
          @click="handleStepClick(index)"
        >
          <div class="step-marker rounded-full"></div>
          <div v-if="step.label" class="absolute top-full left-1/2 transform -translate-x-1/2 mt-xs text-label text-gray-600 whitespace-nowrap">{{ step.label }}</div>
        </div>
      </div>
    </div>
    
    <!-- 可选的详细信息 -->
    <div v-if="showDetails || $slots.details" class="flex justify-between items-center mt-sm">
      <slot name="details">
        <div v-if="showTimeEstimate && timeEstimate" class="text-label text-gray-600">
          预计剩余时间: {{ timeEstimate }}
        </div>
        <div v-if="showCurrentStep && currentStepInfo" class="text-label text-gray-600">
          {{ currentStepInfo }}
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'

// 步骤接口定义
interface ProgressStep {
  label?: string
  value: number
  completed?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<{
  // 基础数值
  modelValue?: number
  min?: number
  max?: number
  
  // 显示选项
  showLabel?: boolean
  showPercentage?: boolean
  showInnerText?: boolean
  showDetails?: boolean
  showSteps?: boolean
  showTimeEstimate?: boolean
  showCurrentStep?: boolean
  
  // 文本内容
  labelText?: string
  innerText?: string
  ariaLabel?: string
  currentStepInfo?: string
  timeEstimate?: string
  
  // 样式配置
  variant?: 'default' | 'thin' | 'thick' | 'rounded' | 'square'
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'custom'
  customColor?: string
  size?: 'small' | 'medium' | 'large'
  
  // 动画选项
  animated?: boolean
  smooth?: boolean
  duration?: number
  
  // 步骤配置
  steps?: ProgressStep[]
  allowStepClick?: boolean
  
  // 高级选项
  striped?: boolean
  indeterminate?: boolean
  disabled?: boolean
}>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  showLabel: false,
  showPercentage: true,
  showInnerText: false,
  showDetails: false,
  showSteps: false,
  showTimeEstimate: false,
  showCurrentStep: false,
  labelText: '进度',
  innerText: '',
  ariaLabel: '进度指示器',
  currentStepInfo: '',
  timeEstimate: '',
  variant: 'default',
  color: 'primary',
  customColor: '',
  size: 'medium',
  animated: true,
  smooth: true,
  duration: 300,
  steps: () => [],
  allowStepClick: false,
  striped: false,
  indeterminate: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'stepClick': [stepIndex: number, step: ProgressStep]
  'complete': []
  'change': [value: number]
}>()

// 响应式状态
const animatedValue = ref(props.modelValue)
const previousValue = ref(props.modelValue)

// 计算当前值（处理边界）
const currentValue = computed(() => {
  return Math.min(props.max, Math.max(props.min, props.modelValue))
})

// 计算显示百分比
const displayPercentage = computed(() => {
  const range = props.max - props.min
  const progress = currentValue.value - props.min
  return Math.round((progress / range) * 100)
})

// 计算容器类名
const containerClass = computed(() => ({
  [`progress-container--${props.size}`]: true,
  'progress-container--disabled': props.disabled
}))

// 计算轨道类名
const trackClass = computed(() => ({
  [`progress-track--${props.variant}`]: true,
  [`progress-track--${props.color}`]: props.color !== 'custom',
  'progress-track--striped': props.striped,
  'progress-track--indeterminate': props.indeterminate,
  // UnoCSS圆角类 - 所有进度条都有基础圆角，除非明确设置为square
  'rounded-base': props.variant !== 'square'
}))

// 计算轨道样式
const trackStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.color === 'custom' && props.customColor) {
    style.borderColor = props.customColor + '40' // 26% opacity
  }
  
  return style
})

// 计算填充类名
const fillClass = computed(() => ({
  [`progress-fill--${props.color}`]: props.color !== 'custom',
  'progress-fill--animated': props.animated,
  'progress-fill--smooth': props.smooth,
  'progress-fill--striped': props.striped,
  // UnoCSS圆角类 - 填充需要继承轨道的圆角，所有进度条都有基础圆角除非设为square
  'rounded-base': props.variant !== 'square'
}))

// 计算填充样式
const fillStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.indeterminate) {
    style.width = '100%'
    style.animation = 'progress-indeterminate 2s linear infinite'
  } else {
    const percentage = displayPercentage.value
    style.width = `${percentage}%`
    
    if (props.smooth) {
      style.transition = `width ${props.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
    }
  }
  
  if (props.color === 'custom' && props.customColor) {
    style.backgroundColor = props.customColor
  }
  
  return style
})

// 计算步骤类名
const stepClass = (index: number) => {
  const step = props.steps[index]
  const stepValue = step.value
  const isActive = currentValue.value >= stepValue
  const isCompleted = step.completed || currentValue.value > stepValue
  const isClickable = props.allowStepClick && (step.clickable ?? true)
  
  return {
    'progress-step--active': isActive,
    'progress-step--completed': isCompleted,
    'progress-step--clickable': isClickable && !props.disabled
  }
}

// 计算步骤样式
const stepStyle = (index: number) => {
  const step = props.steps[index]
  const range = props.max - props.min
  const percentage = ((step.value - props.min) / range) * 100
  
  return {
    left: `${percentage}%`
  }
}

// 处理步骤点击
const handleStepClick = (index: number) => {
  if (!props.allowStepClick || props.disabled) return
  
  const step = props.steps[index]
  if (step.clickable === false) return
  
  emit('update:modelValue', step.value)
  emit('stepClick', index, step)
}

// 监听值变化
watch(() => props.modelValue, (newValue, oldValue) => {
  previousValue.value = oldValue
  
  if (props.smooth) {
    // 平滑动画过渡
    const startValue = animatedValue.value
    const endValue = newValue
    const startTime = performance.now()
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / props.duration, 1)
      
      // 使用缓动函数
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      animatedValue.value = startValue + (endValue - startValue) * easeOutCubic
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        animatedValue.value = endValue
        if (newValue >= props.max) {
          emit('complete')
        }
        emit('change', newValue)
      }
    }
    
    requestAnimationFrame(animate)
  } else {
    animatedValue.value = newValue
    if (newValue >= props.max) {
      emit('complete')
    }
    emit('change', newValue)
  }
})

// 组件挂载时初始化动画值
onMounted(() => {
  animatedValue.value = props.modelValue
})
</script>

<style scoped>
/* 标签样式已迁移至UnoCSS shortcuts - D.1.8 标准化 */

/* 轨道样式 */
.progress-track {
  position: relative;
  background-color: var(--color-primary-100);
  overflow: hidden;
}

/* 轨道变体 */
.progress-track--default {
  height: 8px;
}

.progress-track--thin {
  height: 4px;
}

.progress-track--thick {
  height: 12px;
}

.progress-track--rounded {
}

.progress-track--square {
  border-radius: 0;
}

/* 轨道颜色 */
.progress-track--primary {
  background-color: rgba(107, 114, 128, 0.12);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.12),
    inset 0 1px 2px rgba(0, 0, 0, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.4);
}

.progress-track--success {
  background-color: rgba(34, 197, 94, 0.1);
}

.progress-track--warning {
  background-color: rgba(245, 158, 11, 0.1);
}

.progress-track--danger {
  background-color: rgba(239, 68, 68, 0.1);
}

.progress-track--info {
  background-color: rgba(14, 165, 233, 0.1);
}

/* 条纹轨道 */
.progress-track--striped {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.1) 10px,
    rgba(255, 255, 255, 0.1) 20px
  );
}

/* 填充样式 */
.progress-fill {
  height: 100%;
  background-color: var(--color-primary-400);
  border-radius: inherit;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  transition: width 0.3s ease;
}

/* 填充颜色 */
.progress-fill--primary {
  background: linear-gradient(90deg, #6b7280, #9ca3af);
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.progress-fill--success {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}

.progress-fill--warning {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.progress-fill--danger {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.progress-fill--info {
  background: linear-gradient(90deg, #0ea5e9, #38bdf8);
}

/* 平滑动画 */
.progress-fill--smooth {
  transition: width var(--transition-duration-slow) cubic-bezier(0.4, 0, 0.2, 1);
}

/* 条纹填充 */
.progress-fill--striped {
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.2) 10px,
    transparent 10px,
    transparent 20px
  );
  background-size: 20px 20px;
}

.progress-fill--striped.progress-fill--animated {
  animation: progress-stripes 1s linear infinite;
}

/* 光泽效果 */
.progress-shine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: progress-shine 2s ease-in-out infinite;
}

/* 内部文本样式已迁移至UnoCSS shortcuts - D.1.8 标准化 */

/* 步骤指示器 */
.progress-steps {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.progress-step {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: auto;
}

.step-marker {
  width: 12px;
  height: 12px;
  background-color: var(--color-primary-200);
  border: 2px solid white;
  transition: all var(--transition-duration-fast) var(--transition-ease);
}

.progress-step--active .step-marker {
  background-color: var(--color-primary-400);
  border-color: white;
}

.progress-step--completed .step-marker {
  background-color: var(--color-success);
  border-color: white;
}

.progress-step--clickable {
  cursor: pointer;
}

.progress-step--clickable:hover .step-marker {
  transform: scale(1.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 步骤标签和详细信息样式已迁移至UnoCSS shortcuts - D.1.8 标准化 */

/* 尺寸变体 */
.progress-container--small .progress-track--default {
  height: 6px;
}

.progress-container--small .progress-track--thick {
  height: 8px;
}

.progress-container--large .progress-track--default {
  height: 10px;
}

.progress-container--large .progress-track--thick {
  height: 16px;
}

/* 禁用状态 */
.progress-container--disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* 不确定状态动画 */
@keyframes progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 条纹动画 */
@keyframes progress-stripes {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 20px 0;
  }
}

/* 光泽动画 */
@keyframes progress-shine {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* 响应式Typography已通过clamp()内置 - D.1.8 标准化 */
@media (max-width: 768px) {
  /* 保留必要的布局调整，Typography已通过shortcuts管理 */
  .progress-details {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
}

@media (max-width: 480px) {
  .progress-container--large .progress-track--default {
    height: 8px;
  }
  
  .progress-container--large .progress-track--thick {
    height: 12px;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .progress-fill {
    transition: none;
  }
  
  .progress-fill--animated,
  .progress-shine {
    animation: none;
  }
  
  .progress-step--clickable:hover .step-marker {
    transform: none;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .progress-track {
    border: 1px solid var(--text-primary);
  }
  
  .progress-fill {
    border: 1px solid var(--text-primary);
  }
  
  .step-marker {
    border-width: 3px;
  }
}
</style>