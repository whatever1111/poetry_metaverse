<script setup lang="ts">
// 主应用容器
// 使用Vue Router进行页面切换
</script>

<template>
  <div id="app">
    <!-- 路由视图容器 -->
    <RouterView />
  </div>
</template>

<style scoped>
#app {
  font-family: 'Noto Serif SC', serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  line-height: 1.6;
}
</style>

<style>
/* 全局样式 */
body {
  font-family: 'Noto Serif SC', serif;
  background-color: #f3f4f6;
  transition: background-color 0.5s ease;
  line-height: 1.6;
  margin: 0;
  padding: 0;
}

/* 全局段落间距优化 */
p {
  margin-bottom: 1rem;
  line-height: 1.7;
}

/* 动画效果 */
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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animate-fadeInUp {
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* 加载动画 */
.loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #60a5fa;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-left: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 页面切换过渡动画 */
.router-link-active {
  font-weight: bold;
}

/* 响应式设计基础 */
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
}
</style>
