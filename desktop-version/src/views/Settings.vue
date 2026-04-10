<template>
  <!-- 设置视图 -->
  <div class="h-full p-6 overflow-y-auto">
    <div class="max-w-2xl mx-auto space-y-6">

      <!-- 标题 -->
      <div class="flex items-center gap-3 mb-8">
        <span class="material-symbols-outlined text-2xl text-amber-500">settings</span>
        <h1 class="font-headline text-2xl font-bold text-on-surface">系统设置</h1>
      </div>

      <!-- 连接状态卡片 -->
      <section class="bg-surface-container-low rounded-lg p-6 border border-white/5">
        <h2 class="font-label text-sm uppercase font-bold tracking-widest text-amber-500 mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined">sensors</span>
          连接状态
        </h2>

        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 bg-surface-container-high rounded text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <span class="w-2 h-2 rounded-full" :class="connectionStatus.localApi ? 'bg-green-500' : 'bg-red-500'"></span>
              <span class="text-xs text-zinc-400">本地 FastAPI</span>
            </div>
            <p class="text-sm font-bold" :class="connectionStatus.localApi ? 'text-green-400' : 'text-red-400'">
              {{ connectionStatus.localApi ? '在线' : '离线' }}
            </p>
          </div>

          <div class="p-4 bg-surface-container-high rounded text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <span class="w-2 h-2 rounded-full" :class="connectionStatus.remoteApi ? 'bg-green-500' : 'bg-red-500'"></span>
              <span class="text-xs text-zinc-400">远程服务器</span>
            </div>
            <p class="text-sm font-bold" :class="connectionStatus.remoteApi ? 'text-green-400' : 'text-red-400'">
              {{ connectionStatus.remoteApi ? '在线' : '离线' }}
            </p>
          </div>

          <div class="p-4 bg-surface-container-high rounded text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <span class="w-2 h-2 rounded-full" :class="connectionStatus.tailscale ? 'bg-green-500' : 'bg-red-500'"></span>
              <span class="text-xs text-zinc-400">Tailscale</span>
            </div>
            <p class="text-sm font-bold" :class="connectionStatus.tailscale ? 'text-green-400' : 'text-red-400'">
              {{ connectionStatus.tailscale ? '已连接' : '未连接' }}
            </p>
          </div>
        </div>

        <button @click="testConnections"
                :disabled="testing"
                class="mt-4 w-full py-2 bg-amber-500/20 text-amber-500 rounded hover:bg-amber-500/30 transition-all disabled:opacity-50">
          <span v-if="testing" class="flex items-center justify-center gap-2">
            <span class="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
            测试中...
          </span>
          <span v-else>重新测试连接</span>
        </button>
      </section>

      <!-- 服务器配置 -->
      <section class="bg-surface-container-low rounded-lg p-6 border border-white/5">
        <h2 class="font-label text-sm uppercase font-bold tracking-widest text-amber-500 mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined">dns</span>
          服务器配置
        </h2>

        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-xs text-on-surface-variant uppercase tracking-wider">本地 FastAPI 地址</label>
            <input v-model="config.localApiUrl" type="text"
                   class="w-full bg-surface-container-high border border-outline-variant rounded-sm px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors">
          </div>

          <div class="space-y-2">
            <label class="text-xs text-on-surface-variant uppercase tracking-wider">远程服务器地址 (Tailscale)</label>
            <input v-model="config.remoteApiUrl" type="text"
                   placeholder="http://100.x.x.x:8000"
                   class="w-full bg-surface-container-high border border-outline-variant rounded-sm px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors">
            <p class="text-[10px] text-zinc-500">输入 Tailscale 分配的虚拟 IP 地址</p>
          </div>

          <div class="space-y-2">
            <label class="text-xs text-on-surface-variant uppercase tracking-wider">请求超时 (秒)</label>
            <input v-model.number="config.timeout" type="number" min="5" max="120"
                   class="w-full bg-surface-container-high border border-outline-variant rounded-sm px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors">
          </div>
        </div>
      </section>

      <!-- 截图配置 -->
      <section class="bg-surface-container-low rounded-lg p-6 border border-white/5">
        <h2 class="font-label text-sm uppercase font-bold tracking-widest text-amber-500 mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined">screenshot_monitor</span>
          截图配置
        </h2>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-on-surface-variant">自动截图模式</span>
            <button @click="toggleAutoCapture"
                    :class="['w-12 h-6 rounded-full transition-colors relative', autoCapture ? 'bg-amber-500' : 'bg-zinc-700']">
              <span :class="['absolute top-1 w-4 h-4 bg-white rounded-full transition-transform', autoCapture ? 'translate-x-7' : 'translate-x-1']"></span>
            </button>
          </div>

          <div class="space-y-2" v-if="autoCapture">
            <label class="text-xs text-on-surface-variant uppercase tracking-wider">截图间隔 (秒)</label>
            <div class="flex items-center gap-4">
              <input v-model.number="captureInterval" type="range" min="1" max="60"
                     class="flex-1 accent-amber-500">
              <span class="text-sm text-amber-500 w-12">{{ captureInterval }}s</span>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs text-on-surface-variant uppercase tracking-wider">目标窗口标题 (可选)</label>
            <input v-model="config.windowTitle" type="text" placeholder="ELDEN RING"
                   class="w-full bg-surface-container-high border border-outline-variant rounded-sm px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors">
            <p class="text-[10px] text-zinc-500">留空则截取全屏</p>
          </div>
        </div>
      </section>

      <!-- 情感配置 -->
      <section class="bg-surface-container-low rounded-lg p-6 border border-white/5">
        <h2 class="font-label text-sm uppercase font-bold tracking-widest text-amber-500 mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined">psychology</span>
          情感模式
        </h2>

        <div class="grid grid-cols-3 gap-3">
          <button v-for="mode in emotionModes" :key="mode.value"
                  @click="setEmotionMode(mode.value)"
                  :class="['p-4 rounded-sm text-left transition-all border', currentEmotion === mode.value
                    ? 'bg-amber-500/20 border-amber-500'
                    : 'bg-surface-container-high border-transparent hover:border-white/10']">
            <span class="block text-sm font-bold text-on-surface">{{ mode.label }}</span>
            <span class="block text-[10px] text-on-surface-variant mt-1">{{ mode.desc }}</span>
          </button>
        </div>
      </section>

      <!-- TTS 语音配置 -->
      <section class="bg-surface-container-low rounded-lg p-6 border border-white/5">
        <h2 class="font-label text-sm uppercase font-bold tracking-widest text-amber-500 mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined">volume_up</span>
          语音播报
        </h2>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-sm text-on-surface-variant">启用语音播报</span>
              <span class="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-500 rounded">{{ ttsAvailable ? '可用' : '不可用' }}</span>
            </div>
            <button @click="toggleTTS"
                    :disabled="!ttsAvailable"
                    :class="['w-12 h-6 rounded-full transition-colors relative', ttsEnabled ? 'bg-amber-500' : 'bg-zinc-700']">
              <span :class="['absolute top-1 w-4 h-4 bg-white rounded-full transition-transform', ttsEnabled ? 'translate-x-7' : 'translate-x-1']"></span>
            </button>
          </div>

          <div class="space-y-2" v-if="ttsEnabled">
            <label class="text-xs text-on-surface-variant uppercase tracking-wider">语速</label>
            <div class="flex items-center gap-4">
              <input v-model.number="ttsSpeed" type="range" min="0.5" max="2" step="0.1"
                     class="flex-1 accent-amber-500"
                     @change="updateTTSConfig"
              >
              <span class="text-sm text-amber-500 w-12">{{ ttsSpeed }}x</span>
            </div>
          </div>

          <div class="space-y-2" v-if="ttsEnabled">
            <label class="text-xs text-on-surface-variant uppercase tracking-wider">音量</label>
            <div class="flex items-center gap-4">
              <input v-model.number="ttsVolume" type="range" min="0" max="1" step="0.1"
                     class="flex-1 accent-amber-500"
                     @change="updateTTSConfig"
              >
              <span class="text-sm text-amber-500 w-12">{{ Math.round(ttsVolume * 100) }}%</span>
            </div>
          </div>

          <div class="pt-4 border-t border-white/5" v-if="ttsEnabled">
            <button @click="testTTS"
                    :disabled="testingTTS"
                    class="w-full py-2 bg-amber-500/20 text-amber-500 rounded hover:bg-amber-500/30 transition-all disabled:opacity-50"
            >
              {{ testingTTS ? '测试中...' : '测试语音播报' }}
            </button>
          </div>
        </div>
      </section>

      <!-- 悬浮窗配置 -->
      <section class="bg-surface-container-low rounded-lg p-6 border border-white/5">
        <h2 class="font-label text-sm uppercase font-bold tracking-widest text-amber-500 mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined">picture_in_picture</span>
          悬浮窗
        </h2>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-sm text-on-surface-variant">显示悬浮窗</span>
              <span class="text-[10px] px-2 py-0.5 bg-zinc-700 text-zinc-400 rounded">Ctrl+Shift+K</span>
            </div>
            <div @click.stop="toggleOverlay"
                 class="w-12 h-6 rounded-full transition-colors relative cursor-pointer select-none z-10"
                 :class="overlayVisible ? 'bg-amber-500' : 'bg-zinc-700'"
                 style="min-width: 48px;">
              <span class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200"
                    :style="{ transform: overlayVisible ? 'translateX(28px)' : 'translateX(4px)' }"></span>
            </div>
          </div>

          <p class="text-[10px] text-zinc-500">
            悬浮窗可以在游戏或其他应用上方显示，方便实时对话和截图
          </p>
        </div>
      </section>

      <!-- 保存按钮 -->
      <div class="flex justify-end gap-3 pt-4">
        <button @click="resetConfig"
                class="px-4 py-2 rounded-sm text-sm text-zinc-400 hover:text-on-surface transition-colors">
          恢复默认
        </button>
        <button @click="saveConfig"
                :disabled="saving"
                class="bg-primary-container text-on-primary px-6 py-2 rounded-sm text-sm font-label font-bold tracking-widest hover:brightness-110 transition-all disabled:opacity-50">
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'
import { appStore, EmotionMode } from '../stores/app'
import { setApiConfig, getApiConfig, testLocalConnection, testRemoteConnection } from '../services/api'
import { getTTSConfig, saveTTSConfig, isTTSAvailable, speak } from '../services/tts'
import { toast } from '../utils/toast'

