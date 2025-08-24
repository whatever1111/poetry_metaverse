import { defineConfig, presetUno, presetWind } from 'unocss'

export default defineConfig({
  // 启用Tailwind兼容预设，确保开发体验连续性
  presets: [
    presetUno(), // UnoCSS默认预设
    presetWind(), // Tailwind CSS兼容预设
  ],
  
  // 内容扫描路径 - 性能优化
  content: {
    filesystem: [
      'src/**/*.{vue,js,ts}',
      'index.html'
    ],
    pipeline: {
      include: [
        // 仅扫描源文件，排除node_modules和构建产物
        /\.(vue|[jt]sx?|html)($|\?)/,
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        '.git/**'
      ]
    }
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
  
  // CSS层级配置，确保UnoCSS与现有样式的正确优先级
  layers: {
    'base': 1,        // 基础样式层（最低优先级）
    'components': 2,  // 组件样式层 
    'utilities': 3    // 工具类层（最高优先级，可覆盖组件样式）
  },
  
  // CSS输出控制和命名空间
  cssLayers: {
    base: 'uno-base',
    components: 'uno-components', 
    utilities: 'uno-utilities'
  },
  
  // 开发环境配置
  dev: {
    // HMR优化
    hmr: true
  },
  
  // 性能优化选项
  shortcuts: [
    // 按钮系统 - 基于传统CSS的UnoCSS化
    ['btn-base', 'inline-flex items-center justify-center min-h-[44px] min-w-[120px] px-6 py-4 text-base font-semibold leading-6 rounded-lg border border-transparent cursor-pointer transition-all duration-200 ease-out no-underline whitespace-nowrap select-none focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'],
    ['btn-primary', 'inline-flex items-center justify-center min-h-[36px] min-w-[100px] px-4 py-2 text-sm font-semibold leading-5 rounded-lg border border-transparent cursor-pointer transition-all duration-200 ease-out no-underline whitespace-nowrap select-none focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-br from-primary-600 to-primary-700 text-light border-primary-700 shadow-base hover:from-primary-700 hover:to-primary-800 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm disabled:hover:translate-y-0'],
    ['btn-secondary', 'btn-base bg-white text-gray-700 border-gray-300 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:-translate-y-0.25 hover:shadow-md'],
    ['btn-option', 'btn-base bg-white/30 backdrop-blur-[20px] text-gray-700 border-white/40 shadow-md hover:bg-white/50 hover:border-brand-primary hover:-translate-y-0.5 hover:scale-102 hover:shadow-lg active:bg-white/60 active:translate-y-0 active:scale-98 active:shadow-base'],
    // 功能按钮统一定义
    ['btn-retry-warning', 'btn-base bg-gradient-to-br from-warning to-orange-600 text-white border-none shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:from-orange-600 hover:to-orange-700 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(245,158,11,0.4)]'],
    ['btn-retry-error', 'btn-base bg-red-500 text-white border-none hover:bg-red-600 hover:-translate-y-0.25'],
    ['btn-regenerate', 'btn-base bg-info text-white border-none hover:bg-blue-600 hover:-translate-y-0.25'],
    // 小尺寸按钮变体 - QuizScreen使用
    ['btn-primary-sm', 'px-3 py-1 bg-blue-600 text-white text-sm rounded cursor-pointer transition-colors hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed'],
    ['btn-secondary-sm', 'px-3 py-1 border border-blue-300 text-blue-600 text-sm rounded cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-60 disabled:cursor-not-allowed'],
    // 分享工具按钮系统 - C.5 纯图标模式重构 (从C.4轻量化进化为极简图标模式)
    ['btn-share-tools-base', 'inline-flex items-center justify-center w-8 h-8 p-1 text-xs font-medium rounded border-0 bg-transparent text-gray-500 transition-all duration-150 cursor-pointer select-none'],
    ['btn-share-tools-hover', 'hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100'],
    ['btn-share-tools-disabled', 'disabled:opacity-50 disabled:cursor-not-allowed'],
    ['btn-share-tools-success', 'text-green-600 hover:text-green-700 hover:bg-green-50'],
    ['btn-share-tools', 'btn-share-tools-base btn-share-tools-hover btn-share-tools-disabled'],
    
    // 控制按钮系统 - C.2 现代化实现
    ['btn-control-base', 'inline-flex items-center justify-center min-h-[48px] min-w-24 px-4 py-3 text-sm font-semibold rounded-lg border transition-all duration-200 ease-out cursor-pointer select-none text-white shadow-base'],
    ['btn-control-hover', 'hover:-translate-y-0.5 hover:shadow-md disabled:hover:translate-y-0 disabled:hover:shadow-base'],
    ['btn-control-active', 'active:translate-y-0 active:shadow-sm'],
    ['btn-control-disabled', 'disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none'],
    
    // 控制按钮主题变体
    ['btn-control-interpret', 'bg-gradient-to-br from-[#789a9a] to-[#527a7a] border-[#4a6869] hover:from-[#527a7a] hover:to-[#3d6667]'],
    ['btn-control-listen', 'bg-gradient-to-br from-[#9d6b53] to-[#804d39] border-[#6a3e2f] hover:from-[#804d39] hover:to-[#6b3f2a]'],
    ['btn-control-poet', 'bg-gradient-to-br from-[#8b5a96] to-[#6a4c7a] border-[#5a3d6a] hover:from-[#6a4c7a] hover:to-[#583d66]'],
    ['btn-control-restart', 'bg-gradient-to-br from-[#6c757d] to-[#495057] border-[#343a40] hover:from-[#495057] hover:to-[#343a40]'],
    
    // 控制按钮特殊状态
    ['btn-control-playing', 'animate-pulse from-[#b8744e] to-[#9a5530]'],
    ['btn-control-poet-clicked', 'from-[#a67ba7] to-[#7d5f8b] opacity-90'],
    
    // 控制按钮组合shortcuts
    ['btn-interpret', 'btn-control-base btn-control-hover btn-control-active btn-control-disabled btn-control-interpret'],
    ['btn-listen', 'btn-control-base btn-control-hover btn-control-active btn-control-disabled btn-control-listen'],
    ['btn-poet', 'btn-control-base btn-control-hover btn-control-active btn-control-disabled btn-control-poet'],
    ['btn-restart', 'btn-control-base btn-control-hover btn-control-active btn-control-disabled btn-control-restart'],
    // 保留原有的shortcuts
    ['card-base', 'bg-white rounded-lg shadow-md p-6 transition-all duration-300 ease-out'],
    ['text-responsive', 'text-base max-sm:text-sm lg:text-lg']
  ],
  
  // 预加载常用工具类（提升冷启动性能）
  safelist: [
    'flex', 'grid', 'hidden', 'block', 
    'w-full', 'h-full', 'max-w-3xl', 'mx-auto',
    'text-center', 'items-center', 'justify-center'
  ]
})

