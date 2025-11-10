@echo off
echo 🚀 FlowbitAI Development Setup
echo ==============================

echo 📋 Checking prerequisites...

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    exit /b 1
)

echo ✅ Node.js found

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.9+ and try again.
    exit /b 1
)

echo ✅ Python found

echo.
echo 📦 Installing dependencies...
call npm run install:all

echo.
echo 🔧 Setting up environment files...

if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo ✅ Created backend/.env from template
    echo ⚠️  Please edit backend/.env with your database credentials
)

if not exist "ai-server\.env" (
    copy "ai-server\.env.example" "ai-server\.env"
    echo ✅ Created ai-server/.env from template
    echo ⚠️  Please edit ai-server/.env with your Groq API key
)

echo.
echo 🐍 Setting up Python virtual environment...
cd ai-server

if not exist "venv" (
    python -m venv venv
    echo ✅ Created Python virtual environment
)

call venv\Scripts\activate.bat
pip install -r requirements.txt
echo ✅ Installed Python dependencies

cd ..

echo.
echo 🎉 Setup complete!
echo.
echo 📝 Next steps:
echo 1. Create a PostgreSQL database called 'flowbitai_db'
echo 2. Edit backend/.env with your database connection string
echo 3. Edit ai-server/.env with your Groq API key
echo 4. Run 'npm run db:setup' to initialize the database
echo 5. Run 'npm run dev' to start the development servers
echo.
echo 📚 For detailed instructions, see README.md

pause