<template>
  <div class="classical-echo-screen">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- 古典回响内容展示 - 使用专门的ClassicalEchoDisplay组件 -->
        <div class="echo-content">
          <ClassicalEchoDisplay 
            :quote-citation="quoteCitation"
            :quote-text="quoteText"
            :classical-echo="classicalEchoContent"
            content-animation-delay="0.1s"
          />
        </div>
        
        <!-- 继续按钮区域 - 对齐原版zhou.html的分离式设计 -->
        <div class="continue-section animate-fadeInUp" style="animation-delay: 0.5s;">
          <div class="flex items-center justify-center gap-2">
            <!-- 引导文字 - 来自原版zhou.html -->
            <span class="continue-text">看看你的同行者吴任几是怎么说的</span>
            <!-- 箭头按钮 -->
            <button 
              @click="continueToResult"
              class="btn-continue-arrow rounded-full"
              :class="{ 'animate-pulse': isTransitioning }"
              :disabled="isTransitioning"
            >
              <svg 
                v-if="!isTransitioning"
                class="continue-btn-icon" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
              <svg 
                v-else
                class="animate-spin h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  class="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  stroke-width="4"
                ></circle>
                <path 
                  class="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useZhouStore } from '../stores/zhou'
import ClassicalEchoDisplay from '../components/ClassicalEchoDisplay.vue'

const router = useRouter()
const zhouStore = useZhouStore()
const isTransitioning = ref(false)

// 古典回响页面
// 对应原 zhou.html 中的 #classical-echo-screen
// 使用专门的ClassicalEchoDisplay组件实现原版的"你选择的道路，有古人智慧的回响"体验

// 直接从结构化数据获取引文篇目名
const quoteCitation = computed(() => {
  const poemTitle = zhouStore.result.poemTitle
  if (!poemTitle || !zhouStore.universeData.poems[poemTitle]) return null
  
  const poemData = zhouStore.universeData.poems[poemTitle]
  return poemData.quote_citation || null
})

// 直接从结构化数据获取引文内容
const quoteText = computed(() => {
  const poemTitle = zhouStore.result.poemTitle
  if (!poemTitle || !zhouStore.universeData.poems[poemTitle]) return null
  
  const poemData = zhouStore.universeData.poems[poemTitle]
  return poemData.quote_text || null
})

// 根据用户答案生成古典回响内容
const classicalEchoContent = computed(() => {
  if (!zhouStore.quiz.isQuizComplete || !zhouStore.result.selectedPoem) {
    return null
  }

  // 查找对应的诗歌原型，获取古典回响内容
  const poemTitle = zhouStore.result.poemTitle
  if (poemTitle) {
    const archetype = zhouStore.universeData.poemArchetypes.find(
      p => p.title === poemTitle
    )
    if (archetype && archetype.classicalEcho) {
      return archetype.classicalEcho
    }
  }

  // 默认回响内容
  return `您的内心世界如诗如画，古人云："情动于中而形于言"。
  
即将为您呈现的诗歌，正是您此刻心境的真实写照。`
})

onMounted(() => {
  // 检查问答是否已完成
  if (!zhouStore.quiz.isQuizComplete) {
    router.replace('/')
    return
  }

  // 如果还没有计算诗歌映射，重新计算
  if (!zhouStore.result.selectedPoem) {
    zhouStore.calculatePoemMapping()
  }
})

// 继续到结果页面
const continueToResult = async () => {
  if (isTransitioning.value) return
  
  isTransitioning.value = true
  
  try {
    // 确保诗歌映射已完成
    if (!zhouStore.result.selectedPoem) {
      zhouStore.calculatePoemMapping()
    }
    
    // 短暂延迟以提供更好的用户体验
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    zhouStore.showResult()
    router.push('/result')
  } catch (error) {
    console.error('跳转到结果页面失败:', error)
    zhouStore.showError('跳转失败，请重试')
  } finally {
    isTransitioning.value = false
  }
}
</script>

<style scoped>
.classical-echo-screen {
  min-height: 100vh;
  background-color: var(--bg-primary);
  display: flex;
  align-items: center;
  padding: var(--spacing-xl) 0;
}

.echo-content {
  margin-bottom: var(--spacing-2xl);
}

/* 继续按钮区域 - 对齐原版zhou.html的分离式设计 */
.continue-section {
  text-align: center;
  margin-top: var(--spacing-xl);
}

.continue-text {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  font-weight: 500;
}

/* 箭头按钮样式 - 对齐原版zhou.html */
.btn-continue-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: linear-gradient(135deg, var(--color-primary-400) 0%, var(--color-primary-600) 100%);
  color: white;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  box-shadow: 
    0 4px 12px rgba(var(--color-primary-500-rgb), 0.3),
    0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-continue-arrow:hover:not(:disabled) {
  transform: translateY(-1px) scale(1.05);
  box-shadow: 
    0 6px 16px rgba(var(--color-primary-500-rgb), 0.4),
    0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-continue-arrow:active:not(:disabled) {
  transform: translateY(0) scale(1.02);
  transition-duration: 0.1s;
}

.btn-continue-arrow:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.continue-btn-icon {
  width: 20px;
  height: 20px;
  margin-left: 2px; /* 视觉居中调整 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .classical-echo-screen {
    align-items: flex-start;
    padding-top: var(--spacing-2xl);
  }
  
  .echo-content {
    margin-bottom: var(--spacing-xl);
  }
  
  .continue-section {
    margin-top: var(--spacing-lg);
  }
  
  .continue-text {
    font-size: var(--font-size-base);
  }
  
  .btn-continue-arrow {
    width: 36px;
    height: 36px;
  }
  
  .continue-btn-icon {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .continue-section {
    flex-direction: column;
    gap: var(--spacing-base);
  }
  
  .continue-text {
    font-size: var(--font-size-sm);
  }
  
  .btn-continue-arrow {
    width: 32px;
    height: 32px;
    margin: 0 auto;
  }
  
  .continue-btn-icon {
    width: 16px;
    height: 16px;
  }
}

/* 移动端取消悬浮效果 */
@media (max-width: 768px) {
  .btn-continue-arrow:hover:not(:disabled) {
    transform: none;
    box-shadow: 
      0 4px 12px rgba(var(--color-primary-500-rgb), 0.3),
      0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

/* 无障碍访问增强 */
.btn-continue-arrow:focus {
  outline: 2px solid var(--color-primary-300);
  outline-offset: 2px;
}

.btn-continue-arrow:focus:not(:focus-visible) {
  outline: none;
}
</style>