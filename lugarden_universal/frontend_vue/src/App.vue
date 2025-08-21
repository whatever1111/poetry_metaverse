<script setup lang="ts">
// 主应用容器
// 使用Vue Router进行页面切换
</script>

<template>
  <div id="app" class="min-h-screen">
    <!-- 路由视图容器 -->
    <RouterView />
  </div>
</template>

<style scoped>
/* App.vue基础样式已迁移至UnoCSS utility类 */
/* min-height: 100vh → class="min-h-screen" */
</style>