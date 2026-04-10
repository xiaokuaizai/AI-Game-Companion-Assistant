/**
 * API 服务模块
 * 负责与本地 FastAPI 服务和远程服务器通信
 * 包含重连机制、错误处理、Toast 通知
 * 兼容浏览器和 Tauri 环境
 * 修改：使用 Tauri HTTP API 绕过系统代理直接连接 Tailscale
 */

import { toast } from '../utils/toast'

// 检测是否在 Tauri 环境中运行
const isTauri = () => {
  return typeof window !== 'undefined' && !!(window as any).__TAURI__
}

// 动态导入 Tauri HTTP API（仅在 Tauri 环境中使用）
let tauriHttpModule: any = null
async function getTauriHttp() {
  if (!tauriHttpModule && isTauri()) {
    tauriHttpModule = await import('@tauri-apps/api/http')
  }
  return tauriHttpModule
}

// 统一 fetch 函数
async function httpFetch(url: string, options: any): Promise<any> {
  // 在 Tauri 环境中且访问远程 Tailscale 地址时，使用 Tauri HTTP API 绕过系统代理
  if (isTauri() && url.includes('100.122.65.26')) {
    return await tauriHttpFetch(url, options)
  }

  // 优先使用原生 fetch，更可靠
  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers: options.headers || { 'Content-Type': 'application/json' }
  }

  // 处理 body
  if (options.body) {
    if (options.body.type === 'Json' && options.body.payload) {
      fetchOptions.body = JSON.stringify(options.body.payload)
    } else {
      fetchOptions.body = JSON.stringify(options.body)
    }
  }

  // 处理超时
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  const timeout = options.timeout || 30000
  const controller = new AbortController()

  if (timeout > 0) {
    timeoutId = setTimeout(() => controller.abort(), timeout)
    fetchOptions.signal = controller.signal
  }

  try {
    const response = await fetch(url, fetchOptions)
    if (timeoutId) clearTimeout(timeoutId)

    const data = await response.json().catch(() => null)
    return {
      status: response.status,
      data: data
    }
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId)
    throw error
  }
}

/**
 * 使用 Tauri HTTP API 发送请求 - 绕过系统代理
 * 用于直接连接 Tailscale 虚拟 IP
 */
async function tauriHttpFetch(url: string, options: any): Promise<any> {
  const http = await getTauriHttp()
  if (!http) {
    throw new Error('Tauri HTTP module not available')
  }

  const method = (options.method || 'GET').toUpperCase() as any
  const timeout = options.timeout || 30000

  // 处理请求体
  let body: any
  if (options.body) {
    const payload = options.body.type === 'Json' && options.body.payload
      ? options.body.payload
      : options.body
    body = http.Body.json(payload)
  }

  try {
    // 使用 Tauri HTTP API，它会绕过系统代理
    const response = await http.fetch(url, {
      method,
      headers: options.headers || { 'Content-Type': 'application/json' },
      body,
      timeout: {
        secs: Math.floor(timeout / 1000),
        nanos: (timeout % 1000) * 1000000
      }
    })

    return {
      status: response.status,
      data: response.data
    }
  } catch (error) {
    throw error
  }
}

// 配置接口
interface ApiConfig {
  localApiUrl: string      // 本地 FastAPI 地址
  remoteApiUrl: string     // 远程服务器地址 (通过 Tailscale)
  timeout: number
}

// 默认配置
const defaultConfig: ApiConfig = {
  localApiUrl: 'http://localhost:8000',
  remoteApiUrl: 'http://100.122.65.26:8000',  // Qwen服务 (Tailscale虚拟IP，直接连接)
  timeout: 60000  // 60秒超时，平衡响应和等待时间
}

// 当前配置（强制使用默认配置，忽略localStorage缓存）
let config: ApiConfig = { ...defaultConfig }

// 清除旧的localStorage配置（确保使用最新配置）
localStorage.removeItem('kuaizai-api-config')

// 重连状态 (保留供将来使用)
// let _reconnectAttempts = 0
// const _maxReconnectAttempts = 5
// const _reconnectDelay = 2000  // 2秒

/**
 * 更新 API 配置
 */
export function setApiConfig(newConfig: Partial<ApiConfig>) {
  config = { ...config, ...newConfig }
  localStorage.setItem('kuaizai-api-config', JSON.stringify(config))
  // 重置重连计数（如有需要）
}

/**
 * 加载保存的配置
 */
export function loadApiConfig(): ApiConfig {
  const saved = localStorage.getItem('kuaizai-api-config')
  if (saved) {
    config = { ...config, ...JSON.parse(saved) }
  }
  return config
}

/**
 * 获取当前配置
 */
export function getApiConfig(): ApiConfig {
  return config
}

/**
 * 带重连的请求
 */