// 情感模式选项
const emotionModes = [
  { value: 'sarcastic' as EmotionMode, label: '毒舌', desc: '讽刺、尖锐但准确' },
  { value: 'nurturing' as EmotionMode, label: '养成', desc: '温柔、耐心、鼓励' },
  { value: 'omniscient' as EmotionMode, label: '全知', desc: '冷静、客观、分析' }
]

// 配置数据
const config = reactive({
  localApiUrl: 'http://localhost:8000',
  remoteApiUrl: '',
  timeout: 30,
  windowTitle: ''
})

// 状态
const currentEmotion = ref<EmotionMode>('sarcastic')
const autoCapture = ref(false)
const captureInterval = ref(5)
const saving = ref(false)
const testing = ref(false)
const connectionStatus = reactive({
  localApi: false,
  remoteApi: false,
  tailscale: false
})

// TTS 状态
const ttsEnabled = ref(false)
const ttsSpeed = ref(1.0)
const ttsVolume = ref(0.8)
const ttsAvailable = ref(false)
const testingTTS = ref(false)

// 悬浮窗状态
const overlayVisible = ref(false)

// 加载配置
onMounted(() => {
  const apiConfig = getApiConfig()
  config.localApiUrl = apiConfig.localApiUrl
  config.remoteApiUrl = apiConfig.remoteApiUrl
  config.timeout = apiConfig.timeout / 1000

  currentEmotion.value = appStore.state.emotionMode
  autoCapture.value = appStore.state.autoCapture
  captureInterval.value = appStore.state.captureInterval

  // 加载 TTS 配置
  const ttsConfig = getTTSConfig()
  ttsEnabled.value = ttsConfig.enabled
  ttsSpeed.value = ttsConfig.speed
  ttsVolume.value = ttsConfig.volume

  // 检查 TTS 可用性
  isTTSAvailable().then(available => {
    ttsAvailable.value = available
  })

  // 测试连接（延迟执行，避免阻塞页面渲染）
  setTimeout(() => {
    testConnections()
  }, 100)
})

