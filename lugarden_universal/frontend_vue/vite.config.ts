import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import UnoCSS from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    UnoCSS({
      // UnoCSS插件性能优化配置
      hmrTopLevelAwait: false, // 提升HMR性能
      inspector: false, // 生产环境禁用inspector
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/modules': fileURLToPath(new URL('./src/modules', import.meta.url)),
      '@/shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@/core': fileURLToPath(new URL('./src/core', import.meta.url))
    },
  },
  // 构建优化配置
  build: {
    cssCodeSplit: true, // CSS代码分割
    cssMinify: 'esbuild', // 使用esbuild压缩CSS
    rollupOptions: {
      output: {
        // CSS文件命名
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name].[hash].css'
          }
          return 'assets/[name].[hash].[ext]'
        }
      }
    }
  },
  
  server: {
    host: '0.0.0.0', // 允许外部访问（tunnel代理支持）
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})
