@echo off
REM Stripe Invoice Management Desktop App Startup Script for Windows

echo 🚀 Starting Stripe Invoice Management Desktop App...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js (v16 or higher) first.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

REM Start the development server
echo 🌐 Starting React development server...
start /b npm start

REM Wait a moment for React to start
timeout /t 5 /nobreak >nul

REM Start Electron
echo 🖥️  Starting Electron app...
npm run electron-dev

echo ✅ App started successfully!
echo 📱 React dev server: http://localhost:3000
echo 🖥️  Electron app should open automatically
echo.
echo To stop the app, close the Electron window and press Ctrl+C in this terminal
pause
