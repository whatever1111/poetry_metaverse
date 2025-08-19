<template>
  <div class="classical-echo-screen">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- 古典回响内容 -->
        <div class="echo-content text-center">
          <h1 class="text-3xl font-bold mb-6 text-gray-800">
            古典回响
          </h1>
          
          <div class="echo-text text-lg text-gray-700 leading-relaxed mb-8">
            <!-- 古典回响文本将在这里渲染 -->
          </div>
          
          <!-- 继续按钮 -->
          <div class="action-buttons">
            <button 
              @click="continueToResult"
              class="bg-gray-800 text-white px-8 py-3 rounded-full hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
            >
              继续
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 古典回响页面
// 对应原 zhou.html 中的 #classical-echo-screen

const continueToResult = () => {
  router.push('/result')
}
</script>

<style scoped>
.classical-echo-screen {
  min-height: 100vh;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
}
</style>
