<template>
  <div class="poem-viewer">
    <div class="poem-content card-base animate-fadeInUp" :style="{ animationDelay: animationDelay }">
      <h2 class="poem-title">
        {{ cleanTitle(poemTitle) }}
      </h2>
      <div class="poem-body">
        {{ formattedBody }}
      </div>
      
      <!-- 可选的作者信息 -->
      <div v-if="author" class="poem-author">
        <span class="author-label">作者:</span>
        <span class="author-name">{{ author }}</span>
      </div>
      
      <!-- 可选的附加信息 -->
      <div v-if="additionalInfo" class="poem-info">
        {{ additionalInfo }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 组件Props
interface Props {
  poemTitle?: string | null
  poemBody?: string | object | null
  author?: string
  additionalInfo?: string
  animationDelay?: string
}

const props = withDefaults(defineProps<Props>(), {
  poemTitle: null,
  poemBody: null,
  author: '',
  additionalInfo: '',
  animationDelay: '0s'
})

// 清理标题（移除书名号）
const cleanTitle = (title: string | null): string => {
  if (!title) return '诗歌'
  return title.replace(/[《》]/g, '')
}

// 格式化诗歌内容
const formattedBody = computed(() => {
  if (!props.poemBody) {
    return '诗歌内容加载中...'
  }
  
  if (typeof props.poemBody === 'string') {
    return props.poemBody
  }
  
  if (typeof props.poemBody === 'object' && props.poemBody !== null) {
    const body = props.poemBody as Record<string, unknown>
    const parts: string[] = []
    
    if (body.quote_text && typeof body.quote_text === 'string') {
      parts.push(body.quote_text)
    }
    if (body.quote_citation && typeof body.quote_citation === 'string') {
      parts.push(`——${body.quote_citation}`)
    }
    if (body.main_text && typeof body.main_text === 'string') {
      parts.push(body.main_text)
    }
    
    return parts.join('\n\n')
  }
  
  return '诗歌格式错误'
})
</script>

<style scoped>
.poem-viewer {
  max-width: 800px;
  margin: 0 auto;
}

.poem-content {
  text-align: center;
  position: relative;
}

.poem-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
  line-height: 1.3;
  text-align: center;
}

.poem-body {
  font-size: var(--font-size-base);
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  text-align: center;
  white-space: pre-line;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.poem-author {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-base);
  border-top: 1px solid var(--color-primary-200);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
}

.author-label {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  font-weight: 500;
}

.author-name {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 600;
}

.poem-info {
  margin-top: var(--spacing-base);
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  font-style: italic;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .poem-title {
    font-size: var(--font-size-2xl);
    margin-bottom: var(--spacing-lg);
  }
  
  .poem-body {
    font-size: var(--font-size-base);
    line-height: 1.7;
    padding: 0 var(--spacing-sm);
  }
  
  .poem-content {
    padding: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .poem-title {
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-base);
  }
  
  .poem-body {
    font-size: var(--font-size-sm);
    line-height: 1.6;
    padding: 0;
  }
  
  .poem-content {
    padding: var(--spacing-base);
  }
  
  .poem-author {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
}

/* 特殊的诗歌样式效果 */
.poem-content::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-brand-primary), transparent);
  opacity: 0.6;
}

.poem-content::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-primary-300), transparent);
  opacity: 0.4;
}

/* 诗意的文字效果 */
.poem-body {
  position: relative;
}

.poem-body::first-letter {
  font-size: 1.2em;
  font-weight: 600;
  color: var(--color-brand-primary);
}
</style>
