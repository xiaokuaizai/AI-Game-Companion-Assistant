/**
 * 屏幕捕获服务
 * 使用 Tauri 原生命令进行屏幕截图
 */

import { invoke } from '@tauri-apps/api/tauri'
import { toast } from '../utils/toast'

// 截图配置
interface ScreenshotConfig {
  region?: {
    x: number
    y: number
    width: number
    height: number
  }
  windowTitle?: string  // 指定窗口标题（如 "ELDEN RING"）
}

/**
 * 捕获屏幕截图
 * @param config 截图配置
 * @returns Base64 编码的图片
 */
export async function captureScreenshot(
  _config?: ScreenshotConfig,  // 当前版本忽略配置，后续可支持区域截图
  showToast = false
): Promise<{
  success: boolean
  imageBase64?: string
  error?: string
}> {
  try {
    // 调用 Tauri 原生命令
    const result = await invoke<{
      success: boolean
      image: string
      width: number
      height: number
    }>('capture_screenshot')

    if (showToast) {
      toast.success('截图成功')
    }

    return {
      success: true,
      imageBase64: result.image
    }
  } catch (error: any) {
    const errorMsg = String(error)
    console.error('[Screenshot] 截图失败:', errorMsg)

    if (showToast) {
      toast.error('截图失败', errorMsg)
    }

    return {
      success: false,
      error: errorMsg
    }
  }
}

/**
 * 连续截图模式
 */
export class ScreenshotCapture {
  private intervalId: number | null = null
  private isRunning = false

  constructor(
    private interval: number = 5000,  // 默认 5 秒
    private onCapture: (imageBase64: string) => void,
    private onError?: (error: string) => void
  ) {}

  /**
   * 开始连续截图
   */
  async start() {
    if (this.isRunning) return

    this.isRunning = true

    const capture = async () => {
      if (!this.isRunning) return

      const result = await captureScreenshot()
      if (result.success && result.imageBase64) {
        this.onCapture(result.imageBase64)
      } else if (result.error && this.onError) {
        this.onError(result.error)
      }

      if (this.isRunning) {
        this.intervalId = window.setTimeout(capture, this.interval)
      }
    }

    capture()
  }

  /**
   * 停止截图
   */
  stop() {
    this.isRunning = false
    if (this.intervalId) {
      clearTimeout(this.intervalId)
      this.intervalId = null
    }
  }

  /**
   * 是否正在运行
   */
  get running() {
    return this.isRunning
  }
}

/**
 * 获取屏幕尺寸
 */
export async function getScreenSize(): Promise<{
  width: number
  height: number
} | null> {
  try {
    const result = await invoke<{
      width: number
      height: number
    }>('get_screen_size')
    return result
  } catch (error) {
    console.error('[Screenshot] 获取屏幕尺寸失败:', error)
    return null
  }
}

/**
 * 获取截图预览
 * 将 Base64 图片转换为 Blob URL
 */
export function getImagePreview(imageBase64: string): string {
  const byteCharacters = atob(imageBase64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: 'image/png' })
  return URL.createObjectURL(blob)
}
