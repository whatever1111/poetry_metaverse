<template>
  <transition 
    :name="transitionName"
    :mode="mode"
    :duration="duration"
    :appear="appear"
    @before-enter="handleBeforeEnter"
    @enter="handleEnter" 
    @after-enter="handleAfterEnter"
    @before-leave="handleBeforeLeave"
    @leave="handleLeave"
    @after-leave="handleAfterLeave"
    @enter-cancelled="handleEnterCancelled"
    @leave-cancelled="handleLeaveCancelled"
  >
    <div 
      v-if="visible"
      :key="animationKey" 
      class="animation-wrapper"
      :class="wrapperClass"
      :style="wrapperStyle"
    >
      <slot></slot>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 组件Props
interface Props {
  // 基础动画配置
  animationType?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'slideInLeft' | 'slideInRight' | 'slideInUp' | 'slideInDown' | 'scaleIn' | 'rotateIn' | 'custom'
  mode?: 'in-out' | 'out-in' | 'default'
  duration?: number | { enter: number; leave: number }
  appear?: boolean
  
  // 动画控制
  visible?: boolean
  animationKey?: string | number
  delay?: number
  
  // 响应式动画控制
  disableAnimationOnMobile?: boolean
  respectReducedMotion?: boolean
  
  // 自定义样式
  customTransitionName?: string
  wrapperClass?: string | object | Array<string | object>
  
  // 高级选项
  preserveAspectRatio?: boolean
  preventScrollJump?: boolean
}

// 组件Emits
interface Emits {
  beforeEnter: [el: Element]
  enter: [el: Element]
  afterEnter: [el: Element]
  beforeLeave: [el: Element] 
  leave: [el: Element]
  afterLeave: [el: Element]
  enterCancelled: [el: Element]
  leaveCancelled: [el: Element]
}

const props = withDefaults(defineProps<Props>(), {
  animationType: 'fadeInUp',
  mode: 'default',
  duration: 300,
  appear: true,
  visible: true,
  animationKey: 'default',
  delay: 0,
  disableAnimationOnMobile: false,
  respectReducedMotion: true,
  customTransitionName: '',
  wrapperClass: '',
  preserveAspectRatio: false,
  preventScrollJump: false
})

const emit = defineEmits<Emits>()

// 响应式状态
const isMobile = ref(false)
const prefersReducedMotion = ref(false)

// 计算过渡名称
const transitionName = computed(() => {
  if (props.customTransitionName) {
    return props.customTransitionName
  }
  
  // 检查是否应该禁用动画
  if (shouldDisableAnimation.value) {
    return 'no-animation'
  }
  
  return `anim-${props.animationType}`
})

// 计算是否应该禁用动画
const shouldDisableAnimation = computed(() => {
  if (props.respectReducedMotion && prefersReducedMotion.value) {
    return true
  }
  
  if (props.disableAnimationOnMobile && isMobile.value) {
    return true
  }
  
  return false
})

// 计算包装器样式
const wrapperStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.delay > 0) {
    style.animationDelay = `${props.delay}ms`
  }
  
  if (props.preserveAspectRatio) {
    style.aspectRatio = 'auto'
  }
  
  return style
})

// 设备检测
const checkMobileDevice = () => {
  isMobile.value = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 动画偏好检测
const checkReducedMotionPreference = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches
    
    // 监听偏好变化
    mediaQuery.addEventListener('change', (e) => {
      prefersReducedMotion.value = e.matches
    })
  }
}

// 防止滚动跳跃
const preventScrollJumpHandler = () => {
  if (props.preventScrollJump) {
    document.body.style.overflow = 'hidden'
  }
}

const restoreScrollHandler = () => {
  if (props.preventScrollJump) {
    document.body.style.overflow = ''
  }
}

// 生命周期
onMounted(() => {
  checkMobileDevice()
  checkReducedMotionPreference()
  
  // 窗口大小变化监听
  window.addEventListener('resize', checkMobileDevice)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobileDevice)
  restoreScrollHandler()
})

// 过渡事件处理
const handleBeforeEnter = (el: Element) => {
  preventScrollJumpHandler()
  emit('beforeEnter', el)
}

const handleEnter = (el: Element) => {
  emit('enter', el)
}

const handleAfterEnter = (el: Element) => {
  restoreScrollHandler()
  emit('afterEnter', el)
}

const handleBeforeLeave = (el: Element) => {
  preventScrollJumpHandler()
  emit('beforeLeave', el)
}

const handleLeave = (el: Element) => {
  emit('leave', el)
}

const handleAfterLeave = (el: Element) => {
  restoreScrollHandler()
  emit('afterLeave', el)
}

const handleEnterCancelled = (el: Element) => {
  restoreScrollHandler()
  emit('enterCancelled', el)
}

const handleLeaveCancelled = (el: Element) => {
  restoreScrollHandler()
  emit('leaveCancelled', el)
}
</script>

