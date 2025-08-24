<template>
  <div v-if="showActions" class="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-primary-100 animate-fadeInUp max-md:gap-2 max-md:pt-4 max-sm:flex-col max-sm:gap-1 max-sm:items-stretch" :style="{ animationDelay: animationDelay }" :class="layoutClasses">
    <button
      v-for="action in visibleActions"
      :key="action.key"
      @click="action.handler"
      :class="[
        'btn-share-tools',
        action.variant && `btn-share-tools-${action.variant}`,
        action.additionalClasses,
        'max-sm:w-full max-sm:max-w-[150px] max-sm:mx-auto',
        props.layout === 'vertical' && 'w-full max-w-[150px] mx-auto'
      ]"
      :disabled="action.disabled"
      :title="action.title"
    >
      <span class="share-icon text-sm leading-none shrink-0">
        {{ action.icon }}
      </span>
      <span class="share-text whitespace-nowrap font-medium">
        {{ action.text }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 分享工具按钮配置接口
interface ShareToolButton {
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
  actions: ShareToolButton[]
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

// 布局样式计算
const layoutClasses = computed(() => ({
  'flex-col items-stretch': props.layout === 'vertical',
  'flex-row flex-wrap': props.layout === 'horizontal'
}))
</script>

<!-- ShareTools组件样式已完全迁移至UnoCSS (C.4轻量化重构) -->
