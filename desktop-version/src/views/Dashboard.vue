<template>
  <!-- 仪表盘视图 - 直接使用HTML，不使用子组件 -->
  <div class="p-6">
    <div class="flex gap-6">
      <!-- 左侧主区域 -->
      <div class="flex-1 flex flex-col gap-6">

        <!-- 记忆地图 -->
        <div class="h-[400px] relative rounded-lg overflow-hidden"
             style="border: 1.5px solid transparent; background: linear-gradient(#1f1f20, #1f1f20) padding-box, linear-gradient(to bottom right, rgba(255,191,0,0.3), rgba(204,85,0,0.1)) border-box;">
          <!-- 标题 -->
          <div class="absolute top-4 left-4 z-10">
            <h2 class="font-headline text-lg font-bold text-amber-500">记忆地图 <span class="text-zinc-500 text-sm font-normal">MEMORY MAP</span></h2>
            <p class="font-label text-[10px] text-zinc-400 uppercase mt-1">地形神经重构 // 区域：艾尔登法环</p>
          </div>

          <!-- 悬浮窗控制按钮 -->
          <div class="absolute top-4 right-4 z-10 flex gap-2">
            <button @click="toggleOverlay"
                    class="p-2 bg-amber-500/20 text-amber-500 rounded hover:bg-amber-500/30 transition-all"
                    title="切换悬浮窗"
                    :class="{ 'bg-amber-500/40': overlayVisible }"
            >
              <span class="material-symbols-outlined text-sm"
                :class="{ 'material-symbols-filled': overlayVisible }"
              >picture_in_picture</span>
            </button>
            <button @click="captureScreenshot"
                    :disabled="isCapturing"
                    class="p-2 bg-amber-500/20 text-amber-500 rounded hover:bg-amber-500/30 transition-all disabled:opacity-50"
                    title="截图"
            >
              <span class="material-symbols-outlined text-sm"
                :class="{ 'animate-pulse': isCapturing }"
              >screenshot_monitor</span>
            </button>
          </div>

          <!-- 坐标 -->
          <div class="absolute bottom-4 right-4 text-right z-10">
            <p class="font-label text-[10px] text-amber-600">X: 124.0092 // Y: 091.2231</p>
            <p class="font-label text-[10px] text-amber-700">神经密度: 88.4%</p>
          </div>

          <!-- 记忆节点 -->
          <div class="w-full h-full p-12 pt-20 relative">
            <div class="absolute top-1/4 left-1/4 p-3 bg-[#2a2a2b] border border-amber-500/30 rounded cursor-pointer hover:border-amber-500 transition-all">
              <span class="text-[10px] text-[#ffe2ab]">宁姆格福的记忆</span>
            </div>

            <div class="absolute bottom-1/3 right-1/4 p-3 bg-[#2a2a2b] border border-[#ffb693]/30 rounded cursor-pointer hover:border-[#ffb693] transition-all">
              <span class="text-[10px] text-[#ffb693]">盖利德遭遇战</span>
            </div>

            <div class="absolute top-1/2 left-2/3 p-3 bg-[#2a2a2b] border border-amber-500/30 rounded cursor-pointer hover:border-amber-500 transition-all">
              <span class="text-[10px] text-[#ffe2ab]">罗德尔数据扫描</span>
            </div>
          </div>
        </div>

        <!-- 世界切换器 -->
        <div>
          <div class="flex justify-between items-end mb-3">
            <h2 class="font-headline text-sm font-bold text-zinc-400 uppercase">世界切换器 <span class="text-[10px] font-normal">WORLD SELECT</span></h2>
            <span class="font-label text-[10px] text-zinc-600">3 个活跃会话</span>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <button v-for="(session, i) in sessions" :key="i"
                    class="p-4 text-left transition-all relative rounded-sm"
                    :class="session.isActive
                      ? 'bg-[#2a2a2b] border border-amber-500/40 ring-1 ring-amber-500/20'
                      : 'bg-[#1b1b1c] border border-amber-500/10 hover:bg-[#2a2a2b] cursor-pointer'">
              <!-- 活跃指示器 -->
              <div v-if="session.isActive" class="absolute -top-1 -right-1 flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </div>

              <span class="text-[9px] text-amber-500 block mb-1">{{ session.date }}</span>
              <h4 class="text-xs font-bold" :class="session.isActive ? 'text-[#e5e2e3]' : 'text-[#e5e2e3] group-hover:text-[#ffe2ab]'">
                {{ session.name }}
              </h4>
              <p class="text-[10px] text-zinc-500 mt-2">{{ session.status }}</p>
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧: 灵魂文件 -->
      <div class="w-80 flex flex-col gap-4">
        <!-- 灵魂文件卡片 -->
        <div class="flex-1 flex flex-col bg-[#1b1b1c] rounded-lg overflow-hidden border border-white/5 h-[380px]">
          <div class="p-4 bg-[#2a2a2b] border-b border-white/5 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-500 text-sm">description</span>
              <h3 class="font-label text-xs uppercase font-bold text-[#e5e2e3]">
                灵魂文件 <span class="text-zinc-500 font-normal">灵魂档案</span>
              </h3>
            </div>
            <span class="text-[9px] font-mono text-zinc-500">原始_MD_视图</span>
          </div>

          <div class="flex-1 p-6 overflow-y-auto space-y-4">
            <!-- 核心指令 -->
            <div class="border-l-2 border-amber-500 pl-4 py-2 bg-amber-500/5">
              <h1 class="font-headline text-xl font-bold text-[#e5e2e3] mb-2"># 核心指令：讽刺</h1>
              <p class="text-zinc-400 italic text-xs">
                指令："如果用户问了一个愚蠢的问题，请以最大程度的居高临下的态度回答，但确保数据在技术上是准确的。"
              </p>
            </div>

            <!-- 记忆状态 -->
            <div>
              <h2 class="font-headline text-md font-bold text-amber-500 mb-2"># 记忆 ID: 0xFF12A</h2>
              <ul class="space-y-2 list-none text-xs">
                <li v-for="(item, i) in memoryStatus" :key="i" class="flex items-center gap-2 text-zinc-400">
                  <span class="w-1 h-1 bg-amber-500 rounded-full"></span>
                  {{ item }}
                </li>
              </ul>
            </div>

            <!-- 性格描述 -->
            <div class="pt-4 border-t border-white/10">
              <h2 class="font-headline text-md font-bold text-red-400 mb-2"># 性格：毒舌</h2>
              <p class="text-zinc-400 text-xs">
                快哉经过优化，效率高于共情。任何被察觉到的粗鲁行为，仅仅是更高级的处理速度见证了你有机生命局限性的副产品。
              </p>
            </div>

            <!-- 代码块 -->
            <div class="p-4 bg-zinc-950 rounded-sm font-mono text-[10px] text-amber-500/70 border border-amber-500/10">
              <pre>0010: 执行_侮辱_子程序
