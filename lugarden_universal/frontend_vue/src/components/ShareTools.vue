<template>
  <div v-if="showActions" class="flex justify-center items-center gap-4 mt-8 pt-6 animate-fadeInUp max-md:gap-2 max-md:pt-4 max-sm:gap-3 max-sm:justify-center" :style="{ animationDelay: animationDelay }" :class="layoutClasses">
    <button
      v-for="action in visibleActions"
      :key="action.key"
      @click="action.handler"
      :class="[
        'btn-share-tools',
        action.variant && `btn-share-tools-${action.variant}`,
        action.additionalClasses,
        'max-sm:w-8 max-sm:h-8',
        props.layout === 'vertical' && 'w-8 h-8'
      ]"
      :disabled="action.disabled"
      :title="action.title"
    >
      <component 
        :is="action.iconComponent" 
        class="w-4 h-4" 
        aria-hidden="true"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  DocumentDuplicateIcon, 
  ShareIcon, 
  ArrowDownTrayIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

// 分享工具按钮配置接口 (C.5重构: 纯图标模式)
interface ShareToolButton {
  key: string
  iconComponent: any  // Heroicons组件
  handler: () => void
  disabled?: boolean
  title: string  // hover tooltip必需
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
