/**
 * 应用状态管理
 * 使用 Vue 3 Composition API 的响应式系统
 */

import { reactive, readonly } from 'vue'

// 情感模式
export type EmotionMode = 'sarcastic' | 'nurturing' | 'omniscient'

// 连接状态
interface ConnectionStatus {
  localApi: boolean      // 本地 FastAPI
  remoteApi: boolean     // 远程服务器
  tailscale: boolean     // Tailscale 网络
  lastChecked: Date | null
}

// 系统状态
interface SystemStatus {
  gpuUsage: number
  memoryUsage: number
  temperature: number
}

// 对话消息
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  imageUrl?: string      // 关联的截图
}

// 应用状态
interface AppState {
  // 配置
  emotionMode: EmotionMode
  autoCapture: boolean
  captureInterval: number  // 秒

  // 连接状态
  connection: ConnectionStatus

  // 系统状态
  system: SystemStatus

  // 对话历史
  messages: Message[]

  // 当前会话
  currentSession: {
    id: string
    gameName: string
    startTime: Date
  } | null

  // 截图预览
  lastScreenshot: string | null

  // 加载状态
  isAnalyzing: boolean
  isCapturing: boolean
}

// 初始状态
const state = reactive<AppState>({
  emotionMode: 'sarcastic',
  autoCapture: false,
  captureInterval: 5,

  connection: {
    localApi: false,
    remoteApi: false,
    tailscale: false,
    lastChecked: null
  },

  system: {
    gpuUsage: 0,
    memoryUsage: 0,
    temperature: 0
  },

  messages: [],
  currentSession: null,
  lastScreenshot: null,
  isAnalyzing: false,
  isCapturing: false
})

// 从 localStorage 加载状态
function loadState() {
  const saved = localStorage.getItem('kuaizai-app-state')
  if (saved) {
    const parsed = JSON.parse(saved)
    Object.assign(state, parsed)
  }
}

// 保存状态到 localStorage
function saveState() {
  localStorage.setItem('kuaizai-app-state', JSON.stringify({
    emotionMode: state.emotionMode,
    autoCapture: state.autoCapture,
    captureInterval: state.captureInterval
  }))
}

// Actions
export const appStore = {
  state: readonly(state),

  // 设置情感模式
  setEmotionMode(mode: EmotionMode) {
    state.emotionMode = mode
    saveState()
  },

  // 设置自动截图
  setAutoCapture(enabled: boolean) {
    state.autoCapture = enabled
    saveState()
  },

  // 设置截图间隔
  setCaptureInterval(interval: number) {
    state.captureInterval = interval
    saveState()
  },

  // 更新连接状态
  updateConnection(status: Partial<ConnectionStatus>) {
    Object.assign(state.connection, status)
    state.connection.lastChecked = new Date()
  },

  // 更新系统状态
  updateSystem(status: Partial<SystemStatus>) {
    Object.assign(state.system, status)
  },

  // 添加消息
  addMessage(message: Omit<Message, 'id' | 'timestamp'>) {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    state.messages.push(newMessage)
    // 只保留最近 100 条消息
    if (state.messages.length > 100) {
      state.messages.shift()
    }
  },

  // 清空消息
  clearMessages() {
    state.messages = []
  },

  // 设置截图
  setScreenshot(imageBase64: string | null) {
    state.lastScreenshot = imageBase64
  },

  // 开始会话
  startSession(gameName: string) {
    state.currentSession = {
      id: Date.now().toString(),
      gameName,
      startTime: new Date()
    }
  },

  // 结束会话
  endSession() {
    state.currentSession = null
  },

  // 设置分析状态
  setAnalyzing(analyzing: boolean) {
    state.isAnalyzing = analyzing
  },

  // 设置截图状态
  setCapturing(capturing: boolean) {
    state.isCapturing = capturing
  }
}

// 初始化加载
loadState()
