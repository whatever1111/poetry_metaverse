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
          <div v-if="zhouStore.result.selectedPoem" class="poem-content card-base mb-8 animate-fadeInUp" style="animation-delay: 0.2s;">
            <h2 class="poem-title mb-6">
              {{ cleanTitle(zhouStore.result.poemTitle || zhouStore.result.selectedPoem.title) }}
            </h2>
            <div class="poem-body">
              {{ formatPoemBody(zhouStore.result.selectedPoem.body) }}
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="action-buttons grid grid-cols-2 gap-4 mb-8 animate-fadeInUp" style="animation-delay: 0.4s;">
            <button 
              @click="getInterpretation" 
              class="btn-interpret btn-base"
              :disabled="zhouStore.result.interpretationLoading"
            >
              <span v-if="zhouStore.result.interpretationLoading">解读中...</span>
              <span v-else>解诗</span>
            </button>
            
            <button 
              @click="playPoem" 
              class="btn-listen btn-base"
              :disabled="audioLoading"
            >
              <span v-if="audioLoading">播放中...</span>
              <span v-else-if="zhouStore.result.audioPlaying">暂停</span>
              <span v-else>读诗</span>
            </button>
            
            <button 
              @click="showPoetExplanation" 
              class="btn-poet btn-base"
              :class="{ 'opacity-75': zhouStore.result.poetButtonClicked }"
            >
              <span v-if="zhouStore.result.poetButtonClicked">
                诗人解读 ({{ zhouStore.result.poetButtonClickCount }})
              </span>
              <span v-else>诗人解读</span>
            </button>
            
            <button 
              @click="startOver" 
              class="btn-restart btn-base"
            >
              重新开始
            </button>
          </div>
          
          <!-- 解读内容区域 -->
          <div class="interpretation-area">
            <!-- AI解读 -->
            <div 
              v-if="zhouStore.result.interpretationContent" 
              class="interpretation-content card-base mb-6 animate-fadeInUp"
            >
              <h3 class="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <svg class="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                AI解读
              </h3>
              <div class="text-gray-700 whitespace-pre-line leading-relaxed">
                {{ zhouStore.result.interpretationContent }}
              </div>
            </div>
            
            <!-- 诗人解读 -->
            <div 
              v-if="zhouStore.result.poetExplanation" 
              class="poet-explanation card-base mb-6 animate-fadeInUp"
            >
              <h3 class="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <svg class="w-5 h-5 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
                诗人解读
              </h3>
              <div class="text-gray-700 whitespace-pre-line leading-relaxed">
                {{ zhouStore.result.poetExplanation }}
              </div>
            </div>
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

// 清理标题（移除书名号）
const cleanTitle = (title: string | null): string => {
  if (!title) return '未知诗歌'
  return title.replace(/[《》]/g, '')
}

// 格式化诗歌内容
const formatPoemBody = (body: string | object): string => {
  if (typeof body === 'string') {
    return body
  }
  
  if (typeof body === 'object' && body !== null) {
    const poemBody = body as any
    const parts: string[] = []
    
    if (poemBody.quote_text) {
      parts.push(poemBody.quote_text)
    }
    if (poemBody.quote_citation) {
      parts.push(`——${poemBody.quote_citation}`)
    }
    if (poemBody.main_text) {
      parts.push(poemBody.main_text)
    }
    
    return parts.join('\n\n')
  }
  
  return '诗歌内容加载中...'
}

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

.poem-content {
  text-align: center;
}

.action-buttons {
  max-width: 600px;
  margin: 0 auto;
}

/* 按钮样式覆盖 */
.btn-interpret {
  background: linear-gradient(145deg, #789a9a, #527a7a);
  border-color: #4a6869;
}

.btn-listen {
  background: linear-gradient(145deg, #9d6b53, #804d39);
  border-color: #6a3e2f;
}

.btn-poet {
  background: linear-gradient(145deg, #8b5a96, #6a4c7a);
  border-color: #5a3d6a;
}

.btn-restart {
  background: linear-gradient(145deg, #6c757d, #495057);
  border-color: #343a40;
}

/* 解读内容样式 */
.interpretation-content,
.poet-explanation {
  text-align: left;
  animation-delay: 0.6s;
}

.interpretation-content h3,
.poet-explanation h3 {
  border-bottom: 2px solid var(--color-primary-200);
  padding-bottom: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .action-buttons {
    grid-template-columns: 1fr;
    gap: var(--spacing-base);
  }
  
  .poem-title {
    font-size: var(--font-size-2xl);
    margin-bottom: var(--spacing-base);
  }
  
  .poem-body {
    font-size: var(--font-size-base);
    line-height: 1.8;
    padding: 0 var(--spacing-sm);
  }
  
  .card-base {
    padding: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .poem-title {
    font-size: var(--font-size-xl);
  }
  
  .poem-body {
    font-size: var(--font-size-sm);
    line-height: 1.7;
  }
  
  .card-base {
    padding: var(--spacing-base);
  }
  
  .content-title {
    font-size: var(--font-size-3xl);
    margin-bottom: var(--spacing-lg);
  }
}

/* 按钮状态动画 */
.btn-base:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

.btn-poet.opacity-75 {
  background: linear-gradient(145deg, #a67ba7, #7d5f8b);
}

/* 音频播放状态 */
.btn-listen[data-playing="true"] {
  background: linear-gradient(145deg, #b8744e, #9a5530);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>