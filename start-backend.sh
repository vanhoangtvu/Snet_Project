#!/bin/bash

echo "🚀 Starting PixShare Backend..."

# Kiểm tra MySQL đang chạy
if ! systemctl is-active --quiet mysql; then
    echo "❌ MySQL is not running. Starting MySQL..."
    sudo systemctl start mysql
    sleep 3
fi

# Kiểm tra database tồn tại
echo "📊 Checking database..."
mysql -u root -p1111 -e "CREATE DATABASE IF NOT EXISTS PixShare_db;" 2>/dev/null

# Build backend
echo "🔨 Building backend..."
cd backend
mvn clean package -DskipTests

# Chạy backend
echo "▶️  Starting backend on port 8086..."
java -jar target/pixshare-backend-1.0.0.jar

# Hoặc dùng mvn spring-boot:run
# mvn spring-boot:run
