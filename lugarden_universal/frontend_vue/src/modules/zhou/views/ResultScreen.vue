<template>
  <div class="min-h-screen" style="background-color: var(--bg-primary);">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- ================================ -->
        <!-- D.6移动端解读卡片布局优化 (2025-08-26) -->
        <!-- ================================ -->
        <!-- 响应式双布局：移动端插入式布局，PC端保持原有布局 -->
        <!-- 技术方案：基于断点768px，移动端(<768px)使用新布局，PC端(>=768px)保持现状 -->
        <!-- ================================ -->
        
        <!-- 移动端布局 (< 768px) -->
        <div class="result-content-mobile md:hidden">
          <!-- 诗歌内容 -->
          <div v-if="zhouStore.result.selectedPoem" class="mb-8">
            <PoemViewer 
              :poem-title="zhouStore.result.poemTitle || zhouStore.result.selectedPoem.title"
              :quote-text="selectedPoemQuoteText"
              :quote-citation="selectedPoemQuoteCitation"
              :main-text="selectedPoemMainText"
              animation-delay="0.2s"
              :show-actions="true"
              :show-download="true"
              @copied="handlePoemCopied"
              @shared="handlePoemShared"
              @downloaded="handlePoemDownloaded"
            />
          </div>
          
          <!-- 解诗按钮组 -->
          <div class="action-group animate-fadeInUp" style="animation-delay: 0.1s;">
            <div class="max-w-2xl mx-auto">
              <button 
                @click="getInterpretation"
                class="w-full btn-interpret text-change-animation text-body font-medium"
                :class="{ 'animate-pulse': zhouStore.result.interpretationLoading }"
                :disabled="zhouStore.result.interpretationLoading"
              >
                <span v-if="zhouStore.result.interpretationLoading">解读中...</span>
                <span v-else>解诗</span>
              </button>
              
              <!-- 解诗卡片 - 紧跟在解诗按钮下方 -->
              <div v-if="zhouStore.result.interpretationContent" class="animate-fadeInUp" style="animation-delay: 0.2s;">
                <InterpretationDisplay 
                  :ai-interpretation="zhouStore.result.interpretationContent"
                  :poet-explanation="null"
                  :ai-error="zhouStore.ui.errorMessage"
                  :show-ai-error="!!zhouStore.ui.errorMessage"
                  :show-retry-action="true"
                  :retrying="zhouStore.result.interpretationLoading"
                  ai-animation-delay="0s"
                  empty-message=""
                  @retry-ai="retryAiFeatures"
                />
              </div>
            </div>
          </div>
          
          <!-- 诗人解读按钮组 -->
          <div class="action-group animate-fadeInUp" style="animation-delay: 0.2s;">
            <div class="max-w-2xl mx-auto">
              <button 
                @click="showPoetExplanation"
                class="w-full btn-poet text-change-animation text-body font-medium"
                :class="{ 
                  'btn-control-poet-clicked': zhouStore.result.poetButtonClicked, 
                  'scale-95': textChanging 
                }"
              >
                <span>{{ zhouStore.getPoetButtonText() }}</span>
              </button>
              
              <!-- 诗人解读卡片 - 紧跟在诗人解读按钮下方 -->
              <div v-if="zhouStore.result.poetExplanation" class="animate-fadeInUp" style="animation-delay: 0.2s;">
                <InterpretationDisplay 
                  :ai-interpretation="null"
                  :poet-explanation="zhouStore.result.poetExplanation"
                  :ai-error="null"
                  :show-ai-error="false"
                  :show-retry-action="false"
                  poet-animation-delay="0s"
                  empty-message=""
                />
              </div>
            </div>
          </div>
          
          <!-- 重新开始按钮 -->
          <div class="action-group action-group-last animate-fadeInUp" style="animation-delay: 0.3s;">
            <div class="max-w-2xl mx-auto">
              <button 
                @click="startOver"
                class="w-full btn-restart text-body font-medium"
              >
                <span>重新开始</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- PC端布局 (>= 768px) - 完全保持原有布局结构 -->
        <div class="result-content hidden md:block">
          <!-- 诗歌内容 -->
          <div v-if="zhouStore.result.selectedPoem" class="mb-8">
            <PoemViewer 
              :poem-title="zhouStore.result.poemTitle || zhouStore.result.selectedPoem.title"
              :quote-text="selectedPoemQuoteText"
              :quote-citation="selectedPoemQuoteCitation"
              :main-text="selectedPoemMainText"
              animation-delay="0.2s"
              :show-actions="true"
              :show-download="true"
              @copied="handlePoemCopied"
              @shared="handlePoemShared"
              @downloaded="handlePoemDownloaded"
            />
          </div>
          
          <!-- 操作按钮 -->
          <div class="mb-8 animate-fadeInUp" style="animation-delay: 0.4s;">
            <ControlButtons 
              :interpretation-loading="zhouStore.result.interpretationLoading"
              :poet-button-clicked="zhouStore.result.poetButtonClicked"
              :poet-button-click-count="zhouStore.result.poetButtonClickCount"
              :poet-button-text="zhouStore.getPoetButtonText()"
              @interpret="getInterpretation"
              @poet-explanation="showPoetExplanation"
              @restart="startOver"
            />
          </div>
          
          <!-- 解读内容区域 -->
          <div class="interpretation-area">
            <InterpretationDisplay 
              :ai-interpretation="zhouStore.result.interpretationContent"
              :poet-explanation="zhouStore.result.poetExplanation"
              :ai-error="zhouStore.ui.errorMessage"
              :show-ai-error="!!zhouStore.ui.errorMessage"
              :show-retry-action="true"
              :retrying="zhouStore.result.interpretationLoading"
              ai-animation-delay="0.6s"
              poet-animation-delay="0.8s"
              empty-message="点击上方按钮获取诗歌解读"
              @retry-ai="retryAiFeatures"
            />
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="!zhouStore.result.selectedPoem && !zhouStore.universeData.error">
          <LoadingSpinner 
            size="large"
            loading-text="正在准备您的诗歌..."
            subtitle="诗意正在汇聚，请稍候..."
            variant="pulse"
            :show-progress="false"
            centered
          />
        </div>

        <!-- 错误状态 -->
        <div v-if="zhouStore.universeData.error">
          <ErrorState 
            error-type="unknown"
            error-title="出现了问题"
            :error-message="zhouStore.universeData.error"
            :show-retry="true"
            :show-back="false"
            retry-text="重试"
            @retry="retryLoad"
            :suggestions="['请检查网络连接', '刷新页面重试', '稍后再试']"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useZhouStore } from '@/modules/zhou/stores/zhou'
