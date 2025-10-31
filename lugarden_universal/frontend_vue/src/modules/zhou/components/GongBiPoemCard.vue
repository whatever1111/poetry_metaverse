<template>
  <div class="gongbi-poem-card animate-fadeInUp">
    <!-- 标题区 -->
    <div class="text-center mb-8">
      <h2 class="text-3xl md:text-4xl font-bold mb-2" style="color: var(--text-primary);">
        陆家明的回应
      </h2>
      <p class="text-sm md:text-base" style="color: var(--text-secondary);">
        基于你的感受："{{ poem.userFeeling }}"
      </p>
    </div>
    
    <!-- 诗歌卡片 -->
    <div class="card-base">
      <!-- 诗歌标题 -->
      <h3 class="text-2xl md:text-3xl font-semibold text-center mb-6" style="color: var(--text-primary);">
        《{{ poem.title }}》
      </h3>
      
      <!-- 引文区域 -->
      <div v-if="poem.quote" class="quote-section text-center mb-6">
        <p class="text-base md:text-lg italic leading-relaxed" style="color: var(--text-secondary);">
          {{ poem.quote }}
        </p>
        <p v-if="poem.quoteSource" class="text-sm mt-2" style="color: var(--text-tertiary);">
          ——{{ poem.quoteSource }}
        </p>
      </div>
      
      <!-- 诗歌正文 -->
      <div class="poem-content whitespace-pre-wrap text-base md:text-lg leading-loose" style="color: var(--text-primary);">
        {{ poem.content }}
      </div>
      
      <!-- 操作按钮区 -->
      <div class="action-buttons grid grid-cols-3 gap-3 md:gap-4 mt-8">
        <button 
          @click="copyPoem"
          class="btn-action"
          :class="{ 'btn-action-success': copySuccess }"
          :disabled="copySuccess"
        >
          <svg 
            v-if="!copySuccess"
            class="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          <svg 
            v-else
            class="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ copySuccess ? '已复制' : '复制' }}</span>
        </button>
        
        <button 
          @click="sharePoem"
          class="btn-action"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>分享</span>
        </button>
        
        <button 
          @click="downloadPoem"
          class="btn-action"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>下载</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// ================================
// Props定义
// ================================
interface Props {
  poem: {
    title: string
    quote: string
    quoteSource: string
    content: string
    userFeeling: string
  }
}

const props = defineProps<Props>()

// ================================
// 响应式状态
// ================================
const copySuccess = ref(false)

// ================================
// 方法
// ================================

// 复制诗歌内容
const copyPoem = async () => {
  try {
    // 构建完整的诗歌文本
    const parts: string[] = [
      `《${props.poem.title}》`,
      ''
    ]
    
    if (props.poem.quote) {
      parts.push(props.poem.quote)
      if (props.poem.quoteSource) {
        parts.push(`——${props.poem.quoteSource}`)
      }
      parts.push('')
    }
    
    parts.push(props.poem.content)
    parts.push('')
    parts.push(`—— 陆家明为你创作于陆家花园`)
    
    const fullText = parts.join('\n')
    
    // 使用Clipboard API复制
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(fullText)
      copySuccess.value = true
      
      // 2秒后重置状态
      setTimeout(() => {
        copySuccess.value = false
      }, 2000)
      
      console.log('[GongBiPoemCard] 诗歌已复制到剪贴板')
    } else {
      // 降级方案：使用textarea
      const textarea = document.createElement('textarea')
      textarea.value = fullText
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      
      copySuccess.value = true
      setTimeout(() => {
        copySuccess.value = false
      }, 2000)
    }
  } catch (error) {
    console.error('[GongBiPoemCard] 复制失败:', error)
    alert('复制失败，请手动选择文本复制')
  }
}

// 分享诗歌
const sharePoem = async () => {
  const shareData = {
    title: `《${props.poem.title}》— 陆家明`,
    text: `${props.poem.content.substring(0, 100)}...`,
    url: window.location.href
  }
  
  try {
    // 尝试使用Web Share API
    if (navigator.share) {
      await navigator.share(shareData)
      console.log('[GongBiPoemCard] 诗歌已分享')
    } else {
      // 降级方案：复制链接
      await navigator.clipboard.writeText(window.location.href)
      alert('当前浏览器不支持分享功能，已复制页面链接到剪贴板')
    }
  } catch (error) {
    console.error('[GongBiPoemCard] 分享失败:', error)
  }
}

// 下载诗歌为TXT文件
const downloadPoem = () => {
  try {
    // 构建完整的诗歌文本
    const parts: string[] = [
      `《${props.poem.title}》`,
      '',
      '陆家明的回应',
      ''
    ]
    
    if (props.poem.quote) {
      parts.push(props.poem.quote)
      if (props.poem.quoteSource) {
        parts.push(`——${props.poem.quoteSource}`)
      }
      parts.push('')
    }
    
    parts.push(props.poem.content)
    parts.push('')
    parts.push('---')
    parts.push(`你的感受：${props.poem.userFeeling}`)
    parts.push('')
    parts.push(`创作于陆家花园 - ${new Date().toLocaleDateString('zh-CN')}`)
    
    const fullText = parts.join('\n')
    
    // 创建Blob
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' })
    
    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${props.poem.title}_陆家明.txt`
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 释放URL对象
    URL.revokeObjectURL(url)
    
    console.log('[GongBiPoemCard] 诗歌已下载')
  } catch (error) {
    console.error('[GongBiPoemCard] 下载失败:', error)
    alert('下载失败，请稍后重试')
  }
}
</script>

<style scoped>
/* 卡片基础样式 */
.gongbi-poem-card {
  animation-duration: 0.6s;
  animation-fill-mode: both;
}

.card-base {
  padding: var(--spacing-xl);
  background: rgba(var(--card-bg-rgb), 0.8);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-normal) var(--ease-out);
}

.card-base:hover {
  box-shadow: var(--shadow-lg);
}

/* 引文样式 */
.quote-section {
  padding: var(--spacing-base);
  border-left: 3px solid var(--color-primary-500);
  background: rgba(var(--card-bg-rgb), 0.5);
  border-radius: var(--radius-base);
}

/* 诗歌正文样式 */
.poem-content {
  text-align: justify;
  line-height: 2;
}

/* 操作按钮样式 */
.action-buttons {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--border-color);
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-base);
  border-radius: var(--radius-base);
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-action:hover:not(:disabled) {
  background-color: var(--color-primary-500);
  color: white;
  border-color: var(--color-primary-500);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.btn-action:active:not(:disabled) {
  transform: translateY(0);
  transition-duration: 0.1s;
}

.btn-action:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-action-success {
  background-color: #10b981;
  color: white;
  border-color: #10b981;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-base {
    padding: var(--spacing-lg);
  }
  
  .action-buttons {
    gap: var(--spacing-sm);
  }
  
  .btn-action {
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .btn-action svg {
    width: 1rem;
    height: 1rem;
  }
}

@media (max-width: 480px) {
  .card-base {
    padding: var(--spacing-base);
  }
  
  .btn-action span {
    display: none;
  }
  
  .btn-action {
    justify-content: center;
  }
}
</style>


