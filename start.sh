#!/bin/bash

# Earnings Verifier - Start Script
# Runs both frontend and backend servers

echo "🚀 Starting Earnings Call Verifier..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+"
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+"
    exit 1
fi

# Backend setup
echo "📦 Setting up backend..."
cd server

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing backend dependencies..."
pip install -q -r requirements.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp .env.example .env
    echo "✏️  Please edit server/.env with your configuration"
fi

# Start backend in background
echo "🔧 Starting backend API server..."
python3 app.py &
BACKEND_PID=$!
echo "Backend running on http://localhost:5001 (PID: $BACKEND_PID)"

cd ..

# Frontend setup
echo ""
echo "📦 Setting up frontend..."

# Install frontend dependencies if needed
if [ ! -d "ui/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd ui && npm install && cd ..
fi

# Start frontend
echo "🎨 Starting frontend development server..."
cd ui && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting..."
echo ""
echo "📡 Backend API:  http://localhost:5001"
echo "🎨 Frontend:     http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Shutting down...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Keep script running
wait
