<template>
  <!-- 记忆地图详细视图 -->
  <div class="h-full p-6 flex gap-6">
    <!-- 左侧：拓扑地图 -->
    <div class="flex-1 signature-gradient-border rounded-lg relative overflow-hidden">
      <div class="absolute top-4 left-4 z-10">
        <h2 class="font-headline text-xl font-bold text-amber-500">神经拓扑</h2>
        <p class="font-label text-[10px] text-zinc-400 uppercase tracking-tighter">
          地形扫描 // 实时重构
        </p>
      </div>

      <!-- 地图内容 -->
      <div class="w-full h-full p-8 pt-20">
        <div class="w-full h-full border border-amber-500/20 rounded-lg relative
                    bg-gradient-to-br from-amber-500/5 to-transparent">

          <!-- 地图节点 -->
          <div v-for="(node, i) in mapNodes" :key="i"
               class="absolute p-2 bg-surface-container-high border rounded-sm
                      hover:border-amber-500 transition-all cursor-pointer"
               :class="node.active ? 'border-amber-500' : 'border-white/10'"
               :style="{ top: node.y, left: node.x }"
               @click="selectNode(node)">
            <span class="font-label text-[10px]" :class="node.active ? 'text-amber-500' : 'text-zinc-400'">
              {{ node.name }}
            </span>
          </div>

          <!-- 连接线 SVG -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none">
            <line v-for="(link, i) in nodeLinks" :key="i"
                  :x1="link.x1" :y1="link.y1" :x2="link.x2" :y2="link.y2"
                  stroke="rgba(255, 191, 0, 0.2)" stroke-width="1" />
          </svg>
        </div>
      </div>
    </div>

    <!-- 右侧：节点详情 -->
    <div class="w-80 flex flex-col gap-4">
      <!-- 选中节点信息 -->
      <div class="flex-1 bg-surface-container-low rounded-lg p-4 border border-white/5">
        <h3 class="font-label text-xs uppercase font-bold tracking-widest text-amber-500 mb-4">
          节点详情
        </h3>

        <div v-if="selectedNode" class="space-y-4">
          <div>
            <span class="text-[10px] text-zinc-500 uppercase">名称</span>
            <p class="text-sm text-on-surface font-bold">{{ selectedNode.name }}</p>
          </div>

          <div>
            <span class="text-[10px] text-zinc-500 uppercase">类型</span>
            <p class="text-xs text-on-surface-variant">{{ selectedNode.type }}</p>
          </div>

          <div>
            <span class="text-[10px] text-zinc-500 uppercase">置信度</span>
            <div class="w-full h-1 bg-zinc-800 rounded-full mt-1">
              <div class="h-full bg-amber-500 rounded-full"
                   :style="{ width: selectedNode.confidence + '%' }"></div>
            </div>
            <span class="text-[10px] text-amber-500">{{ selectedNode.confidence }}%</span>
          </div>

          <div class="pt-4 border-t border-white/10">
            <span class="text-[10px] text-zinc-500 uppercase">描述</span>
            <p class="text-xs text-on-surface-variant mt-1 leading-relaxed">
              {{ selectedNode.description }}
            </p>
          </div>
        </div>

        <div v-else class="text-center py-8 text-zinc-500">
          <span class="material-symbols-outlined text-4xl mb-2">touch_app</span>
          <p class="text-xs">选择一个节点查看详情</p>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="h-48 bg-surface-container-low rounded-lg p-4 border border-white/5">
        <h3 class="font-label text-xs uppercase font-bold tracking-widest text-amber-500 mb-4">
          区域统计
        </h3>

        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-3 bg-surface-container-high rounded">
            <span class="text-2xl font-bold text-amber-500">{{ mapNodes.length }}</span>
            <p class="text-[10px] text-zinc-500 uppercase mt-1">记忆节点</p>
          </div>

          <div class="text-center p-3 bg-surface-container-high rounded">
            <span class="text-2xl font-bold text-amber-500">{{ activeNodes }}</span>
            <p class="text-[10px] text-zinc-500 uppercase mt-1">活跃节点</p>
          </div>

          <div class="text-center p-3 bg-surface-container-high rounded col-span-2">
            <span class="text-xl font-bold text-amber-500">{{ coverage }}%</span>
            <p class="text-[10px] text-zinc-500 uppercase mt-1">地图覆盖率</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 地图节点
interface MapNode {
  id: string
  name: string
  type: string
  x: string
  y: string
  active: boolean
  confidence: number
  description: string
}

const mapNodes = ref<MapNode[]>([
  {
    id: '1', name: '宁姆格福的记忆', type: '探索记忆',
    x: '20%', y: '30%', active: true, confidence: 94,
    description: '初次踏入交界地的记忆，充满了对未知的探索欲望。'
  },
  {
    id: '2', name: '盖利德遭遇战', type: '战斗记忆',
    x: '60%', y: '50%', active: true, confidence: 87,
    description: '与碎星拉塔恩的史诗战斗，神经链接极度活跃。'
  },
  {
    id: '3', name: '罗德尔数据扫描', type: '地形记忆',
    x: '40%', y: '70%', active: false, confidence: 72,
    description: '王城罗德尔的地形扫描数据，包含主要路径信息。'
  },
  {
    id: '4', name: '史东薇尔城堡', type: '地标记忆',
    x: '15%', y: '20%', active: false, confidence: 68,
    description: '风暴城的详细地图数据，包含隐藏路径。'
  },
  {
    id: '5', name: '黄金树根部', type: '关键记忆',
    x: '50%', y: '80%', active: true, confidence: 91,
    description: '艾尔登法环的核心区域，神经密度极高。'
  }
])

// 节点连接
const nodeLinks = ref([
  { x1: '25%', y1: '35%', x2: '45%', y2: '75%' },
  { x1: '45%', y1: '75%', x2: '55%', y2: '55%' },
  { x1: '55%', y1: '55%', x2: '65%', y2: '50%' },
  { x1: '20%', y1: '25%', x2: '25%', y2: '35%' }
])

// 选中节点
const selectedNode = ref<MapNode | null>(null)

// 选择节点
const selectNode = (node: MapNode) => {
  selectedNode.value = node
  mapNodes.value.forEach(n => n.active = (n.id === node.id))
}

// 活跃节点数
const activeNodes = computed(() => mapNodes.value.filter(n => n.active).length)

// 覆盖率
const coverage = computed(() => Math.round(
  mapNodes.value.reduce((sum, n) => sum + n.confidence, 0) / mapNodes.value.length
))
</script>
