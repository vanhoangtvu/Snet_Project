#!/bin/bash

echo "🔄 Updating IP Configuration..."

# Lấy IP mới
NEW_IP=$(curl -s -4 ifconfig.me)
OLD_IP="14.160.195.30"

echo "📍 Current IP: $OLD_IP"
echo "📍 New IP: $NEW_IP"

if [ "$NEW_IP" == "$OLD_IP" ]; then
    echo "✅ IP hasn't changed. No update needed."
    exit 0
fi

echo ""
echo "🔧 Updating configuration files..."

# Update backend application.yml
sed -i "s|url: http://.*:8086|url: http://$NEW_IP:8086|g" backend/src/main/resources/application.yml
echo "✅ Updated backend/src/main/resources/application.yml"

# Update SecurityConfig.java
sed -i "s|http://[0-9.]*:3006|http://$NEW_IP:3006|g" backend/src/main/java/com/pixshare/config/SecurityConfig.java
sed -i "s|http://[0-9.]*:8086|http://$NEW_IP:8086|g" backend/src/main/java/com/pixshare/config/SecurityConfig.java
echo "✅ Updated SecurityConfig.java"

# Update WebSocketConfig.java
sed -i "s|http://[0-9.]*:3006|http://$NEW_IP:3006|g" backend/src/main/java/com/pixshare/config/WebSocketConfig.java
echo "✅ Updated WebSocketConfig.java"

# Update frontend .env.local
echo "NEXT_PUBLIC_API_URL=http://$NEW_IP:8086/api" > frontend/.env.local
echo "✅ Updated frontend/.env.local"

echo ""
echo "🔨 Rebuilding..."

# Rebuild backend
cd backend
mvn clean package -DskipTests -q
echo "✅ Backend rebuilt"

# Rebuild frontend
cd ../frontend
npm run build --silent
echo "✅ Frontend rebuilt"

cd ..

echo ""
echo "🔄 Restarting services..."

# Stop old services
if [ -f backend.pid ]; then
    kill $(cat backend.pid) 2>/dev/null
    rm backend.pid
fi

if [ -f frontend.pid ]; then
    kill $(cat frontend.pid) 2>/dev/null
    rm frontend.pid
fi

sleep 3

# Start new services
cd backend
nohup java -jar target/pixshare-backend-1.0.0.jar > ../backend.log 2>&1 &
echo $! > ../backend.pid
cd ..

cd frontend
PORT=3006 nohup npm start > ../frontend.log 2>&1 &
echo $! > ../frontend.pid
cd ..

echo ""
echo "✅ Services restarted!"
echo ""
echo "🌐 New URLs:"
echo "   Frontend: http://$NEW_IP:3006"
echo "   Backend:  http://$NEW_IP:8086"
echo ""