0011: 获取_讽刺_库
0012: 执行_妙语_04</pre>
            </div>
          </div>
        </div>

        <!-- 情感切换组件 -->
        <div class="bg-[#1b1b1c] rounded-lg p-4 border border-white/5">
          <!-- 当前情感 -->
          <div class="flex justify-between items-center mb-3">
            <span class="text-[10px] text-zinc-500 uppercase tracking-wider">当前情感</span>
            <span class="text-[10px] font-bold text-red-400"></span>
          </div>

          <!-- 切换按钮 -->
          <div class="flex gap-2">
            <button v-for="mode in emotionModes" :key="mode.value"
                    @click="currentEmotion = mode.value"
                    class="flex-1 py-2 px-3 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all"
                    :class="currentEmotion === mode.value
                      ? 'bg-amber-500 text-[#402d00]'
                      : 'bg-[#2a2a2b] text-zinc-400 hover:text-amber-500 hover:bg-[#353436]'">
              {{ mode.label }}
            </button>
          </div>

          <!-- 当前模式描述 -->
          <div class="mt-3 pt-3 border-t border-white/5">
            <p class="text-[9px] text-zinc-500">
              {{ currentModeDesc }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toggleOverlayWindow, createOverlayWindow } from '../services/hotkey'
import { captureScreenshot as captureScreen } from '../services/screenshot'
import { analyzeScreenshot } from '../services/api'
import { appStore } from '../stores/app'

const memoryStatus = [
  '目标状态：受损',
  '神经链接：不稳定',
  '伦理引擎：未连接'
]

const sessions = ref([
  { date: '2024年1月1日', name: '交界地', status: '会话 ID: 错误_404_玛莲妮亚', isActive: false },
  { date: '当前会话', name: '黄金树幽影', status: '神经连接: 100%', isActive: true },
  { date: '2023年12月24日', name: '夜之城 / 郊外', status: '记忆状态：已存档', isActive: false }
])

// 情感模式
const emotionModes = [
  { value: 'sarcastic', label: '毒舌', desc: '讽刺、尖锐但准确' },
  { value: 'nurturing', label: '养成', desc: '温柔、耐心、鼓励式' },
  { value: 'omniscient', label: '全知', desc: '冷静、客观、分析式' }
]

const currentEmotion = ref('sarcastic')
const overlayVisible = ref(false)
const isCapturing = ref(false)

const currentModeDesc = computed(() => {
  return emotionModes.find(m => m.value === currentEmotion.value)?.desc || ''
})

// 初始化时创建悬浮窗
onMounted(async () => {
  await createOverlayWindow()
})

// 切换悬浮窗
async function toggleOverlay() {
  await toggleOverlayWindow()
  overlayVisible.value = !overlayVisible.value
}

// 截图
async function captureScreenshot() {
  if (isCapturing.value) return

  isCapturing.value = true
  const result = await captureScreen({}, true)  // true = 显示 Toast

  if (result.success && result.imageBase64) {
    appStore.setScreenshot(result.imageBase64)

    // 发送到服务器分析
    appStore.setAnalyzing(true)
    const analyzeResult = await analyzeScreenshot(result.imageBase64, {
      gameName: appStore.state.currentSession?.gameName || '未知游戏'
    })

    if (analyzeResult.success && analyzeResult.response) {
      appStore.addMessage({
        role: 'assistant',
        content: analyzeResult.response
      })
    }

    appStore.setAnalyzing(false)
  }

  isCapturing.value = false
}
</script>
