<template>
  <div v-if="showActions" class="action-group animate-fadeInUp" :style="{ animationDelay: animationDelay }">
    <button
      v-for="action in visibleActions"
      :key="action.key"
      @click="action.handler"
      :class="[
        'btn-action',
        action.variant && `btn-action-${action.variant}`,
        action.additionalClasses
      ]"
      :disabled="action.disabled"
      :title="action.title"
    >
      <span class="action-icon text-base leading-none shrink-0">
        {{ action.icon }}
      </span>
      <span class="action-text whitespace-nowrap font-medium">
        {{ action.text }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 操作按钮配置接口
interface ActionButton {
  key: string
  icon: string
  text: string
  handler: () => void
  disabled?: boolean
  title?: string
  variant?: 'success' | 'warning' | 'error'
  visible?: boolean
  additionalClasses?: string
}

// 组件Props
interface Props {
  actions: ActionButton[]
  showActions?: boolean
  animationDelay?: string
  layout?: 'horizontal' | 'vertical' | 'auto'
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  animationDelay: '0s',
  layout: 'auto'
})

// 过滤可见的操作
const visibleActions = computed(() => 
  props.actions.filter(action => action.visible !== false)
)
</script>

<style scoped>
.action-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-base);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-primary-100);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .action-group {
    gap: var(--spacing-sm);
    padding-top: var(--spacing-base);
  }
}

@media (max-width: 480px) {
  .action-group {
    flex-direction: column;
    gap: var(--spacing-xs);
    align-items: stretch;
  }
  
  .action-group .btn-action {
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }
}

/* 垂直布局变体 */
.action-group[data-layout="vertical"] {
  flex-direction: column;
  align-items: stretch;
}

.action-group[data-layout="vertical"] .btn-action {
  width: 100%;
  max-width: 200px;
  margin: 0 auto;
}

/* 水平布局变体 */
.action-group[data-layout="horizontal"] {
  flex-direction: row;
  flex-wrap: wrap;
}
</style>
