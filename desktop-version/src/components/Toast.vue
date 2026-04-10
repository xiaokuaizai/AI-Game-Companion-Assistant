<template>
  <!-- Toast 通知容器 - 固定在右上角 -->
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id"
             class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-[400px] relative"
             :class="typeClasses[toast.type]"
        >
          <!-- 图标 -->
          <span class="material-symbols-outlined text-lg">
            {{ typeIcons[toast.type] }}
          </span>

          <!-- 内容 -->
          <div class="flex-1">
            <p class="text-sm font-medium">{{ toast.message }}</p>
            <p v-if="toast.detail" class="text-xs opacity-75 mt-0.5">{{ toast.detail }}</p>
          </div>

          <!-- 关闭按钮 -->
          <button @click="removeToast(toast.id)"
                  class="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <span class="material-symbols-outlined text-sm">close</span>
          </button>

          <!-- 进度条 -->
          <div class="absolute bottom-0 left-0 h-0.5 bg-white/30 transition-all"
               :style="{ width: toast.progress + '%' }"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { registerToastCallbacks, unregisterToastCallbacks } from '../utils/toast'

// Toast 类型
export type ToastType = 'success' | 'error' | 'warning' | 'info'

// Toast 数据
interface ToastData {
  id: number
  type: ToastType
  message: string
  detail?: string
  duration: number
  progress: number
}

// 类型样式
const typeClasses: Record<ToastType, string> = {
  success: 'bg-green-500/90 text-white border border-green-400/50',
  error: 'bg-red-500/90 text-white border border-red-400/50',
  warning: 'bg-amber-500/90 text-[#131314] border border-amber-400/50',
  info: 'bg-blue-500/90 text-white border border-blue-400/50'
}

// 类型图标
const typeIcons: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info'
}

// Toast 列表
const toasts = ref<ToastData[]>([])
let toastId = 0

// 添加 Toast
function addToast(toast: Omit<ToastData, 'id'>): number {
  const id = ++toastId
  const toastData: ToastData = { ...toast, id }

  toasts.value.push(toastData)

  // 启动进度动画
  const startTime = Date.now()
  const updateProgress = () => {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, toastData.duration - elapsed)
    toastData.progress = (remaining / toastData.duration) * 100

    if (remaining > 0) {
      requestAnimationFrame(updateProgress)
    } else {
      removeToast(id)
    }
  }
  requestAnimationFrame(updateProgress)

  return id
}

// 移除 Toast
function removeToast(id: number) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// 组件挂载时注册回调
onMounted(() => {
  registerToastCallbacks(addToast, removeToast)
})

// 组件卸载时注销回调
onUnmounted(() => {
  unregisterToastCallbacks()
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
