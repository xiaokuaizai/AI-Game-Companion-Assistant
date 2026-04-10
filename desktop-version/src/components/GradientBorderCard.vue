<template>
  <!-- 渐变边框卡片 - 签名效果 -->
  <div class="signature-gradient-border rounded-lg overflow-hidden relative h-full"
       :class="{ 'hover:border-amber-500/50 transition-all': hoverable }"
    <!-- 标题区域 -->
    <div v-if="title || subtitle" class="absolute top-4 left-4 z-10">
      <h2 v-if="title" class="font-headline text-lg font-bold text-amber-500 flex items-center gap-2">
        {{ title }}
        <span v-if="englishTitle" class="text-zinc-500 text-sm font-normal">{{ englishTitle }}</span>
      </h2>
      <p v-if="subtitle" class="font-label text-[10px] text-zinc-400 uppercase tracking-tighter mt-1">
        {{ subtitle }}
      </p>
    </div>

    <!-- 内容插槽 -->
    <div class="w-full h-full" :class="contentClass">
      <slot />
    </div>

    <!-- 坐标/信息覆盖层 -->
    <div v-if="coords" class="absolute bottom-4 right-4 text-right z-10">
      <p class="font-label text-[10px] text-amber-600">{{ coords.x }}</p>
      <p class="font-label text-[10px] text-amber-700">{{ coords.y }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 组件属性
interface Props {
  title?: string
  englishTitle?: string
  subtitle?: string
  coords?: { x: string; y: string }
  contentClass?: string
  hoverable?: boolean
}

defineProps<Props>()
</script>
