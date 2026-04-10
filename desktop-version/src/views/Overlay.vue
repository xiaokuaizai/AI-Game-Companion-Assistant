<template>
  <!-- 悬浮窗 -->
  <div class="h-screen w-screen overflow-hidden bg-[#0a0a0a] select-none">
    <!-- 主容器 - 玻璃拟态效果 -->
    <div class="m-4 p-4 bg-[#131314]/90 backdrop-blur-md rounded-lg border border-amber-500/30 shadow-lg"
         style="box-shadow: 0 0 20px rgba(255,191,0,0.1);">

      <!-- 标题栏 - 可拖拽 -->
      <div class="flex justify-between items-center mb-4 cursor-move" data-tauri-drag-region @mousedown="startDrag">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-500 text-sm">smart_toy</span>
          <span class="font-label text-xs uppercase tracking-wider text-amber-500">KUAIZAI</span>
          <span class="text-[10px] text-zinc-500">// {{ emotionMode }}</span>
        </div>

        <div class="flex items-center gap-2">
          <!-- 置顶按钮 -->
          <button @click.stop="toggleAlwaysOnTop"
                  class="p-1 text-zinc-400 hover:text-amber-500 transition-colors"
                  title="置顶">
            <span class="material-symbols-outlined text-sm">push_pin</span>
          </button>

          <!-- 最小化按钮 -->
          <button @click.stop="minimize"
                  class="p-1 text-zinc-400 hover:text-amber-500 transition-colors"
                  title="最小化">
            <span class="material-symbols-outlined text-sm">remove</span>
          </button>

          <!-- 关闭按钮 -->
          <button @click.stop="close"
                  class="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                  title="关闭">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>

      <!-- 截图预览区 -->
      <div class="mb-4 relative group">
        <div class="h-32 bg-[#1b1b1c] rounded border border-white/5 overflow-hidden flex items-center justify-center">
          <img v-if="lastScreenshot" :src="lastScreenshot" class="max-w-full max-h-full object-contain" alt="截图">
          <span v-else class="text-xs text-zinc-600">等待截图...</span>
        </div>

        <!-- 截图按钮 -->
        <button @click="captureNow"
                :disabled="isCapturing"
                class="absolute bottom-2 right-2 p-2 bg-amber-500/80 text-[#131314] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="截图">
          <span class="material-symbols-outlined text-sm">screenshot_monitor</span>
        </button>
      </div>

      <!-- 对话区域 -->
      <div ref="chatContainer" class="h-64 overflow-y-auto space-y-3 mb-4 pr-1">
        <div v-for="(msg, i) in recentMessages" :key="i"
             :class="['flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : '']">

          <!-- 头像 -->
          <div class="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center"
               :class="msg.role === 'user' ? 'bg-zinc-700' : 'bg-amber-500/20'">
            <span class="material-symbols-outlined text-[10px]"
                  :class="msg.role === 'user' ? 'text-zinc-400' : 'text-amber-500'">
              {{ msg.role === 'user' ? 'person' : 'smart_toy' }}
            </span>
          </div>

          <!-- 内容 -->
          <div :class="['max-w-[80%] p-2 rounded text-xs', msg.role === 'user'
            ? 'bg-zinc-800 text-zinc-200'
            : 'bg-amber-500/10 text-amber-100 border border-amber-500/20']">
            {{ msg.content }}
          </div>
        </div>

        <!-- 分析中 -->
        <div v-if="isAnalyzing" class="flex gap-2">
          <div class="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center">
            <span class="material-symbols-outlined text-[10px] text-amber-500">smart_toy</span>
          </div>
          <div class="p-2 rounded text-xs bg-amber-500/10 text-amber-100 border border-amber-500/20 flex items-center gap-1">
            <span v-for="i in 3" :key="i" class="w-1 h-1 bg-amber-500 rounded-full animate-bounce" :style="{ animationDelay: i * 0.1 + 's' }"></span>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="flex gap-2">
        <input v-model="inputMessage"
               @keyup.enter="sendMessage"
               type="text"
               placeholder="输入指令..."
               class="flex-1 bg-[#1b1b1c] border border-white/10 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50 transition-colors">
        <button @click="sendMessage"
                :disabled="!inputMessage.trim() || isAnalyzing"
                class="px-3 py-2 bg-amber-500 text-[#131314] rounded text-xs font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          发送
        </button>
      </div>

      <!-- 快捷键提示 -->
      <div class="mt-3 pt-3 border-t border-white/5 flex justify-between items-center text-[9px] text-zinc-600">
        <span>Ctrl+Shift+K 显示/隐藏</span>
        <span>Ctrl+Shift+S 截图</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { appWindow } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import { appStore } from '../stores/app'
