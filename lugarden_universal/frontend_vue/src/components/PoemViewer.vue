<template>
  <div class="poem-viewer max-w-3xl mx-auto">
    <div class="poem-content unified-content-card rounded-base animate-fadeInUp relative" :style="{ animationDelay: animationDelay }">
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
        :class="showFallbackMenu ? 'share-tools-active' : ''"
      />
      
      <!-- 兜底分享菜单 - 毛玻璃蒙版 + 从分享按钮展开 -->
      <div 
        v-if="showFallbackMenu"
        class="absolute inset-0 z-30 backdrop-blur-sm bg-black bg-opacity-10 rounded-base"
        @click="showFallbackMenu = false"
      >
        <!-- 菜单定位容器 - 计算相对于分享按钮的位置 -->
        <div 
          class="absolute z-50"
          :style="menuPosition"
          @click.stop
        >
          <div 
            class="bg-white rounded-lg shadow-2xl border border-gray-100 py-2 min-w-64 transform origin-top-right animate-fadeInUp"
          >
            <div class="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
              选择分享平台
            </div>
            
            <button 
              @click="shareToWeibo"
              class="w-full flex items-center px-3 py-2.5 hover:bg-gray-50 transition-colors duration-200 text-left"
            >
              <GlobeAltIcon class="w-4 h-4 text-orange-500 mr-3" />
              <div class="flex-1">
                <div class="text-sm font-medium">微博</div>
                <div class="text-xs text-gray-500">打开分享页面</div>
              </div>
            </button>
            
            <button 
              @click="copyShareContent"
              class="w-full flex items-center px-3 py-2.5 hover:bg-gray-50 transition-colors duration-200 text-left"
            >
              <DocumentDuplicateIcon class="w-4 h-4 text-blue-500 mr-3" />
              <div class="flex-1">
                <div class="text-sm font-medium">复制分享内容</div>
                <div class="text-xs text-gray-500">适用于微信/QQ/小红书等</div>
              </div>
            </button>
            
            <div class="border-t border-gray-100 mt-1 pt-1">
              <button 
                @click="showFallbackMenu = false"
                class="w-full px-3 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
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
  CheckIcon,
  GlobeAltIcon
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
const showFallbackMenu = ref(false)

// 计算菜单位置 - 从底部ShareTools分享按钮展开
const menuPosition = computed(() => {
  // ShareTools组件在诗歌卡片底部，菜单应该从底部区域展开
  const isMobile = window.innerWidth < 768
  
  if (isMobile) {
    // 移动端：菜单从屏幕底部向上展开，水平居中
    return {
      bottom: '20%', 
      left: '50%',
      right: 'auto',
      transform: 'translateX(-50%)', // 水平居中
      maxWidth: 'calc(100vw - 2rem)'
    }
  } else {
    // 桌面端：菜单从底部区域展开，水平居中
    return {
      bottom: '15%', // 从底部展开，不是垂直居中
      left: '50%',
      right: 'auto', 
      transform: 'translateX(-50%)', // 水平居中
      maxWidth: '20rem'
    }
  }
})

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

// 获取标准分享数据
const getShareData = (): ShareData => ({
  title: cleanTitle(props.poemTitle),
  text: plainTextContent.value,
  url: window.location.href
})

// 通用分享内容格式化（适用于微信/QQ/小红书等）
const getGeneralShareContent = (shareData: ShareData): string => {
  const author = props.author || '佚名'
  return `🌸 ${shareData.title} 🌸\n\n${shareData.text}\n\n————————————\n✍️ 作者：${author}\n📖 来源：陆家花园诗歌元宇宙\n🔗 ${shareData.url}\n\n#诗歌分享 #文学 #诗歌元宇宙`
}

// 微博格式化分享内容
const getWeiboContent = (shareData: ShareData): string => {
  const weiboText = shareData.text.length > 100 ? shareData.text.substring(0, 100) + '...' : shareData.text
  return `🌸 ${shareData.title} 🌸\n\n${weiboText}\n\n@陆家花园诗歌元宇宙 ${shareData.url}`
}

// 复制到剪贴板
const copyToClipboard = async (content: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(content)
  } else {
    // 旧浏览器兜底方案
    const textArea = document.createElement('textarea')
    textArea.value = content
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

// 分享诗歌 - Web Share API优先策略
const sharePoem = async () => {
  if (isActionLoading.value) return
  
  isActionLoading.value = true
  
  try {
    const shareData = getShareData()
    
    if (canShare.value) {
      // 优先使用 Web Share API（系统原生分享面板，包含微信/QQ/小红书等）
      await navigator.share(shareData)
      emit('shared', shareData)
    } else {
      // 兜底方案：显示轻量中国平台选择菜单
      showFallbackMenu.value = true
    }
    
  } catch (error) {
    console.error('分享诗歌失败:', error)
    // 如果用户取消分享，不显示错误
    if (error instanceof Error && !error.message.includes('cancel')) {
      // Web Share API失败，显示兜底菜单
      showFallbackMenu.value = true
    }
  } finally {
    isActionLoading.value = false
  }
}

// 兜底方案：微博分享
const shareToWeibo = async () => {
  const shareData = getShareData()
  const content = getWeiboContent(shareData)
  
  // 尝试微博URL scheme，失败则复制
  try {
    const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareData.url || window.location.href)}&title=${encodeURIComponent(content)}`
    window.open(weiboUrl, '_blank')
  } catch {
    await copyToClipboard(content)
  }
  
  showFallbackMenu.value = false
  emit('shared', shareData)
}

// 兜底方案：复制通用分享内容（适用于微信/QQ/小红书等）
const copyShareContent = async () => {
  const shareData = getShareData()
  const content = getGeneralShareContent(shareData)
  await copyToClipboard(content)
  showFallbackMenu.value = false
  emit('shared', shareData)
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

/* 分享菜单激活时的按钮层级控制 */
.share-tools-active {
  position: relative;
  z-index: 35; /* 高于毛玻璃z-30，确保所有按钮都在上方 */
}

/* 清理：已不需要单独的分享按钮层级控制 */
</style>
