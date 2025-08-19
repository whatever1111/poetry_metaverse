<template>
  <div class="loading-spinner-container" :class="containerClass">
    <!-- 加载动画 -->
    <div class="loading-content">
      <!-- 主加载动画 -->
      <div class="spinner-wrapper">
        <div 
          class="loading-spinner" 
          :class="spinnerClass"
          :style="spinnerStyle"
        ></div>
        
        <!-- 可选的内部装饰 -->
        <div v-if="showInnerRing" class="inner-ring"></div>
      </div>
      
      <!-- 加载文本 -->
      <div v-if="showText" class="loading-text-section">
        <div class="loading-text">{{ loadingText }}</div>
        <div v-if="subtitle" class="loading-subtitle">{{ subtitle }}</div>
        
        <!-- 可选的进度指示 -->
        <div v-if="showProgress && typeof progress === 'number'" class="loading-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"
            ></div>
          </div>
          <div class="progress-text">{{ Math.round(progress) }}%</div>
        </div>
      </div>
      
      <!-- 可选的额外内容插槽 -->
      <div v-if="$slots.extra" class="loading-extra">
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
.loading-spinner-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

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

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

/* 动画器包装 */
.spinner-wrapper {
  position: relative;
  margin-bottom: var(--spacing-lg);
}

/* 基础动画器样式 */
.loading-spinner {
  border-radius: 50%;
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
  border-radius: 50%;
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
  border-radius: 50%;
  animation: spin 2s linear infinite reverse;
}

/* 文本区域 */
.loading-text-section {
  text-align: center;
  max-width: 300px;
}

.loading-text {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
}

.loading-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  font-style: italic;
  margin-bottom: var(--spacing-base);
}

/* 进度条 */
.loading-progress {
  width: 100%;
  margin-top: var(--spacing-base);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: var(--color-primary-200);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-info), #60a5fa);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  text-align: center;
}

/* 额外内容 */
.loading-extra {
  margin-top: var(--spacing-lg);
  text-align: center;
}

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
  .loading-text {
    font-size: var(--font-size-base);
  }
  
  .loading-subtitle {
    font-size: var(--font-size-xs);
  }
  
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
  .loading-content {
    padding: var(--spacing-base);
  }
  
  .loading-text-section {
    max-width: 250px;
  }
  
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
