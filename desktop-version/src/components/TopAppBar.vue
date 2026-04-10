<template>
  <!-- 顶部应用栏 - 玻璃拟态效果 -->
  <header class="fixed top-0 right-0 left-64 z-50 flex justify-between items-center px-6 h-14
                 bg-zinc-950/40 backdrop-blur-md border-b border-orange-600/30
                 shadow-inner shadow-amber-500/5">

    <!-- 左侧：系统标识和状态 -->
    <div class="flex items-center gap-6">
      <span class="text-lg font-black text-amber-500 italic px-2">KUAIZAI_OS</span>

      <div class="hidden lg:flex gap-4">
        <StatusBadge text="Tailscale: 已连接" type="success" />
        <StatusBadge text="FastAPI: 在线" type="info" />
        <StatusBadge text="性格：毒舌" type="warning" />
      </div>
    </div>

    <!-- 右侧：操作按钮 -->
    <div class="flex items-center gap-4">
      <!-- 信号指示器 -->
      <SignalIndicator :delay="signalDelay" />

      <!-- 启动按钮 -->
      <button @click="launchAgent"
              class="bg-primary-container text-on-primary px-4 py-1.5 rounded-sm
                     text-[10px] font-label font-bold tracking-widest
                     hover:brightness-110 transition-all active:scale-95">
        启动 AGENT
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StatusBadge from './StatusBadge.vue'
import SignalIndicator from './SignalIndicator.vue'

// 信号延迟
const signalDelay = ref(4)

// 启动 Agent
const launchAgent = () => {
  console.log('[KUAIZAI] 启动 Agent...')
  // TODO: 调用 Tauri API 启动后端服务
}
</script>
