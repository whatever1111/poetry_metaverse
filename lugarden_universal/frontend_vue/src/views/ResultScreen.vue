<template>
  <div class="min-h-screen" style="background-color: var(--bg-primary);">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- 结果展示 -->
        <div class="result-content">
          <!-- 诗歌内容 -->
          <div v-if="zhouStore.result.selectedPoem" class="mb-8">
            <PoemViewer 
              :poem-title="zhouStore.result.poemTitle || zhouStore.result.selectedPoem.title"
              :quote-text="selectedPoemQuoteText"
              :quote-citation="selectedPoemQuoteCitation"
              :main-text="selectedPoemMainText"
              animation-delay="0.2s"
              :show-actions="true"
              :show-download="true"
              @copied="handlePoemCopied"
              @shared="handlePoemShared"
              @downloaded="handlePoemDownloaded"
            />
          </div>
          
          <!-- 操作按钮 -->
          <div class="mb-8 animate-fadeInUp" style="animation-delay: 0.4s;">
            <ControlButtons 
              :interpretation-loading="zhouStore.result.interpretationLoading"
              :audio-loading="zhouStore.result.audioLoading"
              :audio-playing="zhouStore.result.audioPlaying"
              :poet-button-clicked="zhouStore.result.poetButtonClicked"
              :poet-button-click-count="zhouStore.result.poetButtonClickCount"
              :poet-button-text="zhouStore.getPoetButtonText()"
              @interpret="getInterpretation"
              @play-poem="playPoem"
              @poet-explanation="showPoetExplanation"
              @restart="startOver"
            />
          </div>
          
          <!-- 解读内容区域 -->
          <div class="interpretation-area">
            <InterpretationDisplay 
              :ai-interpretation="zhouStore.result.interpretationContent"
              :poet-explanation="zhouStore.result.poetExplanation"
              :ai-error="zhouStore.result.audioError || zhouStore.ui.errorMessage"
              :show-ai-error="!!zhouStore.result.audioError || !!zhouStore.ui.errorMessage"
              :show-retry-action="true"
              :retrying="zhouStore.result.audioLoading || zhouStore.result.interpretationLoading"
              ai-animation-delay="0.6s"
              poet-animation-delay="0.8s"
              empty-message="点击上方按钮获取诗歌解读"
              @retry-ai="retryAiFeatures"
            />
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="!zhouStore.result.selectedPoem && !zhouStore.universeData.error">
          <LoadingSpinner 
            size="large"
            loading-text="正在准备您的诗歌..."
            subtitle="诗意正在汇聚，请稍候..."
            variant="pulse"
            :show-progress="false"
            centered
          />
        </div>

        <!-- 错误状态 -->
        <div v-if="zhouStore.universeData.error">
          <ErrorState 
            error-type="unknown"
            error-title="出现了问题"
            :error-message="zhouStore.universeData.error"
            :show-retry="true"
            :show-back="false"
            retry-text="重试"
            @retry="retryLoad"
            :suggestions="['请检查网络连接', '刷新页面重试', '稍后再试']"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useZhouStore } from '../stores/zhou'
import PoemViewer from '../components/PoemViewer.vue'
import ControlButtons from '../components/ControlButtons.vue'
import InterpretationDisplay from '../components/InterpretationDisplay.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ErrorState from '../components/ErrorState.vue'

const router = useRouter()
const zhouStore = useZhouStore()

// 结果页面
// 对应原 zhou.html 中的 #result-screen

// 计算属性：获取结构化诗歌数据
const selectedPoemQuoteText = computed(() => {
  const poem = zhouStore.result.selectedPoem
  if (!poem || !poem.body) return null
  
  if (typeof poem.body === 'object' && poem.body !== null) {
    return poem.body.quote_text || null
  }
  
  return null
})

const selectedPoemQuoteCitation = computed(() => {
  const poem = zhouStore.result.selectedPoem
  if (!poem || !poem.body) return null
  
  if (typeof poem.body === 'object' && poem.body !== null) {
    return poem.body.quote_citation || null
  }
  
  return null
})

const selectedPoemMainText = computed(() => {
  const poem = zhouStore.result.selectedPoem
  if (!poem || !poem.body) return null
  
  if (typeof poem.body === 'object' && poem.body !== null) {
    return poem.body.main_text || null
  }
  
  // 如果是字符串格式（向后兼容），将整个body作为主文本
  if (typeof poem.body === 'string') {
    return poem.body
  }
  
  return null
})

onMounted(() => {
  // 检查是否有结果数据
  if (!zhouStore.quiz.isQuizComplete) {
    router.replace('/')
    return
  }

  // 如果没有选中的诗歌，重新计算映射
  if (!zhouStore.result.selectedPoem) {
    zhouStore.calculatePoemMapping()
  }
})

// 诗歌标题和内容格式化现已移至PoemViewer组件

// 获取AI解读
const getInterpretation = async () => {
  try {
    await zhouStore.getInterpretation()
  } catch (error) {
    console.error('获取解读失败:', error)
  }
}

// 播放诗歌
const playPoem = async () => {
  try {
    await zhouStore.playPoem()
  } catch (error) {
    console.error('播放诗歌失败:', error)
  }
}

// 显示诗人解读
const showPoetExplanation = () => {
  zhouStore.showPoetExplanation()
}

// 重新开始
const startOver = () => {
  zhouStore.resetApp()
  router.push('/')
}

// 重试加载
const retryLoad = async () => {
  zhouStore.clearError()
  zhouStore.calculatePoemMapping()
}

// 处理诗歌复制事件
const handlePoemCopied = (text: string) => {
  console.log('诗歌已复制到剪贴板:', text.substring(0, 50) + '...')
  // 可以在这里显示成功提示
}

// 处理诗歌分享事件
const handlePoemShared = (shareData: { title: string; text: string; url?: string }) => {
  console.log('诗歌已分享:', shareData.title)
  // 可以在这里记录分享统计
}

// 处理诗歌下载事件
const handlePoemDownloaded = (fileName: string) => {
  console.log('诗歌已下载为文件:', fileName)
  // 可以在这里显示下载成功提示
}

// 重试AI功能
const retryAiFeatures = () => {
  // 清除错误状态
  zhouStore.clearError()
  
  // 可以选择重新获取解读或音频
  console.log('重试AI功能')
  
  // 如果有具体的错误类型，可以根据错误类型决定重试什么
  if (zhouStore.result.audioError) {
    // 重试音频功能
    playPoem()
  } else if (!zhouStore.result.interpretationContent) {
    // 重试解读功能
    getInterpretation()
  }
}
</script>

<style scoped>
/* 诗歌内容样式已迁移到PoemViewer组件 */

/* 操作按钮样式已迁移到ControlButtons组件 */

/* 解读内容样式已迁移到InterpretationDisplay组件 */

/* 响应式设计 */
@media (max-width: 768px) {
  .card-base {
    padding: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .card-base {
    padding: var(--spacing-base);
  }
  
  .content-title {
    font-size: var(--font-size-3xl);
    margin-bottom: var(--spacing-lg);
  }
}

/* 按钮样式已迁移到ControlButtons组件 */
</style>