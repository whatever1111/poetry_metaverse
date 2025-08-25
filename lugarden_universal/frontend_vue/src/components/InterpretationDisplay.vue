<template>
  <div class="max-w-3xl mx-auto">
    <!-- AI解读 -->
    <div 
      v-if="aiInterpretation" 
      class="interpretation-content unified-content-card rounded-base animate-fadeInUp"
      :style="{ animationDelay: aiAnimationDelay }"
    >
      <div class="interpretation-header">
        <h3 class="interpretation-title">
          <SparklesIcon class="w-5 h-5 mr-2 text-gray-500" aria-hidden="true" />
          陆家明
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
      class="poet-explanation unified-content-card rounded-base animate-fadeInUp"
      :style="{ animationDelay: poetAnimationDelay }"
    >
      <div class="interpretation-header">
        <h3 class="interpretation-title">
          <AcademicCapIcon class="w-5 h-5 mr-2 text-gray-500" aria-hidden="true" />
          吴任几
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
    <div v-if="$slots.custom" class="custom-interpretation unified-content-card rounded-base animate-fadeInUp">
      <slot name="custom"></slot>
    </div>
    
    <!-- AI功能错误状态 -->
    <div v-if="showAiError && aiError" class="ai-error unified-content-card rounded-base animate-fadeInUp">
      <div class="error-content">
        <div class="error-icon">
          <ExclamationTriangleIcon class="w-5 h-5 mx-auto" aria-hidden="true" />
        </div>
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
      <div class="empty-icon">
        <ChatBubbleLeftEllipsisIcon class="w-6 h-6 mx-auto" aria-hidden="true" />
      </div>
      <p class="empty-text">{{ emptyMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon, ChatBubbleLeftEllipsisIcon, UserIcon, AcademicCapIcon, SparklesIcon, LightBulbIcon, BeakerIcon, WrenchScrewdriverIcon } from '@heroicons/vue/24/outline'

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
  /* 优雅的渐变分隔线，替代生硬的solid边框 */
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(var(--color-primary-rgb), 0.15) 20%, 
    rgba(var(--color-primary-rgb), 0.25) 50%, 
    rgba(var(--color-primary-rgb), 0.15) 80%, 
    transparent 100%
  );
  background-size: 100% 1px;
  background-repeat: no-repeat;
  background-position: bottom;
  padding-bottom: var(--spacing-base);
  margin-bottom: var(--spacing-xl);
  position: relative;
  
  /* 微妙的阴影效果增强层次感 */
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(var(--color-primary-rgb), 0.08) 50%, 
      transparent 100%
    );
    filter: blur(0.5px);
  }
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
  position: absolute;
  right: 0;
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  font-style: italic;
}

.interpretation-body {
  line-height: 1.8;
  /* 增加阅读区域的呼吸感和左右间距 */
  padding: var(--spacing-base) var(--spacing-lg);
}

.interpretation-text {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  white-space: pre-line;
  word-wrap: break-word;
  line-height: 1.8;
  text-align: justify;
  text-justify: inter-ideograph;
  /* 段落间距优化 */
  p {
    margin-bottom: 1.2em;
    line-height: inherit;
  }
  /* 长文本阅读优化 */
  letter-spacing: 0.02em;
  text-indent: 0;
}

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

.poet-info {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  /* 用空间留白和微妙阴影替代实线边框 */
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  /* 微妙的顶部阴影分隔 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 30%;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(var(--color-primary-rgb), 0.12) 50%, 
      transparent 100%
    );
    filter: blur(0.8px);
  }
}

.poet-label {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  font-weight: 500;
}

.poet-name {
  font-size: var(--font-size-sm);
  color: rgb(107 114 128); /* 与图标颜色保持一致 - text-gray-500 */
  font-weight: 600;
}

/* 操作按钮 */
.interpretation-actions {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: flex-end;
}

/* btn-regenerate现在使用统一的UnoCSS定义 */

/* AI错误状态 - 统一玻璃态风格 */
.ai-error {
  text-align: center;
}

/* 错误状态图标保持红色 */
.ai-error .error-title {
  color: #dc2626;
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

/* btn-retry-error现在使用统一的UnoCSS定义 */

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

/* 内容渐入动画增强 - 优化动画时序 */
.interpretation-text {
  opacity: 0;
  animation: fadeIn 0.8s var(--ease-out) 0.3s forwards;
  /* 确保动画过程中排版不变形 */
  transform: translateY(0);
}

.poet-explanation .interpretation-text {
  animation-delay: 0.5s;
}

/* 面向不同内容长度的适应性优化 */
.interpretation-text {
  /* 短文本(小于100字)的紧凑样式 */
  &[data-length="short"] {
    line-height: 1.7;
    letter-spacing: 0.01em;
    margin-bottom: var(--spacing-base);
  }
  
  /* 中等文本(100-200字)的平衡样式 */
  &[data-length="medium"] {
    line-height: 1.8;
    letter-spacing: 0.02em;
    margin-bottom: var(--spacing-lg);
  }
  
  /* 长文本(大于200字)的舒展样式 */
  &[data-length="long"] {
    line-height: 1.9;
    letter-spacing: 0.03em;
    margin-bottom: var(--spacing-xl);
  }
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

/* 阅读体验统一优化 */
.interpretation-text {
  /* 确保所有统一样式在上方已定义 */
  font-size: inherit;
  max-height: none;
  overflow: visible;
  
  /* 滑动阅读体验优化 */
  scroll-behavior: smooth;
  
  /* 防止孤立标点符号 */
  orphans: 2;
  widows: 2;
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
}
</style>
