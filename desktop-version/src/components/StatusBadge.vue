<template>
  <!-- 状态徽章组件 -->
  <span :class="[
    'font-label font-medium text-[10px] tracking-tight',
    typeClasses[type]
  ]">
    {{ text }}
  </span>
</template>

<script setup lang="ts">
// 组件属性
interface Props {
  text: string
  type: 'success' | 'info' | 'warning' | 'error'
}

const props = defineProps<Props>()

// 类型样式映射
const typeClasses = {
  success: 'text-amber-400 font-bold border-b border-amber-500',
  info: 'text-zinc-400',
  warning: 'text-orange-400',
  error: 'text-red-400'
}
</script>
