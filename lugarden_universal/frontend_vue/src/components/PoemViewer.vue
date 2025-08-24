<template>
  <div class="poem-viewer max-w-3xl mx-auto">
    <div class="poem-content unified-content-card animate-fadeInUp" :style="{ animationDelay: animationDelay }">
      <h2 class="poem-title">
        {{ cleanTitle(poemTitle) }}
      </h2>
      
      <!-- 引文内容 -->
      <div v-if="quoteText" class="poem-quote">
        {{ formattedQuoteText }}
      </div>
      
      <!-- 引文出处 -->
      <div v-if="quoteCitation" class="poem-citation">
        ——{{ formattedQuoteCitation }}
      </div>
      
      <!-- 诗歌原文 -->
      <div v-if="mainText" class="poem-main">
        {{ formattedMainText }}
      </div>
      
      <!-- 兼容原有poemBody格式（仅支持string类型） -->
      <div v-if="poemBody && !quoteText && !mainText" class="poem-body">
        {{ formattedLegacyBody }}
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
      
      <!-- 分享工具组 - 使用轻量化ShareTools组件 -->
              <ShareTools
        :actions="actionButtons"
        :show-actions="showActions"
        :animation-delay="`${parseFloat(animationDelay) + 0.3}s`"
        layout="auto"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PoemViewerProps } from '../types/zhou'
import ShareTools from './ShareTools.vue'
import { 
  DocumentDuplicateIcon, 
  ShareIcon, 
  ArrowDownTrayIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

// 使用统一的类型定义
type Props = PoemViewerProps

// 组件Emits
interface Emits {
  copied: [text: string]
  shared: [shareData: ShareData]
  downloaded: [fileName: string]
}

interface ShareData {
  title: string
  text: string
  url?: string
}

const props = withDefaults(defineProps<Props>(), {
  poemTitle: null,
  quoteText: null,
  quoteCitation: null,
  mainText: null,
  poemBody: null,
  author: '',
  additionalInfo: '',
  animationDelay: '0s',
  showActions: false,
  showDownload: false
})

const emit = defineEmits<Emits>()

// 组件状态
const isCopied = ref(false)
const isActionLoading = ref(false)

// 清理标题（移除书名号）
const cleanTitle = (title: string | null): string => {
  if (!title) return '诗歌'
  return title.replace(/[《》]/g, '')
}

// 格式化引文内容
const formattedQuoteText = computed(() => 
  props.quoteText ? enhanceTextFormatting(props.quoteText) : ''
)

// 格式化引文出处（去除——前缀）
const formattedQuoteCitation = computed(() => {
  if (!props.quoteCitation) return ''
  return props.quoteCitation.replace(/^——/, '').trim()
})

// 格式化诗歌原文
const formattedMainText = computed(() => 
  props.mainText ? enhanceTextFormatting(props.mainText) : ''
)

// 兼容原有poemBody格式（仅支持string类型）
const formattedLegacyBody = computed(() => {
  if (!props.poemBody) {
    return '诗歌内容加载中...'
  }
  
  if (typeof props.poemBody === 'string') {
    return enhanceTextFormatting(props.poemBody)
  }
  
  return '不支持的诗歌格式'
})

// 增强文本格式处理
const enhanceTextFormatting = (text: string): string => {
  return text
    // 标准化换行符
    .replace(/\r\n?/g, '\n')
    // 清理多余的空白行（超过2个连续换行变为2个）
    .replace(/\n{3,}/g, '\n\n')
    // 处理诗行缩进：如果行首有空格，保留这些缩进
    .split('\n')
    .map(line => line.trimEnd()) // 去除行尾空格，保留行首缩进
    .join('\n')
    // 去除首尾多余的空白行
    .trim()
}

// 获取纯文本内容（用于复制和分享）
const plainTextContent = computed(() => {
  const title = cleanTitle(props.poemTitle)
  
  // 构建诗歌内容：优先使用结构化数据，兼容原有格式
  let content = ''
  if (props.quoteText || props.quoteCitation || props.mainText) {
    // 使用结构化数据
    const parts: string[] = []
    if (props.quoteText) parts.push(formattedQuoteText.value)
    if (props.quoteCitation) parts.push(`——${formattedQuoteCitation.value}`)
    if (props.mainText) parts.push(formattedMainText.value)
    content = parts.join('\n\n')
  } else if (props.poemBody) {
    // 兼容原有格式
    content = formattedLegacyBody.value
  } else {
    content = '诗歌内容加载中...'
  }
  
  const authorText = props.author ? `\n\n作者：${props.author}` : ''
  const infoText = props.additionalInfo ? `\n${props.additionalInfo}` : ''
  
  return `${title}\n\n${content}${authorText}${infoText}`
})

// 检查是否支持Web Share API
const canShare = computed(() => {
  return typeof navigator !== 'undefined' && 'share' in navigator
})

// 分享工具配置 - C.5纯图标模式重构
const actionButtons = computed(() => [
  {
    key: 'copy',
    iconComponent: isCopied.value ? CheckIcon : DocumentDuplicateIcon,
    handler: copyPoem,
    disabled: isActionLoading.value,
    title: isCopied.value ? '已复制' : '复制诗歌内容',
    variant: isCopied.value ? ('success' as const) : undefined,
    visible: true
  },
  {
    key: 'share',
    iconComponent: ShareIcon,
    handler: sharePoem,
    disabled: isActionLoading.value,
    title: '分享诗歌',
    visible: true
  },
  {
    key: 'download',
    iconComponent: ArrowDownTrayIcon,
    handler: downloadPoem,
    disabled: isActionLoading.value,
    title: '下载TXT文件',
    visible: props.showDownload
  }
])

// 复制诗歌到剪贴板
const copyPoem = async () => {
  if (isActionLoading.value) return
  
  isActionLoading.value = true
  
  try {
    const textToCopy = plainTextContent.value
    
    if (navigator.clipboard && window.isSecureContext) {
      // 使用现代 Clipboard API
      await navigator.clipboard.writeText(textToCopy)
    } else {
      // 降级到传统方法
      const textArea = document.createElement('textarea')
      textArea.value = textToCopy
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
      } catch {
        throw new Error('复制失败')
      } finally {
        document.body.removeChild(textArea)
      }
    }
    
    // 显示复制成功状态
    isCopied.value = true
    emit('copied', textToCopy)
    
    // 3秒后重置状态
    setTimeout(() => {
      isCopied.value = false
    }, 3000)
    
  } catch (error) {
    console.error('复制诗歌失败:', error)
    // 可以在这里显示错误提示
  } finally {
    isActionLoading.value = false
  }
}

