#!/bin/bash

# Script kiểm tra cập nhật IP Server
# Tác giả: Auto-generated
# Ngày: 28/12/2025

echo "=================================================="
echo "  KIỂM TRA CẬP NHẬT IP SERVER"
echo "  IP mới: 14.163.29.11"
echo "=================================================="
echo ""

# Màu sắc
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Biến đếm
PASS=0
FAIL=0

echo "1. Kiểm tra file cấu hình..."
echo "-----------------------------------"

# Kiểm tra .env
if grep -q "14.163.29.11:8086" .env; then
    echo -e "${GREEN}✓${NC} .env - OK (14.163.29.11:8086)"
    ((PASS++))
else
    echo -e "${RED}✗${NC} .env - FAIL"
    ((FAIL++))
fi

# Kiểm tra .env.docker
if grep -q "14.163.29.11:8080" .env.docker; then
    echo -e "${GREEN}✓${NC} .env.docker - OK (14.163.29.11:8080)"
    ((PASS++))
else
    echo -e "${RED}✗${NC} .env.docker - FAIL"
    ((FAIL++))
fi

# Kiểm tra frontend/.env.local
if grep -q "14.163.29.11:8086" frontend/.env.local; then
    echo -e "${GREEN}✓${NC} frontend/.env.local - OK (14.163.29.11:8086)"
    ((PASS++))
else
    echo -e "${RED}✗${NC} frontend/.env.local - FAIL"
    ((FAIL++))
fi

echo ""
echo "2. Kiểm tra source code..."
echo "-----------------------------------"

# Kiểm tra api.ts
if grep -q "14.163.29.11:8086" frontend/lib/api.ts; then
    echo -e "${GREEN}✓${NC} frontend/lib/api.ts - OK"
    ((PASS++))
else
    echo -e "${RED}✗${NC} frontend/lib/api.ts - FAIL"
    ((FAIL++))
fi

# Kiểm tra next.config.js
if grep -q "14.163.29.11" frontend/next.config.js; then
    echo -e "${GREEN}✓${NC} frontend/next.config.js - OK"
    ((PASS++))
else
    echo -e "${RED}✗${NC} frontend/next.config.js - FAIL"
    ((FAIL++))
fi

# Kiểm tra ChatContext.tsx
if grep -q "14.163.29.11:8086" frontend/contexts/ChatContext.tsx; then
    echo -e "${GREEN}✓${NC} frontend/contexts/ChatContext.tsx - OK"
    ((PASS++))
else
    echo -e "${RED}✗${NC} frontend/contexts/ChatContext.tsx - FAIL"
    ((FAIL++))
fi

echo ""
echo "3. Kiểm tra không còn IP cũ..."
echo "-----------------------------------"

# Kiểm tra IP cũ trong source code (loại trừ .next và node_modules)
OLD_IP_COUNT=$(grep -r "113.187.152.149\|113.170.159.180" frontend/ \
    --include="*.ts" --include="*.tsx" --include="*.js" \
    --exclude-dir=".next" --exclude-dir="node_modules" 2>/dev/null | wc -l)

if [ "$OLD_IP_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Không còn IP cũ trong source code"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Vẫn còn $OLD_IP_COUNT vị trí chứa IP cũ"
    echo -e "${YELLOW}   Danh sách:${NC}"
    grep -r "113.187.152.149\|113.170.159.180" frontend/ \
        --include="*.ts" --include="*.tsx" --include="*.js" \
        --exclude-dir=".next" --exclude-dir="node_modules" 2>/dev/null | head -5
    ((FAIL++))
fi

# Kiểm tra IP cũ trong .env files
OLD_IP_ENV=$(grep -r "113.187.152.149\|113.170.159.180" .env* frontend/.env* 2>/dev/null | wc -l)

if [ "$OLD_IP_ENV" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Không còn IP cũ trong file cấu hình"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Vẫn còn IP cũ trong file cấu hình"
    grep -r "113.187.152.149\|113.170.159.180" .env* frontend/.env* 2>/dev/null
    ((FAIL++))
fi

echo ""
echo "4. Kiểm tra kết nối (optional)..."
echo "-----------------------------------"

# Test API endpoint (nếu server đang chạy)
if command -v curl &> /dev/null; then
    if curl -s --connect-timeout 5 "http://14.163.29.11:8086/api" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Server 14.163.29.11:8086 đang hoạt động"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} Không thể kết nối đến 14.163.29.11:8086 (server có thể chưa chạy)"
    fi
else
    echo -e "${YELLOW}⚠${NC} curl không có sẵn, bỏ qua kiểm tra kết nối"
fi

echo ""
echo "=================================================="
echo "  KẾT QUẢ KIỂM TRA"
echo "=================================================="
echo -e "Passed: ${GREEN}$PASS${NC}"
echo -e "Failed: ${RED}$FAIL${NC}"
echo ""

if [ "$FAIL" -eq 0 ]; then
    echo -e "${GREEN}✓ TẤT CẢ KIỂM TRA ĐỀU PASS!${NC}"
    echo ""
    echo "Các bước tiếp theo:"
    echo "1. Rebuild frontend: cd frontend && npm run build"
    echo "2. Restart Docker: docker-compose down && docker-compose up -d"
    echo "3. Clear browser cache"
    echo "4. Test các chức năng chính"
    exit 0
else
    echo -e "${RED}✗ CÓ LỖI CẦN KHẮC PHỤC!${NC}"
    echo ""
    echo "Vui lòng kiểm tra lại các file bị lỗi ở trên."
    exit 1
fi
