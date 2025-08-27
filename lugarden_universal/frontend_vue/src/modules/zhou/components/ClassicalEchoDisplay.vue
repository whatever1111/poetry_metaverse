<template>
  <div class="max-w-3xl mx-auto">
    <!-- 核心引导语 - 来自原版zhou.html -->
    <div class="text-center animate-fadeInUp">
      <h2 class="text-heading-spaced">
        你选择的道路，有古人智慧的回响
      </h2>
    </div>
    
    <!-- 古典内容展示区域 - 统一卡片设计 -->
    <div class="mt-3xl mb-3xl animate-fadeInUp" :style="{ animationDelay: contentAnimationDelay }">
      
      <!-- 统一内容卡片 -->
      <div v-if="hasAnyContent" class="unified-content-card card-padding-normal content-spacing-normal rounded-base" >
        
        <!-- 引文篇目名 - 居中加粗 -->
        <div v-if="quoteCitation" class="text-heading-spaced text-center font-bold italic tracking-wide">
          {{ quoteCitation }}
        </div>
        
        <!-- 引文内容 - 粗体 -->
        <div v-if="quoteText" class="text-body-spaced font-semibold italic text-gray-700">
          {{ quoteText }}
        </div>
        
        <!-- 古典回响内容 - 标准粗细 -->
        <div v-if="classicalEcho" class="text-body text-gray-700 text-justify">
          {{ classicalEcho }}
        </div>
        
      </div>
      
      <!-- 无内容时的默认展示 -->
      <div v-if="!hasAnyContent" class="text-center card-padding-normal content-spacing-normal bg-white/40 backdrop-blur-[10px] border border-white/30 text-gray-600 rounded-base">
        <div class="text-5xl mb-base opacity-70">🏮</div>
        <p class="text-body italic">{{ emptyMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 组件Props
interface Props {
  quoteText?: string | null
  quoteCitation?: string | null
  classicalEcho?: string | null
  contentAnimationDelay?: string
  emptyMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  quoteText: null,
  quoteCitation: null,
  classicalEcho: null,
  contentAnimationDelay: '0.1s',
  emptyMessage: '古典智慧与现代诗歌的对话，需要更多的时间来沉淀...'
})

// 检查是否有任何内容
const hasAnyContent = computed(() => {
  return !!(props.quoteText || props.quoteCitation || props.classicalEcho)
})
</script>

<style scoped>
/* 基础容器样式已迁移至UnoCSS utility类 */

/* 所有Typography样式已迁移至UnoCSS shortcuts - D.1.4 标准化 */

/* 响应式Typography已通过clamp()内置，卡片填充已通过shortcuts管理 - D.1.4 标准化 */

/* 动画和悬浮效果现已移至全局CSS - components.css */
</style>
