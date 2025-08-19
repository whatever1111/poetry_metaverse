<template>
  <div class="main-project-selection">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
        周与春秋
      </h1>
      <div class="text-center mb-8">
        <p class="text-gray-600">请选择一个项目开始您的诗歌之旅</p>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="zhouStore.universeData.loading" class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">{{ zhouStore.ui.loadingMessage }}</div>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="zhouStore.universeData.error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3 class="text-xl font-bold mb-2 text-orange-800">加载失败</h3>
        <p class="text-orange-600 mb-4">{{ zhouStore.universeData.error }}</p>
        <button 
          @click="retryLoad" 
          class="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
        >
          重试
        </button>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="zhouStore.universeData.projects.length === 0" class="empty-container">
        <div class="empty-icon">📚</div>
        <h3 class="text-xl font-bold mb-2 text-gray-600">暂无项目</h3>
        <p class="text-gray-500">当前没有可用的项目，请稍后再试</p>
      </div>
      
      <!-- 项目列表 -->
      <div v-else class="grid grid-responsive">
        <div 
          v-for="(project, index) in zhouStore.universeData.projects" 
          :key="project.id"
          class="card-project animate-fadeInUp"
          :style="{ animationDelay: `${0.1 * index}s` }"
          @click="selectProject(project)"
        >
          <h2 class="text-2xl font-bold mb-2 text-gray-800">{{ project.name }}</h2>
          <div class="text-gray-600 mb-4 whitespace-pre-line">{{ project.description }}</div>
          <div class="flex justify-between items-center mt-4">
            <p class="text-sm text-gray-500">导游: {{ project.poet || '未指定' }}</p>
            <button class="btn-primary">
              进入
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useZhouStore } from '../stores/zhou'
import type { ZhouProject } from '../types/zhou'

const router = useRouter()
const zhouStore = useZhouStore()

// 主项目选择页面
// 对应原 zhou.html 中的 #main-project-selection-screen

// 组件挂载时初始化数据
onMounted(async () => {
  // 检测移动设备
  zhouStore.detectMobileDevice()
  
  // 如果还未初始化或数据过期，加载宇宙内容
  if (!zhouStore.appState.initialized || shouldRefreshData()) {
    await zhouStore.loadUniverseContent()
  }
})

// 判断是否需要刷新数据（可选的缓存策略）
function shouldRefreshData(): boolean {
  if (!zhouStore.universeData.lastFetchTime) return true
  
  const CACHE_DURATION = 10 * 60 * 1000 // 10分钟
  const now = Date.now()
  return (now - zhouStore.universeData.lastFetchTime) > CACHE_DURATION
}

// 选择项目
function selectProject(project: ZhouProject): void {
  zhouStore.selectMainProject(project)
  router.push(`/project/${project.id}`)
}

// 重试加载
async function retryLoad(): Promise<void> {
  zhouStore.clearError()
  await zhouStore.loadUniverseContent()
}
</script>

<style scoped>
.main-project-selection {
  min-height: 100vh;
  background-color: var(--bg-primary);
}

/* 组件特有的样式 */
.loading-spinner {
  animation: spin 1s linear infinite;
}
</style>
