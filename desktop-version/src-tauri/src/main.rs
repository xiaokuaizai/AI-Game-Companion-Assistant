// KUAIZAI_OS Tauri 主程序入口

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{Manager, WindowBuilder, GlobalShortcutManager};
use std::process::Command;
use std::sync::Mutex;
use screenshots::Screen;
use base64::{engine::general_purpose::STANDARD, Engine};

// TTS 进程管理
struct TTSState {
    current_process: Option<std::process::Child>,
}

impl Default for TTSState {
    fn default() -> Self {
        TTSState {
            current_process: None,
        }
    }
}

// 切换悬浮窗显示/隐藏
#[tauri::command]
fn toggle_overlay_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_window("overlay") {
        // 窗口已存在，切换显示/隐藏
        if window.is_visible().unwrap_or(false) {
            window.hide().map_err(|e| e.to_string())?;
        } else {
            window.show().map_err(|e| e.to_string())?;
            window.set_always_on_top(true).map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
        }
    } else {
        // 窗口不存在，创建它
        create_overlay_window(app_handle)?;
    }
    Ok(())
}

// 创建悬浮窗
#[tauri::command]
fn create_overlay_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    // 如果窗口已存在，直接显示
    if let Some(window) = app_handle.get_window("overlay") {
        window.show().map_err(|e| e.to_string())?;
        window.set_always_on_top(true).map_err(|e| e.to_string())?;
        return Ok(());
    }

    // 获取主显示器（物理位置为0,0的屏幕）
    let screens = Screen::all().map_err(|e| format!("获取屏幕失败: {}", e))?;
    if screens.is_empty() {
        return Err("没有找到屏幕".to_string());
    }

    // 打印所有屏幕信息以便调试
    println!("[Overlay] 检测到 {} 个屏幕", screens.len());
    for (i, s) in screens.iter().enumerate() {
        println!("[Overlay] 屏幕[{}]: 位置({},{}) 大小({}x{})",
            i, s.display_info.x, s.display_info.y, s.display_info.width, s.display_info.height);
    }

    // 找到主屏幕（x=0, y=0）
    let screen = screens.iter()
        .find(|s| s.display_info.x == 0 && s.display_info.y == 0)
        .or_else(|| screens.first())
        .ok_or("无法获取屏幕信息")?;

    let screen_width = screen.display_info.width as f64;
    let screen_height = screen.display_info.height as f64;
    let window_width = 420.0;
    let window_height = 650.0;

    // 放在屏幕右侧（确保不超出屏幕）
    let x = (screen_width - window_width - 20.0).max(50.0);
    let y = 50.0_f64.min((screen_height - window_height - 50.0).max(50.0));

    println!("[Overlay] 创建窗口: 位置({}, {}), 大小({}x{})", x, y, window_width, window_height);

    WindowBuilder::new(
        &app_handle,
        "overlay",
        tauri::WindowUrl::App("/overlay".into())
    )
    .title("KUAIZAI Overlay")
    .inner_size(window_width, window_height)
    .position(x, y)
    .decorations(false)
    .always_on_top(true)
    .skip_taskbar(true)
    .resizable(true)
    .visible(true)
    .build()
    .map_err(|e| format!("创建窗口失败: {}", e))?;

    Ok(())
}

