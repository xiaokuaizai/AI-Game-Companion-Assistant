<template>
  <!-- 日志视图 -->
  <div class="h-full p-6">
    <div class="h-full flex flex-col bg-surface-container-low rounded-lg border border-white/5 overflow-hidden"
    >

      <!-- 顶部工具栏 -->
      <div class="p-4 bg-surface-container-high border-b border-white/5 flex justify-between items-center"
      >
        <div class="flex items-center gap-4"
        >
          <span class="material-symbols-outlined text-amber-500"
          >terminal</span>
          <h2 class="font-label text-xs uppercase font-bold tracking-widest text-on-surface"
          >系统日志</h2>
        </div>

        <div class="flex items-center gap-2"
        >
          <button v-for="level in logLevels" :key="level.value"
                  @click="toggleLevel(level.value)"
                  :class="[
                    'px-3 py-1 rounded-sm text-[10px] font-label uppercase tracking-wider transition-all',
                    activeLevels.includes(level.value)
                      ? level.activeClass
                      : 'bg-surface-container text-zinc-500 hover:text-zinc-400'
                  ]"
          >
            {{ level.label }}
          </button>

          <div class="w-px h-4 bg-white/10 mx-2"
          >
          </div>

          <button @click="clearLogs"
                  class="p-1.5 text-zinc-500 hover:text-error transition-colors"
                  title="清空日志"
          >
            <span class="material-symbols-outlined text-sm"
          >delete</span>
          </button>
        </div>
      </div>

      <!-- 日志内容 -->
      <div ref="logContainer" class="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1"
      >
        <div v-for="(log, i) in filteredLogs" :key="i"
             :class="[
               'py-1 px-2 rounded flex gap-3 items-start hover:bg-white/5 transition-colors',
               logLevelClasses[log.level]
             ]"
        >
          <span class="text-zinc-500 flex-shrink-0 w-16"
          >{{ log.time }}</span>
          <span class="flex-shrink-0 w-12 font-bold uppercase"
          >[{{ log.level }}]</span>
          <span class="break-all"
          >{{ log.message }}</span>
        </div>
      </div>

      <!-- 底部状态栏 -->
      <div class="p-2 bg-surface-container-high border-t border-white/5 flex justify-between items-center text-[10px] text-zinc-500"
      >
        <span>共 {{ filteredLogs.length }} 条日志</span>
        <span class="flex items-center gap-2"
        >
          <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"
          >
          </span>
          实时更新中
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 日志级别配置
const logLevels = [
  { label: 'INFO', value: 'info', activeClass: 'bg-amber-500/20 text-amber-500' },
  { label: 'WARN', value: 'warn', activeClass: 'bg-orange-500/20 text-orange-500' },
  { label: 'ERROR', value: 'error', activeClass: 'bg-red-500/20 text-red-500' },
  { label: 'DEBUG', value: 'debug', activeClass: 'bg-zinc-500/20 text-zinc-400' }
]

// 激活的日志级别
const activeLevels = ref(['info', 'warn', 'error', 'debug'])

// 切换日志级别
const toggleLevel = (level: string) => {
  if (activeLevels.value.includes(level)) {
    activeLevels.value = activeLevels.value.filter(l => l !== level)
  } else {
    activeLevels.value.push(level)
  }
}

// 日志级别样式
const logLevelClasses: Record<string, string> = {
  info: 'text-on-surface-variant',
  warn: 'text-orange-400',
  error: 'text-red-400',
  debug: 'text-zinc-500'
}

// 日志数据
const logs = ref([
  { time: '14:32:01', level: 'info', message: 'KUAIZAI_OS v1.0 初始化完成' },
  { time: '14:32:02', level: 'info', message: 'FastAPI 服务连接成功: http://localhost:8000' },
  { time: '14:32:03', level: 'info', message: 'Tailscale 网络已连接: 100.x.x.x' },
  { time: '14:32:04', level: 'warn', message: '讽刺模块加载延迟: 120ms' },
  { time: '14:32:05', level: 'info', message: '性格配置加载完成: 毒舌模式' },
  { time: '14:32:06', level: 'debug', message: '记忆地图初始化: 发现 5 个活跃节点' },
  { time: '14:32:07', level: 'info', message: '屏幕捕获模块就绪' },
  { time: '14:32:08', level: 'debug', message: 'DGX Spark 遥测连接建立' },
  { time: '14:32:09', level: 'info', message: '系统状态: 正常运行' },
  { time: '14:32:10', level: 'warn', message: '记忆节点 0xFF12A 置信度偏低: 68%' },
  { time: '14:32:15', level: 'debug', message: '收到用户输入: "你好"' },
  { time: '14:32:16', level: 'info', message: 'Agent 响应生成中...' },
  { time: '14:32:17', level: 'debug', message: 'LLM 推理时间: 1.2s' },
  { time: '14:32:18', level: 'info', message: '响应已发送' },
  { time: '14:33:05', level: 'error', message: '连接超时: screen_capture_module.py' },
  { time: '14:33:06', level: 'info', message: '尝试重新连接...' },
  { time: '14:33:08', level: 'info', message: '连接恢复' }
])

// 过滤后的日志
const filteredLogs = computed(() => {
  return logs.value.filter(log => activeLevels.value.includes(log.level))
})

// 清空日志
const clearLogs = () => {
  logs.value = []
}
</script>