// 带超时的测试函数
async function testWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | false> {
  return Promise.race([
    promise.catch(() => false),
    new Promise<false>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeoutMs)
    ).catch(() => false)
  ]) as Promise<T | false>
}

// 测试连接
async function testConnections() {
  testing.value = true

  try {
    // 分别测试，带5秒超时
    const local = await testWithTimeout(testLocalConnection(), 5000).catch(() => false)
    const remote = await testWithTimeout(testRemoteConnection(), 5000).catch(() => false)

    connectionStatus.localApi = Boolean(local)
    connectionStatus.remoteApi = Boolean(remote)
    connectionStatus.tailscale = Boolean(remote)  // 如果远程能连上，说明 Tailscale 正常

    appStore.updateConnection({
      localApi: Boolean(local),
      remoteApi: Boolean(remote),
      tailscale: Boolean(remote)
    })
  } catch (error) {
    console.error('[Settings] 连接测试失败:', error)
  } finally {
    testing.value = false
  }
}

// 设置情感模式
function setEmotionMode(mode: EmotionMode) {
  currentEmotion.value = mode
  appStore.setEmotionMode(mode)
}

// 切换自动截图
function toggleAutoCapture() {
  autoCapture.value = !autoCapture.value
  appStore.setAutoCapture(autoCapture.value)
}

