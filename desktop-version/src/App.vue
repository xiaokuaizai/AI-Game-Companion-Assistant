<template>
  <div class="h-screen w-screen overflow-hidden bg-background text-on-background">
    <!-- 遥测网格背景 -->
    <div class="fixed inset-0 telemetry-grid opacity-10 pointer-events-none z-0"></div>

    <!-- 侧边导航栏 -->
    <SideNavBar />

    <!-- 顶部应用栏 -->
    <TopAppBar />

    <!-- 主内容区域 -->
    <main class="ml-64 mt-14 h-[calc(100vh-3.5rem)] overflow-hidden relative z-10">
      <RouterView />
    </main>

    <!-- HUD 底部状态 -->
    <HUDFooter />

    <!-- Toast 通知 -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import SideNavBar from './components/SideNavBar.vue'
import TopAppBar from './components/TopAppBar.vue'
import HUDFooter from './components/HUDFooter.vue'
import Toast from './components/Toast.vue'
</script>
