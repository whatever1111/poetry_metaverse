<template>
  <div class="error-state flex items-center justify-center text-center" :class="containerClass">
          <div class="error-content animate-fadeIn max-w-lg w-full">
      <!-- 错误图标 -->
      <div class="error-icon">
        <div v-if="!$slots.icon" class="default-icon">
          {{ errorIcon }}
        </div>
        <slot name="icon"></slot>
      </div>
      
      <!-- 错误标题 -->
      <h3 class="error-title">{{ errorTitle }}</h3>
      
      <!-- 错误描述 -->
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      
      <!-- 错误详情（可折叠） -->
      <div v-if="errorDetails && showDetails" class="error-details">
        <button @click="toggleDetails" class="details-toggle">
          <span>{{ detailsVisible ? '隐藏详情' : '显示详情' }}</span>
          <svg 
            class="w-4 h-4 ml-1 transition-transform duration-200"
            :class="{ 'rotate-180': detailsVisible }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div v-show="detailsVisible" class="details-content">
          <pre class="details-text">{{ errorDetails }}</pre>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div v-if="showActions || $slots.actions" class="error-actions">
        <slot name="actions">
          <button 
            v-if="showRetry"
            @click="handleRetry"
            class="btn-retry"
            :disabled="retrying"
          >
            <svg v-if="retrying" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ retrying ? retryingText : retryText }}</span>
          </button>
          
          <button 
            v-if="showBack"
            @click="handleBack"
            class="btn-back"
          >
            {{ backText }}
          </button>
          
          <button 
            v-if="showReport"
            @click="handleReport"
            class="btn-report"
          >
            {{ reportText }}
          </button>
        </slot>
      </div>
      
      <!-- 额外建议 -->
      <div v-if="suggestions.length > 0" class="error-suggestions">
        <h4 class="suggestions-title">建议尝试：</h4>
        <ul class="suggestions-list">
          <li v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-item">
            {{ suggestion }}
          </li>
        </ul>
      </div>
      
      <!-- 额外内容插槽 -->
      <div v-if="$slots.extra" class="error-extra">
        <slot name="extra"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 组件Props
interface Props {
  errorType?: 'network' | 'server' | 'client' | 'permission' | 'notfound' | 'unknown'
  errorCode?: string | number
  errorTitle?: string
  errorMessage?: string
  errorDetails?: string
  showDetails?: boolean
  showActions?: boolean
  showRetry?: boolean
  showBack?: boolean
  showReport?: boolean
  retryText?: string
  retryingText?: string
  backText?: string
  reportText?: string
  retrying?: boolean
  suggestions?: string[]
  size?: 'small' | 'medium' | 'large'
  centered?: boolean
}

// 组件Emits
interface Emits {
  retry: []
  back: []
  report: []
}

const props = withDefaults(defineProps<Props>(), {
  errorType: 'unknown',
  errorCode: '',
  errorTitle: '出现了问题',
  errorMessage: '请稍后重试或联系技术支持',
  errorDetails: '',
  showDetails: false,
  showActions: true,
  showRetry: true,
  showBack: true,
  showReport: false,
  retryText: '重试',
  retryingText: '重试中...',
  backText: '返回',
  reportText: '报告问题',
  retrying: false,
  suggestions: () => [],
  size: 'medium',
  centered: true
})

const emit = defineEmits<Emits>()

const detailsVisible = ref(false)

// 计算容器类
const containerClass = computed(() => ({
  [`error-${props.size}`]: true,
  [`error-${props.errorType}`]: true,
  'error-centered': props.centered
}))

// 根据错误类型获取图标
const errorIcon = computed(() => {
  switch (props.errorType) {
    case 'network':
      return '🌐'
    case 'server':
      return '🔧'
    case 'client':
      return '💻'
    case 'permission':
      return '🔒'
    case 'notfound':
      return '🔍'
    default:
      return '⚠️'
  }
})

// 切换详情显示
const toggleDetails = () => {
  detailsVisible.value = !detailsVisible.value
}

// 事件处理函数
const handleRetry = () => {
  if (!props.retrying) {
    emit('retry')
  }
}

const handleBack = () => {
  emit('back')
}

const handleReport = () => {
  emit('report')
}
</script>

<style scoped>
/* 基础布局样式已迁移至UnoCSS: flex items-center justify-center text-center */
.error-state {
  padding: var(--spacing-2xl) var(--spacing-base);
}

.error-centered {
  min-height: 300px;
}

/* 基础尺寸样式已迁移至UnoCSS: max-w-lg w-full */
.error-content {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  border: 1px solid var(--color-warning);
  box-shadow: var(--shadow-lg);
}

/* 错误图标 */
.error-icon {
  margin-bottom: var(--spacing-lg);
}

.default-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-base);
  opacity: 0.8;
}

/* 错误标题 */
.error-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: #92400e;
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
}

