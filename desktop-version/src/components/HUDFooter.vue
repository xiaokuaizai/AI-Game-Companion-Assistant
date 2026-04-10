<template>
  <!-- HUD 底部状态栏 - 固定在左下角侧边栏旁边 -->
  <div class="fixed bottom-4 left-[272px] pointer-events-none z-50">
    <div class="flex gap-4 items-center">
      <!-- 波形指示器 -->
      <div class="flex items-center gap-0.5">
        <div v-for="i in 5" :key="i" class="waveform-bar"></div>
      </div>

      <span class="font-label text-[10px] text-zinc-500 tracking-tighter uppercase">
        信号延迟: {{ delay }}ms // {{ syncStatus }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 信号延迟和同步状态
const delay = ref(4)
const syncStatus = ref('记忆同步中...')
</script>
