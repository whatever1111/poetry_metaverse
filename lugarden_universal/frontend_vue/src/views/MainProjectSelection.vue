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
      <div v-else class="project-list grid gap-6 max-w-4xl mx-auto">
        <div 
          v-for="(project, index) in zhouStore.universeData.projects" 
          :key="project.id"
          class="project-card bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer animate-fadeInUp"
          :style="{ animationDelay: `${0.1 * index}s` }"
          @click="selectProject(project)"
        >
          <h2 class="text-2xl font-bold mb-2 text-gray-800">{{ project.name }}</h2>
          <div class="text-gray-600 mb-4 whitespace-pre-line">{{ project.description }}</div>
          <div class="flex justify-between items-center mt-4">
            <p class="text-sm text-gray-500">导游: {{ project.poet || '未指定' }}</p>
            <button class="enter-project-btn bg-gray-800 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-700 transition-colors">
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
  background-color: #f3f4f6;
}

/* 加载状态样式 */
.loading-container {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #60a5fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-text {
  font-size: 1.1rem;
  color: #374151;
}

/* 错误状态样式 */
.error-container {
  text-align: center;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  margin: 1rem;
  border: 1px solid #f59e0b;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* 空状态样式 */
.empty-container {
  text-align: center;
  padding: 4rem 1rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* 项目卡片样式 */
.project-card {
  opacity: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.project-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.enter-project-btn {
  transition: all 0.3s ease;
}

.enter-project-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-list {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .project-card {
    padding: 1rem;
  }
  
  .project-card h2 {
    font-size: 1.5rem;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
