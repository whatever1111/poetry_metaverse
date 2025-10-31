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
        <div v-if="!loading && !generatedPoem && !error" class="space-y-6 animate-fadeInUp">
          <!-- 标题 -->
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold mb-4" style="color: var(--text-primary);">共笔</h1>
            <p class="text-lg" style="color: var(--text-secondary);">与陆家明一起，为你刚刚读到的诗歌创作回应</p>
          </div>
          
          <!-- 原诗展示（可折叠） -->
          <div v-if="sourcePoem" class="card-base mb-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-2xl font-bold" style="color: var(--text-primary);">你读到的诗</h2>
              <button 
                @click="showSourcePoem = !showSourcePoem"
                class="text-sm px-4 py-2 rounded-lg transition-all"
                style="background-color: var(--bg-secondary); color: var(--text-secondary);"
              >
                {{ showSourcePoem ? '折叠' : '展开' }}
              </button>
            </div>
            
            <div v-if="showSourcePoem" class="space-y-4">
              <h3 class="text-xl font-semibold text-center" style="color: var(--text-primary);">
                《{{ sourcePoem.title }}》
              </h3>
              
              <div v-if="sourcePoem.quote" class="text-center italic" style="color: var(--text-secondary);">
                <p>{{ sourcePoem.quote }}</p>
                <p v-if="sourcePoem.quoteSource" class="text-sm">——{{ sourcePoem.quoteSource }}</p>
              </div>
              
              <div class="whitespace-pre-wrap" style="color: var(--text-primary);">
                {{ sourcePoem.content }}
              </div>
            </div>
          </div>
          
          <!-- 输入区域 -->
          <div class="card-base">
            <label class="block mb-4">
              <span class="text-lg font-medium block mb-2" style="color: var(--text-primary);">
                写下你的感受（最多50字）
              </span>
              <textarea 
                v-model="userFeeling"
                :maxlength="50"
                rows="4"
                class="w-full p-4 rounded-lg border-2 transition-all text-body"
                style="
                  background-color: var(--bg-secondary);
                  color: var(--text-primary);
                  border-color: var(--border-color);
                "
                :style="{ borderColor: userFeeling.length >= 50 ? '#f59e0b' : 'var(--border-color)' }"
                placeholder="说说这首诗给你的感受..."
              />
              <div class="flex justify-between items-center mt-2">
                <span 
                  class="text-sm"
                  :style="{ color: userFeeling.length >= 50 ? '#f59e0b' : 'var(--text-secondary)' }"
                >
                  {{ userFeeling.length }} / 50 字
                </span>
                <span v-if="userFeeling.length >= 50" class="text-sm" style="color: #f59e0b;">
                  已达字数上限
                </span>
              </div>
            </label>
          </div>
          
          <!-- 操作按钮 -->
          <div class="grid grid-cols-2 gap-4">
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
              让陆家明为我写诗
            </button>
          </div>
        </div>
        
        <!-- 生成中状态 -->
        <div v-if="loading" class="space-y-6 animate-fadeInUp">
          <LoadingSpinner 
            size="large"
            loading-text="陆家明正在为你创作..."
            subtitle="请稍候，这可能需要几秒钟"
            variant="pulse"
            :show-progress="false"
            centered
          />
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
          <div class="grid grid-cols-2 gap-4 animate-fadeInUp" style="animation-delay: 0.2s;">
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
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'
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
.card-base {
  padding: var(--spacing-xl);
  background: rgba(var(--card-bg-rgb), 0.8);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-base {
    padding: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .card-base {
    padding: var(--spacing-base);
  }
}
</style>

