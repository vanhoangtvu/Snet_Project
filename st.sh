#!/bin/bash

# Script chạy ngầm dự án SNet (Backend + Frontend)

echo "🚀 Starting SNet Project..."

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

# Chạy Backend
echo -e "${BLUE}🔧 Starting Backend...${NC}"
cd "$BACKEND_DIR"
nohup mvn spring-boot:run > backend.log 2>&1 &
echo $! > "$BACKEND_PID_FILE"
echo -e "${GREEN}✅ Backend started (PID: $(cat $BACKEND_PID_FILE))${NC}"

# Đợi backend khởi động
sleep 10

# Chạy Frontend
echo -e "${BLUE}🎨 Starting Frontend...${NC}"
cd "$FRONTEND_DIR"
nohup npm run dev > frontend.log 2>&1 &
echo $! > "$FRONTEND_PID_FILE"
echo -e "${GREEN}✅ Frontend started (PID: $(cat $FRONTEND_PID_FILE))${NC}"

echo ""
echo -e "${GREEN}✨ Started Successfully!${NC}"
echo "   Backend:  https://api.snet.io.vn"
echo "   Frontend: https://snet.io.vn"
echo ""
echo "🛑 Stop: ./stp.sh"
