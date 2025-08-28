<template>
  <div class="universe-portal">
    <!-- 主标题区域 -->
    <header class="portal-header">
      <h1 class="portal-title">陆家花园</h1>
      <p class="portal-subtitle">诗歌宇宙的探索入口</p>
    </header>

    <!-- 宇宙卡片列表区域 -->
    <main class="universes-container">
      <!-- 加载状态 -->
      <LoadingSpinner 
        v-if="loading" 
        message="正在加载宇宙列表..."
        size="large"
      />
      
      <!-- 错误状态 -->
      <ErrorState 
        v-else-if="error.hasError"
        :message="error.message"
        @retry="portalStore.retryLoad"
      />
      
      <!-- 宇宙列表 -->
      <div v-else class="universes-grid">
        <UniverseCard
          v-for="universe in universes" 
          :key="universe.id"
          :universe="universe"
          @click="navigateToUniverse"
          @enter="navigateToUniverse"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { LoadingSpinner, ErrorState } from '@/shared/components'
import { UniverseCard } from '../components'
import { usePortalStore } from '../stores'
import type { Universe } from '../types'

// 路由
const router = useRouter()

// Portal状态管理
const portalStore = usePortalStore()

// 计算属性
const loading = computed(() => portalStore.isLoading)
const error = computed(() => ({
  hasError: portalStore.hasError,
  message: portalStore.errorMessage
}))
const universes = computed(() => portalStore.visibleUniverses)

// 方法
const loadUniverses = async () => {
  await portalStore.loadUniverses()
}

const navigateToUniverse = (universe: Universe) => {
  // 选择宇宙
  portalStore.selectUniverse(universe)
  
  if (!portalStore.isUniverseAccessible(universe)) {
    // TODO: 可以显示开发中提示或模态框
    console.log(`${universe.name} 还在开发中，敬请期待！`)
    return
  }
  
  // 获取导航路径并跳转
  const navigationPath = portalStore.getUniverseNavigationPath(universe.id)
  router.push(navigationPath)
}

// 生命周期
onMounted(async () => {
  // 预加载数据，如果已有缓存则不重新加载
  await portalStore.preloadUniverseData()
})
</script>

<style scoped>
/* 主容器 */
.universe-portal {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

/* 头部样式 */
.portal-header {
  text-align: center;
  margin-bottom: 3rem;
}

.portal-title {
  font-size: 3rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.portal-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

/* 宇宙容器 */
.universes-container {
  max-width: 1200px;
  margin: 0 auto;
}

.universes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .universe-portal {
    padding: 1rem;
  }
  
  .portal-title {
    font-size: 2rem;
  }
  
  .universes-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
