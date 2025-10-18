#!/bin/bash

echo "🔄 Restarting PixShare với cấu hình mới cho upload file lớn..."
echo ""

# Check if running Docker
if command -v docker-compose &> /dev/null; then
    echo "📦 Phát hiện Docker Compose"
    echo ""
    
    # Stop containers
    echo "⏸️  Stopping containers..."
    docker-compose down
    
    echo ""
    echo "🔨 Rebuilding containers..."
    docker-compose up --build -d
    
    echo ""
    echo "⏳ Waiting for services to start..."
    sleep 10
    
    echo ""
    echo "📊 Container status:"
    docker-compose ps
    
    echo ""
    echo "📝 Theo dõi logs:"
    echo "  Backend:  docker-compose logs -f backend"
    echo "  MySQL:    docker-compose logs -f mysql"
    echo "  Frontend: docker-compose logs -f frontend"
    
else
    echo "⚠️  Docker Compose không được tìm thấy"
    echo "Vui lòng restart thủ công:"
    echo ""
    echo "Backend:"
    echo "  cd backend"
    echo "  mvn spring-boot:run"
    echo ""
    echo "Frontend:"
    echo "  cd frontend"
    echo "  npm run dev"
fi

echo ""
echo "✅ Hoàn tất!"
echo ""
echo "🌐 Truy cập:"
echo "  Frontend: http://localhost:3006"
echo "  Backend:  http://localhost:8086"
echo "  Swagger:  http://localhost:8086/swagger-ui.html"
echo ""
echo "🧪 Test upload file lớn tại: http://localhost:3006/dashboard/files"
