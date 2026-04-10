/**
 * 应用入口文件
 * 初始化 Vue 应用并挂载
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { initGlobalShortcuts } from './services/hotkey'
import { captureScreenshot } from './services/screenshot'
import { appStore } from './stores/app'
import { analyzeScreenshot } from './services/api'

// 创建应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 挂载到 DOM
app.mount('#app')

// 初始化全局快捷键
initGlobalShortcuts({
  onScreenshot: async () => {
    // 全局截图快捷键处理
    appStore.setCapturing(true)
    const result = await captureScreenshot()
    if (result.success && result.imageBase64) {
      appStore.setScreenshot(result.imageBase64)
      // 触发分析
      appStore.setAnalyzing(true)
      const analyzeResult = await analyzeScreenshot(result.imageBase64, {
        gameName: appStore.state.currentSession?.gameName || '未知游戏'
      })
      if (analyzeResult.success) {
        appStore.addMessage({
          role: 'assistant',
          content: analyzeResult.response || '分析完成'
        })
      }
      appStore.setAnalyzing(false)
    }
    appStore.setCapturing(false)
  }
})
