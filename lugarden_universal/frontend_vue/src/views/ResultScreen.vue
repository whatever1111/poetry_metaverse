<template>
  <div class="result-screen">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- 结果展示 -->
        <div class="result-content">
          <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
            您的诗歌
          </h1>
          
          <!-- 诗歌内容 -->
          <div class="poem-content bg-white p-8 rounded-lg shadow-lg mb-8">
            <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">
              <!-- 诗歌标题 -->
            </h2>
            <div class="poem-text text-lg text-gray-700 leading-relaxed text-center">
              <!-- 诗歌内容将在这里渲染 -->
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="action-buttons flex flex-wrap justify-center gap-4 mb-8">
            <button class="btn-secondary">
              解诗
            </button>
            <button class="btn-secondary">
              读诗
            </button>
            <button class="btn-secondary">
              诗人解读
            </button>
            <button @click="startOver" class="btn-primary">
              重新开始
            </button>
          </div>
          
          <!-- 解读内容区域 -->
          <div class="interpretation-area">
            <!-- 解读内容将在这里渲染 -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 结果页面
// 对应原 zhou.html 中的 #result-screen

const startOver = () => {
  router.push('/')
}
</script>

<style scoped>
.result-screen {
  min-height: 100vh;
  background-color: #f3f4f6;
}

.btn-primary {
  @apply bg-gray-800 text-white px-6 py-2 rounded-full hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1;
}

.btn-secondary {
  @apply bg-white text-gray-800 px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1;
}
</style>
