<template>
  <div class="sub-project-selection">
    <div class="container mx-auto px-4 py-8">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <button @click="goBack" class="flex items-center text-gray-600 hover:text-gray-800">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
      </div>

      <h1 class="text-3xl font-bold text-center mb-4 text-gray-800">
        <!-- 项目标题 -->
      </h1>
      
      <div class="text-center mb-8">
        <p class="text-gray-600">
          <!-- 项目描述 -->
        </p>
      </div>
      
      <!-- 子项目列表将在这里渲染 -->
      <div class="sub-project-list grid gap-6 max-w-4xl mx-auto">
        <!-- 子项目卡片占位 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 子项目选择页面
// 对应原 zhou.html 中的 #sub-project-selection-screen

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.sub-project-selection {
  min-height: 100vh;
  background-color: #f3f4f6;
}
</style>
