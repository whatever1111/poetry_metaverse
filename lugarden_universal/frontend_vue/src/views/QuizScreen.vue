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
import { onMounted, watch } from 'vue'
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

/* ProgressBar组件样式已迁移到组件内部 */
/* QuestionCard组件样式已迁移到组件内部 */
</style>