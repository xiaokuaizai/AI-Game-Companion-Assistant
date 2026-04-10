@echo off
chcp 65001 >nul
echo ========================================
echo   KUAIZAI_OS 网页版 - 启动脚本
echo ========================================
echo.
echo 正在启动本地服务器...
echo.

REM 检查是否安装了 npx
where npx >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误：未找到 npx，请先安装 Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

echo 服务器地址：
echo   - 本机访问：http://localhost:8080
echo   - 局域网访问：http://%COMPUTERNAME%:8080
echo.
echo 按 Ctrl+C 停止服务器
echo.

REM 使用 npx serve 启动静态服务器
npx serve -l 8080 -s

pause
