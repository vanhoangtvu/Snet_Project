#!/bin/bash

echo "🔥 Opening firewall ports for PixShare..."

# Mở port 8086 (Backend)
sudo ufw allow 8086/tcp
echo "✅ Port 8086 (Backend) opened"

# Mở port 3006 (Frontend)
sudo ufw allow 3006/tcp
echo "✅ Port 3006 (Frontend) opened"

# Mở port 3306 (MySQL) - chỉ nếu cần truy cập từ xa
# sudo ufw allow 3306/tcp
# echo "✅ Port 3306 (MySQL) opened"

# Reload firewall
sudo ufw reload

# Hiển thị status
echo ""
echo "📊 Firewall status:"
sudo ufw status

echo ""
echo "🌐 Your public IP: $(curl -s -4 ifconfig.me)"
echo ""
echo "🔗 Access URLs:"
echo "   Frontend: http://$(curl -s -4 ifconfig.me):3006"
echo "   Backend:  http://$(curl -s -4 ifconfig.me):8086"
echo "   Swagger:  http://$(curl -s -4 ifconfig.me):8086/swagger-ui.html"
