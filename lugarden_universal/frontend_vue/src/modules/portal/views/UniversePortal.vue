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
        @retry="loadUniverses"
      />
      
      <!-- 宇宙列表 -->
      <div v-else class="universes-grid">
        <div 
          v-for="universe in universes" 
          :key="universe.id"
          class="universe-card"
          @click="navigateToUniverse(universe)"
        >
          <div class="card-header">
            <h3 class="universe-name">{{ universe.name }}</h3>
            <span class="universe-status" :class="universe.status">
              {{ getStatusText(universe.status) }}
            </span>
          </div>
          <p class="universe-description">{{ universe.description }}</p>
          <div class="card-footer">
            <span class="universe-meta">{{ universe.meta }}</span>
            <button class="enter-button">
              进入宇宙
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { LoadingSpinner, ErrorState } from '@/shared/components'
import type { ErrorState as ErrorStateType } from '@/shared/types'

// 路由
const router = useRouter()

// 响应式状态
const loading = ref(false)
const error = ref<ErrorStateType>({ hasError: false, message: '' })

// 临时宇宙数据（MVP阶段硬编码）
const universes = ref([
  {
    id: 'zhou',
    name: '周与春秋练习',
    description: '基于吴任几《周与春秋练习》系列诗歌的互动体验，通过问答与解诗探索古典诗歌的现代意义。',
    status: 'active',
    meta: '诗歌问答 · 古典解读'
  },
  {
    id: 'maoxiaodou',
    name: '毛小豆故事演绎',
    description: '毛小豆宇宙的奇幻冒险，包含前篇、正篇、番外的完整故事体系。',
    status: 'developing',
    meta: '故事世界 · 角色扮演'
  }
])

// 方法
const loadUniverses = async () => {
  loading.value = true
  error.value = { hasError: false, message: '' }
  
  try {
    // TODO: 后续替换为API调用
    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟加载
    // const response = await getUniverses()
    // universes.value = response.data
  } catch (err) {
    error.value = {
      hasError: true,
      message: '加载宇宙列表失败，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}

const navigateToUniverse = (universe: any) => {
  if (universe.status !== 'active') {
    // TODO: 可以显示开发中提示
    console.log(`${universe.name} 还在开发中，敬请期待！`)
    return
  }
  
  // 导航到具体宇宙
  if (universe.id === 'zhou') {
    router.push('/zhou')
  }
  // TODO: 添加其他宇宙的导航（如毛小豆宇宙）
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '已上线',
    developing: '开发中',
    maintenance: '维护中'
  }
  return statusMap[status] || '未知'
}

// 生命周期
onMounted(() => {
  loadUniverses()
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

/* 宇宙卡片样式 */
.universe-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.universe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.universe-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.universe-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.universe-status.active {
  background: #c6f6d5;
  color: #22543d;
}

.universe-status.developing {
  background: #feebc8;
  color: #c05621;
}

.universe-description {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.universe-meta {
  color: #718096;
  font-size: 0.875rem;
}

.enter-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.enter-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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
  
  .universe-card {
    padding: 1.5rem;
  }
}
</style>
