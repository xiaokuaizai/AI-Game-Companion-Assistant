/**
 * 路由配置
 * 定义应用的所有页面路由
 */
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import MemoryMap from '../views/MemoryMap.vue'
import RealtimeChat from '../views/RealtimeChat.vue'
import Logs from '../views/Logs.vue'
import Settings from '../views/Settings.vue'
import Overlay from '../views/Overlay.vue'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: '仪表盘' }
  },
  {
    path: '/memory',
    name: 'MemoryMap',
    component: MemoryMap,
    meta: { title: '记忆地图' }
  },
  {
    path: '/chat',
    name: 'RealtimeChat',
    component: RealtimeChat,
    meta: { title: '实时对话' }
  },
  {
    path: '/logs',
    name: 'Logs',
    component: Logs,
    meta: { title: '日志' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { title: '设置' }
  },
  {
    path: '/overlay',
    name: 'Overlay',
    component: Overlay,
    meta: { title: '悬浮窗', transparent: true }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
