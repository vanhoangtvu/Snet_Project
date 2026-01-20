#!/bin/bash

echo "🚀 PixShare - Starting All Services"
echo "===================================="
echo ""

# Lấy IP public
PUBLIC_IP=$(curl -s -4 ifconfig.me)
echo "🌐 Public IP: $PUBLIC_IP"
echo ""

# Kiểm tra MySQL
echo "📊 Checking MySQL..."
if systemctl is-active --quiet mysql || systemctl is-active --quiet mysqld; then
    echo "✅ MySQL is running"
else
    echo "❌ MySQL is not running. Please start MySQL first:"
    echo "   sudo systemctl start mysql"
    exit 1
fi

# Kiểm tra database
echo "📊 Checking database..."
mysql -u root -p1111 -e "CREATE DATABASE IF NOT EXISTS PixShare_db;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Database ready"
else
    echo "❌ Cannot connect to MySQL. Check password."
    exit 1
fi

echo ""
echo "🔨 Building Backend..."
cd backend
mvn clean package -DskipTests -q
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed"
    exit 1
fi
echo "✅ Backend built successfully"

echo ""
echo "🔨 Building Frontend..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --silent
fi
npm run build --silent
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
echo "✅ Frontend built successfully"

cd ..

echo ""
echo "===================================="
echo "✅ Build completed!"
echo ""
echo "🚀 Starting services..."
echo ""
echo "📝 Run these commands in separate terminals:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   cd backend && java -jar target/pixshare-backend-1.0.0.jar"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   cd frontend && npm start"
echo ""
echo "🔗 Access URLs:"
echo "   Frontend: http://$PUBLIC_IP:3006"
echo "   Backend:  http://$PUBLIC_IP:8086"
echo "   Swagger:  http://$PUBLIC_IP:8086/swagger-ui.html"
echo ""
echo "🔐 Login with:"
echo "   Email: admin@pixshare.com"
echo "   Password: admin123"
echo ""
