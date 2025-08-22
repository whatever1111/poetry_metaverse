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
    // 常用组合可以定义为shortcuts
    ['btn-base', 'inline-flex items-center justify-center min-w-30 min-h-11 px-4 py-2 font-semibold rounded-lg cursor-pointer transition-all duration-200 ease-out'],
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