import { captureScreenshot } from '../services/screenshot'
import { analyzeScreenshot } from '../services/api'

// 状态
const inputMessage = ref('')
const chatContainer = ref<HTMLDivElement | null>(null)
const isAlwaysOnTop = ref(true)

const lastScreenshot = computed(() => appStore.state.lastScreenshot)
const isAnalyzing = computed(() => appStore.state.isAnalyzing)
const isCapturing = computed(() => appStore.state.isCapturing)

const emotionMode = computed(() => {
  const map: Record<string, string> = {
    sarcastic: '毒舌',
    nurturing: '养成',
    omniscient: '全知'
  }
  return map[appStore.state.emotionMode] || '默认'
})

// 只显示最近5条消息
const recentMessages = computed(() => {
  return appStore.state.messages.slice(-5)
})

// 监听全局截图快捷键
onMounted(async () => {
  await listen('global-shortcut-screenshot', () => {
    captureNow()
  })
})

// 开始拖拽
function startDrag() {
  appWindow.startDragging()
}

// 截图
async function captureNow() {
  if (isCapturing.value) return

  appStore.setCapturing(true)

  const result = await captureScreenshot()
  if (result.success && result.imageBase64) {
    appStore.setScreenshot(result.imageBase64)
    await processImage(result.imageBase64)
  }

  appStore.setCapturing(false)
}

// 处理图片分析
async function processImage(imageBase64: string) {
  appStore.setAnalyzing(true)

  // 添加用户消息
  appStore.addMessage({
    role: 'user',
    content: '[截图]'
  })

  scrollToBottom()

  // 发送到服务器分析
  const result = await analyzeScreenshot(imageBase64, {
    gameName: appStore.state.currentSession?.gameName || '未知游戏'
  })

  if (result.success && result.response) {
    appStore.addMessage({
      role: 'assistant',
      content: result.response
    })
  } else {
    appStore.addMessage({
      role: 'assistant',
      content: `分析失败：${result.error || '未知错误'}`
    })
  }

  appStore.setAnalyzing(false)
  scrollToBottom()
}

// 发送消息
async function sendMessage() {
  if (!inputMessage.value.trim() || isAnalyzing.value) return

  appStore.addMessage({
    role: 'user',
    content: inputMessage.value
  })

  const question = inputMessage.value
  inputMessage.value = ''

  scrollToBottom()

  // 模拟回复
  appStore.setAnalyzing(true)
  setTimeout(() => {
    appStore.addMessage({
      role: 'assistant',
      content: `关于"${question}"... 让我分析一下。`
    })
    appStore.setAnalyzing(false)
    scrollToBottom()
  }, 1000)
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// 置顶切换
async function toggleAlwaysOnTop() {
  isAlwaysOnTop.value = !isAlwaysOnTop.value
  await appWindow.setAlwaysOnTop(isAlwaysOnTop.value)
}

// 最小化
async function minimize() {
  await appWindow.minimize()
}

// 关闭
async function close() {
  // 调用 Tauri 命令关闭窗口
  try {
    await invoke('close_overlay_window')
  } catch (e) {
    // 如果命令失败，直接隐藏
    await appWindow.hide()
  }
}
</script>

<style scoped>
/* 隐藏滚动条但保留功能 */
::-webkit-scrollbar {
  width: 2px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 191, 0, 0.2);
  border-radius: 1px;
}
</style>
