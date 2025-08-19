<template>
  <div class="quiz-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <button @click="goBack" class="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
      </div>

      <!-- 进度指示器 -->
      <div class="progress-indicator mb-8 animate-fadeIn">
        <div class="text-center text-sm text-gray-500 mb-2">
          进度: {{ zhouStore.quiz.currentQuestionIndex + 1 }} / {{ zhouStore.quiz.totalQuestions }}
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-500 h-2 rounded-full transition-all duration-300" 
            :style="{ width: `${zhouStore.quizProgress}%` }"
          ></div>
        </div>
      </div>
      
      <!-- 问题卡片 -->
      <div v-if="zhouStore.currentQuestion" class="max-w-2xl mx-auto">
        <div class="card-question animate-fadeInUp">
          <div class="question-text animate-textChange" :key="zhouStore.quiz.currentQuestionIndex">
            {{ zhouStore.currentQuestion.question }}
          </div>
          
          <!-- 选项按钮 -->
          <div class="options-grid grid-cols-1 gap-4">
            <button 
              v-for="(option, key) in zhouStore.currentQuestion.options"
              :key="key"
              class="btn-option text-left animate-fadeInUp"
              :style="{ animationDelay: `${0.3 + (key === 'A' ? 0 : 0.1)}s` }"
              @click="handleAnswer(key as 'A' | 'B')"
            >
              <span class="font-bold mr-2">{{ key }}.</span>
              {{ option }}
            </button>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="zhouStore.universeData.loading" class="loading-container">
        <div class="loading-spinner animate-spin"></div>
        <div class="loading-text">正在加载问题...</div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="zhouStore.universeData.error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">加载失败</h3>
        <p class="error-message">{{ zhouStore.universeData.error }}</p>
        <button @click="retryLoad" class="error-action">重试</button>
      </div>

      <!-- 无问题状态 -->
      <div v-else class="empty-container">
        <div class="empty-icon">❓</div>
        <h3 class="text-xl font-bold mb-2 text-gray-600">没有找到问题</h3>
        <p class="text-gray-500">当前章节没有可用的问题</p>
        <button @click="goBack" class="btn-secondary mt-4">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useZhouStore } from '../stores/zhou'

const router = useRouter()
const route = useRoute()
const zhouStore = useZhouStore()

// 问答页面
// 对应原 zhou.html 中的 #question-screen

onMounted(async () => {
  // 确保数据已加载
  if (!zhouStore.appState.initialized) {
    await zhouStore.loadUniverseContent()
  }

  // 检查是否有选择的章节
  const chapterParam = route.params.chapter as string
  if (chapterParam && !zhouStore.navigation.currentChapterName) {
    const chapterName = decodeURIComponent(chapterParam)
    
    // 如果没有选择主项目，尝试从数据中推断
    if (!zhouStore.navigation.currentMainProject) {
      // 查找包含此章节的项目
      const project = zhouStore.universeData.projects.find(p => 
        p.subProjects?.some(sp => sp.name === chapterName)
      )
      if (project) {
        zhouStore.selectMainProject(project)
      }
    }
    
    // 选择章节
    if (zhouStore.universeData.questions[chapterName]) {
      zhouStore.selectChapter(chapterName)
    } else {
      // 章节不存在，返回主页
      router.replace('/')
      return
    }
  }

  // 如果没有当前章节，返回上一页
  if (!zhouStore.navigation.currentChapterName) {
    router.replace('/project')
  }
})

// 监听问答完成状态
watch(
  () => zhouStore.quiz.isQuizComplete,
  (completed) => {
    if (completed) {
      // 问答完成，跳转到古典回响页面
      router.push('/classical-echo')
    }
  }
)

// 处理答案选择
const handleAnswer = (selectedOption: 'A' | 'B') => {
  zhouStore.answerQuestion(selectedOption)
}

// 返回上一页
const goBack = () => {
  zhouStore.goBack()
  if (zhouStore.navigation.currentMainProject) {
    router.push(`/project/${zhouStore.navigation.currentMainProject.id}`)
  } else {
    router.push('/')
  }
}

// 重试加载
const retryLoad = async () => {
  zhouStore.clearError()
  await zhouStore.loadUniverseContent()
}
</script>

<style scoped>
.quiz-screen {
  min-height: 100vh;
  background-color: var(--bg-primary);
}

.progress-indicator .bg-blue-500 {
  background-color: var(--color-info);
  transition: width 0.3s ease;
}

.options-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}

@media (min-width: 480px) {
  .options-grid {
    gap: var(--spacing-lg);
  }
}

@media (min-width: 768px) {
  .options-grid {
    gap: var(--spacing-xl);
  }
}

/* 确保按钮文本左对齐 */
.btn-option {
  text-align: left;
  justify-content: flex-start;
}
</style>