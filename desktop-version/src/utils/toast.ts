/**
 * Toast 工具函数
 * 全局通知提示
 */

import type { ToastType } from '../components/Toast.vue'

// Toast 数据接口
export interface ToastData {
  id: number
  type: ToastType
  message: string
  detail?: string
  duration: number
  progress: number
}

// 回调函数存储
let addToastCallback: ((toast: Omit<ToastData, 'id'>) => number) | null = null
let removeToastCallback: ((id: number) => void) | null = null

/**
 * 注册 Toast 回调（由 Toast 组件调用）
 */
export function registerToastCallbacks(
  addFn: (toast: Omit<ToastData, 'id'>) => number,
  removeFn: (id: number) => void
) {
  addToastCallback = addFn
  removeToastCallback = removeFn
}

/**
 * 注销 Toast 回调
 */
export function unregisterToastCallbacks() {
  addToastCallback = null
  removeToastCallback = null
}

/**
 * 显示 Toast 通知
 */
function showToast(
  type: ToastType,
  message: string,
  detail?: string,
  duration = 3000
): number {
  if (!addToastCallback) {
    console.warn('[Toast] Toast 组件未挂载，无法显示通知:', message)
    return -1
  }
  return addToastCallback({ type, message, detail, duration, progress: 100 })
}

/**
 * 移除 Toast 通知
 */
export function removeToast(id: number) {
  if (removeToastCallback) {
    removeToastCallback(id)
  }
}

// 便捷方法
export const toast = {
  success: (message: string, detail?: string, duration?: number) =>
    showToast('success', message, detail, duration),
  error: (message: string, detail?: string, duration?: number) =>
    showToast('error', message, detail, duration),
  warning: (message: string, detail?: string, duration?: number) =>
    showToast('warning', message, detail, duration),
  info: (message: string, detail?: string, duration?: number) =>
    showToast('info', message, detail, duration)
}