import PoemViewer from '@/modules/zhou/components/PoemViewer.vue'
import ControlButtons from '@/modules/zhou/components/ControlButtons.vue'
import InterpretationDisplay from '@/modules/zhou/components/InterpretationDisplay.vue'
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'
import ErrorState from '@/shared/components/ErrorState.vue'

const router = useRouter()
const zhouStore = useZhouStore()

// ================================
// D.6移动端解读卡片布局优化 (2025-08-26)
// ================================
// 移动端按钮交互状态管理
// 用于支持诗人解读按钮的文本变化动画效果
// ================================
const textChanging = ref(false)

// 结果页面
// 对应原 zhou.html 中的 #result-screen

// 计算属性：获取结构化诗歌数据
const selectedPoemQuoteText = computed(() => {
  const poem = zhouStore.result.selectedPoem
  if (!poem || !poem.body) return null
  
  if (typeof poem.body === 'object' && poem.body !== null) {
    return poem.body.quote_text || null
  }
  
  return null
})

const selectedPoemQuoteCitation = computed(() => {
  const poem = zhouStore.result.selectedPoem
  if (!poem || !poem.body) return null
  
  if (typeof poem.body === 'object' && poem.body !== null) {
    return poem.body.quote_citation || null
  }
  
  return null
})

const selectedPoemMainText = computed(() => {
  const poem = zhouStore.result.selectedPoem
  if (!poem || !poem.body) return null
  
  if (typeof poem.body === 'object' && poem.body !== null) {
    return poem.body.main_text || null
  }
  
  // 如果是字符串格式（向后兼容），将整个body作为主文本
  if (typeof poem.body === 'string') {
    return poem.body
  }
  
  return null
})

onMounted(() => {
  // 检查是否有结果数据
  if (!zhouStore.quiz.isQuizComplete) {
    router.replace('/')
    return
  }

  // 如果没有选中的诗歌，重新计算映射
  if (!zhouStore.result.selectedPoem) {
    zhouStore.calculatePoemMapping()
  }
})

// 诗歌标题和内容格式化现已移至PoemViewer组件

// 获取AI解读
const getInterpretation = async () => {
  try {
    await zhouStore.getInterpretation()
  } catch (error) {
    console.error('获取解读失败:', error)
  }
}



// 显示诗人解读
const showPoetExplanation = () => {
  // ================================
  // D.6移动端解读卡片布局优化 (2025-08-26)
  // ================================
  // 添加移动端诗人解读按钮的文本变化动画支持
  // 与ControlButtons组件保持一致的交互体验
  // ================================
  
  // 触发文本变化动画（移动端）
  textChanging.value = true
  setTimeout(() => {
    textChanging.value = false
  }, 400) // 与ControlButtons组件动画时间一致
  
  zhouStore.showPoetExplanation()
}