// 保存配置
async function saveConfig() {
  saving.value = true

  setApiConfig({
    localApiUrl: config.localApiUrl,
    remoteApiUrl: config.remoteApiUrl,
    timeout: config.timeout * 1000
  })

  appStore.setCaptureInterval(captureInterval.value)

  // 重新测试连接
  await testConnections()

  saving.value = false
}

// 恢复默认
function resetConfig() {
  config.localApiUrl = 'http://localhost:8000'
  config.remoteApiUrl = ''
  config.timeout = 30
  currentEmotion.value = 'sarcastic'
  autoCapture.value = false
  captureInterval.value = 5
  ttsEnabled.value = false
  ttsSpeed.value = 1.0
  ttsVolume.value = 0.8
  updateTTSConfig()
}

// TTS 相关
function toggleTTS() {
  ttsEnabled.value = !ttsEnabled.value
  updateTTSConfig()
}

function updateTTSConfig() {
  saveTTSConfig({
    enabled: ttsEnabled.value,
    speed: ttsSpeed.value,
    volume: ttsVolume.value
  })
}

async function testTTS() {
  testingTTS.value = true
  await speak('这是一个语音测试，如果你听到这段话，说明语音播报功能正常工作。', true)
  testingTTS.value = false
}

// 悬浮窗控制
async function toggleOverlay() {
  const newState = !overlayVisible.value
  console.log('[Settings] 切换悬浮窗:', newState)

  try {
    if (newState) {
      // 打开悬浮窗
      await invoke('create_overlay_window')
      overlayVisible.value = true
      toast.success('悬浮窗已打开')
    } else {
      // 关闭悬浮窗
      await invoke('close_overlay_window')
      overlayVisible.value = false
      toast.success('悬浮窗已关闭')
    }
  } catch (error: any) {
    console.error('[Settings] 切换悬浮窗失败:', error)
    toast.error('悬浮窗操作失败', error.toString())
  }
}
</script>
