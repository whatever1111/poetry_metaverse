<template>
  <div class="sub-project-selection">
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

      <!-- 项目信息 -->
      <div v-if="zhouStore.navigation.currentMainProject" class="text-center mb-8">
        <h1 class="content-title animate-fadeInDown">
          {{ zhouStore.navigation.currentMainProject.name }}
        </h1>
        <div class="content-subtitle animate-fadeIn" style="animation-delay: 0.2s;">
          {{ zhouStore.navigation.currentMainProject.description }}
        </div>
        <p class="text-gray-500 mb-8">
          导游: {{ zhouStore.navigation.currentMainProject.poet || '未指定' }}
        </p>
      </div>
      
      <!-- 子项目列表 -->
      <div v-if="zhouStore.navigation.currentMainProject?.subProjects" class="grid grid-responsive">
        <div 
          v-for="(subProject, index) in zhouStore.navigation.currentMainProject.subProjects" 
          :key="`${subProject.name}-${index}`"
          class="card-project animate-fadeInUp cursor-pointer"
          :style="{ animationDelay: `${0.3 + 0.1 * index}s` }"
          @click="selectChapter(subProject.name)"
        >
          <h2 class="text-2xl font-bold mb-4 text-gray-800">{{ subProject.name }}</h2>
          <div class="text-gray-600 mb-4 whitespace-pre-line">{{ subProject.description }}</div>
          <div class="flex justify-end">
            <button class="btn-primary">
              开始问答
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!zhouStore.universeData.loading" class="empty-container animate-fadeIn">
        <div class="empty-icon">📝</div>
        <h3 class="text-xl font-bold mb-2 text-gray-600">暂无子项目</h3>
        <p class="text-gray-500">当前项目没有可用的子项目</p>
      </div>

      <!-- 加载状态 -->
      <div v-else class="loading-container">
        <div class="loading-spinner animate-spin"></div>
        <div class="loading-text">正在加载项目信息...</div>
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

// 子项目选择页面
// 对应原 zhou.html 中的 #sub-project-selection-screen

onMounted(async () => {
  // 如果没有选择主项目，尝试从路由参数获取
  if (!zhouStore.navigation.currentMainProject && route.params.projectId) {
    // 确保数据已加载
    if (!zhouStore.appState.initialized) {
      await zhouStore.loadUniverseContent()
    }
    
    // 根据路由参数查找项目
    const projectId = route.params.projectId as string
    const project = zhouStore.universeData.projects.find(p => p.id === projectId)
    if (project) {
      zhouStore.selectMainProject(project)
    } else {
      // 项目不存在，返回主页
      router.replace('/')
      return
    }
  }
  
  // 如果仍然没有选择项目，返回主页
  if (!zhouStore.navigation.currentMainProject) {
    router.replace('/')
  }
})

// 监听当前项目变化
watch(
  () => zhouStore.navigation.currentMainProject,
  (newProject) => {
    if (!newProject) {
      router.replace('/')
    }
  }
)

// 返回上一级
const goBack = () => {
  zhouStore.goBack()
  router.push('/')
}

// 选择章节，开始问答
const selectChapter = (chapterName: string) => {
  zhouStore.selectChapter(chapterName)
  router.push(`/quiz/${encodeURIComponent(chapterName)}`)
}
</script>

<style scoped>
.sub-project-selection {
  min-height: 100vh;
  background-color: var(--bg-primary);
}
</style>