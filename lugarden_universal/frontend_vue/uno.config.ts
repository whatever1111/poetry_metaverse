import { defineConfig, presetUno, presetWind } from 'unocss'

export default defineConfig({
  // 启用Tailwind兼容预设，确保开发体验连续性
  presets: [
    presetUno(), // UnoCSS默认预设
    presetWind(), // Tailwind CSS兼容预设
  ],
  
  // 内容扫描路径
  content: {
    filesystem: ['**/*.{html,js,ts,jsx,tsx,vue,svelte,astro}']
  },
  
  // 自定义主题扩展（后续在A.2阶段配置）
  theme: {
    // 预留空间给CSS变量映射
  },
  
  // CSS层级配置，避免与现有样式冲突
  layers: {
    'utilities': 1,
    'components': 2,
    'base': 3
  },
  
  // 开发环境配置
  dev: {
    // HMR优化
    hmr: true
  }
})

