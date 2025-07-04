@echo off
REM Hedera Counter DApp Setup Script for Windows
REM This script sets up the complete development environment

echo 🚀 Setting up Hedera Counter DApp...
echo ======================================

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js found: %NODE_VERSION%

REM Check if npm is installed
echo [INFO] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [SUCCESS] npm found: %NPM_VERSION%

REM Setup environment files
echo [INFO] Setting up environment files...

if not exist ".env" (
    copy ".env.example" ".env" >nul
    echo [SUCCESS] Created .env file from template
    echo [WARNING] Please edit .env with your Hedera credentials
) else (
    echo [WARNING] .env file already exists
)

if not exist "frontend\.env.local" (
    copy "frontend\.env.local.example" "frontend\.env.local" >nul
    echo [SUCCESS] Created frontend\.env.local file from template
) else (
    echo [WARNING] frontend\.env.local file already exists
)

REM Install root dependencies
echo [INFO] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Root dependencies installed

REM Install smart contract dependencies
echo [INFO] Installing smart contract dependencies...
cd smart-contract
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install smart contract dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo [SUCCESS] Smart contract dependencies installed

REM Install frontend dependencies
echo [INFO] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo [SUCCESS] Frontend dependencies installed

REM Compile smart contract
echo [INFO] Compiling smart contract...
cd smart-contract
call npx hardhat compile
if %errorlevel% neq 0 (
    echo [ERROR] Failed to compile smart contract
    cd ..
    pause
    exit /b 1
)
cd ..
echo [SUCCESS] Smart contract compiled successfully

REM Build frontend
echo [INFO] Building frontend application...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build frontend
    cd ..
    pause
    exit /b 1
)
cd ..
echo [SUCCESS] Frontend built successfully

REM Display next steps
echo.
echo 🎉 Setup completed successfully!
echo ================================
echo.
echo 📋 Next Steps:
echo.
echo 1. 🔑 Configure your Hedera credentials:
echo    - Edit .env file with your HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY
echo    - Get testnet credentials from: https://portal.hedera.com/
echo.
echo 2. 🚀 Deploy the smart contract:
echo    npm run deploy-contract
echo.
echo 3. 🌐 Start the frontend development server:
echo    npm run dev
echo.
echo 4. 🔗 Open your browser and visit:
echo    http://localhost:3000
echo.
echo 📚 Additional Resources:
echo    - README.md: Complete project documentation
echo    - docs\HEDERA_BASICS.md: Hedera blockchain basics
echo    - docs\DEPLOYMENT.md: Deployment guide
echo.
echo 🆘 Need Help?
echo    - Check the troubleshooting section in README.md
echo    - Join Hedera Discord: https://discord.gg/hedera
echo    - GitHub Issues: https://github.com/your-repo/issues
echo.
echo [SUCCESS] Happy building on Hedera! 🚀

pause
