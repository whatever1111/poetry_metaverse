<template>
  <div class="max-w-4xl mx-auto">
    <div class="unified-content-card card-padding-normal content-spacing-normal rounded-base animate-fadeInUp">
      <div 
        class="text-heading-spaced text-center animate-textChange" 
        :key="questionIndex"
      >
        {{ question.question }}
      </div>
      
      <!-- 选项按钮 -->
      <div class="flex flex-col gap-4 sm:gap-6 md:gap-8">
        <button 
          v-for="(option, key) in question.options"
          :key="key"
          class="btn-option text-left justify-start whitespace-normal text-body px-6 py-4 max-sm:px-4 max-sm:py-3 animate-fadeInUp"
          :style="{ animationDelay: `${0.3 + (key === 'A' ? 0 : 0.1)}s` }"
          @click="handleAnswer(key as 'A' | 'B')"
          :disabled="disabled"
        >
          <span class="font-bold mr-2">{{ key }}.</span>
          {{ option }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ZhouQuestion } from '../types/zhou'

// 组件Props
interface Props {
  question: ZhouQuestion
  questionIndex: number
  disabled?: boolean
}

// 组件Emits
interface Emits {
  answer: [option: 'A' | 'B']
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

// 处理答案选择
const handleAnswer = (option: 'A' | 'B') => {
  if (props.disabled) return
  emit('answer', option)
}
</script>

<style scoped>
/* QuestionCard基础样式已迁移至UnoCSS utility类 - D.1.7 标准化 */
/* 布局迁移: max-w-4xl mx-auto, flex flex-col gap-4 */
/* 响应式迁移: sm:gap-6 md:gap-8, max-sm:px-4 max-sm:py-3 */
/* Typography迁移: text-heading-spaced (问题文本), text-body (选项按钮文本) */
/* 按钮样式迁移: text-left justify-start whitespace-normal px-6 py-4 */
/* 卡片填充迁移: card-padding-normal content-spacing-normal */

.btn-option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}
</style>
