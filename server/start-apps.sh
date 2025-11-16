#!/bin/bash

# Application startup script
echo "Starting Spring Boot and React applications..."

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SERVER_DIR="$PROJECT_ROOT/server"
CLIENT_DIR="$PROJECT_ROOT/client"

# Stop existing processes
echo "Stopping existing processes..."
pkill -f "java.*EdgeApplication" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "pnpm.*my-app.*dev" 2>/dev/null
pkill -f "electron" 2>/dev/null
pkill -f "pnpm.*app" 2>/dev/null

# Wait a bit
sleep 2

# Start Spring Boot application
echo "Starting Spring Boot application..."
cd "$SERVER_DIR" || exit 1
./gradlew bootRun > "$PROJECT_ROOT/server.log" 2>&1 &
SPRING_PID=$!

# Wait for Spring Boot to start
echo "Waiting for Spring Boot to start..."
sleep 15

# Check if Spring Boot started successfully
if ! kill -0 $SPRING_PID 2>/dev/null; then
    echo "Error: Spring Boot failed to start. Check server.log for details."
    exit 1
fi

# Start React application (using pnpm app command)
echo "Starting React application with Electron..."
cd "$CLIENT_DIR" || exit 1

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "Error: pnpm is not installed or not in PATH"
    exit 1
fi

# Start React app with Electron using pnpm app command
nohup pnpm app > "$PROJECT_ROOT/client.log" 2>&1 &
REACT_PID=$!

# Wait a moment for the processes to start
sleep 8

# Check if Vite process is running
# Try multiple methods to find the Vite process
VITE_PID=""
ELECTRON_PID=""
for i in {1..3}; do
    # Method 1: Look for vite process in my-app directory
    VITE_PID=$(pgrep -f "vite.*apps/my-app" | head -1)
    [ -n "$VITE_PID" ] && break
    
    # Method 2: Look for any vite process
    VITE_PID=$(pgrep -f "node.*vite" | head -1)
    [ -n "$VITE_PID" ] && break
    
    # Method 3: Check if port 5173 is in use
    PORT_PID=$(lsof -ti:5173 2>/dev/null | head -1)
    if [ -n "$PORT_PID" ]; then
        VITE_PID=$PORT_PID
        break
    fi
    
    if [ $i -lt 3 ]; then
        sleep 3
    fi
done

# Check for Electron process
ELECTRON_PID=$(pgrep -f "electron" | head -1)

if [ -z "$VITE_PID" ] && [ -z "$ELECTRON_PID" ]; then
    echo "Error: React application failed to start. Check client.log for details:"
    echo "=========================================="
    tail -n 50 "$PROJECT_ROOT/client.log" 2>/dev/null || echo "No log file found"
    echo "=========================================="
    kill $SPRING_PID 2>/dev/null
    pkill -f "pnpm.*app" 2>/dev/null
    exit 1
fi

if [ -n "$VITE_PID" ]; then
    echo "Vite process found with PID: $VITE_PID"
fi
if [ -n "$ELECTRON_PID" ]; then
    echo "Electron process found with PID: $ELECTRON_PID"
fi

echo "Applications started!"
echo "Spring Boot PID: $SPRING_PID"
echo "React/Electron PID: $REACT_PID"
[ -n "$VITE_PID" ] && echo "Vite PID: $VITE_PID"
[ -n "$ELECTRON_PID" ] && echo "Electron PID: $ELECTRON_PID"
echo ""
echo "Spring Boot: http://localhost:8080"
echo "Spring Boot logs: $PROJECT_ROOT/server.log"
echo "React: http://localhost:5173 (or check the Vite output in client.log)"
echo "Electron: Desktop application should be running"
echo "Client logs: $PROJECT_ROOT/client.log"
echo ""
echo "To stop applications, press Ctrl+C"
echo ""
echo "To view logs in real-time, run:"
echo "  tail -f $PROJECT_ROOT/server.log"
echo "  tail -f $PROJECT_ROOT/client.log"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping applications..."
    kill $SPRING_PID 2>/dev/null
    kill $REACT_PID 2>/dev/null
    [ -n "$VITE_PID" ] && kill $VITE_PID 2>/dev/null
    [ -n "$ELECTRON_PID" ] && kill $ELECTRON_PID 2>/dev/null
    pkill -f "vite" 2>/dev/null
    pkill -f "electron" 2>/dev/null
    pkill -f "pnpm.*app" 2>/dev/null
    pkill -f "pnpm.*my-app.*dev" 2>/dev/null
    pkill -f "java.*EdgeApplication" 2>/dev/null
    # Kill any process using port 5173
    lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Monitor processes
wait
