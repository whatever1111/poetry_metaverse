<template>
  <div class="min-h-screen" style="background-color: var(--bg-primary);">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-3xl mx-auto">
        
        <!-- 错误状态 -->
        <div v-if="error && !loading" class="space-y-6 animate-fadeInUp">
          <ErrorState 
            error-type="unknown"
            error-title="出现了问题"
            :error-message="error"
            :show-retry="false"
            :show-back="true"
            back-text="返回"
            @back="goBack"
            :suggestions="['请重新完成问答', '返回诗歌页面']"
          />
        </div>
        
        <!-- 输入步骤 -->
        <div v-if="!loading && !generatedPoem && !error" class="animate-fadeInUp">
          <!-- 标题 -->
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold mb-4" style="color: var(--text-primary);">共笔</h1>
            <p class="text-lg" style="color: var(--text-secondary);">你起意，我落笔</p>
          </div>
          
          <!-- 原诗展示（可折叠） -->
          <div v-if="sourcePoem" class="source-poem-section">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-2xl font-bold" style="color: var(--text-primary);">你读到的诗</h2>
              <button 
                @click="showSourcePoem = !showSourcePoem"
                class="toggle-button"
              >
                {{ showSourcePoem ? '折叠' : '展开' }}
              </button>
            </div>
            
            <div v-if="showSourcePoem" class="source-poem-viewer">
              <PoemViewer 
                :poem-title="sourcePoem.title"
                :quote-text="sourcePoem.quote"
                :quote-citation="sourcePoem.quoteSource"
                :main-text="sourcePoem.content"
                animation-delay="0.1s"
                :show-actions="false"
                :show-download="false"
              />
            </div>
          </div>
          
          <!-- 输入区域 -->
          <div class="input-section">
            <h2 class="text-2xl font-bold mb-4" style="color: var(--text-primary);">你的临时起意</h2>
            <div class="w-full">
              <textarea 
                v-model="userFeeling"
                :maxlength="50"
                rows="4"
                class="feeling-input"
                :class="{ 'feeling-input-limit': userFeeling.length >= 50 }"
                placeholder=""
              />
              <div class="flex justify-end items-center mt-1 w-full">
                <span v-if="userFeeling.length >= 50" class="limit-hint mr-2">
                  念头不用太纷扰
                </span>
                <span 
                  class="char-count"
                  :class="{ 'char-count-limit': userFeeling.length >= 50 }"
                >
                  {{ userFeeling.length }} / 50
                </span>
              </div>
            </div>
            
            <!-- 操作按钮 - 移到input-section内部 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <button 
              @click="goBack"
              class="btn-control-base btn-control-hover btn-control-disabled px-6 py-3 rounded-lg font-medium text-body"
              style="background-color: var(--bg-secondary); color: var(--text-secondary);"
            >
              取消
            </button>
            <button 
              @click="handleSubmit"
              :disabled="!userFeeling.trim()"
              class="btn-control-base btn-control-hover btn-control-active btn-control-disabled btn-gongbi px-6 py-3 rounded-lg font-medium text-body"
            >
              陆家明的闻言落笔
            </button>
            </div>
          </div>
        </div>
        
        <!-- 生成中状态 -->
        <div v-if="loading" class="gongbi-loading animate-fadeInUp">
          <div class="loading-icon-wrapper">
            <img 
              src="/lujiaming_icon.png" 
              alt="陆家明"
              class="loading-icon"
            />
          </div>
          <p class="loading-text">诗渐浓，君稍待</p>
        </div>
        
        <!-- 结果展示 - 使用PoemViewer组件 -->
        <div v-if="generatedPoem && !loading" class="space-y-6">
          <!-- 陆家明生成的诗歌卡片 -->
          <PoemViewer 
            :poem-title="generatedPoem.title"
            :quote-text="generatedPoem.quote"
            :quote-citation="generatedPoem.quoteSource"
            :main-text="generatedPoem.content"
            animation-delay="0.2s"
            :show-actions="true"
            :show-download="true"
          />
          
          <!-- 操作按钮 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeInUp" style="animation-delay: 0.2s;">
            <button 
              @click="resetAndRetry"
              class="btn-control-base btn-control-hover px-6 py-3 rounded-lg font-medium text-body"
              style="background-color: var(--bg-secondary); color: var(--text-secondary);"
            >
              再写一首
            </button>
            <button 
              @click="goBack"
              class="btn-restart px-6 py-3 rounded-lg font-medium text-body"
            >
              返回诗歌页
            </button>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useZhouStore } from '@/modules/zhou/stores/zhou'
