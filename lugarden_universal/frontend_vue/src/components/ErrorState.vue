<template>
  <div class="error-state flex items-center justify-center text-center" :class="containerClass">
          <div class="error-content animate-fadeIn max-w-lg w-full card-padding-normal content-spacing-normal rounded-lg">
      <!-- 错误图标 -->
      <div class="mb-lg">
        <div v-if="!$slots.icon" class="text-5xl mb-base opacity-80">
          <component :is="errorIconComponent" class="w-6 h-6 mx-auto" aria-hidden="true" />
        </div>
        <slot name="icon"></slot>
      </div>
      
      <!-- 错误标题 -->
      <h3 class="text-heading-spaced text-amber-800">{{ errorTitle }}</h3>
      
      <!-- 错误描述 -->
      <p v-if="errorMessage" class="text-body-spaced text-amber-700">{{ errorMessage }}</p>
      
      <!-- 错误详情（可折叠） -->
      <div v-if="errorDetails && showDetails" class="mb-lg text-left">
        <button @click="toggleDetails" class="flex items-center justify-center bg-transparent border-0 text-amber-800 text-caption cursor-pointer px-xs py-0 transition-colors duration-200 hover:text-amber-900">
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
        
        <div v-show="detailsVisible" class="mt-base bg-white/50 border border-amber-300/30 p-base rounded-base">
          <pre class="text-label text-amber-700 whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto m-0 font-mono">{{ errorDetails }}</pre>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div v-if="showActions || $slots.actions" class="error-actions">
        <slot name="actions">
          <button 
            v-if="showRetry"
            @click="handleRetry"
            class="btn-retry-warning"
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
            class="btn-back rounded-base text-sm font-semibold"
          >
            {{ backText }}
          </button>
          
          <button 
            v-if="showReport"
            @click="handleReport"
            class="btn-report rounded-base text-sm font-semibold"
          >
            {{ reportText }}
          </button>
        </slot>
      </div>
      
      <!-- 额外建议 -->
      <div v-if="suggestions.length > 0" class="text-left mb-base">
        <h4 class="text-caption-spaced font-semibold text-amber-800">建议尝试：</h4>
        <ul class="list-none p-0 m-0">
          <li v-for="(suggestion, index) in suggestions" :key="index" class="text-caption text-amber-700 mb-xs pl-base relative leading-relaxed">
            <span class="absolute left-0 text-amber-400 font-bold">•</span>
            {{ suggestion }}
          </li>
        </ul>
      </div>
      
      <!-- 额外内容插槽 -->
      <div v-if="$slots.extra" class="mt-base">
        <slot name="extra"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ExclamationTriangleIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

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

// 根据错误类型返回对应SVG图标组件 - C.5重构
const errorIconComponent = computed(() => {
  switch (props.errorType) {
    case 'network':
      return ExclamationTriangleIcon  // 🌐 → 警告
    case 'server':
      return ExclamationTriangleIcon  // 🔧 → 警告  
    case 'client':
      return ExclamationTriangleIcon  // 💻 → 警告
    case 'permission':
      return ExclamationTriangleIcon  // 🔒 → 警告
    case 'notfound':
      return MagnifyingGlassIcon      // 🔍 → 搜索
    default:
      return ExclamationTriangleIcon  // ⚠️ → 警告
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
  padding: var(--spacing-2xl);
  border: 1px solid var(--color-warning);
  box-shadow: var(--shadow-lg);
}

/* 错误图标、标题、消息、详情样式已迁移至UnoCSS shortcuts - D.1.5 标准化 */

/* 操作按钮区域 */
.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-base);
  justify-content: center;
  margin-bottom: var(--spacing-base);
}

/* btn-retry-warning现在使用统一的UnoCSS定义 */

.btn-back,
.btn-report {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  min-width: 80px;
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

/* 建议列表和额外内容样式已迁移至UnoCSS shortcuts - D.1.5 标准化 */

/* 尺寸变体布局样式保留，Typography已迁移至shortcuts - D.1.5 标准化 */
.error-small {
  padding: var(--spacing-lg) var(--spacing-base);
  min-height: 200px;
}

.error-small .error-content {
  padding: var(--spacing-lg);
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

/* 错误类型变体保留背景和边框颜色，Typography已统一至shortcuts - D.1.5 标准化 */
.error-network .error-content {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #3b82f6;
}

.error-server .error-content {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  border-color: #ef4444;
}

.error-permission .error-content {
  background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
  border-color: #8b5cf6;
}

/* 响应式Typography已通过clamp()内置，卡片填充已通过shortcuts管理 - D.1.5 标准化 */
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
  
  .btn-retry-warning,
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
}

/* 动画效果 - 适配新的HTML结构 - D.1.5 标准化 */
.error-content > div:first-child {
  opacity: 0;
  animation: bounceIn 0.8s var(--ease-out) 0.2s forwards;
}

.error-content h3 {
  opacity: 0;
  animation: fadeInUp 0.6s var(--ease-out) 0.4s forwards;
}

.error-content p {
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

/* 可访问性 - 适配新的HTML结构 - D.1.5 标准化 */
@media (prefers-reduced-motion: reduce) {
  .error-content > div:first-child,
  .error-content h3,
  .error-content p,
  .error-actions {
    opacity: 1;
    animation: none;
  }
}
</style>
