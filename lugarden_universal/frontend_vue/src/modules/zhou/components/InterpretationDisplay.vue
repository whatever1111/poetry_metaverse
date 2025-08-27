<template>
  <div class="max-w-3xl mx-auto">
    <!-- AI解读 -->
    <div 
      v-if="aiInterpretation" 
      class="interpretation-content unified-content-card card-padding-interpret content-spacing-normal rounded-base animate-fadeInUp" 
      :style="{ animationDelay: aiAnimationDelay }"
    >
      <div class="interpretation-header">
        <h3 class="text-heading flex items-center">
          <SparklesIcon class="w-5 h-5 mr-2 text-gray-500" aria-hidden="true" />
          陆家明
        </h3>
        <div v-if="showTimestamp && aiTimestamp" class="text-label absolute right-0 italic text-gray-600">
          {{ formatTimestamp(aiTimestamp) }}
        </div>
      </div>
      
      <div class="interpretation-body">
        <div class="text-body-spaced whitespace-pre-line break-words text-justify">
          {{ aiInterpretation }}
        </div>
        
        <!-- 可选的AI解读操作 -->
        <div v-if="showAiActions" class="interpretation-actions">
          <button @click="handleRegenerateAi" class="btn-regenerate" :disabled="regenerating">
            <span v-if="regenerating">重新生成中...</span>
            <span v-else>重新解读</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 诗人解读 -->
    <div 
      v-if="poetExplanation" 
      class="poet-explanation unified-content-card card-padding-interpret content-spacing-normal rounded-base animate-fadeInUp" 
      :style="{ animationDelay: poetAnimationDelay }"
    >
      <div class="interpretation-header">
        <h3 class="text-heading flex items-center">
          <AcademicCapIcon class="w-5 h-5 mr-2 text-gray-500" aria-hidden="true" />
          吴任几
        </h3>
        <div v-if="showTimestamp && poetTimestamp" class="text-label absolute right-0 italic text-gray-600">
          {{ formatTimestamp(poetTimestamp) }}
        </div>
      </div>
      
      <div class="interpretation-body">
        <div class="text-body-spaced whitespace-pre-line break-words text-justify">
          {{ poetExplanation }}
        </div>
        
        <!-- 诗人信息 -->
        <div v-if="poetName" class="mt-xl pt-lg relative flex items-center gap-sm">
          <span class="text-caption text-gray-600 font-medium">诗人:</span>
          <span class="text-caption text-gray-500 font-semibold">{{ poetName }}</span>
        </div>
      </div>
    </div>

    <!-- 自定义解读内容插槽 -->
    <div v-if="$slots.custom" class="custom-interpretation unified-content-card card-padding-normal content-spacing-normal rounded-base animate-fadeInUp">
      <slot name="custom"></slot>
    </div>
    
    <!-- AI功能错误状态 -->
    <div v-if="showAiError && aiError" class="ai-error unified-content-card card-padding-normal text-center rounded-base animate-fadeInUp">
      <div class="content-spacing-normal">
        <div class="text-4xl mb-base">
          <ExclamationTriangleIcon class="w-5 h-5 mx-auto" aria-hidden="true" />
        </div>
        <h3 class="text-heading-spaced text-red-600">AI功能暂时无法使用</h3>
        <p class="text-body-spaced text-gray-700">{{ aiError }}</p>
        <div v-if="showRetryAction" class="flex justify-center">
          <button @click="handleRetryAi" class="btn-retry" :disabled="retrying">
            <span v-if="retrying">重试中...</span>
            <span v-else>重试</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!aiInterpretation && !poetExplanation && !$slots.custom && !showAiError" class="text-center card-padding-normal content-spacing-normal text-gray-600">
      <div class="text-5xl mb-base opacity-60">
        <ChatBubbleLeftEllipsisIcon class="w-6 h-6 mx-auto" aria-hidden="true" />
      </div>
      <p class="text-body italic">{{ emptyMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// ================================
// 读诗功能移除记录 (2025-08-26)
// ================================
// 移除内容: 未使用的Heroicons imports (代码清理)
// 删除的imports: UserIcon, LightBulbIcon, BeakerIcon, WrenchScrewdriverIcon
// 清理原因: 移除读诗功能后，这些图标不再被使用
// 恢复说明: 如需恢复相关功能，可根据需要重新导入对应的图标组件
// ================================
import { ExclamationTriangleIcon, ChatBubbleLeftEllipsisIcon, AcademicCapIcon, SparklesIcon } from '@heroicons/vue/24/outline'

// 组件Props
interface Props {
  aiInterpretation?: string | null
  poetExplanation?: string | null
  poetName?: string
  showTimestamp?: boolean
  aiTimestamp?: Date | null
  poetTimestamp?: Date | null
  aiAnimationDelay?: string
  poetAnimationDelay?: string
  showAiActions?: boolean
  regenerating?: boolean
  emptyMessage?: string
  aiError?: string | null
  showAiError?: boolean
  showRetryAction?: boolean
  retrying?: boolean
}

// 组件Emits
interface Emits {
  regenerateAi: []
  retryAi: []
}

const props = withDefaults(defineProps<Props>(), {
  aiInterpretation: null,
  poetExplanation: null,
  poetName: '',
  showTimestamp: false,
  aiTimestamp: null,
  poetTimestamp: null,
  aiAnimationDelay: '0s',
  poetAnimationDelay: '0.2s',
  showAiActions: false,
  regenerating: false,
  emptyMessage: '暂无解读内容',
  aiError: null,
  showAiError: false,
  showRetryAction: true,
  retrying: false
})

const emit = defineEmits<Emits>()

// 格式化时间戳
const formatTimestamp = (timestamp: Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp)
}

// 重新生成AI解读
const handleRegenerateAi = () => {
  if (props.regenerating) return
  emit('regenerateAi')
}

// 重试AI功能
const handleRetryAi = () => {
  if (props.retrying) return
  emit('retryAi')
}
</script>

<style scoped>
/* 基础容器样式已迁移至UnoCSS utility类 */

.interpretation-content,
.poet-explanation,
.custom-interpretation {
  text-align: left;
  margin-bottom: var(--spacing-lg);
}

.interpretation-content:last-child,
.poet-explanation:last-child,
.custom-interpretation:last-child {
  margin-bottom: 0;
}

.interpretation-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* Typography样式已迁移至UnoCSS shortcuts - D.1.3 标准化 */

/* 图标统一样式 - 与分享按钮颜色保持一致 */
.interpretation-content .interpretation-title svg,
.poet-explanation .interpretation-title svg {
  color: rgb(107 114 128); /* text-gray-500 的实际值 */
  transition: color 0.15s ease-out;
}

/* 悬停效果 - 与分享按钮一致 */
.interpretation-header:hover .interpretation-title svg {
  color: rgb(55 65 81); /* text-gray-700 的实际值 */
}

/* .poet-info样式已迁移至UnoCSS shortcuts - D.1.3 标准化 */

/* 操作按钮 */
.interpretation-actions {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: flex-end;
}

/* 所有错误状态和空状态Typography已迁移至UnoCSS shortcuts - D.1.3 标准化 */

/* 响应式Typography已通过clamp()内置，卡片填充已通过shortcuts管理 - D.1.3 标准化 */
@media (max-width: 768px) {
  .interpretation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .poet-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
}

/* 保留必要的阅读体验增强效果（无法通过shortcuts实现的特殊样式） */

/* 内容渐入动画增强 - 针对shortcuts迁移后的选择器 */
.interpretation-body > div {
  opacity: 0;
  animation: fadeIn 0.8s var(--ease-out) 0.3s forwards;
  transform: translateY(0);
}

.poet-explanation .interpretation-body > div {
  animation-delay: 0.5s;
}

/* 面向不同内容长度的适应性优化 - 基于data属性 */
[data-length="short"] {
  line-height: 1.7 !important;
  letter-spacing: 0.01em !important;
}

[data-length="medium"] {
  line-height: 1.8 !important;
  letter-spacing: 0.02em !important;
}

[data-length="long"] {
  line-height: 1.9 !important;
  letter-spacing: 0.03em !important;
}

/* 文字打字机效果（可选） */
.typewriter {
  overflow: hidden;
  border-right: 2px solid var(--color-primary-400);
  white-space: nowrap;
  animation: typing 3s steps(40, end), blink-caret 0.75s step-end infinite;
}

@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes blink-caret {
  from, to { border-color: transparent; }
  50% { border-color: var(--color-primary-400); }
}

/* 阅读体验统一优化 */
.interpretation-body > div {
  scroll-behavior: smooth;
  orphans: 2;
  widows: 2;
}

/* 滚动条样式 */
.interpretation-body > div::-webkit-scrollbar {
  width: 4px;
}

.interpretation-body > div::-webkit-scrollbar-track {
  background: var(--color-primary-100);
}

.interpretation-body > div::-webkit-scrollbar-thumb {
  background: var(--color-primary-300);
}
</style>
