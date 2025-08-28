<template>
  <div class="min-h-screen" style="background-color: var(--bg-primary);">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
        周与春秋
      </h1>
      <div class="text-center mb-8">
        <p class="text-gray-600">请选择一个项目开始您的诗歌之旅</p>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="zhouStore.universeData.loading">
        <LoadingSpinner 
          size="large"
          :loading-text="zhouStore.ui.loadingMessage || '正在加载项目...'"
          subtitle="为您准备诗歌之旅"
          variant="default"
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
          :show-back="false"
          retry-text="重试"
          @retry="retryLoad"
          :suggestions="['请检查网络连接', '刷新页面重试', '联系技术支持']"
        />
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="zhouStore.universeData.projects.length === 0">
        <EmptyState 
          icon="📚"
          title="暂无项目"
          description="当前没有可用的项目，请稍后再试"
          size="large"
          variant="default"
        />
      </div>
      
      <!-- 项目列表 -->
      <div v-else class="grid grid-responsive">
        <div 
          v-for="(project, index) in zhouStore.universeData.projects" 
          :key="project.id"
          class="unified-content-card rounded-base animate-fadeInUp flex flex-col h-full"
          :style="{ animationDelay: `${0.1 * index}s` }"
          @click="selectProject(project)"
        >
          <div class="flex-1">
            <h2 class="text-2xl font-bold mb-2 text-gray-800">{{ project.name }}</h2>
            <div class="text-gray-600 mb-4 whitespace-pre-line">{{ project.description }}</div>
            <p class="text-sm text-gray-500">导游: {{ project.poet || '未指定' }}</p>
          </div>
          <div class="flex justify-end mt-4">
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
import { useZhouStore } from '@/modules/zhou/stores/zhou'
import type { ZhouProject } from '@/modules/zhou/types/zhou'
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'
import ErrorState from '@/shared/components/ErrorState.vue'
import EmptyState from '@/shared/components/EmptyState.vue'

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
/* 组件特有的样式 */
.loading-spinner {
  animation: spin 1s linear infinite;
}
</style>
