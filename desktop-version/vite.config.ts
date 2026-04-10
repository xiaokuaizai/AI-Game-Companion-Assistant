/**
 * Vite 配置文件
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5174,  // 修改为5174，避免端口冲突
    strictPort: false,  // 如果5174也被占用，自动尝试下一个端口
    host: true,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
})