// 分享诗歌
const sharePoem = async () => {
  if (isActionLoading.value) return
  
  isActionLoading.value = true
  
  try {
    const shareData: ShareData = {
      title: cleanTitle(props.poemTitle),
      text: plainTextContent.value,
      url: window.location.href
    }
    
    if (canShare.value) {
      // 使用 Web Share API
      await navigator.share(shareData)
    } else {
      // 降级到复制链接
      const shareUrl = `${window.location.origin}${window.location.pathname}#poem-${encodeURIComponent(cleanTitle(props.poemTitle))}`
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n分享链接: ${shareUrl}`)
        // 可以显示 "分享链接已复制到剪贴板" 的提示
      } else {
        // 打开新窗口显示分享内容
        const shareWindow = window.open('', '_blank', 'width=500,height=400')
        if (shareWindow) {
          shareWindow.document.write(`
            <html>
              <head><title>分享诗歌</title></head>
              <body style="font-family: sans-serif; padding: 20px;">
                <h2>${shareData.title}</h2>
                <pre style="white-space: pre-wrap; line-height: 1.6;">${shareData.text}</pre>
                <p><a href="${shareUrl}">查看原文</a></p>
                <button onclick="navigator.clipboard?.writeText('${shareData.text}')">复制文本</button>
              </body>
            </html>
          `)
        }
      }
    }
    
    emit('shared', shareData)
    
  } catch (error) {
    console.error('分享诗歌失败:', error)
    // 如果用户取消分享，不显示错误
    if (error instanceof Error && !error.message.includes('cancel')) {
      // 可以在这里显示错误提示
    }
  } finally {
    isActionLoading.value = false
  }
}

// 下载诗歌为文本文件
const downloadPoem = () => {
  if (isActionLoading.value) return
  
  isActionLoading.value = true
  
  try {
    const content = plainTextContent.value
    const title = cleanTitle(props.poemTitle)
    const fileName = `${title.replace(/[^\w\s-]/g, '')}.txt`
    
    // 创建 Blob 对象
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    
    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.style.display = 'none'
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理对象URL
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 100)
    
    emit('downloaded', fileName)
    
  } catch (error) {
    console.error('下载诗歌失败:', error)
    // 可以在这里显示错误提示
  } finally {
    isActionLoading.value = false
  }
}
</script>

<style scoped>
/* 基础容器样式已迁移至UnoCSS: max-w-3xl mx-auto */
.poem-viewer {}

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

/* 结构化诗歌内容样式 */
.poem-quote {
  font-size: var(--font-size-base);
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-base);
  text-align: center;
  white-space: pre-line;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-style: italic;
}

.poem-citation {
  font-size: var(--font-size-sm);
  line-height: 1.6;
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-lg);
  text-align: right;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 500;
}

.poem-main {
  font-size: var(--font-size-base);
  line-height: 1.8;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  text-align: center;
  white-space: pre-line;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 600;
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

/* 装饰横条已移除 - 基于用户体验反馈和"内容为王"设计哲学 */

/* 诗意的文字效果 */
.poem-body {
  position: relative;
}

/* 首字母品牌色效果已被UnoCSS覆盖失效，已清理 - A.3任务 */

/* 操作按钮样式已迁移至UnoCSS - C.1 现代化实现 */

/* 改善缩进显示效果 */
.poem-body {
  white-space: pre-line;
  tab-size: 2;
  font-variant-numeric: proportional-nums;
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* 特殊的诗歌行样式 */
.poem-body br + br {
  line-height: 0.5;
}

/* 引用样式增强 */
.poem-body {
  font-family: var(--font-family-serif, serif);
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
}

/* 深色模式适配已迁移至UnoCSS - C.1 现代化实现 */
</style>
