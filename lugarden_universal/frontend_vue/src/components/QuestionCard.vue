<template>
  <div class="question-card">
    <div class="unified-content-card animate-fadeInUp">
      <div 
        class="question-text animate-textChange" 
        :key="questionIndex"
      >
        {{ question.question }}
      </div>
      
      <!-- 选项按钮 -->
      <div class="options-grid">
        <button 
          v-for="(option, key) in question.options"
          :key="key"
          class="btn-option text-left animate-fadeInUp"
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
.question-card {
  max-width: 800px;
  margin: 0 auto;
}

.options-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
  margin-top: var(--spacing-xl);
}

@media (min-width: 480px) {
  .options-grid {
    gap: var(--spacing-lg);
  }
}

@media (min-width: 768px) {
  .options-grid {
    gap: var(--spacing-xl);
  }
}

.btn-option {
  text-align: left;
  justify-content: flex-start;
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* 确保按钮文本换行 */
.btn-option {
  white-space: normal;
  line-height: 1.5;
  padding: var(--spacing-base) var(--spacing-lg);
}

@media (max-width: 480px) {
  .btn-option {
    padding: 0.75rem 1rem;
  }
}
</style>
