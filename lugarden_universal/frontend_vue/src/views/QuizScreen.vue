<template>
  <div class="quiz-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <button @click="goBack" class="flex items-center text-gray-600 hover:text-gray-800">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
      </div>

      <!-- 进度指示器 -->
      <div class="progress-indicator mb-8">
        <div class="text-center text-sm text-gray-500 mb-2">
          进度: {{ currentQuestionIndex + 1 }} / {{ totalQuestions }}
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" 
               :style="{ width: `${progress}%` }"></div>
        </div>
      </div>
      
      <!-- 问题卡片将在这里渲染 -->
      <div class="question-card max-w-2xl mx-auto">
        <!-- 问题内容占位 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 问答页面
// 对应原 zhou.html 中的 #question-screen

const currentQuestionIndex = ref(0)
const totalQuestions = ref(10) // 占位数据

const progress = computed(() => {
  return ((currentQuestionIndex.value + 1) / totalQuestions.value) * 100
})

const goBack = () => {
  router.push('/project')
}
</script>

<style scoped>
.quiz-screen {
  min-height: 100vh;
  background-color: #f3f4f6;
}
</style>
