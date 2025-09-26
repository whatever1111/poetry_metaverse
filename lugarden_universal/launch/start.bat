@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   陆家花园 - 周春秋诗歌管理系统
echo ========================================
echo.

:: 切换到正确的目录
cd /d "%~dp0..\application"

:: 检查目录是否存在
if not exist "package.json" (
    echo ❌ 错误：找不到 package.json 文件
    echo 请确保在正确的项目目录中运行此脚本
    pause
    exit /b 1
)

echo 📁 当前目录: %CD%
echo.

:: 检查 node_modules 是否存在
if not exist "node_modules" (
    echo 📦 正在安装依赖包...
    npm install
    if errorlevel 1 (
        echo ❌ npm install 失败
        pause
        exit /b 1
    )
    echo ✅ 依赖包安装完成
    echo.
) else (
    echo ✅ 依赖包已存在，跳过安装
    echo.
)

:: 检查 .env.local 文件是否存在
if not exist ".env.local" (
    echo ⚠️  警告：未找到 .env.local 文件
    echo 请确保已创建个人配置文件
    echo.
)

:: 启动服务器
echo 🚀 正在启动陆家花园...
echo.
echo 访问地址：
echo   主页: http://localhost:3000
echo   管理后台: http://localhost:3000/admin
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

npm start

:: 如果 npm start 失败
if errorlevel 1 (
    echo.
    echo ❌ 服务器启动失败
    echo 请检查错误信息
    pause
    exit /b 1
)
