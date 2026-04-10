<template>
  <!-- 信号延迟指示器 -->
  <div class="flex items-center gap-1" title="信号延迟">
    <div v-for="i in 3" :key="i"
         class="w-1 rounded-sm transition-all duration-300"
         :class="[
           i <= activeBars ? 'bg-amber-500' : 'bg-amber-500/30',
           barHeights[i - 1]
         ]">
    </div>
    <span class="ml-2 font-label text-[10px] text-zinc-500 tracking-tighter uppercase">
      {{ delay }}ms
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 组件属性
interface Props {
  delay: number // 延迟毫秒数
}

const props = defineProps<Props>()

// 根据延迟计算活跃的柱状条数
const activeBars = computed(() => {
  if (props.delay < 10) return 3
  if (props.delay < 50) return 2
  return 1
})

// 柱状条高度
const barHeights = ['h-3', 'h-2', 'h-1']
</script>
