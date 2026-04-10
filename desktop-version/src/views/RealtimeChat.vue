<template>
  <!-- 实时对话视图 -->
  <div class="h-full p-6 flex gap-6">

    <!-- 左侧：视觉回显窗 + 资源监控 -->
    <div class="w-[400px] flex flex-col gap-4">

      <!-- 视觉回显窗 -->
      <div class="h-56 signature-gradient-border rounded-lg relative overflow-hidden group">
        <div class="absolute top-3 left-4 z-10">
          <span class="material-symbols-outlined text-amber-500">visibility</span>
        </div>

        <div class="absolute top-3 right-4 z-10">
          <span class="font-label text-[10px] text-amber-500">LIVE</span>
        </div>

        <!-- 截图显示 -->
        <div class="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
          <img v-if="lastScreenshot" :src="lastScreenshot" class="max-w-full max-h-full object-contain" alt="截图">
          <div v-else class="text-center">
            <span class="material-symbols-outlined text-6xl text-zinc-600 mb-2">videocam_off</span>
            <p class="text-xs text-zinc-500">等待截图...</p>
          </div>
        </div>

        <!-- 底部覆盖层 -->
        <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <p class="text-[10px] text-amber-500/70 font-mono truncate">
            {{ isCapturing ? '正在截图...' : '等待捕获' }}
          </p>
        </div>

        <!-- 截图按钮 -->
        <button @click="captureNow"
                :disabled="isCapturing"
                class="absolute bottom-3 right-3 p-2 bg-amber-500/20 text-amber-500 rounded hover:bg-amber-500/30 transition-all disabled:opacity-50">
          <span class="material-symbols-outlined text-sm">screenshot_monitor</span>
        </button>
      </div>

      <!-- 资源监控 -->
      <div class="flex-1 bg-surface-container-low rounded-lg p-4 border border-white/5">
        <h3 class="font-label text-xs uppercase font-bold tracking-widest text-amber-500 mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-sm">memory</span>
          系统遥测
        </h3>

        <div class="space-y-4">
          <div v-for="(metric, i) in telemetryData" :key="i" class="space-y-1">
            <div class="flex justify-between items-center">
              <span class="text-xs text-on-surface-variant">{{ metric.label }}</span>
              <span class="text-xs font-mono" :class="metric.color">{{ metric.value }}</span>
            </div>
            <div class="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500" :class="metric.barColor"
                   :style="{ width: metric.percent + '%' }">
              </div>
            </div>
          </div>
        </div>

        <!-- 自动截图开关 -->
        <div class="mt-6 pt-4 border-t border-white/5">
          <div class="flex items-center justify-between">
            <span class="text-sm text-on-surface-variant">自动截图分析</span>
            <button @click="toggleAutoCapture"
                    :class="['w-12 h-6 rounded-full transition-colors relative', autoCapture ? 'bg-amber-500' : 'bg-zinc-700']">
              <span :class="['absolute top-1 w-4 h-4 bg-white rounded-full transition-transform', autoCapture ? 'translate-x-7' : 'translate-x-1']">
              </span>
            </button>
          </div>
          <p class="text-[10px] text-zinc-500 mt-1" v-if="autoCapture">
            每 {{ captureInterval }} 秒自动截图并分析
          </p>
        </div>
      </div>
    </div>

    <!-- 右侧：对话界面 -->
    <div class="flex-1 flex flex-col bg-surface-container-low rounded-lg border border-white/5 overflow-hidden">

      <!-- 顶部：会话信息 -->
      <div class="p-3 bg-surface-container-high border-b border-white/5 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-500 text-sm">headphones</span>
          <span class="font-label text-xs uppercase text-on-surface">
            Active Session // {{ emotionModeText }}
          </span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
          <span class="text-[10px] text-amber-500">实时</span>
        </div>
      </div>

      <!-- 消息列表 -->
      <div ref="messageContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-for="(msg, i) in messages" :key="i" class="flex gap-3" :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
          <!-- 头像 -->
          <div class="w-8 h-8 rounded-sm flex-shrink-0 flex items-center justify-center"
               :class="msg.role === 'user' ? 'bg-zinc-700' : 'bg-amber-500/20 border border-amber-500/30'">
            <span v-if="msg.role === 'user'" class="material-symbols-outlined text-zinc-400 text-sm">person</span>
            <span v-else class="material-symbols-outlined text-amber-500 text-sm">smart_toy</span>
          </div>

          <!-- 消息内容 -->
          <div class="max-w-[80%]">
            <div class="p-3 rounded-lg" :class="msg.role === 'user'
                        ? 'bg-surface-container-high text-on-surface'
                        : 'bg-surface-container text-amber-100 border border-amber-500/20'">
              <p class="text-sm leading-relaxed">{{ msg.content }}</p>
              <img v-if="msg.imageUrl" :src="msg.imageUrl" class="mt-2 max-w-xs rounded border border-white/10" alt="截图">
            </div>
            <span class="text-[9px] text-zinc-500 mt-1 block">{{ formatTime(msg.timestamp) }}</span>
          </div>
        </div>

        <!-- 分析中指示器 -->
        <div v-if="isAnalyzing" class="flex gap-3">
          <div class="w-8 h-8 rounded-sm bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <span class="material-symbols-outlined text-amber-500 text-sm">smart_toy</span>
          </div>
          <div class="p-3 bg-surface-container border border-amber-500/20 rounded-lg">
            <div class="flex gap-1">
              <span v-for="i in 3" :key="i" class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"
                    :style="{ animationDelay: i * 0.1 + 's' }">
              </span>
            </div>
            <p class="text-[10px] text-zinc-500 mt-2">正在分析画面...</p>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="p-4 border-t border-white/5 bg-surface-container-high">
        <!-- 图片上传预览 -->
        <div v-if="uploadedImage" class="mb-3 flex items-center gap-2 p-2 bg-surface-container rounded border border-amber-500/20">
          <img :src="uploadedImage" class="h-16 w-auto rounded object-contain" alt="上传预览">
          <span class="text-xs text-zinc-400">已选择图片</span>
          <button @click="clearUploadedImage" class="ml-auto p-1 text-zinc-500 hover:text-red-400">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <form @submit.prevent="sendMessage" class="flex gap-3">
          <!-- 上传图片按钮 -->
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileUpload"
            id="file-upload"
          >
          <button
            type="button"
            onclick="document.getElementById('file-upload').click()"
            class="p-2 text-zinc-400 hover:text-amber-500 transition-colors"
            title="上传图片"
          >
            <span class="material-symbols-outlined text-sm">image</span>
          </button>

          <input v-model="inputMessage" type="text" placeholder="输入指令或提问..."
                 class="flex-1 bg-transparent border-b border-outline-variant text-on-surface text-sm py-2 px-1 focus:outline-none focus:border-primary transition-colors">
          <button type="submit"
                  :disabled="isAnalyzing"
                  class="bg-primary-container text-on-primary px-4 py-2 rounded-sm text-xs font-label font-bold tracking-widest hover:brightness-110 transition-all active:scale-95 flex items-center gap-1 disabled:opacity-50">
            <span class="material-symbols-outlined text-sm">send</span>
            {{ uploadedImage ? '发送图片' : '发送' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { appStore } from '../stores/app'
import { captureScreenshot, ScreenshotCapture } from '../services/screenshot'
import { analyzeScreenshot, sendChatMessage } from '../services/api'

// 遥测数据（模拟）
const telemetryData = ref([
  { label: 'GPU 利用率', value: '45%', percent: 45, color: 'text-amber-500', barColor: 'bg-amber-500' },
  { label: '显存占用', value: '12.4GB / 24GB', percent: 52, color: 'text-amber-400', barColor: 'bg-amber-400' },
  { label: '系统内存', value: '8.2GB / 32GB', percent: 26, color: 'text-zinc-400', barColor: 'bg-zinc-500' },
  { label: 'SoC 温度', value: '54°C', percent: 54, color: 'text-amber-500', barColor: 'bg-amber-500' }
])

// 状态
const messages = computed(() => appStore.state.messages)
const lastScreenshot = computed(() => appStore.state.lastScreenshot)
const autoCapture = computed(() => appStore.state.autoCapture)
const captureInterval = computed(() => appStore.state.captureInterval)
const isAnalyzing = computed(() => appStore.state.isAnalyzing)
const isCapturing = computed(() => appStore.state.isCapturing)

const emotionModeText = computed(() => {
  const map: Record<string, string> = {
    sarcastic: '毒舌模式',
    nurturing: '养成模式',
    omniscient: '全知模式'
  }
  return map[appStore.state.emotionMode] || '默认模式'
})

// 输入消息
const inputMessage = ref('')
const messageContainer = ref<HTMLDivElement | null>(null)
const uploadedImage = ref<string | null>(null)
const uploadedImageBase64 = ref<string | null>(null)

// 截图捕获器
let screenshotCapture: ScreenshotCapture | null = null

// 初始化
onMounted(() => {
  // 添加欢迎消息
  if (messages.value.length === 0) {
    appStore.addMessage({
      role: 'assistant',
      content: '哟，有机体。终于连上线了。我正准备闲着呢，结果你就来了。有什么"紧急"到需要打扰我的问题吗？\n\n...算了，直接问吧。我的讽刺模块今天加载得特别充分。'
    })

    // ===== 模拟演示：游戏截图分析 =====
    // 1. 显示游戏截图
    setTimeout(() => {
      // 使用本地游戏截图
      appStore.setScreenshot('/game_screenshot.png')

      // 2. 添加用户消息
      appStore.addMessage({
        role: 'user',
        content: '[游戏截图] 帮我看看这个画面，我在《极限国度》里该干嘛？',
        imageUrl: '/game_screenshot.png'
      })

      // 3. 显示分析中
      appStore.setAnalyzing(true)

      // 4. AI 回复分析结果
      setTimeout(() => {
        appStore.setAnalyzing(false)
        appStore.addMessage({
          role: 'assistant',
          content: `哦，看看这是谁，《极限国度》的新手玩家。穿着这身豹纹套装...品味独特，我给你的时尚选择打 3 分（满分 100）。

不过既然你诚心诚意地发问了，我就大发慈悲地分析一下：

📊 **场景分析**
• 地点：红杉国家公园的 Moro Rock
• 时间：日出/日落时分，光线很赞
• 环境：开阔的山顶平台，周围都是树
• 装备：背上那个发光背包...你是怕别人看不见你吗？

🎯 **操作建议**
• 看到左边的"起飞"按钮了吗？按下它，然后祈祷
• 或者选择"运动项目"换个玩法
• 距离标记显示 19 米——这可能是你离悬崖边缘的距离

💡 **专业建议**：既然 GPU 只占用了 12%，说明你的电脑还有余力。不如把画质调高点？反正摔下来的画面会更清晰。`
        })
      }, 2000)
    }, 1000)
    // ===== 模拟演示结束 =====
  }

  // 如果开启了自动截图，启动捕获器
  if (autoCapture.value) {
    startAutoCapture()
  }
})

onUnmounted(() => {
  stopAutoCapture()
})

// 启动自动截图
function startAutoCapture() {
  stopAutoCapture()

  screenshotCapture = new ScreenshotCapture(
    captureInterval.value * 1000,
    async (imageBase64) => {
      appStore.setScreenshot(imageBase64)
      await processImage(imageBase64, '[自动截图]')
    },
    (error) => {
      console.error('[Chat] 截图失败:', error)
    }
  )

  screenshotCapture.start()
}

// 停止自动截图
function stopAutoCapture() {
  if (screenshotCapture) {
    screenshotCapture.stop()
    screenshotCapture = null
  }
}

// 切换自动截图
function toggleAutoCapture() {
  const newValue = !autoCapture.value
  appStore.setAutoCapture(newValue)

  if (newValue) {
    startAutoCapture()
  } else {
    stopAutoCapture()
  }
}

// 立即截图
async function captureNow() {
  appStore.setCapturing(true)

  const result = await captureScreenshot()
  if (result.success && result.imageBase64) {
    appStore.setScreenshot(result.imageBase64)
    await processImage(result.imageBase64, '[截图]')
  }

  appStore.setCapturing(false)
}

// 处理图片分析
async function processImage(imageBase64: string, description: string = '[截图]') {
  appStore.setAnalyzing(true)

  // 添加用户消息（截图或上传的图片）
  appStore.addMessage({
    role: 'user',
    content: description,
    imageUrl: `data:image/png;base64,${imageBase64}`
  })

  scrollToBottom()

  // 发送到服务器分析
  const result = await analyzeScreenshot(imageBase64, {
    gameName: appStore.state.currentSession?.gameName || '未知游戏',
    currentTask: ''
  })

  if (result.success && result.response) {
    appStore.addMessage({
      role: 'assistant',
      content: result.response
    })
  } else {
    appStore.addMessage({
      role: 'assistant',
      content: `抱歉，分析失败：${result.error || '未知错误'}`
    })
  }

  appStore.setAnalyzing(false)
  scrollToBottom()
}

// 处理文件上传
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    appStore.addMessage({
      role: 'assistant',
      content: '请选择图片文件（JPG、PNG、GIF 等）'
    })
    return
  }

  // 检查文件大小（限制 10MB）
  if (file.size > 10 * 1024 * 1024) {
    appStore.addMessage({
      role: 'assistant',
      content: '图片大小不能超过 10MB'
    })
    return
  }

  // 读取文件
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    if (result) {
      // 存储 base64 数据（去掉 data:image/xxx;base64, 前缀）
      uploadedImage.value = result
      const base64Data = result.split(',')[1]
      uploadedImageBase64.value = base64Data
    }
  }
  reader.readAsDataURL(file)

  // 清空 input，允许重复选择同一文件
  target.value = ''
}

