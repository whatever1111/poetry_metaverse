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
  /* 应用容器基础样式已在全局样式中定义 */
  min-height: 100vh;
}
</style>