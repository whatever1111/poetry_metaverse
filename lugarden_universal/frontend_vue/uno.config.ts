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
  
  // 自定义主题扩展 - 映射现有CSS变量系统
  theme: {
    // 颜色系统映射
    colors: {
      // Primary灰阶色系
      primary: {
        50: '#f3f4f6',
        100: '#e5e7eb', 
        200: '#d1d5db',
        300: '#9ca3af',
        400: '#6b7280',
        500: '#374151',
        600: '#1f2937',
        700: '#111827',
        800: '#0f172a',
        900: '#020617'
      },
      // 品牌色彩
      brand: {
        light: '#f5f1e8',
        primary: '#bca09e',
        dark: '#2d4a4a'
      },
      // 状态颜色
      success: '#10b981',
      warning: '#f59e0b', 
      error: '#ef4444',
      info: '#3b82f6',
      // 背景色
      bg: {
        primary: '#f3f4f6',
        secondary: '#ffffff',
        card: '#f5f1e8',
        overlay: 'rgba(255, 255, 255, 0.3)'
      },
      // 文字颜色
      text: {
        primary: '#1f2937',
        secondary: '#374151', 
        tertiary: '#6b7280',
        light: '#f0e8d9'
      }
    },
    // 字体系统映射
    fontFamily: {
      primary: ['Noto Serif SC', 'serif']
    },
    fontSize: {
      xs: ['clamp(0.75rem, 2vw, 0.875rem)', { lineHeight: '1.4' }],
      sm: ['clamp(0.875rem, 2.5vw, 1rem)', { lineHeight: '1.5' }],
      base: ['clamp(1rem, 3vw, 1.125rem)', { lineHeight: '1.6' }],
      lg: ['clamp(1.125rem, 3.5vw, 1.25rem)', { lineHeight: '1.5' }],
      xl: ['clamp(1.25rem, 4vw, 1.5rem)', { lineHeight: '1.4' }],
      '2xl': ['clamp(1.375rem, 4vw, 1.75rem)', { lineHeight: '1.3' }],
      '3xl': ['clamp(1.5rem, 4.5vw, 2rem)', { lineHeight: '1.3' }],
      '4xl': ['clamp(1.75rem, 5vw, 2.5rem)', { lineHeight: '1.2' }]
    },
    // 间距系统映射
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem', 
      base: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem'
    },
    // 圆角系统映射
    borderRadius: {
      sm: '6px',
      base: '8px',
      lg: '12px', 
      xl: '16px',
      full: '50%'
    },
    // 阴影系统映射
    boxShadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      lg: '0 10px 25px rgba(0,0,0,0.1), 0 3px 6px rgba(0,0,0,0.08)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
    },
    // 动画时长映射
    transitionDuration: {
      fast: '200ms',
      normal: '300ms', 
      slow: '400ms',
      slower: '500ms'
    },
    // 动画缓动映射
    transitionTimingFunction: {
      'ease-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
      'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    // 响应式断点映射
    breakpoints: {
      sm: '480px',
      md: '768px', 
      lg: '1024px',
      xl: '1280px'
    }
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

