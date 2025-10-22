<template>
  <AnimationWrapper
    animation-type="fadeInUp"
    :delay="animationDelay"
    class="universe-card-wrapper"
  >
    <div 
      class="universe-card"
      :class="{ 'card-disabled': !isActive }"
      @click="handleCardClick"
    >
      <!-- 内容区域 - 使用flex-1占据剩余空间 -->
      <div class="card-content">
        <div class="card-header">
          <h3 class="universe-name">{{ universe.name }}</h3>
          <span class="universe-status" :class="universe.status">
            {{ statusText }}
          </span>
        </div>
        <p class="universe-description">{{ universe.description }}</p>
        <p class="universe-meta">{{ universe.meta }}</p>
      </div>
      
      <!-- 按钮区域 - 与Zhou对齐 -->
      <div class="card-footer">
        <button 
          class="enter-button"
          :disabled="!isActive"
          @click.stop="handleEnterClick"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>
  </AnimationWrapper>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AnimationWrapper } from '@/shared/components'
import type { Universe, UniverseCardEvents } from '@/modules/portal/types'

// Props定义
interface Props {
  universe: Universe
  disabled?: boolean
  index?: number
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  index: 0
})

// 事件定义
const emit = defineEmits<UniverseCardEvents>()

// 计算属性
const isActive = computed(() => {
  return props.universe.status === 'active' && !props.disabled
})

const animationDelay = computed(() => {
  // 为每个卡片提供50ms的交错延迟，最大延迟200ms
  return Math.min(props.index * 50, 200)
})

const statusText = computed(() => {
  const statusMap: Record<string, string> = {
    active: '已上线',
    developing: '开发中',
    maintenance: '维护中',
    archived: '已归档'
  }
  return statusMap[props.universe.status] || '未知'
})

const buttonText = computed(() => {
  if (!isActive.value) {
    return props.universe.status === 'developing' ? '敬请期待' : '暂不可用'
  }
  return '进入宇宙'
})

// 事件处理
const handleCardClick = () => {
  emit('click', props.universe)
}

const handleEnterClick = () => {
  if (isActive.value) {
    emit('enter', props.universe)
  }
}
</script>

<style scoped>
/* 卡片包装器 - 确保flex布局生效 */
.universe-card-wrapper {
  height: 100%;
}

/* 宇宙卡片样式 - 与Zhou统一的玻璃态设计 */
.universe-card {
  /* 玻璃态背景 - 与Zhou的unified-content-card一致 */
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(248, 250, 252, 0.6) 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-base); /* 8px */
  padding: var(--spacing-lg); /* 1.5rem = 24px */
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  min-height: 200px;
  
  /* Flex布局 - 与Zhou完全一致 */
  display: flex;
  flex-direction: column;
  height: 100%;
}

.universe-card:hover:not(.card-disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.universe-card.card-disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 内容区域 - 占据剩余空间 */
.card-content {
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.universe-name {
  font-size: var(--font-size-2xl); /* 与Zhou的h2一致 */
  font-weight: 700;
  color: var(--text-primary); /* #1f2937 */
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

.universe-status.maintenance {
  background: #fed7d7;
  color: #c53030;
}

.universe-status.archived {
  background: #e2e8f0;
  color: #4a5568;
}

.universe-description {
  color: var(--text-tertiary); /* #6b7280 - 与Zhou统一 */
  line-height: 1.6;
  margin-bottom: 1rem;
  white-space: pre-line;
}

.universe-meta {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  margin: 0;
}

/* 按钮区域 - 与Zhou对齐：靠右 + 顶部间距 */
.card-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem; /* 与Zhou的mt-4一致 */
}

.enter-button {
  /* 与Zhou btn-primary完全一致的深灰色渐变 */
  background: linear-gradient(to bottom right, var(--color-primary-600), var(--color-primary-700));
  color: var(--text-light);
  border: 1px solid var(--color-primary-700);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  box-shadow: var(--shadow-base);
  min-width: 100px;
  min-height: 36px;
}

.enter-button:hover:not(:disabled) {
  background: linear-gradient(to bottom right, var(--color-primary-700), var(--color-primary-800));
  transform: translateY(-0.125rem);
  box-shadow: var(--shadow-md);
}

.enter-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.enter-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .universe-card {
    padding: 1.5rem;
  }
  
  .universe-name {
    font-size: 1.25rem;
  }
  
  /* 移动端按钮仍然靠右，与Zhou保持一致 */
  .card-footer {
    justify-content: flex-end;
  }
}
</style>
