#!/bin/bash

# Script dừng dự án SNet

echo "🛑 Stopping SNet Project..."

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

# Dừng Backend
if [ -f "$BACKEND_PID_FILE" ]; then
    PID=$(cat "$BACKEND_PID_FILE")
    echo -e "${BLUE}Stopping Backend (PID: $PID)...${NC}"
    kill $PID 2>/dev/null && echo -e "${GREEN}✅ Backend stopped${NC}" || echo -e "${RED}⚠️  Not running${NC}"
    rm -f "$BACKEND_PID_FILE"
fi

# Dừng Frontend
if [ -f "$FRONTEND_PID_FILE" ]; then
    PID=$(cat "$FRONTEND_PID_FILE")
    echo -e "${BLUE}Stopping Frontend (PID: $PID)...${NC}"
    kill $PID 2>/dev/null && echo -e "${GREEN}✅ Frontend stopped${NC}" || echo -e "${RED}⚠️  Not running${NC}"
    rm -f "$FRONTEND_PID_FILE"
fi

# Kill process còn sót
pkill -f "spring-boot:run" 2>/dev/null
pkill -f "next dev" 2>/dev/null

echo -e "${GREEN}✨ Stopped!${NC}"
