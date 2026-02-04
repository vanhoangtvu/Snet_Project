#!/bin/bash

echo "🚀 Starting backend with production URLs..."

export FRONTEND_URL="https://snet.io.vn"
export API_URL="https://api.snet.io.vn"

cd /home/hv/DuAn/snet/backend

# Kill existing process
pkill -f "spring-boot" 2>/dev/null
sleep 2

# Start backend
mvn spring-boot:run

echo "✅ Backend started with:"
echo "   Frontend URL: $FRONTEND_URL"
echo "   API URL: $API_URL"
