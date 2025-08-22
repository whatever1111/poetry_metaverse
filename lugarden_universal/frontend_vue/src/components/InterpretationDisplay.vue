<template>
  <div class="max-w-3xl mx-auto">
    <!-- AI解读 -->
    <div 
      v-if="aiInterpretation" 
      class="interpretation-content unified-content-card animate-fadeInUp"
      :style="{ animationDelay: aiAnimationDelay }"
    >
      <div class="interpretation-header">
        <h3 class="interpretation-title">
          <svg class="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          AI解读
        </h3>
        <div v-if="showTimestamp && aiTimestamp" class="interpretation-timestamp">
          {{ formatTimestamp(aiTimestamp) }}
        </div>
      </div>
      
      <div class="interpretation-body">
        <div class="interpretation-text">
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
      class="poet-explanation unified-content-card animate-fadeInUp"
      :style="{ animationDelay: poetAnimationDelay }"
    >
      <div class="interpretation-header">
        <h3 class="interpretation-title">
          <svg class="w-5 h-5 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
          诗人解读
        </h3>
        <div v-if="showTimestamp && poetTimestamp" class="interpretation-timestamp">
          {{ formatTimestamp(poetTimestamp) }}
        </div>
      </div>
      
      <div class="interpretation-body">
        <div class="interpretation-text">
          {{ poetExplanation }}
        </div>
        
        <!-- 诗人信息 -->
        <div v-if="poetName" class="poet-info">
          <span class="poet-label">诗人:</span>
          <span class="poet-name">{{ poetName }}</span>
        </div>
      </div>
    </div>

    <!-- 自定义解读内容插槽 -->
    <div v-if="$slots.custom" class="custom-interpretation unified-content-card animate-fadeInUp">
      <slot name="custom"></slot>
    </div>
    
    <!-- AI功能错误状态 -->
    <div v-if="showAiError && aiError" class="ai-error unified-content-card animate-fadeInUp">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">AI功能暂时无法使用</h3>
        <p class="error-message">{{ aiError }}</p>
        <div v-if="showRetryAction" class="error-actions">
          <button @click="handleRetryAi" class="btn-retry" :disabled="retrying">
            <span v-if="retrying">重试中...</span>
            <span v-else>重试</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!aiInterpretation && !poetExplanation && !$slots.custom && !showAiError" class="empty-interpretation">
      <div class="empty-icon">💭</div>
      <p class="empty-text">{{ emptyMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--color-primary-200);
  padding-bottom: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.interpretation-title {
  display: flex;
  align-items: center;
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.interpretation-timestamp {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  font-style: italic;
}

.interpretation-body {
  line-height: 1.7;
}

.interpretation-text {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-base);
  white-space: pre-line;
  word-wrap: break-word;
}

/* AI解读特殊样式 */
.interpretation-content .interpretation-title svg {
  color: var(--color-info);
}

.interpretation-content {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.08) 100%);
  border-left: 4px solid var(--color-info);
}

/* 诗人解读特殊样式 */
.poet-explanation .interpretation-title svg {
  color: #8b5a96;
}

.poet-explanation {
  background: linear-gradient(135deg, rgba(139, 90, 150, 0.05) 0%, rgba(196, 145, 210, 0.08) 100%);
  border-left: 4px solid #8b5a96;
}

.poet-info {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-base);
  border-top: 1px solid var(--color-primary-200);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.poet-label {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  font-weight: 500;
}

.poet-name {
  font-size: var(--font-size-sm);
  color: #8b5a96;
  font-weight: 600;
}

/* 操作按钮 */
.interpretation-actions {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: flex-end;
}

.btn-regenerate {
  font-size: var(--font-size-sm);
  padding: var(--spacing-sm) var(--spacing-base);
  background: var(--color-info);
  color: white;
  border: none;
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-regenerate:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-regenerate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* AI错误状态 */
.ai-error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(248, 113, 113, 0.08) 100%);
  border-left: 4px solid #ef4444;
  text-align: center;
}

.error-content {
  padding: var(--spacing-lg);
}

.error-icon {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-base);
}

.error-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: #dc2626;
  margin-bottom: var(--spacing-sm);
}

.error-message {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.error-actions {
  display: flex;
  justify-content: center;
}

.btn-retry {
  font-size: var(--font-size-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: #ef4444;
  color: white;
  border: none;
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-retry:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
}

.btn-retry:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 空状态 */
.empty-interpretation {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-tertiary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-base);
  opacity: 0.6;
}

.empty-text {
  font-size: var(--font-size-base);
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .interpretation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .interpretation-title {
    font-size: var(--font-size-lg);
  }
  
  .interpretation-content,
  .poet-explanation,
  .custom-interpretation {
    padding: var(--spacing-lg);
  }
  
  .poet-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
}

@media (max-width: 480px) {
  .interpretation-content,
  .poet-explanation,
  .custom-interpretation {
    padding: var(--spacing-base);
  }
  
  .interpretation-title {
    font-size: var(--font-size-base);
  }
  
  .interpretation-text {
    font-size: var(--font-size-sm);
  }
  
  .empty-interpretation {
    padding: var(--spacing-xl);
  }
}

/* 内容渐入动画增强 */
.interpretation-text {
  opacity: 0;
  animation: fadeIn 0.8s var(--ease-out) 0.3s forwards;
}

.poet-explanation .interpretation-text {
  animation-delay: 0.5s;
}

/* 文字打字机效果（可选） */
.interpretation-text.typewriter {
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

/* 长文本优化 */
.interpretation-text {
  line-height: 1.8;
  text-align: justify;
  text-justify: inter-ideograph;
}

/* 滚动条样式 */
.interpretation-text::-webkit-scrollbar {
  width: 4px;
}

.interpretation-text::-webkit-scrollbar-track {
  background: var(--color-primary-100);
}

.interpretation-text::-webkit-scrollbar-thumb {
  background: var(--color-primary-300);
  border-radius: 2px;
}
</style>
