@echo off
chcp 65001 >nul
echo ================================
echo 房产估价系统 - 启动脚本
echo ================================
echo.
echo 正在启动开发服务器...
echo 请稍候...
echo.

cd /d "%~dp0"

npx vite --port 3002 --host

echo.
echo 服务器已关闭
pause
