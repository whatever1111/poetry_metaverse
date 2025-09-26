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
    <div class="card-header">
      <h3 class="universe-name">{{ universe.name }}</h3>
      <span class="universe-status" :class="universe.status">
        {{ statusText }}
      </span>
    </div>
    <p class="universe-description">{{ universe.description }}</p>
    <div class="card-footer">
      <span class="universe-meta">{{ universe.meta }}</span>
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

.universe-card:hover:not(.card-disabled) {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.universe-card.card-disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

.universe-status.maintenance {
  background: #fed7d7;
  color: #c53030;
}

.universe-status.archived {
  background: #e2e8f0;
  color: #4a5568;
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

.enter-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.enter-button:disabled {
  background: #cbd5e0;
  color: #4a5568;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .universe-card {
    padding: 1.5rem;
  }
  
  .universe-name {
    font-size: 1.25rem;
  }
  
  .card-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .enter-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}
</style>