// 关闭悬浮窗
#[tauri::command]
fn close_overlay_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_window("overlay") {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

// TTS 语音播报
#[tauri::command]
fn speak_text(
    text: String,
    voice: String,
    speed: f32,
    volume: f32,
    state: tauri::State<Mutex<TTSState>>,
) -> Result<(), String> {
    // 先停止之前的播放
    stop_speaking(state.clone())?;

    // 这里调用 Piper TTS 或系统 TTS
    // 示例：通过命令行调用（需要根据实际 TTS 安装路径调整）
    #[cfg(target_os = "windows")]
    {
        // Windows: 使用 PowerShell 的 SAPI
        let ps_script = format!(
            r#"Add-Type -AssemblyName System.Speech; $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer; $synth.Speak("{}");"#,
            text.replace('"', "\"")
        );

        let child = Command::new("powershell.exe")
            .args(["-Command", &ps_script])
            .spawn()
            .map_err(|e| format!("启动 TTS 失败: {}", e))?;

        if let Ok(mut state) = state.lock() {
            state.current_process = Some(child);
        }
    }

    Ok(())
}

// 停止 TTS
#[tauri::command]
fn stop_speaking(state: tauri::State<Mutex<TTSState>>) -> Result<(), String> {
    if let Ok(mut state) = state.lock() {
        if let Some(mut child) = state.current_process.take() {
            let _ = child.kill();
        }
    }
    Ok(())
}

// 截取屏幕并返回 Base64
#[tauri::command]
fn capture_screenshot() -> Result<serde_json::Value, String> {
    // 获取主屏幕
    let screens = Screen::all().map_err(|e| format!("获取屏幕失败: {}", e))?;

    if screens.is_empty() {
        return Err("没有找到屏幕".to_string());
    }

    // 使用第一个屏幕
    let screen = &screens[0];

    // 截取全屏
    let image = screen.capture().map_err(|e| format!("截图失败: {}", e))?;

    // 转换为 PNG 字节
    let mut png_bytes: Vec<u8> = Vec::new();
    {
        use std::io::Cursor;
        let mut cursor = Cursor::new(&mut png_bytes);
        image.write_to(&mut cursor, image::ImageOutputFormat::Png)
            .map_err(|e| format!("编码 PNG 失败: {}", e))?;
    }

    // 转换为 Base64 (使用新的 API)
    let base64_image = STANDARD.encode(&png_bytes);

    Ok(serde_json::json!({
        "success": true,
        "image": base64_image,
        "width": image.width(),
        "height": image.height()
    }))
}

// 获取屏幕尺寸
#[tauri::command]
fn get_screen_size() -> Result<serde_json::Value, String> {
    let screens = Screen::all().map_err(|e| format!("获取屏幕失败: {}", e))?;

    if screens.is_empty() {
        return Err("没有找到屏幕".to_string());
    }

    let screen = &screens[0];

    Ok(serde_json::json!({
        "width": screen.display_info.width,
        "height": screen.display_info.height
    }))
}

// 检查 TTS 是否可用
#[tauri::command]
fn check_tts_available() -> bool {
    #[cfg(target_os = "windows")]
    {
        // Windows 通常有 SAPI
        true
    }
    #[cfg(not(target_os = "windows"))]
    {
        // 其他系统需要检查 Piper 是否安装
        Command::new("which")
            .arg("piper")
            .output()
            .map(|output| output.status.success())
            .unwrap_or(false)
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // 注册全局快捷键
            let handle = app.handle();
            let mut shortcut_manager = handle.global_shortcut_manager();

            // Ctrl+Shift+K - 切换悬浮窗
            shortcut_manager
                .register("Ctrl+Shift+K", move || {
                    if let Err(e) = toggle_overlay_window(handle.clone()) {
                        eprintln!("切换悬浮窗失败: {}", e);
                    }
                })
                .unwrap_or_else(|e| eprintln!("注册快捷键失败: {}", e));

            // Ctrl+Shift+S - 截图
            let handle2 = app.handle();
            shortcut_manager
                .register("Ctrl+Shift+S", move || {
                    handle2.emit_all("global-shortcut-screenshot", "").unwrap_or_default();
                })
                .unwrap_or_else(|e| eprintln!("注册截图快捷键失败: {}", e));

            Ok(())
        })
        .manage(Mutex::new(TTSState::default()))
        .invoke_handler(tauri::generate_handler![
            toggle_overlay_window,
            create_overlay_window,
            close_overlay_window,
            speak_text,
            stop_speaking,
            check_tts_available,
            capture_screenshot,
            get_screen_size
        ])
        .run(tauri::generate_context!())
        .expect("运行 Tauri 应用时出错");
}
