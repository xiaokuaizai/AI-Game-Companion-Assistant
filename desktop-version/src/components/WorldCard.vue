<template>
  <!-- 世界/会话卡片 -->
  <button
    :class="[
      'flex flex-col p-4 rounded-sm text-left transition-all relative overflow-hidden cursor-pointer',
      isActive
        ? 'bg-surface-container-high border border-amber-500/40 ring-1 ring-amber-500/20'
        : 'bg-surface-container-low border border-amber-500/10 hover:bg-surface-container-high'
    ]"
  >
    <!-- 活跃指示器 -->
    <div v-if="isActive" class="absolute -top-1 -right-1 flex h-2 w-2">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
    </div>

    <!-- 探索图标 -->
    <div v-else class="absolute top-2 right-2 opacity-10 group-hover:opacity-100 transition-opacity">
      <span class="material-symbols-outlined text-amber-500 text-sm">travel_explore</span>
    </div>

    <!-- 日期标签 -->
    <span class="font-label text-[9px] text-amber-500 mb-1">{{ dateLabel }}</span>

    <!-- 世界名称 -->
    <h4
      :class="[
        'font-headline text-xs font-bold transition-colors',
        isActive ? 'text-on-surface' : 'text-on-surface group-hover:text-primary'
      ]"
    >
      {{ worldName }}
    </h4>

    <!-- 状态信息 -->
    <p class="font-label text-[10px] text-zinc-500 mt-2 truncate">{{ status }}</p>
  </button>
</template>

<script setup lang="ts">
// 组件属性
interface Props {
  dateLabel: string      // 日期标签（如 "2024年1月1日"）
  worldName: string      // 世界名称
  status: string         // 状态信息
  isActive?: boolean     // 是否为当前活跃会话
}

defineProps<Props>()
</script>
