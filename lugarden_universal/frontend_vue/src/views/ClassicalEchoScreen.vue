<template>
  <div class="classical-echo-screen">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- 古典回响内容 -->
        <div class="echo-content text-center">
          <h1 class="content-title mb-6 animate-fadeIn">
            古典回响
          </h1>
          
          <!-- 古典回响内容 -->
          <div class="echo-text animate-fadeInUp" style="animation-delay: 0.3s;">
            <InterpretationDisplay 
              :ai-interpretation="classicalEchoContent"
              empty-message="您的心境与古人相通，即将为您呈现一首与您内心共鸣的诗歌。"
              ai-animation-delay="0.0s"
            >
              <template #custom v-if="!classicalEchoContent">
                <div class="default-echo-content">
                  <p class="italic text-gray-600 mb-4">
                    "诗者，志之所之也。在心为志，发言为诗。"
                  </p>
                  <p class="text-base">
                    您的心境与古人相通，即将为您呈现一首与您内心共鸣的诗歌。
                  </p>
                </div>
              </template>
            </InterpretationDisplay>
          </div>
          
          <!-- 诗歌预览 -->
          <div v-if="zhouStore.result.selectedPoem" class="poem-preview animate-fadeInUp" style="animation-delay: 0.5s;">
            <PoemViewer 
              :poem-title="zhouStore.result.poemTitle || zhouStore.result.selectedPoem.title"
              :poem-body="zhouStore.result.selectedPoem.body"
              animation-delay="0.0s"
              :show-actions="true"
              :show-download="false"
              @copied="handlePoemCopied"
              @shared="handlePoemShared"
            />
          </div>
          
          <!-- 继续按钮 -->
          <div class="action-buttons animate-fadeInUp" style="animation-delay: 0.6s;">
            <button 
              @click="continueToResult"
              class="btn-continue flex items-center justify-center mx-auto"
              :class="{ 'animate-pulse': isTransitioning }"
              :disabled="isTransitioning"
            >
              <span v-if="!isTransitioning">继续</span>
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
            
            <p class="text-sm text-gray-500 mt-4 italic">
              静心凝神，诗意正在汇聚...
            </p>
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
import PoemViewer from '../components/PoemViewer.vue'
import InterpretationDisplay from '../components/InterpretationDisplay.vue'

const router = useRouter()
const zhouStore = useZhouStore()
const isTransitioning = ref(false)

// 古典回响页面
// 对应原 zhou.html 中的 #classical-echo-screen

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

// 处理诗歌复制事件
const handlePoemCopied = (text: string) => {
  console.log('古典回响页面：诗歌已复制到剪贴板:', text.substring(0, 50) + '...')
}

// 处理诗歌分享事件
const handlePoemShared = (shareData: { title: string; text: string; url?: string }) => {
  console.log('古典回响页面：诗歌已分享:', shareData.title)
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
  max-width: 800px;
  margin: 0 auto;
}

.echo-text {
  margin-bottom: var(--spacing-xl);
}

.poem-preview {
  margin-bottom: var(--spacing-2xl);
}

.default-echo-content {
  text-align: center;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: var(--radius-base);
}

.btn-continue {
  min-width: 120px;
  min-height: 48px;
  font-size: var(--font-size-lg);
  font-weight: 600;
  padding: var(--spacing-base) var(--spacing-2xl);
  border-radius: var(--radius-full);
  transition: all var(--duration-normal) var(--ease-out);
}

.btn-continue:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 诗意的卡片效果 */
.card-base {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .classical-echo-screen {
    align-items: flex-start;
    padding-top: var(--spacing-2xl);
  }
  
  .echo-content {
    padding: 0 var(--spacing-base);
  }
  
  .content-title {
    font-size: var(--font-size-3xl);
    margin-bottom: var(--spacing-base);
  }
  
  .echo-text .card-base {
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .echo-text .card-base {
    padding: var(--spacing-base);
  }
  
  .content-title {
    font-size: var(--font-size-2xl);
  }
}
</style>