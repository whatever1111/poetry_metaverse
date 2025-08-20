<template>
  <div class="classical-echo-display">
    <!-- 核心引导语 - 来自原版zhou.html -->
    <div class="text-center animate-fadeInUp">
      <h2 class="guidance-title">
        你选择的道路，有古人智慧的回响
      </h2>
    </div>
    
    <!-- 古典内容展示区域 - 统一卡片设计 -->
    <div class="classical-content-area animate-fadeInUp" :style="{ animationDelay: contentAnimationDelay }">
      
      <!-- 统一内容卡片 -->
      <div v-if="hasAnyContent" class="unified-content-card">
        
        <!-- 引文篇目名 - 居中加粗 -->
        <div v-if="quoteCitation" class="citation-text">
          {{ quoteCitation }}
        </div>
        
        <!-- 引文内容 - 粗体 -->
        <div v-if="quoteText" class="quote-text">
          {{ quoteText }}
        </div>
        
        <!-- 古典回响内容 - 标准粗细 -->
        <div v-if="classicalEcho" class="echo-text">
          {{ classicalEcho }}
        </div>
        
      </div>
      
      <!-- 无内容时的默认展示 -->
      <div v-if="!hasAnyContent" class="default-content">
        <div class="default-icon">🏮</div>
        <p class="default-text">{{ emptyMessage }}</p>
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
.classical-echo-display {
  max-width: 800px;
  margin: 0 auto;
}

/* 核心引导语样式 - 对齐原版zhou.html */
.guidance-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 3rem;
  color: var(--text-primary);
  line-height: 1.6;
}

@media (min-width: 768px) {
  .guidance-title {
    font-size: 1.5rem;
    margin-bottom: 3rem;
  }
}

/* 古典内容展示区域 - 对齐原版zhou.html的#classical-content样式 */
.classical-content-area {
  margin-top: 3rem;
  margin-bottom: 3rem;
}

/* 统一内容卡片样式 - 对齐原版zhou.html的backdrop-blur效果 */
.unified-content-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(248, 250, 252, 0.6) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-base);
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
  line-height: 1.8;
  text-align: left;
  white-space: pre-line;
  word-wrap: break-word;
  font-size: var(--font-size-lg);
  min-height: 200px;
}

/* 引文篇目名样式 - 居中加粗 */
.citation-text {
  text-align: center;
  font-weight: 700;
  font-style: italic;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-xl);
  letter-spacing: 0.5px;
}

/* 引文内容样式 - 粗体 */
.quote-text {
  font-weight: 600;
  font-style: italic;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-lg);
  line-height: 1.9;
}

/* 古典回响内容样式 - 标准粗细 */
.echo-text {
  font-weight: 400;
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  line-height: 1.8;
  text-align: justify;
  text-justify: inter-ideograph;
}

/* 默认内容样式 */
.default-content {
  text-align: center;
  padding: var(--spacing-2xl);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(248, 250, 252, 0.6) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-base);
  color: var(--text-tertiary);
}

.default-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-base);
  opacity: 0.7;
}

.default-text {
  font-size: var(--font-size-base);
  font-style: italic;
  line-height: 1.6;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .guidance-title {
    font-size: 1.125rem;
    margin-bottom: 2rem;
    padding: 0 var(--spacing-base);
  }
  
  .classical-content-area {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
  
  .unified-content-card {
    padding: var(--spacing-lg);
    min-height: 150px;
  }
  
  .citation-text {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-lg);
  }
  
  .quote-text {
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-lg);
  }
  
  .echo-text {
    font-size: var(--font-size-base);
  }
}

@media (max-width: 480px) {
  .guidance-title {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .unified-content-card {
    padding: var(--spacing-base);
    min-height: 120px;
  }
  
  .citation-text {
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-base);
  }
  
  .quote-text {
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-base);
  }
  
  .echo-text {
    font-size: var(--font-size-sm);
  }
  
  .default-content {
    padding: var(--spacing-xl);
  }
  
  .default-icon {
    font-size: 2.5rem;
  }
}

/* 内容渐入动画增强 */
.unified-content-card {
  opacity: 0;
  animation: fadeIn 0.8s var(--ease-out) 0.3s forwards;
}

/* 悬浮效果 - 更加细腻 */
.unified-content-card:hover {
  transform: translateY(-2px);
  transition: all var(--duration-normal) var(--ease-out);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

/* 移动端取消悬浮效果 */
@media (max-width: 768px) {
  .unified-content-card:hover {
    transform: none;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.1),
      0 2px 8px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }
}
</style>
