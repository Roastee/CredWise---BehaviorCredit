@echo off
title BehaviorCredit - Full Stack
color 0A
echo.
echo  ╔══════════════════════════════════════╗
echo  ║   BehaviorCredit - Starting Stack   ║
echo  ╚══════════════════════════════════════╝
echo.

:: Kill existing processes on required ports
echo [1/3] Clearing ports 3000 and 5000...
npx kill-port 3000 5000 >nul 2>&1
timeout /t 1 /nobreak >nul

:: Start Backend
echo [2/3] Starting Backend API (port 5000)...
start "BehaviorCredit Backend" cmd /k "cd /d %~dp0backend && node server.js"
timeout /t 2 /nobreak >nul

:: Start Frontend
echo [3/3] Starting Frontend (port 3000)...
start "BehaviorCredit Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo  ✅ Stack starting up...
echo.
echo  Frontend  → http://localhost:3000
echo  Backend   → http://localhost:5000
echo  API Docs  → http://localhost:5000/api/health
echo.
echo  Demo Personas:
echo    Ramesh  ^| Auto Driver  ^| Hindi   ^| Score ~705
echo    Priya   ^| SHG Member   ^| Tamil   ^| Score ~843
echo    Meena   ^| Vendor       ^| Kannada ^| Score ~777
echo.
echo  Press any key to open the app in your browser...
pause >nul
start http://localhost:3000
