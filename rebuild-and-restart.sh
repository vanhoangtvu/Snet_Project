#!/bin/bash

# Script rebuild và restart toàn bộ PixShare với IP mới
# Tác giả: Auto-generated
# Ngày: 28/12/2025

set -e  # Exit on error

# Màu sắc
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================"
echo "  REBUILD VÀ RESTART PIXSHARE"
echo "  IP mới: 14.163.29.11"
echo "======================================${NC}"
echo ""

cd /home/hv/DuAn/PixShare

# Bước 1: Dừng containers
echo -e "${YELLOW}[1/8] Dừng containers...${NC}"
docker-compose down
echo -e "${GREEN}✓ Đã dừng${NC}"
echo ""

# Bước 2: Xóa build cũ
echo -e "${YELLOW}[2/8] Xóa build cũ...${NC}"
rm -rf frontend/.next
rm -rf frontend/node_modules/.cache
rm -rf backend/target
echo -e "${GREEN}✓ Đã xóa build cũ${NC}"
echo ""

# Bước 3: Rebuild backend
echo -e "${YELLOW}[3/8] Rebuild Backend (có thể mất vài phút)...${NC}"
docker-compose build --no-cache backend
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend build thành công${NC}"
else
    echo -e "${RED}✗ Backend build thất bại${NC}"
    exit 1
fi
echo ""

# Bước 4: Rebuild frontend  
echo -e "${YELLOW}[4/8] Rebuild Frontend (có thể mất vài phút)...${NC}"
docker-compose build --no-cache frontend
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend build thành công${NC}"
else
    echo -e "${RED}✗ Frontend build thất bại${NC}"
    exit 1
fi
echo ""

# Bước 5: Start containers
echo -e "${YELLOW}[5/8] Start containers...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Containers đã start${NC}"
echo ""

# Bước 6: Đợi services khởi động
echo -e "${YELLOW}[6/8] Đợi services khởi động (30 giây)...${NC}"
for i in {30..1}; do
    echo -ne "\r   Còn $i giây...  "
    sleep 1
done
echo -e "\n${GREEN}✓ Hoàn tất chờ${NC}"
echo ""

# Bước 7: Kiểm tra status
echo -e "${YELLOW}[7/8] Kiểm tra status containers...${NC}"
docker-compose ps
echo ""

# Bước 8: Test kết nối
echo -e "${YELLOW}[8/8] Test kết nối...${NC}"
echo ""

echo -n "   Backend API (localhost): "
if curl -s http://localhost:8086/api > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo -n "   Backend API (public IP): "
if timeout 5 curl -s http://14.163.29.11:8086/api > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${YELLOW}⚠ TIMEOUT (có thể do firewall)${NC}"
fi

echo -n "   Frontend (localhost): "
if curl -s http://localhost:3006 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo -n "   Frontend (public IP): "
if timeout 5 curl -s http://14.163.29.11:3006 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${YELLOW}⚠ TIMEOUT (có thể do firewall)${NC}"
fi

echo ""
echo -e "${BLUE}======================================"
echo "  HOÀN TẤT"
echo "======================================${NC}"
echo ""
echo "📋 Các bước tiếp theo:"
echo ""
echo "1. Kiểm tra logs nếu có lỗi:"
echo "   ${BLUE}docker-compose logs -f backend${NC}"
echo "   ${BLUE}docker-compose logs -f frontend${NC}"
echo ""
echo "2. Nếu timeout khi test public IP, mở firewall:"
echo "   ${BLUE}sudo ./open-firewall.sh${NC}"
echo ""
echo "3. Truy cập ứng dụng:"
echo "   ${GREEN}http://14.163.29.11:3006${NC}"
echo ""
echo "4. Test đăng nhập với:"
echo "   Email: admin@pixshare.com"
echo "   Password: admin123"
echo ""
echo "5. Nếu vẫn lỗi, xem hướng dẫn chi tiết:"
echo "   ${BLUE}cat COMPLETE_FIX_GUIDE.md${NC}"
echo ""
