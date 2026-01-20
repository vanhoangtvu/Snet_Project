# 🚀 HƯỚNG DẪN CHẠY PIXSHARE KHÔNG DÙNG DOCKER

## ✅ IP Public hiện tại: **14.160.195.30**

Đã cập nhật tất cả file cấu hình với IP mới!

---

## 📋 YÊU CẦU HỆ THỐNG

- ✅ Java 17+ (JDK)
- ✅ Maven 3.x
- ✅ Node.js 18+
- ✅ MySQL 8.0+ (đang chạy)
- ✅ UFW Firewall

---

## 🔧 BƯỚC 1: MỞ FIREWALL

```bash
./setup-firewall.sh
```

Hoặc thủ công:
```bash
sudo ufw allow 8086/tcp  # Backend
sudo ufw allow 3006/tcp  # Frontend
sudo ufw reload
```

---

## 🗄️ BƯỚC 2: KIỂM TRA MYSQL

```bash
# Kiểm tra MySQL đang chạy
sudo systemctl status mysql

# Nếu chưa chạy
sudo systemctl start mysql

# Tạo database
mysql -u root -p1111 -e "CREATE DATABASE IF NOT EXISTS PixShare_db;"
```

---

## 🎯 BƯỚC 3: CHẠY BACKEND

### Cách 1: Dùng script (khuyến nghị)
```bash
./start-backend.sh
```

### Cách 2: Thủ công
```bash
cd backend

# Build
mvn clean package -DskipTests

# Chạy JAR
java -jar target/pixshare-backend-1.0.0.jar

# Hoặc dùng Maven
mvn spring-boot:run
```

Backend sẽ chạy tại: **http://14.160.195.30:8086**

---

## 🎨 BƯỚC 4: CHẠY FRONTEND (Terminal mới)

### Cách 1: Dùng script
```bash
./start-frontend.sh
```

### Cách 2: Thủ công
```bash
cd frontend

# Cài dependencies (lần đầu)
npm install

# Build production
npm run build
npm start

# Hoặc dev mode
npm run dev
```

Frontend sẽ chạy tại: **http://14.160.195.30:3006**

---

## 🌐 TRUY CẬP TỪ BÊN NGOÀI

### URLs công khai:
- **Frontend**: http://14.160.195.30:3006
- **Backend API**: http://14.160.195.30:8086/api
- **Swagger UI**: http://14.160.195.30:8086/swagger-ui.html

### Test từ máy khác:
```bash
# Test backend
curl http://14.160.195.30:8086/api/auth/login

# Test frontend
curl http://14.160.195.30:3006
```

---

## 🔐 TÀI KHOẢN TEST

### Admin:
- Email: `admin@pixshare.com`
- Password: `admin123`

### User:
- Email: `user1@pixshare.com`
- Password: `user123`

---

## 🐛 TROUBLESHOOTING

### 1. Backend không kết nối MySQL
```bash
# Kiểm tra MySQL
sudo systemctl status mysql

# Kiểm tra port 3306
sudo netstat -tlnp | grep 3306

# Test connection
mysql -u root -p1111 -e "SHOW DATABASES;"
```

### 2. Frontend không kết nối Backend
```bash
# Kiểm tra backend đang chạy
curl http://localhost:8086/api/auth/login

# Kiểm tra CORS
curl -H "Origin: http://14.160.195.30:3006" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://14.160.195.30:8086/api/auth/login
```

### 3. Không truy cập được từ bên ngoài
```bash
# Kiểm tra firewall
sudo ufw status

# Kiểm tra port đang listen
sudo netstat -tlnp | grep -E '8086|3006'

# Kiểm tra IP public
curl -4 ifconfig.me
```

### 4. WebSocket không hoạt động
- Kiểm tra CORS trong `WebSocketConfig.java`
- Kiểm tra JWT token hợp lệ
- Xem console log trong browser

---

## 📊 KIỂM TRA TRẠNG THÁI

```bash
# Backend logs
tail -f backend/logs/spring.log

# Frontend logs
# Xem trong terminal đang chạy npm

# MySQL logs
sudo tail -f /var/log/mysql/error.log

# System resources
htop
```

---

## 🔄 CẬP NHẬT IP MỚI (nếu IP thay đổi)

```bash
# Lấy IP mới
NEW_IP=$(curl -s -4 ifconfig.me)
echo "New IP: $NEW_IP"

# Cập nhật backend
sed -i "s|url: http://.*:8086|url: http://$NEW_IP:8086|g" backend/src/main/resources/application.yml
sed -i "s|http://[0-9.]*:3006|http://$NEW_IP:3006|g" backend/src/main/java/com/pixshare/config/SecurityConfig.java
sed -i "s|http://[0-9.]*:3006|http://$NEW_IP:3006|g" backend/src/main/java/com/pixshare/config/WebSocketConfig.java

# Cập nhật frontend
echo "NEXT_PUBLIC_API_URL=http://$NEW_IP:8086/api" > frontend/.env.local

# Rebuild
cd backend && mvn clean package -DskipTests
cd ../frontend && npm run build
```

---

## 🚀 CHẠY NỀN (BACKGROUND)

### Backend:
```bash
cd backend
nohup java -jar target/pixshare-backend-1.0.0.jar > backend.log 2>&1 &
echo $! > backend.pid
```

### Frontend:
```bash
cd frontend
nohup npm start > frontend.log 2>&1 &
echo $! > frontend.pid
```

### Dừng:
```bash
# Backend
kill $(cat backend/backend.pid)

# Frontend
kill $(cat frontend/frontend.pid)
```

---

## 📝 NOTES

1. **MySQL phải chạy trên localhost:3306**
2. **Backend bind 0.0.0.0:8086** (accept all interfaces)
3. **Frontend bind 0.0.0.0:3006**
4. **Firewall phải mở port 8086 và 3006**
5. **Router phải forward port nếu ở sau NAT**

---

## 🎉 HOÀN TẤT!

Dự án đã sẵn sàng truy cập từ bất kỳ đâu qua:
- **http://14.160.195.30:3006**

Chúc bạn thành công! 🚀