<style scoped>
.animation-wrapper {
  width: 100%;
  height: 100%;
}

/* 无动画过渡（用于reduced motion） */
.no-animation-enter-active,
.no-animation-leave-active {
  transition: none !important;
}

.no-animation-enter-from,
.no-animation-leave-to {
  opacity: 1;
  transform: none;
}

/* fadeIn 动画 */
.anim-fadeIn-enter-active,
.anim-fadeIn-leave-active {
  transition: opacity var(--transition-duration-normal) var(--transition-ease);
}

.anim-fadeIn-enter-from,
.anim-fadeIn-leave-to {
  opacity: 0;
}

/* fadeInUp 动画 */
.anim-fadeInUp-enter-active,
.anim-fadeInUp-leave-active {
  transition: all var(--transition-duration-slow) var(--transition-ease);
}

.anim-fadeInUp-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.anim-fadeInUp-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* fadeInDown 动画 */
.anim-fadeInDown-enter-active,
.anim-fadeInDown-leave-active {
  transition: all var(--transition-duration-slow) var(--transition-ease);
}

.anim-fadeInDown-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.anim-fadeInDown-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* slideInLeft 动画 */
.anim-slideInLeft-enter-active,
.anim-slideInLeft-leave-active {
  transition: all var(--transition-duration-normal) var(--transition-ease);
}

.anim-slideInLeft-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.anim-slideInLeft-leave-to {
  opacity: 0;
  transform: translateX(50%);
}

/* slideInRight 动画 */
.anim-slideInRight-enter-active,
.anim-slideInRight-leave-active {
  transition: all var(--transition-duration-normal) var(--transition-ease);
}

.anim-slideInRight-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.anim-slideInRight-leave-to {
  opacity: 0;
  transform: translateX(-50%);
}

/* slideInUp 动画 */
.anim-slideInUp-enter-active,
.anim-slideInUp-leave-active {
  transition: all var(--transition-duration-normal) var(--transition-ease);
}

.anim-slideInUp-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.anim-slideInUp-leave-to {
  opacity: 0;
  transform: translateY(-50%);
}

/* slideInDown 动画 */
.anim-slideInDown-enter-active,
.anim-slideInDown-leave-active {
  transition: all var(--transition-duration-normal) var(--transition-ease);
}

.anim-slideInDown-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.anim-slideInDown-leave-to {
  opacity: 0;
  transform: translateY(50%);
}

/* scaleIn 动画 */
.anim-scaleIn-enter-active,
.anim-scaleIn-leave-active {
  transition: all var(--transition-duration-normal) var(--transition-ease);
}

.anim-scaleIn-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.anim-scaleIn-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* rotateIn 动画 */
.anim-rotateIn-enter-active,
.anim-rotateIn-leave-active {
  transition: all var(--transition-duration-slow) var(--transition-ease);
}

.anim-rotateIn-enter-from {
  opacity: 0;
  transform: rotate(-10deg) scale(0.9);
}

.anim-rotateIn-leave-to {
  opacity: 0;
  transform: rotate(5deg) scale(1.1);
}

/* 移动端优化 */
@media (max-width: 768px) {
  /* 移动端动画时间稍微缩短 */
  .anim-fadeInUp-enter-active,
  .anim-fadeInUp-leave-active,
  .anim-fadeInDown-enter-active,
  .anim-fadeInDown-leave-active,
  .anim-rotateIn-enter-active,
  .anim-rotateIn-leave-active {
    transition-duration: calc(var(--transition-duration-slow) * 0.8);
  }
  
  /* 移动端减少位移量 */
  .anim-fadeInUp-enter-from {
    transform: translateY(15px);
  }
  
  .anim-fadeInDown-enter-from {
    transform: translateY(-15px);
  }
}

/* 性能优化 */
.animation-wrapper {
  will-change: transform, opacity;
}

.anim-slideInLeft-enter-active .animation-wrapper,
.anim-slideInRight-enter-active .animation-wrapper,
.anim-slideInUp-enter-active .animation-wrapper,
.anim-slideInDown-enter-active .animation-wrapper {
  will-change: transform;
}

.anim-fadeIn-enter-active .animation-wrapper,
.anim-fadeInUp-enter-active .animation-wrapper,
.anim-fadeInDown-enter-active .animation-wrapper {
  will-change: opacity, transform;
}

.anim-scaleIn-enter-active .animation-wrapper,
.anim-rotateIn-enter-active .animation-wrapper {
  will-change: transform;
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .anim-fadeIn-enter-from,
  .anim-fadeIn-leave-to,
  .anim-fadeInUp-enter-from,
  .anim-fadeInUp-leave-to,
  .anim-fadeInDown-enter-from,
  .anim-fadeInDown-leave-to {
    opacity: 0.1; /* 而不是完全透明，保持可见性 */
  }
}

/* GPU 加速 */
.animation-wrapper * {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>