import { createGongBi, getGongBiErrorMessage } from '@/modules/zhou/services/gongBiApi'
import PoemViewer from '@/modules/zhou/components/PoemViewer.vue'
import ErrorState from '@/shared/components/ErrorState.vue'

const router = useRouter()
const route = useRoute()
const zhouStore = useZhouStore()

// ================================
// 响应式状态
// ================================
const userFeeling = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const showSourcePoem = ref(true)

// 原诗信息
const sourcePoem = ref<{
  title: string
  quote: string | null
  quoteSource: string | null
  content: string
} | null>(null)

// 生成的诗歌
const generatedPoem = ref<{
  title: string
  quote: string
  quoteSource: string
  content: string
  userFeeling: string
} | null>(null)

// URL参数（用于API调用）
const urlParams = ref<{
  chapter: string
  pattern: string
  poem: string
} | null>(null)

// ================================
// 生命周期
// ================================
onMounted(async () => {
  // 从URL参数读取数据
  const chapterParam = route.query.chapter as string | undefined
  const patternParam = route.query.pattern as string | undefined
  const poemParam = route.query.poem as string | undefined
  
  if (!chapterParam || !patternParam || !poemParam) {
    error.value = '缺少必要参数，请重新完成问答'
    setTimeout(() => router.replace('/zhou'), 2000)
    return
  }
  
  // 保存URL参数用于后续API调用
  urlParams.value = {
    chapter: chapterParam,
    pattern: patternParam,
    poem: poemParam
  }
  
  try {
    // 加载原诗数据
    await zhouStore.loadPoemByParams(chapterParam, patternParam, poemParam)
    
    // 从store中提取诗歌数据
    const poem = zhouStore.result.selectedPoem
    if (!poem || !poem.body) {
      throw new Error('未能加载诗歌数据')
    }
    
    // 解析诗歌body
    const poemBody = typeof poem.body === 'string' ? JSON.parse(poem.body) : poem.body
    
    sourcePoem.value = {
      title: poemParam,
      quote: poemBody?.quote_text || null,
      quoteSource: poemBody?.quote_citation || null,
      content: poemBody?.main_text || (typeof poem.body === 'string' ? poem.body : '')
    }
    
    console.log('[GongBiView] 原诗加载成功:', sourcePoem.value.title)
    
  } catch (err) {
    console.error('[GongBiView] 加载原诗失败:', err)
    error.value = '加载诗歌失败，请稍后重试'
    setTimeout(() => router.replace('/zhou'), 2000)
  }
})

// ================================
// 方法
// ================================

// 提交感受，生成诗歌
const handleSubmit = async () => {
  if (!userFeeling.value.trim() || !urlParams.value) {
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    console.log('[GongBiView] 提交感受:', {
      feeling: userFeeling.value,
      params: urlParams.value
    })
    
    // 调用真实的共笔API
    const poem = await createGongBi({
      chapterKey: urlParams.value.chapter,
      answerPattern: urlParams.value.pattern,
      poemTitle: urlParams.value.poem,
      userFeeling: userFeeling.value
    })
    
    generatedPoem.value = poem
    
    console.log('[GongBiView] 诗歌生成成功:', poem.title)
    
  } catch (err) {
    console.error('[GongBiView] 生成诗歌失败:', err)
    error.value = getGongBiErrorMessage(err)
  } finally {
    loading.value = false
  }
}

