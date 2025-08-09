@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   停止陆家花园服务器
echo ========================================
echo.

:: 查找并停止 Node.js 进程
echo 🔍 正在查找 Node.js 进程...
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq node.exe" /fo table /nh 2^>nul') do (
    echo 找到进程 PID: %%i
    taskkill /f /pid %%i >nul 2>&1
    if errorlevel 1 (
        echo ❌ 停止进程失败
    ) else (
        echo ✅ 进程已停止
    )
)

:: 检查端口 3000 是否被占用
echo.
echo 🔍 检查端口 3000 状态...
netstat -an | findstr :3000 >nul
if errorlevel 1 (
    echo ✅ 端口 3000 已释放
) else (
    echo ⚠️  端口 3000 仍被占用
    echo 可能需要手动结束进程
)

echo.
echo ========================================
echo   服务器已停止
echo ========================================
pause
