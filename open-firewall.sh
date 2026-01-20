#!/bin/bash

# Script mở firewall cho PixShare
# Cần chạy với sudo

echo "=================================================="
echo "  MỞ FIREWALL CHO PIXSHARE"
echo "=================================================="
echo ""

# Màu sắc
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kiểm tra quyền sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}✗ Script này cần chạy với sudo${NC}"
    echo "Sử dụng: sudo ./open-firewall.sh"
    exit 1
fi

echo "1. Kiểm tra UFW status..."
echo "-----------------------------------"
ufw status

echo ""
echo "2. Mở port 8086 (Backend API)..."
echo "-----------------------------------"
ufw allow 8086/tcp
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Port 8086 đã được mở${NC}"
else
    echo -e "${RED}✗ Lỗi khi mở port 8086${NC}"
fi

echo ""
echo "3. Mở port 3006 (Frontend)..."
echo "-----------------------------------"
ufw allow 3006/tcp
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Port 3006 đã được mở${NC}"
else
    echo -e "${RED}✗ Lỗi khi mở port 3006${NC}"
fi

echo ""
echo "4. Mở port 3306 (MySQL - optional)..."
echo "-----------------------------------"
read -p "Bạn có muốn mở port MySQL 3306? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ufw allow 3306/tcp
    echo -e "${GREEN}✓ Port 3306 đã được mở${NC}"
else
    echo -e "${YELLOW}⊘ Bỏ qua port 3306${NC}"
fi

echo ""
echo "5. Reload UFW..."
echo "-----------------------------------"
ufw reload

echo ""
echo "6. Kiểm tra lại UFW status..."
echo "-----------------------------------"
ufw status numbered

echo ""
echo "7. Kiểm tra ports đang listen..."
echo "-----------------------------------"
netstat -tuln | grep -E '8086|3006|3306' || echo "Không tìm thấy ports"

echo ""
echo "=================================================="
echo "  HOÀN TẤT"
echo "=================================================="
echo ""
echo "Các port đã mở:"
echo "  - 8086/tcp (Backend API)"
echo "  - 3006/tcp (Frontend)"
echo ""
echo "Test kết nối:"
echo "  curl http://14.163.29.11:8086/api"
echo "  curl http://14.163.29.11:3006"
echo ""
echo "Truy cập ứng dụng:"
echo "  http://14.163.29.11:3006"
echo ""
