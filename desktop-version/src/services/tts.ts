/**
 * TTS 语音合成服务
 * 调用 Piper TTS 进行语音播报
 */

import { invoke } from '@tauri-apps/api/tauri'

// TTS 配置
interface TTSConfig {
  enabled: boolean
  voice: string           // Piper 语音模型
  speed: number          // 语速 0.5 - 2.0
  volume: number         // 音量 0.0 - 1.0
}

// 默认配置
const defaultConfig: TTSConfig = {
  enabled: false,
  voice: 'zh_CN-huayan-medium',
  speed: 1.0,
  volume: 0.8
}

let currentConfig: TTSConfig = { ...defaultConfig }
let audioQueue: string[] = []
let isPlaying = false

/**
 * 加载 TTS 配置
 */
export function loadTTSConfig(): TTSConfig {
  const saved = localStorage.getItem('kuaizai-tts-config')
  if (saved) {
    currentConfig = { ...currentConfig, ...JSON.parse(saved) }
  }
  return currentConfig
}

/**
 * 保存 TTS 配置
 */
export function saveTTSConfig(config: Partial<TTSConfig>) {
  currentConfig = { ...currentConfig, ...config }
  localStorage.setItem('kuaizai-tts-config', JSON.stringify(currentConfig))
}

/**
 * 获取当前配置
 */
export function getTTSConfig(): TTSConfig {
  return currentConfig
}

/**
 * 语音播报文本
 * @param text 要播报的文本
 * @param priority 是否优先播放
 */
export async function speak(text: string, priority = false): Promise<boolean> {
  if (!currentConfig.enabled) {
    console.log('[TTS] TTS 已禁用，跳过播报')
    return false
  }

  try {
    // 清理文本（移除 Markdown、代码块等）
    const cleanText = cleanTextForTTS(text)

    if (priority) {
      // 优先播放 - 清空队列
      audioQueue = []
      isPlaying = false
    }

    // 添加到队列
    audioQueue.push(cleanText)

    // 开始播放
    if (!isPlaying) {
      await processQueue()
    }

    return true
  } catch (error) {
    console.error('[TTS] 语音合成失败:', error)
    return false
  }
}

/**
 * 处理播放队列
 */
async function processQueue() {
  if (audioQueue.length === 0) {
    isPlaying = false
    return
  }

  isPlaying = true
  const text = audioQueue.shift()

  if (text) {
    try {
      // 调用本地 TTS 服务或 Piper
      // 方式1: 通过 FastAPI 调用 Piper
      // 方式2: 直接调用系统命令

      await invoke('speak_text', {
        text,
        voice: currentConfig.voice,
        speed: currentConfig.speed,
        volume: currentConfig.volume
      })

      // 等待播放完成（模拟）
      await waitForPlayback(text.length * 200)

    } catch (error) {
      console.error('[TTS] 播放失败:', error)
    }
  }

  // 继续播放下一条
  await processQueue()
}

/**
 * 停止播放
 */
export function stopSpeaking() {
  audioQueue = []
  isPlaying = false
  // 通知后端停止当前播放
  invoke('stop_speaking').catch(console.error)
}

/**
 * 检查 TTS 是否可用
 */
export async function isTTSAvailable(): Promise<boolean> {
  try {
    return await invoke('check_tts_available')
  } catch {
    return false
  }
}

/**
 * 清理文本以便 TTS
 */
function cleanTextForTTS(text: string): string {
  return text
    // 移除 Markdown
    .replace(/#+\s/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/`{3}[\s\S]*?`{3}/g, '[代码块]')
    .replace(/`([^`]+)`/g, '$1')
    // 移除 URL
    .replace(/https?:\/\/\S+/g, '[链接]')
    // 移除特殊符号
    .replace(/[\*#_`\[\]]/g, ' ')
    // 合并空格
    .replace(/\s+/g, ' ')
    .trim()
    // 截取前200字符
    .slice(0, 200)
}

/**
 * 等待播放完成
 */
function waitForPlayback(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, Math.min(ms, 10000)))
}

// 初始化加载
loadTTSConfig()