// 重置状态，再写一首
const resetAndRetry = () => {
  userFeeling.value = ''
  generatedPoem.value = null
  error.value = null
  showSourcePoem.value = true
}

// 返回上一页
const goBack = () => {
  // 返回到result页面（带URL参数）
  if (urlParams.value) {
    const params = new URLSearchParams({
      chapter: urlParams.value.chapter,
      pattern: urlParams.value.pattern,
      poem: urlParams.value.poem
    })
    router.push(`/result?${params.toString()}`)
  } else {
    router.back()
  }
}
</script>

<style scoped>
/* 使用全局样式变量 */

/* 原诗展示区域 */
.source-poem-section {
  padding: var(--spacing-lg);
  background: rgba(var(--card-bg-rgb), 0.6);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

/* 折叠/展开按钮 */
.toggle-button {
  padding: 0.5rem 1rem;
  font-size: var(--font-size-sm);
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: var(--radius-base);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.toggle-button:hover {
  background-color: var(--color-primary-500);
  color: white;
  border-color: var(--color-primary-500);
}

/* 原诗PoemViewer容器 - 修改卡片内部底部padding以保持视觉平衡 */
/* PoemViewer内部使用card-padding-poem: pt-3xl(64px) pb-lg(24px) */
/* 覆盖卡片本身的底部padding，使其与顶部对称 */
.source-poem-viewer :deep(.poem-content) {
  padding-bottom: 4rem; /* 64px，与pt-3xl对称 */
}

/* 输入区域容器 - 与诗歌区域宽度对齐 */
.input-section {
  width: 100%;
  padding: var(--spacing-lg);
}

/* 感受输入框 - 内嵌样式（参考进度条） */
.feeling-input {
  width: 100%;
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: none;
  background-color: rgba(107, 114, 128, 0.12);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  line-height: 1.5;
  transition: all var(--duration-normal) var(--ease-out);
  resize: vertical;
  /* 内嵌阴影效果 - 参考ProgressBar */
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.12),
    inset 0 1px 2px rgba(0, 0, 0, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.4);
}

.feeling-input:focus {
  outline: none;
  background-color: rgba(107, 114, 128, 0.15);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.15),
    inset 0 1px 2px rgba(0, 0, 0, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.4),
    0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.feeling-input-limit {
  background-color: rgba(245, 158, 11, 0.08);
  box-shadow: 
    inset 0 2px 4px rgba(245, 158, 11, 0.15),
    inset 0 1px 2px rgba(245, 158, 11, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.4);
}

.feeling-input-limit:focus {
  background-color: rgba(245, 158, 11, 0.12);
  box-shadow: 
    inset 0 2px 4px rgba(245, 158, 11, 0.18),
    inset 0 1px 2px rgba(245, 158, 11, 0.12),
    0 1px 0 rgba(255, 255, 255, 0.4),
    0 0 0 3px rgba(245, 158, 11, 0.1);
}

/* 字数统计 - 右对齐+透明度（参考备案信息） */
.char-count {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  opacity: 0.5;
  transition: all var(--duration-fast) var(--ease-out);
}

/* 共笔加载状态 - 诗意化设计 */
.gongbi-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--spacing-2xl);
}

.loading-icon-wrapper {
  margin-bottom: var(--spacing-xl);
}

.loading-icon {
  width: 80px;
  height: 80px;
  animation: fadeInOut 2s ease-in-out infinite;
}

.loading-text {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  letter-spacing: 0.05em;
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

.char-count:hover {
  opacity: 0.7;
}

.char-count-limit {
  color: var(--color-warning);
  font-weight: 500;
  opacity: 0.8;
}

.char-count-limit:hover {
  opacity: 1;
}

/* 上限提示 */
.limit-hint {
  font-size: var(--font-size-sm);
  color: var(--color-warning);
  font-style: italic;
  opacity: 0.9;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .feeling-input {
    padding: 0.75rem;
    font-size: var(--font-size-sm);
  }
}
</style>

