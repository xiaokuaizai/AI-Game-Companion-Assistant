<template>
  <!-- 侧边导航栏 - 固定左侧，玻璃拟态效果 -->
  <aside class="fixed left-0 top-0 h-full z-40 flex flex-col w-64
                 border-r border-amber-500/20 bg-zinc-950/60 backdrop-blur-xl
                 shadow-[0_0_20px_-5px_rgba(255,191,0,0.15)]">

    <!-- Logo 区域 -->
    <div class="p-6">
      <div class="text-xl font-bold tracking-tighter text-amber-500 italic">KUAIZAI</div>
      <div class="font-headline uppercase tracking-widest text-[10px] text-zinc-500 mt-1">
        V.01-分布式
      </div>
    </div>

    <!-- 导航菜单 -->
    <nav class="flex-1 mt-4 space-y-1 px-2">
      <RouterLink v-for="item in navItems" :key="item.path"
                  :to="item.path"
                  :class="[
                    'flex items-center gap-3 px-4 py-3 transition-all',
                    $route.path === item.path
                      ? 'text-amber-500 bg-amber-500/10 border-r-2 border-orange-600'
                      : 'text-zinc-500 hover:text-amber-200 hover:bg-zinc-800/50'
                  ]">
        <span class="material-symbols-outlined" :class="{ 'material-symbols-filled': $route.path === item.path }">
          {{ item.icon }}
        </span>
        <span class="font-label uppercase text-xs tracking-widest">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- 用户状态卡片 -->
    <div class="p-4 border-t border-amber-500/10">
      <div class="flex items-center gap-3 p-2 rounded-sm bg-surface-container-low">
        <div class="w-8 h-8 rounded-sm bg-amber-500/20 border border-amber-500/30
                    flex items-center justify-center">
          <span class="material-symbols-outlined text-amber-500 text-sm">smart_toy</span>
        </div>
        <div>
          <p class="text-[10px] font-label uppercase text-amber-500">Unit-01 状态</p>
          <p class="text-[9px] text-zinc-400 font-mono">{{ unitStatus }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 导航项配置
const navItems = [
  { path: '/', label: '仪表盘', icon: 'grid_view' },
  { path: '/memory', label: '记忆地图', icon: 'psychology' },
  { path: '/chat', label: '实时对话', icon: 'chat' },
  { path: '/logs', label: '日志', icon: 'terminal' },
  { path: '/settings', label: '设置', icon: 'settings' }
]

// 单元状态
const unitStatus = ref('讽刺模式已加载')
</script>
