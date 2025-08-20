<template>
  <div class="result-screen">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- 结果展示 -->
        <div class="result-content">
          <h1 class="content-title text-center mb-8 animate-fadeIn">
            您的诗歌
          </h1>
          
          <!-- 诗歌内容 -->
          <div v-if="zhouStore.result.selectedPoem" class="mb-8">
            <PoemViewer 
              :poem-title="zhouStore.result.poemTitle || zhouStore.result.selectedPoem.title"
              :poem-body="zhouStore.result.selectedPoem.body"
              animation-delay="0.2s"
            />
          </div>
          
          <!-- 操作按钮 -->
          <div class="mb-8 animate-fadeInUp" style="animation-delay: 0.4s;">
            <ActionButtons 
              :interpretation-loading="zhouStore.result.interpretationLoading"
              :audio-loading="audioLoading"
              :audio-playing="zhouStore.result.audioPlaying"
              :poet-button-clicked="zhouStore.result.poetButtonClicked"
              :poet-button-click-count="zhouStore.result.poetButtonClickCount"
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
              ai-animation-delay="0.6s"
              poet-animation-delay="0.8s"
              empty-message="点击上方按钮获取诗歌解读"
            />
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="!zhouStore.result.selectedPoem && !zhouStore.universeData.error" class="loading-container">
          <div class="loading-spinner animate-spin"></div>
          <div class="loading-text">正在准备您的诗歌...</div>
        </div>

        <!-- 错误状态 -->
        <div v-if="zhouStore.universeData.error" class="error-container">
          <div class="error-icon">⚠️</div>
          <h3 class="error-title">出现了问题</h3>
          <p class="error-message">{{ zhouStore.universeData.error }}</p>
          <button @click="retryLoad" class="error-action">重试</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useZhouStore } from '../stores/zhou'
import PoemViewer from '../components/PoemViewer.vue'
import ActionButtons from '../components/ActionButtons.vue'
import InterpretationDisplay from '../components/InterpretationDisplay.vue'

const router = useRouter()
const zhouStore = useZhouStore()
const audioLoading = ref(false)

// 结果页面
// 对应原 zhou.html 中的 #result-screen

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
  if (audioLoading.value) return
  
  audioLoading.value = true
  try {
    await zhouStore.playPoem()
  } catch (error) {
    console.error('播放诗歌失败:', error)
  } finally {
    audioLoading.value = false
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
</script>

<style scoped>
.result-screen {
  min-height: 100vh;
  background-color: var(--bg-primary);
}

/* 诗歌内容样式已迁移到PoemViewer组件 */

/* 操作按钮样式已迁移到ActionButtons组件 */

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

/* 按钮样式已迁移到ActionButtons组件 */
</style>