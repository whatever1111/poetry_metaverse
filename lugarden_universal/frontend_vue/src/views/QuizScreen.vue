<template>
  <div class="quiz-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <BackButton 
          text="返回"
          variant="default"
          size="medium"
          :hover-animation="true"
          @click="goBack"
        />
      </div>

      <!-- 状态恢复提示 -->
      <div v-if="showRestorePrompt" class="restore-prompt mb-6 animate-fadeInUp">
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <div class="text-blue-500 text-xl">💾</div>
            <div class="flex-1">
              <h3 class="font-medium text-blue-800 dark:text-blue-200 mb-2">
                发现未完成的问答进度
              </h3>
              <p class="text-sm text-blue-600 dark:text-blue-300 mb-3">
                您在此章节中已回答 {{ savedAnswersCount }} / {{ zhouStore.quiz.totalQuestions }} 道题目，是否继续之前的进度？
              </p>
              <div class="flex gap-2">
                <button 
                  @click="restorePreviousProgress"
                  class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  继续上次进度
                </button>
                <button 
                  @click="startNewQuiz"
                  class="px-3 py-1 border border-blue-300 text-blue-600 text-sm rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  重新开始
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 进度指示器 -->
      <div class="progress-indicator mb-8 animate-fadeIn">
        <ProgressBar 
          :model-value="zhouStore.quizProgress"
          :min="0"
          :max="100"
          :show-label="true"
          :show-percentage="true"
          label-text="问答进度"
          variant="rounded"
          color="info"
          size="medium"
          :animated="true"
          :smooth="true"
          :inner-text="`${zhouStore.quiz.currentQuestionIndex + 1} / ${zhouStore.quiz.totalQuestions}`"
          :show-inner-text="true"
        />
      </div>
      
      <!-- 问题卡片 -->
      <div v-if="zhouStore.currentQuestion" class="max-w-2xl mx-auto">
        <QuestionCard 
          :question="zhouStore.currentQuestion"
          :question-index="zhouStore.quiz.currentQuestionIndex"
          @answer="handleAnswer"
        />
      </div>

      <!-- 加载状态 -->
      <div v-else-if="zhouStore.universeData.loading">
        <LoadingSpinner 
          size="large"
          loading-text="正在加载问题..."
          subtitle="请稍候，正在为您准备题目"
          :show-progress="false"
          centered
        />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="zhouStore.universeData.error">
        <ErrorState 
          error-type="network"
          error-title="加载失败"
          :error-message="zhouStore.universeData.error"
          :show-retry="true"
          :show-back="true"
          retry-text="重新加载"
          back-text="返回上一页"
          @retry="retryLoad"
          @back="goBack"
        />
      </div>

      <!-- 无问题状态 -->
      <div v-else>
        <EmptyState 
          icon="❓"
          title="没有找到问题"
          description="当前章节没有可用的问题"
          :show-action="true"
          action-text="返回上一页"
          @action="goBack"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useZhouStore } from '../stores/zhou'
import QuestionCard from '../components/QuestionCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ErrorState from '../components/ErrorState.vue'
import EmptyState from '../components/EmptyState.vue'
import BackButton from '../components/BackButton.vue'
import ProgressBar from '../components/ProgressBar.vue'

const router = useRouter()
const route = useRoute()
const zhouStore = useZhouStore()

// 状态恢复相关
const showRestorePrompt = ref(false)
const savedAnswersCount = ref(0)

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
      
      // 检查是否有保存的状态
      checkForSavedState(chapterName)
    } else {
      // 章节不存在，返回主页
      router.replace('/')
      return
    }
  } else if (zhouStore.navigation.currentChapterName) {
    // 如果已有当前章节，检查保存的状态
    checkForSavedState(zhouStore.navigation.currentChapterName)
  }

  // 如果没有当前章节，返回上一页
  if (!zhouStore.navigation.currentChapterName) {
    router.replace('/project')
  }
})

// 检查保存的状态
const checkForSavedState = (chapterName: string) => {
  try {
    const savedState = localStorage.getItem('zhou_quiz_state')
    if (savedState) {
      const state = JSON.parse(savedState)
      
      // 检查是否是同一章节且未过期
      if (state.chapterName === chapterName && 
          state.userAnswers && 
          state.userAnswers.length > 0 &&
          !state.isQuizComplete &&
          Date.now() - state.savedAt < 24 * 60 * 60 * 1000) {
        
        savedAnswersCount.value = state.userAnswers.length
        showRestorePrompt.value = true
        
        console.log('发现可恢复的问答状态:', {
          chapter: chapterName,
          answersCount: savedAnswersCount.value,
          totalQuestions: state.totalQuestions
        })
      }
    }
  } catch (error) {
    console.warn('检查保存状态失败:', error)
  }
}

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

// 恢复之前的进度
const restorePreviousProgress = () => {
  const restored = zhouStore.restoreQuizState()
  if (restored) {
    showRestorePrompt.value = false
    console.log('已恢复之前的问答进度')
  } else {
    console.warn('恢复问答进度失败')
    startNewQuiz()
  }
}

// 重新开始问答
const startNewQuiz = () => {
  zhouStore.clearSavedQuizState()
  zhouStore.resetQuiz()
  
  // 重新初始化当前章节
  const chapterName = zhouStore.navigation.currentChapterName
  if (chapterName && zhouStore.universeData.questions[chapterName]) {
    const questions = zhouStore.universeData.questions[chapterName]
    zhouStore.quiz.totalQuestions = questions.length
    zhouStore.quiz.quizStartTime = Date.now()
  }
  
  showRestorePrompt.value = false
  console.log('开始新的问答流程')
}
</script>

<style scoped>
.quiz-screen {
  min-height: 100vh;
  background-color: var(--bg-primary);
}

/* ProgressBar组件样式已迁移到组件内部 */
/* QuestionCard组件样式已迁移到组件内部 */
</style>