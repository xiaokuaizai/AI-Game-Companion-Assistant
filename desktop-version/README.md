# 🖥️ AI Game Companion Assistant - 桌面版

基于 Tauri + Vue 3 的桌面应用，提供完整的游戏 AI 助手功能。

## ✨ 功能特性

- 🎮 **游戏截图分析** - 支持自动/手动截图，AI 实时分析画面
- 💬 **智能对话** - 基于 Qwen2.5-VL-7B 的大语言模型对话
- 🎭 **毒舌模式** - 独特的 AI 人格，幽默讽刺但有帮助
- 📸 **悬浮窗模式** - 游戏中实时显示 AI 建议
- ⌨️ **全局快捷键** - Ctrl+Shift+K 显示/隐藏，Ctrl+Shift+S 截图
- 🔊 **语音播报** - Windows SAPI 语音合成
- 🔄 **自动更新** - 支持在线更新

## 🚀 快速开始

## 功能特性

- 仪表盘 - 显示系统状态和快速操作
- 实时对话 - 与 AI 助手交互
- 悬浮窗模式 - 游戏中实时显示 AI 建议
- 全局快捷键 - Ctrl+Shift+K 显示/隐藏悬浮窗，Ctrl+Shift+S 截图
- 语音播报 - Windows SAPI 语音合成
- 自动更新 - 支持在线更新

## 快速开始

### 开发模式

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动 Tauri 开发模式（带桌面窗口）
npm run tauri:dev
```

### 构建安装包

```bash
# 生成图标（首次构建需要）
npm run icons

# 构建 Windows 安装包
npm run tauri:build

# 或使用完整构建脚本
scripts/build-installer.bat
```

构建输出：`src-tauri/target/release/bundle/`

## 项目结构

```
src/
├── components/     # UI 组件
│   ├── SideNavBar.vue
│   ├── TopAppBar.vue
│   ├── Toast.vue
│   └── StatusBadge.vue
├── views/          # 页面
│   ├── Dashboard.vue
│   ├── Chat.vue
│   ├── Settings.vue
│   └── Overlay.vue
├── services/       # API 服务
│   ├── api.ts
│   ├── screenshot.ts
│   └── tts.ts
├── stores/         # 状态管理
│   └── app.ts
├── router/         # 路由
│   └── index.ts
└── App.vue

src-tauri/
├── src/
│   └── main.rs     # Rust 后端入口
├── icons/          # 应用图标
├── tauri.conf.json # Tauri 配置
└── Cargo.toml      # Rust 依赖
```

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **桌面框架**: Tauri 1.5
- **构建工具**: Vite 5
- **状态管理**: Pinia 2
- **UI 样式**: TailwindCSS 3
- **路由**: Vue Router 4

## 配置说明

### 开发服务器端口

在 `vite.config.ts` 中配置：

```typescript
export default defineConfig({
  server: {
    port: 5174,  // 修改开发端口
    strictPort: false
  }
})
```

### Tauri 配置

在 `src-tauri/tauri.conf.json` 中配置：

```json
{
  "tauri": {
    "bundle": {
      "identifier": "com.kuaizai.app",
      "shortDescription": "分布式AI游戏助手"
    },
    "windows": {
      "width": 1400,
      "height": 800
    }
  }
}
```

### 自动更新

参考 [UPDATER.md](./UPDATER.md) 配置自动更新功能。

## 部署

参考 [DEPLOY.md](./DEPLOY.md) 了解完整的部署流程。

## 常见问题

### Q: 端口被占用？
A: 修改 `vite.config.ts` 中的 `server.port` 为其他端口。

### Q: 构建失败，提示缺少图标？
A: 运行 `npm run icons` 生成占位图标。

### Q: 如何修改应用名称？
A: 修改 `src-tauri/tauri.conf.json` 中的 `tauri.windows.title`。

### Q: 悬浮窗不显示？
A: 确保已注册全局快捷键，按 Ctrl+Shift+K 切换显示。

## 许可证

MIT License - 详见 [LICENSE](./LICENSE)

## 作者

XIAOKUAIZAI
