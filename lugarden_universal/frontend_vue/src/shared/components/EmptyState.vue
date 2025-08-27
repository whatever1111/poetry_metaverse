<template>
  <div class="empty-state flex items-center justify-center text-center" :class="containerClass">
          <div class="empty-content animate-fadeIn max-w-sm w-full card-padding-normal content-spacing-normal">
      <!-- 图标或插图 -->
      <div class="mb-lg">
        <div v-if="!$slots.icon" class="text-6xl mb-base opacity-60">
          <component v-if="iconComponent" :is="iconComponent" class="w-6 h-6 mx-auto" aria-hidden="true" />
          <span v-else>{{ icon }}</span>
        </div>
        <slot name="icon"></slot>
      </div>
      
      <!-- 标题 -->
      <h3 class="text-heading-spaced text-gray-700">{{ title }}</h3>
      
      <!-- 描述文字 -->
      <p v-if="description" class="text-body-spaced text-gray-600">{{ description }}</p>
      
      <!-- 操作按钮 -->
      <div v-if="showAction || $slots.action" class="mb-base">
        <slot name="action">
          <button 
            v-if="actionText"
            @click="handleAction"
            class="btn-primary min-w-[120px]"
            :disabled="actionLoading"
          >
            <span v-if="actionLoading">{{ actionLoadingText }}</span>
            <span v-else>{{ actionText }}</span>
          </button>
        </slot>
      </div>
      
      <!-- 额外内容插槽 -->
      <div v-if="$slots.extra" class="mt-base">
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

/* 所有Typography样式已迁移至UnoCSS shortcuts - D.1.6 标准化 */

/* 尺寸变体布局样式保留，Typography已迁移至shortcuts - D.1.6 标准化 */
.empty-small {
  padding: var(--spacing-lg) var(--spacing-base);
  min-height: 200px;
}

.empty-medium {
  padding: var(--spacing-2xl) var(--spacing-base);
  min-height: 300px;
}

.empty-large {
  padding: var(--spacing-3xl) var(--spacing-base);
  min-height: 400px;
}

/* 变体样式保留背景和边框颜色，Typography已统一至shortcuts - D.1.6 标准化 */
.empty-default {
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.9) 100%);
}

.empty-search {
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.8) 0%, rgba(224, 242, 254, 0.9) 100%);
  border: 1px solid rgba(14, 165, 233, 0.2);
}

.empty-error {
  background: linear-gradient(135deg, rgba(254, 242, 242, 0.8) 0%, rgba(254, 226, 226, 0.9) 100%);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.empty-success {
  background: linear-gradient(135deg, rgba(240, 253, 244, 0.8) 0%, rgba(220, 252, 231, 0.9) 100%);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.empty-loading {
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.8) 0%, rgba(254, 243, 199, 0.9) 100%);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

/* 响应式Typography已通过clamp()内置，卡片填充已通过shortcuts管理 - D.1.6 标准化 */
@media (max-width: 768px) {
  .empty-state {
    padding: var(--spacing-xl) var(--spacing-base);
  }
  
  .empty-large {
    padding: var(--spacing-2xl) var(--spacing-base);
    min-height: 300px;
  }
}

@media (max-width: 480px) {
  .empty-state {
    padding: var(--spacing-lg) var(--spacing-sm);
  }
  
  .empty-content {
    max-width: none;
  }
}

/* 动画效果 - 适配新的HTML结构 - D.1.6 标准化 */
.empty-content > div:first-child {
  opacity: 0;
  animation: fadeInUp 0.6s var(--ease-out) 0.2s forwards;
}

.empty-content h3 {
  opacity: 0;
  animation: fadeInUp 0.6s var(--ease-out) 0.4s forwards;
}

.empty-content p {
  opacity: 0;
  animation: fadeInUp 0.6s var(--ease-out) 0.6s forwards;
}

.empty-content > div:nth-child(4) {
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

/* 可访问性 - 适配新的HTML结构 - D.1.6 标准化 */
@media (prefers-reduced-motion: reduce) {
  .empty-content > div:first-child,
  .empty-content h3,
  .empty-content p,
  .empty-content > div:nth-child(4) {
    opacity: 1;
    animation: none;
  }
}

/* 暗黑模式适配（预留） - Typography已统一至shortcuts - D.1.6 标准化 */
@media (prefers-color-scheme: dark) {
  .empty-default {
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%);
  }
}

/* 交互效果 - 适配新的HTML结构 - D.1.6 标准化 */
.empty-content:hover > div:first-child > div {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