async function fetchWithRetry(
  url: string,
  options: any,
  retries = 3
): Promise<any> {
  let lastError: any

  for (let i = 0; i < retries; i++) {
    try {
      const response = await httpFetch(url, options)
      return response
    } catch (error) {
      lastError = error
      if (i < retries - 1) {
        await delay(1000 * (i + 1))  // 递增延迟
      }
    }
  }

  throw lastError
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 测试本地 FastAPI 连接
 */
export async function testLocalConnection(showToast = false): Promise<boolean> {
  try {
    const response = await httpFetch(`${config.localApiUrl}/health`, {
      method: 'GET',
      timeout: 5000
    })
    const success = response.status === 200

    if (showToast) {
      if (success) {
        toast.success('本地服务连接成功')
      } else {
        toast.error('本地服务连接失败', `状态码: ${response.status}`)
      }
    }

    return success
  } catch (error) {
    if (showToast) {
      toast.error('本地服务连接失败', '请检查 FastAPI 服务是否启动')
    }
    return false
  }
}

/**
 * 测试远程服务器连接
 */
export async function testRemoteConnection(showToast = false): Promise<boolean> {
  if (!config.remoteApiUrl) {
    if (showToast) {
      toast.warning('远程服务器未配置', '请在设置中配置 Tailscale 服务器地址')
    }
    return false
  }

  try {
    const response = await httpFetch(`${config.remoteApiUrl}/health`, {
      method: 'GET',
      timeout: 15000  // 增加到15秒，Tailscale网络延迟较高
    })
    const success = response.status === 200

    if (showToast) {
      if (success) {
        toast.success('远程服务器连接成功')
      } else {
        toast.error('远程服务器连接失败', `状态码: ${response.status}`)
      }
    }

    return success
  } catch (error) {
    if (showToast) {
      toast.error('远程服务器连接失败', '请检查 Tailscale 连接和服务器状态')
    }
    return false
  }
}

/**
 * 发送截图到服务器分析
 * 包含重连机制
 */
export async function analyzeScreenshot(
  imageBase64: string,
  gameContext: {
    gameName: string
    currentTask?: string
    playerLevel?: number
  }
): Promise<{
  success: boolean
  response?: string
  error?: string
}> {
  // 检查远程服务器配置
  if (!config.remoteApiUrl) {
    const error = '远程服务器未配置'
    toast.error(error, '请在设置中配置服务器地址')
    return { success: false, error }
  }

  // 显示加载状态
  const loadingToast = toast.info('正在发送截图...', '请稍候', 0)  // 不自动关闭

  try {
    const response = await fetchWithRetry(
      `${config.remoteApiUrl}/analyze`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          type: 'Json',
          payload: {
            image: imageBase64,
            context: gameContext,
            emotion: getCurrentEmotion(),
            timestamp: new Date().toISOString()
          }
        },
        timeout: config.timeout
      },
      2  // 重试2次
    )

    // 关闭加载提示
    // @ts-ignore
    loadingToast && (loadingToast.id && removeToast(loadingToast.id))

    if (response.status === 200) {
      const data = response.data as { response: string }
      return {
        success: true,
        response: data.response
      }
    } else {
      const error = `服务器返回错误: ${response.status}`
      toast.error('分析失败', error)
      return {
        success: false,
        error
      }
    }
  } catch (error: any) {
    // 关闭加载提示
    // @ts-ignore
    loadingToast && (loadingToast.id && removeToast(loadingToast.id))

    const errorMsg = String(error)

    // 判断错误类型
    if (errorMsg.includes('timeout')) {
      toast.error('请求超时', '服务器响应时间过长，请稍后重试')
    } else if (errorMsg.includes('Network') || errorMsg.includes('fetch')) {
      toast.error('网络错误', '无法连接到服务器，请检查 Tailscale 连接')
    } else {
      toast.error('分析失败', errorMsg)
    }

    return {
      success: false,
      error: errorMsg
    }
  }
}

/**
 * 获取当前情感模式
 */
function getCurrentEmotion(): string {
  const saved = localStorage.getItem('kuaizai-app-state')
  if (saved) {
    const state = JSON.parse(saved)
    return state.emotionMode || 'sarcastic'
  }
  return 'sarcastic'
}

/**
 * 获取系统状态
 */
export async function getSystemStatus(): Promise<{
  localConnected: boolean
  remoteConnected: boolean
}> {
  const [localConnected, remoteConnected] = await Promise.all([
    testLocalConnection(),
    testRemoteConnection()
  ])

  return {
    localConnected,
    remoteConnected
  }
}

/**
 * 发送对话消息到 Qwen 服务
 * 支持记忆功能
 */
export async function sendChatMessage(
  messages: Array<{ role: string; content: string }>,
  userId: string = 'default'
): Promise<{
  success: boolean
  response?: string
  error?: string
}> {
  if (!config.remoteApiUrl) {
    return {
      success: false,
      error: '远程服务器未配置'
    }
  }

  try {
    const response = await fetchWithRetry(
      `${config.remoteApiUrl}/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          type: 'Json',
          payload: {
            messages,
            user_id: userId,
            enable_memory: true,
            max_tokens: 128  // 与服务器配置保持一致
          }
        },
        timeout: config.timeout
      },
      2
    )

    if (response.status === 200) {
      const data = response.data as { choices: Array<{ message: { content: string } }> }
      return {
        success: true,
        response: data.choices[0]?.message?.content || ''
      }
    } else {
      return {
        success: false,
        error: `服务器返回错误: ${response.status}`
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: String(error)
    }
  }
}

// 初始化加载
loadApiConfig()
