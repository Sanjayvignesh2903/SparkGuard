@echo off
echo ========================================================
echo   IntelliClaim Frontend Service Runner
echo   React 19 + TypeScript + Vite + Tailwind CSS
echo ========================================================

cd /d "%~dp0frontend"

echo Checking and installing npm packages...
call npm install

echo.
echo ========================================================
echo   Starting Vite Dev Server at http://localhost:5173
echo ========================================================
call npm run dev

