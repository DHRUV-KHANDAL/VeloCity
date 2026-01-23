@echo off
setlocal enabledelayedexpansion

echo 🚀 VeloCity Project Setup

:: Check Node.js version
for /f "delims=" %%a in ('node --version') do set "NODE_VERSION=%%a"
echo Node.js Version: %NODE_VERSION%

:: Verify npm
npm --version

:: Clean previous installations
echo 🧹 Cleaning previous installations...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "Backend\node_modules" rmdir /s /q "Backend\node_modules"
if exist "Frontend\node_modules" rmdir /s /q "Frontend\node_modules"

:: Install root dependencies
echo 📦 Installing root dependencies...
npm install

:: Install Backend dependencies
echo 🔧 Installing Backend dependencies...
cd Backend
npm install
cd ..

:: Install Frontend dependencies
echo 🖥️ Installing Frontend dependencies...
cd Frontend
npm install
cd ..

echo ✅ VeloCity project setup complete!
echo Run 'npm run dev' to start the development servers