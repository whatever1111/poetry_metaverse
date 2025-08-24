<template>
  <div class="max-w-2xl mx-auto">
    <div class="grid gap-4 mb-6" :class="gridClass">
      <!-- 解诗按钮 -->
      <button 
        @click="handleInterpretation" 
        class="btn-interpret text-change-animation"
        :class="{ 'animate-pulse': interpretationLoading }"
        :disabled="interpretationLoading || disabled"
      >
        <span v-if="interpretationLoading">解读中...</span>
        <span v-else>解诗</span>
      </button>
      
      <!-- 读诗按钮 -->
      <button 
        @click="handlePlayPoem" 
        class="btn-listen text-change-animation"
        :class="{ 
          'btn-control-playing': audioPlaying,
          'animate-pulse': audioLoading 
        }"
        :disabled="audioLoading || disabled"
      >
        <span v-if="audioLoading">播放中...</span>
        <span v-else-if="audioPlaying">暂停</span>
        <span v-else>读诗</span>
      </button>
      
      <!-- 诗人解读按钮 -->
      <button 
        @click="handlePoetExplanation" 
        class="btn-poet text-change-animation"
        :class="{ 
          'btn-control-poet-clicked': poetButtonClicked, 
          'scale-95': textChanging 
        }"
        :disabled="disabled"
      >
        <span>{{ poetButtonText }}</span>
      </button>
      
      <!-- 重新开始按钮 -->
      <button 
        @click="handleRestart" 
        class="btn-restart"
        :disabled="disabled"
      >
        <span>重新开始</span>
      </button>
      
      <!-- 可选的自定义按钮插槽 -->
      <slot name="extra-buttons"></slot>
    </div>
    
    <!-- 操作提示 -->
    <div v-if="showHints" class="text-center mt-4">
      <p class="text-sm text-gray-500 italic opacity-80">
        点击上方按钮探索诗歌的不同维度
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// 组件Props
interface Props {
  interpretationLoading?: boolean
  audioLoading?: boolean
  audioPlaying?: boolean
  poetButtonClicked?: boolean
  poetButtonClickCount?: number
  disabled?: boolean
  showHints?: boolean
  gridLayout?: 'grid-2x2' | 'grid-1x4' | 'grid-responsive'
  poetButtonText?: string
}

// 组件Emits
interface Emits {
  interpret: []
  playPoem: []
  poetExplanation: []
  restart: []
}

const props = withDefaults(defineProps<Props>(), {
  interpretationLoading: false,
  audioLoading: false,
  audioPlaying: false,
  poetButtonClicked: false,
  poetButtonClickCount: 0,
  disabled: false,
  showHints: true,
  gridLayout: 'grid-responsive',
  poetButtonText: '最好不要点'
})

// 文本变化动画状态
const textChanging = ref(false)

const emit = defineEmits<Emits>()

// 计算网格布局类
const gridClass = computed(() => {
  switch (props.gridLayout) {
    case 'grid-2x2':
      return 'grid-cols-2'
    case 'grid-1x4':
      return 'grid-cols-1'
    case 'grid-responsive':
    default:
      return 'grid-cols-2 max-md:grid-cols-1 max-md:gap-3 lg:gap-4'
  }
})

// 事件处理函数
const handleInterpretation = () => {
  if (props.disabled || props.interpretationLoading) return
  emit('interpret')
}

const handlePlayPoem = () => {
  if (props.disabled || props.audioLoading) return
  emit('playPoem')
}

const handlePoetExplanation = () => {
  if (props.disabled) return
  
  // 触发文本变化动画
  textChanging.value = true
  setTimeout(() => {
    textChanging.value = false
  }, 400) // 与动画时间一致
  
  emit('poetExplanation')
}

const handleRestart = () => {
  if (props.disabled) return
  emit('restart')
}
</script>

<style scoped>
/* 文本变化动画 - 保留特殊动画效果 */
.text-change-animation.scale-95 {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 按钮组动画 - 使用UnoCSS实现 */
.grid > * {
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.grid > *:nth-child(1) { animation-delay: 0.1s; }
.grid > *:nth-child(2) { animation-delay: 0.2s; }
.grid > *:nth-child(3) { animation-delay: 0.3s; }
.grid > *:nth-child(4) { animation-delay: 0.4s; }

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

/* 移动端优化 - 使用CSS变量与UnoCSS配合 */
@media (max-width: 480px) {
  .btn-interpret,
  .btn-listen,
  .btn-poet,
  .btn-restart {
    font-size: 0.875rem;
    padding: 0.75rem 1rem;
    min-height: 48px;
  }
}
</style>
