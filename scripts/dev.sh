#!/bin/bash

# Kill any existing processes on ports 3000 and 3001
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

echo "Starting development servers..."

# Start Vercel dev server for API on port 3001
npx vercel dev --listen 3001 &
VERCEL_PID=$!

# Wait for Vercel to start
sleep 3

# Start Vite dev server for UI on port 3000
cd ui && npm run dev &
VITE_PID=$!

echo "✅ API server running on http://localhost:3001"
echo "✅ UI server running on http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $VERCEL_PID $VITE_PID
