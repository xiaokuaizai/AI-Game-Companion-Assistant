/**
 * 全局快捷键服务
 * 监听 Tauri 全局快捷键事件
 */

import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'

// 快捷键回调函数类型
type ShortcutCallback = () => void

// 监听器取消函数
let unlisteners: (() => void)[] = []

/**
 * 初始化全局快捷键监听
 */
export async function initGlobalShortcuts(callbacks: {
  onScreenshot?: ShortcutCallback
  onToggleOverlay?: ShortcutCallback
}) {
  // 清理之前的监听器
  cleanupListeners()

  // 监听截图快捷键
  if (callbacks.onScreenshot) {
    const unlisten = await listen('global-shortcut-screenshot', () => {
      console.log('[Hotkey] 截图快捷键触发')
      callbacks.onScreenshot?.()
    })
    unlisteners.push(unlisten)
  }

  console.log('[Hotkey] 全局快捷键监听已初始化')
}

/**
 * 清理监听器
 */
export function cleanupListeners() {
  unlisteners.forEach(unlisten => unlisten())
  unlisteners = []
}

/**
 * 切换悬浮窗显示
 */
export async function toggleOverlayWindow() {
  try {
    await invoke('toggle_overlay_window')
  } catch (error) {
    console.error('[Hotkey] 切换悬浮窗失败:', error)
  }
}

/**
 * 创建悬浮窗
 */
export async function createOverlayWindow() {
  try {
    await invoke('create_overlay_window')
  } catch (error) {
    console.error('[Hotkey] 创建悬浮窗失败:', error)
  }
}

/**
 * 获取悬浮窗实例
 */
export function getOverlayWindow() {
  // 注意：这里使用 appWindow 不行，因为 overlay 是另一个窗口
  // 实际使用时需要通过 Tauri API 操作特定窗口
  return null
}
