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
      
      <!-- 空状态 -->
      <EmptyState
        v-else-if="universes.length === 0"
        title="暂无可用宇宙"
        description="目前还没有已上线的宇宙项目，请稍后再来探索吧～"
        icon="🌌"
        :show-action="true"
        action-text="刷新列表"
        @action="portalStore.refreshUniverses"
      />
      
      <!-- 宇宙列表 -->
      <div v-else class="universes-grid">
        <UniverseCard
          v-for="(universe, index) in universes" 
          :key="universe.id"
          :universe="universe"
          :index="index"
          @click="navigateToUniverse"
          @enter="navigateToUniverse"
        />
      </div>
    </main>

    <!-- 通知提示 -->
    <NotificationToast
      v-if="showToast"
      :message="toastMessage"
      :type="toastType"
      :duration="3000"
      @close="showToast = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { LoadingSpinner, ErrorState, EmptyState, NotificationToast } from '@/shared/components'
import { UniverseCard } from '../components'
import { usePortalStore } from '../stores'
import type { Universe } from '../types'

// 路由
const router = useRouter()

// Portal状态管理
const portalStore = usePortalStore()

// Toast通知状态
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('info')

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

// 显示Toast通知
const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

const navigateToUniverse = async (universe: Universe) => {
  // 选择宇宙
  await portalStore.selectUniverse(universe)
  
  if (!portalStore.isUniverseAccessible(universe)) {
    // 显示友好的开发中提示
    const statusMessages = {
      developing: `${universe.name} 正在紧张开发中，敬请期待！🚧`,
      maintenance: `${universe.name} 正在维护升级，请稍后再来～🔧`,
      archived: `${universe.name} 已暂时下线，感谢您的关注！📦`
    }
    const message = statusMessages[universe.status as keyof typeof statusMessages] || `${universe.name} 暂时无法访问`
    showToastMessage(message, 'info')
    return
  }
  
  // 获取导航路径并跳转
  const navigationPath = portalStore.getUniverseNavigationPath(universe.id)
  showToastMessage(`正在进入 ${universe.name}～`, 'success')
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
