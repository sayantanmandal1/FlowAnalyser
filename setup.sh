#!/bin/bash

# Development Setup Script for FlowbitAI
# This script helps set up the development environment

echo "🚀 FlowbitAI Development Setup"
echo "=============================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "18" ]; then
    echo "❌ Node.js version is $NODE_VERSION. Please upgrade to Node.js 18+ and try again."
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Check Python
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.9+ and try again."
    exit 1
fi

PYTHON_CMD="python3"
if command -v python &> /dev/null; then
    PYTHON_CMD="python"
fi

echo "✅ Python ($($PYTHON_CMD --version)) found"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. Make sure PostgreSQL is installed."
    echo "   You can download it from: https://www.postgresql.org/download/"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm run install:all

# Setup environment files
echo ""
echo "🔧 Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from template"
    echo "⚠️  Please edit backend/.env with your database credentials"
fi

if [ ! -f "ai-server/.env" ]; then
    cp ai-server/.env.example ai-server/.env
    echo "✅ Created ai-server/.env from template"
    echo "⚠️  Please edit ai-server/.env with your Groq API key"
fi

# Setup Python virtual environment
echo ""
echo "🐍 Setting up Python virtual environment..."
cd ai-server

if [ ! -d "venv" ]; then
    $PYTHON_CMD -m venv venv
    echo "✅ Created Python virtual environment"
fi

# Activate virtual environment and install dependencies
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    source venv/Scripts/activate
else
    # Unix/Linux/macOS
    source venv/bin/activate
fi

pip install -r requirements.txt
echo "✅ Installed Python dependencies"

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Create a PostgreSQL database called 'flowbitai_db'"
echo "2. Edit backend/.env with your database connection string"
echo "3. Edit ai-server/.env with your Groq API key"
echo "4. Run 'npm run db:setup' to initialize the database"
echo "5. Run 'npm run dev' to start the development servers"
echo ""
echo "📚 For detailed instructions, see README.md"