// 清除上传的图片
function clearUploadedImage() {
  uploadedImage.value = null
  uploadedImageBase64.value = null
}

// 发送消息
async function sendMessage() {
  // 如果有上传的图片，优先处理图片
  if (uploadedImageBase64.value) {
    await processImage(uploadedImageBase64.value, inputMessage.value || '[用户上传的图片]')
    clearUploadedImage()
    inputMessage.value = ''
    return
  }

  // 普通文本消息
  if (!inputMessage.value.trim()) return

  // 添加用户消息
  appStore.addMessage({
    role: 'user',
    content: inputMessage.value
  })

  inputMessage.value = ''

  scrollToBottom()

  // 分析中状态
  appStore.setAnalyzing(true)

  // 构建消息历史（最近 10 条）
  const historyMessages = messages.value.slice(-10).map(m => ({
    role: m.role,
    content: m.content
  }))

  // 发送到 Qwen 服务
  const result = await sendChatMessage(historyMessages, 'kuaizai-user')

  if (result.success && result.response) {
    appStore.addMessage({
      role: 'assistant',
      content: result.response
    })
  } else {
    appStore.addMessage({
      role: 'assistant',
      content: `连接失败：${result.error || '无法连接到 Qwen 服务'}`
    })
  }

  appStore.setAnalyzing(false)
  scrollToBottom()
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    messageContainer.value?.scrollTo({ top: messageContainer.value.scrollHeight, behavior: 'smooth' })
  })
}

// 格式化时间
function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })
}
</script>