/* 错误消息 */
.error-message {
  font-size: var(--font-size-base);
  color: #a16207;
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

/* 错误详情 */
.error-details {
  margin-bottom: var(--spacing-lg);
  text-align: left;
}

.details-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #92400e;
  font-size: var(--font-size-sm);
  cursor: pointer;
  padding: var(--spacing-xs) 0;
  transition: color var(--duration-fast) var(--ease-out);
}

.details-toggle:hover {
  color: #78350f;
}

.details-content {
  margin-top: var(--spacing-base);
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-base);
  padding: var(--spacing-base);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.details-text {
  font-size: var(--font-size-xs);
  color: #a16207;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
  font-family: 'Courier New', monospace;
}

/* 操作按钮区域 */
.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-base);
  justify-content: center;
  margin-bottom: var(--spacing-base);
}

.btn-retry,
.btn-back,
.btn-report {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-base);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  min-width: 80px;
}

.btn-retry {
  background: linear-gradient(135deg, var(--color-warning) 0%, #d97706 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-retry:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
}

.btn-retry:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-back {
  background: white;
  color: #92400e;
  border: 1px solid #fbbf24;
}

.btn-back:hover {
  background: #fef3c7;
  transform: translateY(-1px);
}

.btn-report {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-report:hover {
  background: #e5e7eb;
  color: #4b5563;
  transform: translateY(-1px);
}

/* 建议列表 */
.error-suggestions {
  text-align: left;
  margin-bottom: var(--spacing-base);
}

.suggestions-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: #92400e;
  margin-bottom: var(--spacing-sm);
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-item {
  font-size: var(--font-size-sm);
  color: #a16207;
  margin-bottom: var(--spacing-xs);
  padding-left: var(--spacing-base);
  position: relative;
  line-height: 1.5;
}

.suggestion-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #fbbf24;
  font-weight: bold;
}

/* 额外内容 */
.error-extra {
  margin-top: var(--spacing-base);
}

/* 尺寸变体 */
.error-small {
  padding: var(--spacing-lg) var(--spacing-base);
  min-height: 200px;
}

.error-small .error-content {
  padding: var(--spacing-lg);
}

.error-small .default-icon {
  font-size: 2rem;
}

.error-small .error-title {
  font-size: var(--font-size-lg);
}

.error-small .error-message {
  font-size: var(--font-size-sm);
}

.error-medium {
  padding: var(--spacing-2xl) var(--spacing-base);
  min-height: 300px;
}

.error-large {
  padding: var(--spacing-3xl) var(--spacing-base);
  min-height: 400px;
}

.error-large .error-content {
  max-width: 600px;
  padding: var(--spacing-3xl);
}

.error-large .default-icon {
  font-size: 4rem;
}

.error-large .error-title {
  font-size: var(--font-size-2xl);
}

.error-large .error-message {
  font-size: var(--font-size-lg);
}

/* 错误类型变体 */
.error-network .error-content {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #3b82f6;
}

.error-network .error-title {
  color: #1d4ed8;
}

.error-network .error-message {
  color: #2563eb;
}

.error-server .error-content {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  border-color: #ef4444;
}

.error-server .error-title {
  color: #dc2626;
}

.error-server .error-message {
  color: #ef4444;
}

.error-permission .error-content {
  background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
  border-color: #8b5cf6;
}

.error-permission .error-title {
  color: #7c3aed;
}

.error-permission .error-message {
  color: #8b5cf6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-state {
    padding: var(--spacing-xl) var(--spacing-base);
  }
  
  .error-content {
    padding: var(--spacing-lg);
  }
  
  .error-large .error-content {
    padding: var(--spacing-xl);
  }
  
  .error-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-retry,
  .btn-back,
  .btn-report {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .error-state {
    padding: var(--spacing-lg) var(--spacing-sm);
  }
  
  .error-content {
    padding: var(--spacing-base);
  }
  
  .error-title {
    font-size: var(--font-size-lg);
  }
  
  .error-message {
    font-size: var(--font-size-sm);
  }
  
  .default-icon {
    font-size: 2.5rem;
  }
}

/* 动画效果 */
.error-icon {
  opacity: 0;
  animation: bounceIn 0.8s var(--ease-out) 0.2s forwards;
}

.error-title {
  opacity: 0;
  animation: fadeInUp 0.6s var(--ease-out) 0.4s forwards;
}

.error-message {
  opacity: 0;
  animation: fadeInUp 0.6s var(--ease-out) 0.6s forwards;
}

.error-actions {
  opacity: 0;
  animation: fadeInUp 0.6s var(--ease-out) 0.8s forwards;
}

@keyframes bounceIn {
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

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 可访问性 */
@media (prefers-reduced-motion: reduce) {
  .error-icon,
  .error-title,
  .error-message,
  .error-actions {
    opacity: 1;
    animation: none;
  }
}
</style>
