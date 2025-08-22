<template>
  <div class="action-buttons max-w-2xl mx-auto">
    <div class="buttons-grid grid gap-4 mb-6" :class="gridClass">
      <!-- 解诗按钮 -->
      <button 
        @click="handleInterpretation" 
        class="btn-interpret btn-base"
        :disabled="interpretationLoading || disabled"
      >
        <span v-if="interpretationLoading">解读中...</span>
        <span v-else>解诗</span>
      </button>
      
      <!-- 读诗按钮 -->
      <button 
        @click="handlePlayPoem" 
        class="btn-listen btn-base"
        :disabled="audioLoading || disabled"
      >
        <span v-if="audioLoading">播放中...</span>
        <span v-else-if="audioPlaying">暂停</span>
        <span v-else>读诗</span>
      </button>
      
      <!-- 诗人解读按钮 -->
      <button 
        @click="handlePoetExplanation" 
        class="btn-poet btn-base text-change-animation"
        :class="{ 'opacity-75': poetButtonClicked, 'text-changing': textChanging }"
        :disabled="disabled"
      >
        <span>{{ poetButtonText }}</span>
      </button>
      
      <!-- 重新开始按钮 -->
      <button 
        @click="handleRestart" 
        class="btn-restart btn-base"
        :disabled="disabled"
      >
        <span>重新开始</span>
      </button>
      
      <!-- 可选的自定义按钮插槽 -->
      <slot name="extra-buttons"></slot>
    </div>
    
    <!-- 操作提示 -->
    <div v-if="showHints" class="action-hints">
      <p class="hint-text">
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
      return 'grid-responsive-buttons'
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
  }, 400) // 与CSS动画时间一致
  
  emit('poetExplanation')
}

const handleRestart = () => {
  if (props.disabled) return
  emit('restart')
}
</script>

<style scoped>
/* 基础布局样式已迁移至UnoCSS: max-w-2xl mx-auto */
.action-buttons {}

/* 基础网格样式已迁移至UnoCSS: grid gap-4 mb-6 */
.buttons-grid {}

/* 网格布局选项 */
.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-cols-1 {
  grid-template-columns: 1fr;
}

.grid-responsive-buttons {
  grid-template-columns: repeat(2, 1fr);
}

@media (max-width: 768px) {
  .grid-responsive-buttons {
    grid-template-columns: 1fr;
    gap: var(--spacing-base);
  }
}

@media (min-width: 1024px) {
  .grid-responsive-buttons {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
  }
}

/* 按钮样式覆盖 */
.btn-interpret {
  background: linear-gradient(145deg, #789a9a, #527a7a);
  border-color: #4a6869;
  color: var(--text-light);
  text-shadow: 0 1px 2px rgba(0,0,0,0.4);
}

.btn-interpret:hover:not(:disabled) {
  background: linear-gradient(145deg, #527a7a, #3d6667);
  transform: translateY(-2px);
}

.btn-listen {
  background: linear-gradient(145deg, #9d6b53, #804d39);
  border-color: #6a3e2f;
  color: var(--text-light);
  text-shadow: 0 1px 2px rgba(0,0,0,0.4);
}

.btn-listen:hover:not(:disabled) {
  background: linear-gradient(145deg, #804d39, #6b3f2a);
  transform: translateY(-2px);
}

.btn-poet {
  background: linear-gradient(145deg, #8b5a96, #6a4c7a);
  border-color: #5a3d6a;
  color: var(--text-light);
  text-shadow: 0 1px 2px rgba(0,0,0,0.4);
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-poet:hover:not(:disabled) {
  background: linear-gradient(145deg, #6a4c7a, #583d66);
  transform: translateY(-2px);
}

.btn-poet.opacity-75 {
  background: linear-gradient(145deg, #a67ba7, #7d5f8b);
  opacity: 0.9;
}

.btn-restart {
  background: linear-gradient(145deg, #6c757d, #495057);
  border-color: #343a40;
  color: var(--text-light);
  text-shadow: 0 1px 2px rgba(0,0,0,0.4);
}

.btn-restart:hover:not(:disabled) {
  background: linear-gradient(145deg, #495057, #343a40);
  transform: translateY(-2px);
}

/* 按钮状态动画 */
.btn-listen[data-playing="true"] {
  background: linear-gradient(145deg, #b8744e, #9a5530);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

/* 操作提示 */
.action-hints {
  text-align: center;
  margin-top: var(--spacing-base);
}

.hint-text {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  font-style: italic;
  opacity: 0.8;
}

/* 按钮禁用状态 */
.btn-base:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-base:disabled:hover {
  transform: none !important;
  box-shadow: var(--shadow-base) !important;
}

/* 移动端优化 */
@media (max-width: 480px) {
  .buttons-grid {
    gap: var(--spacing-sm);
  }
  
  .btn-base {
    font-size: var(--font-size-sm);
    padding: 0.75rem 1rem;
    min-height: 48px;
  }
  
  .action-buttons {
    padding: 0 var(--spacing-base);
  }
}

/* 加载状态视觉反馈 */
.btn-base[data-loading="true"] {
  position: relative;
  color: transparent;
}

.btn-base[data-loading="true"]::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 文本变化动画 */
.text-change-animation.text-changing {
  animation: textChangeScale 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes textChangeScale {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

/* 按钮组动画 */
.buttons-grid > * {
  opacity: 0;
  animation: fadeInUp 0.6s var(--ease-out) forwards;
}

.buttons-grid > *:nth-child(1) { animation-delay: 0.1s; }
.buttons-grid > *:nth-child(2) { animation-delay: 0.2s; }
.buttons-grid > *:nth-child(3) { animation-delay: 0.3s; }
.buttons-grid > *:nth-child(4) { animation-delay: 0.4s; }

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
</style>
