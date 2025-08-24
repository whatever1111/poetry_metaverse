<template>
  <div class="empty-state flex items-center justify-center text-center" :class="containerClass">
          <div class="empty-content animate-fadeIn max-w-sm w-full">
      <!-- 图标或插图 -->
      <div class="empty-icon">
        <div v-if="!$slots.icon" class="default-icon">
          <component v-if="iconComponent" :is="iconComponent" class="w-6 h-6 mx-auto" aria-hidden="true" />
          <span v-else>{{ icon }}</span>
        </div>
        <slot name="icon"></slot>
      </div>
      
      <!-- 标题 -->
      <h3 class="empty-title">{{ title }}</h3>
      
      <!-- 描述文字 -->
      <p v-if="description" class="empty-description">{{ description }}</p>
      
      <!-- 操作按钮 -->
      <div v-if="showAction || $slots.action" class="empty-actions">
        <slot name="action">
          <button 
            v-if="actionText"
            @click="handleAction"
            class="btn-primary"
            :disabled="actionLoading"
          >
            <span v-if="actionLoading">{{ actionLoadingText }}</span>
            <span v-else>{{ actionText }}</span>
          </button>
        </slot>
      </div>
      
      <!-- 额外内容插槽 -->
      <div v-if="$slots.extra" class="empty-extra">
        <slot name="extra"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PencilIcon } from '@heroicons/vue/24/outline'

// 组件Props
interface Props {
  icon?: string
  iconComponent?: any  // SVG组件支持 - C.5重构
  title?: string
  description?: string
  actionText?: string
  actionLoadingText?: string
  actionLoading?: boolean
  showAction?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'search' | 'error' | 'loading' | 'success'
  centered?: boolean
}

// 组件Emits
interface Emits {
  action: []
}

const props = withDefaults(defineProps<Props>(), {
  icon: '',
  iconComponent: PencilIcon,  // C.5默认使用SVG图标
  title: '暂无内容',
  description: '',
  actionText: '',
  actionLoadingText: '处理中...',
  actionLoading: false,
  showAction: false,
  size: 'medium',
  variant: 'default',
  centered: true
})

const emit = defineEmits<Emits>()

// 计算容器类
const containerClass = computed(() => ({
  [`empty-${props.size}`]: true,
  [`empty-${props.variant}`]: true,
  'empty-centered': props.centered,
  'rounded-lg': true
}))

// 处理操作
const handleAction = () => {
  if (!props.actionLoading) {
    emit('action')
  }
}
</script>

<style scoped>
/* 基础布局样式已迁移至UnoCSS: flex items-center justify-center text-center */
.empty-state {
  padding: var(--spacing-2xl) var(--spacing-base);
  color: var(--text-tertiary);
}

.empty-centered {
  min-height: 300px;
}

/* 基础尺寸样式已迁移至UnoCSS: max-w-sm w-full */
.empty-content {}

/* 图标样式 */
.empty-icon {
  margin-bottom: var(--spacing-lg);
}

.default-icon {
  font-size: 4rem;
  opacity: 0.6;
  margin-bottom: var(--spacing-base);
}

/* 标题样式 */
.empty-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
}

/* 描述样式 */
.empty-description {
  font-size: var(--font-size-base);
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

/* 操作按钮区域 */
.empty-actions {
  margin-bottom: var(--spacing-base);
}

.empty-actions .btn-primary {
  min-width: 120px;
}

/* 额外内容 */
.empty-extra {
  margin-top: var(--spacing-base);
}

/* 尺寸变体 */
.empty-small {
  padding: var(--spacing-lg) var(--spacing-base);
  min-height: 200px;
}

.empty-small .default-icon {
  font-size: 2.5rem;
}

.empty-small .empty-title {
  font-size: var(--font-size-lg);
}

.empty-small .empty-description {
  font-size: var(--font-size-sm);
}

.empty-medium {
  padding: var(--spacing-2xl) var(--spacing-base);
  min-height: 300px;
}

.empty-medium .default-icon {
  font-size: 4rem;
}

.empty-large {
  padding: var(--spacing-3xl) var(--spacing-base);
  min-height: 400px;
}

.empty-large .default-icon {
  font-size: 5rem;
}

.empty-large .empty-title {
  font-size: var(--font-size-2xl);
}

.empty-large .empty-description {
  font-size: var(--font-size-lg);
}

/* 变体样式 */
.empty-default {
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.9) 100%);
}

.empty-search {
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.8) 0%, rgba(224, 242, 254, 0.9) 100%);
  border: 1px solid rgba(14, 165, 233, 0.2);
}

.empty-search .empty-title {
  color: #0369a1;
}

.empty-search .empty-description {
  color: #0284c7;
}

.empty-error {
  background: linear-gradient(135deg, rgba(254, 242, 242, 0.8) 0%, rgba(254, 226, 226, 0.9) 100%);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.empty-error .empty-title {
  color: #dc2626;
}

.empty-error .empty-description {
  color: #ef4444;
}

.empty-success {
  background: linear-gradient(135deg, rgba(240, 253, 244, 0.8) 0%, rgba(220, 252, 231, 0.9) 100%);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.empty-success .empty-title {
  color: #16a34a;
}

.empty-success .empty-description {
  color: #22c55e;
}

.empty-loading {
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.8) 0%, rgba(254, 243, 199, 0.9) 100%);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.empty-loading .empty-title {
  color: #d97706;
}

.empty-loading .empty-description {
  color: #f59e0b;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .empty-state {
    padding: var(--spacing-xl) var(--spacing-base);
  }
  
  .empty-large {
    padding: var(--spacing-2xl) var(--spacing-base);
    min-height: 300px;
  }
  
  .empty-large .default-icon {
    font-size: 4rem;
  }
  
  .empty-large .empty-title {
    font-size: var(--font-size-xl);
  }
  
  .empty-large .empty-description {
    font-size: var(--font-size-base);
  }
}

@media (max-width: 480px) {
  .empty-state {
    padding: var(--spacing-lg) var(--spacing-sm);
  }
  
  .empty-content {
    max-width: none;
  }
  
  .empty-title {
    font-size: var(--font-size-lg);
  }
  
  .empty-description {
    font-size: var(--font-size-sm);
  }
  
  .default-icon {
    font-size: 3rem;
  }
  
  .empty-actions .btn-primary {
    min-width: 100px;
    font-size: var(--font-size-sm);
  }
}

/* 动画效果 */
.empty-icon {
  opacity: 0;
  animation: fadeInUp 0.6s var(--ease-out) 0.2s forwards;
}

.empty-title {
  opacity: 0;
  animation: fadeInUp 0.6s var(--ease-out) 0.4s forwards;
}

.empty-description {
  opacity: 0;
  animation: fadeInUp 0.6s var(--ease-out) 0.6s forwards;
}

.empty-actions {
  opacity: 0;
  animation: fadeInUp 0.6s var(--ease-out) 0.8s forwards;
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
  .empty-icon,
  .empty-title,
  .empty-description,
  .empty-actions {
    opacity: 1;
    animation: none;
  }
}

/* 暗黑模式适配（预留） */
@media (prefers-color-scheme: dark) {
  .empty-default {
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%);
  }
  
  .empty-title {
    color: #e2e8f0;
  }
  
  .empty-description {
    color: #94a3b8;
  }
}

/* 交互效果 */
.empty-state:hover .default-icon {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

.empty-actions .btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
