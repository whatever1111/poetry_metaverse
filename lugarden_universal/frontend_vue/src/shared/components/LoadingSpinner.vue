<template>
  <div class="loading-spinner-container relative flex flex-col items-center justify-center" :class="containerClass">
    <!-- 加载动画 -->
          <div class="loading-content flex flex-col items-center justify-center relative z-2">
      <!-- 主加载动画 -->
      <div class="spinner-wrapper mb-lg">
        <div 
          class="loading-spinner rounded-full" 
          :class="spinnerClass"
          :style="spinnerStyle"
        ></div>
        
        <!-- 可选的内部装饰 -->
        <div v-if="showInnerRing" class="inner-ring rounded-full"></div>
      </div>
      
      <!-- 加载文本 -->
      <div v-if="showText" class="loading-text-section text-center max-w-sm max-sm:max-w-xs max-sm:px-base">
        <div class="text-body font-medium text-gray-600 mb-sm max-sm:text-base">{{ loadingText }}</div>
        <div v-if="subtitle" class="text-caption italic text-gray-500 mb-base max-sm:text-xs">{{ subtitle }}</div>
        
        <!-- 可选的进度指示 -->
        <div v-if="showProgress && typeof progress === 'number'" class="loading-progress">
          <div class="progress-bar rounded-sm">
            <div 
              class="progress-fill rounded-sm" 
              :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"
            ></div>
          </div>
          <div class="text-caption text-gray-500 text-center">{{ Math.round(progress) }}%</div>
        </div>
      </div>
      
      <!-- 可选的额外内容插槽 -->
      <div v-if="$slots.extra" class="mt-lg text-center">
        <slot name="extra"></slot>
      </div>
    </div>
    
    <!-- 可选的背景遮罩 -->
    <div v-if="showOverlay" class="loading-overlay" @click="handleOverlayClick"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 组件Props
interface Props {
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  variant?: 'default' | 'dots' | 'pulse' | 'bounce' | 'fade'
  color?: string
  loadingText?: string
  subtitle?: string
  showText?: boolean
  showInnerRing?: boolean
  showOverlay?: boolean
  showProgress?: boolean
  progress?: number
  fullScreen?: boolean
  centered?: boolean
  overlayClickable?: boolean
}

// 组件Emits
interface Emits {
  overlayClick: []
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  variant: 'default',
  color: '',
  loadingText: '正在加载...',
  subtitle: '',
  showText: true,
  showInnerRing: false,
  showOverlay: false,
  showProgress: false,
  progress: 0,
  fullScreen: false,
  centered: true,
  overlayClickable: false
})

const emit = defineEmits<Emits>()

// 计算容器类
const containerClass = computed(() => ({
  'loading-fullscreen': props.fullScreen,
  'loading-centered': props.centered,
  'loading-with-overlay': props.showOverlay
}))

// 计算动画器类
const spinnerClass = computed(() => {
  const classes = [`loading-${props.variant}`, `loading-${props.size}`]
  return classes
})

// 计算动画器样式
const spinnerStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.color) {
    if (props.variant === 'default') {
      style.borderTopColor = props.color
    } else {
      style.backgroundColor = props.color
    }
  }
  return style
})

// 处理遮罩点击
const handleOverlayClick = () => {
  if (props.overlayClickable) {
    emit('overlayClick')
  }
}
</script>

<style scoped>
/* LoadingSpinner基础样式已迁移至UnoCSS utility类 - D.1.9 标准化 */
/* Typography迁移: text-body font-medium (加载文本), text-caption italic (副标题), text-caption (进度文本) */
/* 布局迁移: text-center max-w-sm, mb-lg, mt-lg */
/* 响应式迁移: max-sm:text-base, max-sm:text-xs, max-sm:max-w-xs, max-sm:px-base */
/* 间距迁移: mb-sm, mb-base (文本间距), mb-lg (动画器间距) */
/* 保留传统CSS: 动画关键帧, 复杂视觉效果, 位置定位, 媒体查询特殊处理 */

/* 基础布局样式已迁移至UnoCSS: relative flex flex-col items-center justify-center */
.loading-spinner-container {}

.loading-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-modal);
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

.loading-centered {
  min-height: 200px;
}

/* 基础布局样式已迁移至UnoCSS: flex flex-col items-center justify-center relative z-2 */
.loading-content {}