// 重新开始
const startOver = () => {
  zhouStore.resetApp()
  router.push('/')
}

// 重试加载
const retryLoad = async () => {
  zhouStore.clearError()
  zhouStore.calculatePoemMapping()
}

// 处理诗歌复制事件
const handlePoemCopied = (text: string) => {
  console.log('诗歌已复制到剪贴板:', text.substring(0, 50) + '...')
  // 可以在这里显示成功提示
}

// 处理诗歌分享事件
const handlePoemShared = (shareData: { title: string; text: string; url?: string }) => {
  console.log('诗歌已分享:', shareData.title)
  // 可以在这里记录分享统计
}

// 处理诗歌下载事件
const handlePoemDownloaded = (fileName: string) => {
  console.log('诗歌已下载为文件:', fileName)
  // 可以在这里显示下载成功提示
}

// ================================
// 读诗功能移除记录 (2025-08-26)
// ================================
// 移除内容: retryAiFeatures函数中的音频功能重试逻辑
// 删除的功能: playPoem函数调用
// 原有逻辑: 同时重试解读和读诗功能
// 恢复说明: 如需恢复读诗功能，需要在retryAiFeatures中添加playPoem函数调用
// ================================

// 重试AI功能
const retryAiFeatures = () => {
  // 清除错误状态
  zhouStore.clearError()
  
  // 重试解读功能
  console.log('重试AI功能')
  
  if (!zhouStore.result.interpretationContent) {
    // 重试解读功能
    getInterpretation()
  }
}
</script>

<style scoped>
/* 诗歌内容样式已迁移到PoemViewer组件 */

/* 操作按钮样式已迁移到ControlButtons组件 */

/* 解读内容样式已迁移到InterpretationDisplay组件 */

/* ================================
   D.6移动端解读卡片布局优化 - 响应式CSS (2025-08-26)
   - D.6.6功能回归测试: 优化移动端按钮间距
   - D.6.6问题修复: 解决解读卡片上下间距不对称问题
   - D.6.8间距统一优化: 一次性修复间距逻辑，基于用户反馈优化体验
     移动端&小屏端统一: 按钮16px + 卡片16px = 32px舒适间距
     与PC端mb-8 (32px)完全对齐，实现全设备间距一致性
================================ */

/* 移动端布局专用样式 */
.result-content-mobile {
  /* 确保移动端布局的流畅性 */
  transition: all var(--duration-normal) var(--ease-out);
}

.action-group {
  /* 每个按钮组的微调间距 */
  position: relative;
}

/* 移动端按钮优化 */
@media (max-width: 767px) {
  .result-content-mobile .action-group button {
    /* 确保按钮在移动端有足够的触摸区域 - 遵循WCAG 2.1 AA无障碍标准 */
    min-height: 48px; /* 移动端最小触摸目标 44px+ */
    touch-action: manipulation;
    margin-bottom: var(--spacing-base); /* 16px - 按钮到卡片或下一个按钮组的间距 */
  }
  
  /* 最后一个按钮组的按钮不需要下边距 */
  .result-content-mobile .action-group-last button {
    margin-bottom: 0;
  }
  
  /* 移动端卡片间距微调 - 卡片到下一个按钮组的间距 */
  .result-content-mobile .action-group .animate-fadeInUp {
    margin-bottom: var(--spacing-base); /* 16px - 卡片到下一个按钮组的间距 */
  }
}

/* 确保PC端布局不受影响 */
@media (min-width: 768px) {
  .result-content-desktop {
    /* PC端保持原有样式，无需额外调整 */
    position: relative;
  }
}

/* 响应式设计 - 保持原有样式 */
@media (max-width: 768px) {
  .card-base {
    padding: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .card-base {
    padding: var(--spacing-base);
  }
  
  .content-title {
    font-size: var(--font-size-3xl);
    margin-bottom: var(--spacing-lg);
  }
  
  /* 移动端小屏优化 - 适度舒适的布局 */
  .result-content-mobile .action-group button {
    margin-bottom: var(--spacing-base); /* 16px - 小屏幕按钮到卡片/下一个按钮的舒适间距 */
  }
  
  .result-content-mobile .action-group-last button {
    margin-bottom: 0; /* 最后一个按钮不需要下边距 */
  }
  
  /* 小屏幕卡片间距调整 */
  .result-content-mobile .action-group .animate-fadeInUp {
    margin-bottom: var(--spacing-base); /* 16px - 卡片到下一个按钮组的间距 */
  }
}

/* 按钮样式已迁移到ControlButtons组件 */
</style>