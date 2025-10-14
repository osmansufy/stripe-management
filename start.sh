#!/bin/bash

# Stripe Invoice Management Desktop App Startup Script

echo "🚀 Starting Stripe Invoice Management Desktop App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Start the development server
echo "🌐 Starting React development server..."
npm start &
REACT_PID=$!

# Wait a moment for React to start
sleep 5

# Start Electron
echo "🖥️  Starting Electron app..."
npm run electron-dev &
ELECTRON_PID=$!

echo "✅ App started successfully!"
echo "📱 React dev server: http://localhost:3000"
echo "🖥️  Electron app should open automatically"
echo ""
echo "To stop the app, press Ctrl+C"

# Wait for user to stop
wait $REACT_PID $ELECTRON_PID