/* 动画器包装 */
.spinner-wrapper {
  position: relative;
}

/* 基础动画器样式 */
.loading-spinner {
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

/* 默认旋转动画 */
.loading-default {
  border: 3px solid var(--color-primary-200);
  border-top: 3px solid var(--color-info);
  animation-name: spin;
}

/* 点状动画 */
.loading-dots {
  background: var(--color-info);
  animation-name: pulse;
  position: relative;
}

.loading-dots::before,
.loading-dots::after {
  content: '';
  position: absolute;
  background: var(--color-info);
  animation: pulse 1s infinite;
}

.loading-dots::before {
  left: -200%;
  animation-delay: -0.2s;
}

.loading-dots::after {
  right: -200%;
  animation-delay: 0.2s;
}

/* 脉冲动画 */
.loading-pulse {
  background: var(--color-info);
  animation-name: pulse;
}

/* 弹跳动画 */
.loading-bounce {
  background: var(--color-info);
  animation-name: bounce;
  animation-duration: 1.4s;
}

/* 渐变动画 */
.loading-fade {
  background: var(--color-info);
  animation-name: fade;
}

/* 尺寸变体 */
.loading-small {
  width: 20px;
  height: 20px;
}

.loading-small.loading-dots::before,
.loading-small.loading-dots::after {
  width: 20px;
  height: 20px;
}

.loading-medium {
  width: 40px;
  height: 40px;
}

.loading-medium.loading-dots::before,
.loading-medium.loading-dots::after {
  width: 40px;
  height: 40px;
}

.loading-large {
  width: 60px;
  height: 60px;
}

.loading-large.loading-dots::before,
.loading-large.loading-dots::after {
  width: 60px;
  height: 60px;
}

.loading-xlarge {
  width: 80px;
  height: 80px;
}

.loading-xlarge.loading-dots::before,
.loading-xlarge.loading-dots::after {
  width: 80px;
  height: 80px;
}

/* 内部装饰环 */
.inner-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
  border: 2px solid var(--color-primary-300);
  animation: spin 2s linear infinite reverse;
}

/* 文本区域样式已迁移至UnoCSS shortcuts */
/* text-center max-w-sm: 文本居中, 最大宽度 */
/* text-body font-medium text-gray-600 mb-sm: 加载文本 */
/* text-caption italic text-gray-500 mb-base: 副标题文本 */

/* 进度条 */
.loading-progress {
  width: 100%;
  margin-top: var(--spacing-base);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: var(--color-primary-200);
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-info), #60a5fa);
  transition: width 0.3s ease;
}

/* 进度文本样式已迁移至UnoCSS shortcuts */
/* text-caption text-gray-500 text-center: 进度百分比文本 */

/* 额外内容样式已迁移至UnoCSS shortcuts */
/* mt-lg text-center: 额外内容区域 */

/* 背景遮罩 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(2px);
  z-index: 1;
}

.loading-with-overlay .loading-overlay {
  cursor: pointer;
}

/* 动画关键帧 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(0.8);
    opacity: 0.5;
  }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translateY(0);
  }
  40%, 43% {
    transform: translateY(-10px);
  }
  70% {
    transform: translateY(-5px);
  }
  90% {
    transform: translateY(-2px);
  }
}

@keyframes fade {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 文本字体大小已迁移至UnoCSS shortcuts的自动响应式 */
  
  .loading-xlarge {
    width: 60px;
    height: 60px;
  }
  
  .loading-large {
    width: 50px;
    height: 50px;
  }
}

@media (max-width: 480px) {
  /* 内容填充和文本区域宽度已迁移至UnoCSS shortcuts */
  /* padding: content-spacing, max-width: max-w-xs */
  
  .loading-xlarge {
    width: 50px;
    height: 50px;
  }
  
  .loading-large {
    width: 40px;
    height: 40px;
  }
}

/* 可访问性 */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation-duration: 3s;
  }
  
  .loading-bounce {
    animation: none;
    transform: none;
  }
  
  .inner-ring {
    animation: none;
  }
}

/* 深色主题适配（预留） */
@media (prefers-color-scheme: dark) {
  .loading-fullscreen {
    background-color: rgba(0, 0, 0, 0.9);
  }
  
  .loading-text {
    color: #e5e7eb;
  }
  
  .loading-subtitle {
    color: #9ca3af;
  }
}
</style>
