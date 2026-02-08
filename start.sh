#!/bin/bash

echo "Starting Monitoring System..."

# Start backend
echo "Starting backend server..."
cd server
go run main.go &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend..."
cd ..
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ Monitoring System Started!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 Backend API: http://localhost:8080"
echo "📊 Health Check: http://localhost:8080/health"
echo ""
echo "Press Ctrl+C to stop all services"

# Trap Ctrl+C to kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Wait
wait
