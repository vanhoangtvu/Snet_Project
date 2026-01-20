# Hướng dẫn hoàn chỉnh Fix lỗi kết nối Frontend - Backend

## Tổng quan vấn đề

**Triệu chứng**: Frontend không thể đăng nhập / kết nối với Backend sau khi đổi IP

**Nguyên nhân gốc rễ**:
1. ✅ IP cũ còn trong file cấu hình Backend (application.yml, SecurityConfig.java, WebSocketConfig.java)
2. ✅ Frontend đã build với IP cũ (embedded trong .next folder)
3. ❓ Firewall có thể đang chặn port 8086 và 3006
4. ❓ Docker containers chưa được restart với cấu hình mới

## Các file đã được cập nhật

### Backend (3 files)
1. **backend/src/main/resources/application.yml**
   - Dòng 48: `server.url: http://14.163.29.11:8086`
   - Dòng 84: `cors.allowed-origins: http://localhost:3006,http://14.163.29.11:3006,http://14.163.29.11:8086`

2. **backend/src/main/java/com/pixshare/config/SecurityConfig.java**
   - Dòng 56-60: CORS allowed origins → `14.163.29.11:3006` và `14.163.29.11:8086`

3. **backend/src/main/java/com/pixshare/config/WebSocketConfig.java**
   - Dòng 28-31: WebSocket allowed origins → `14.163.29.11:3006`

### Frontend (10 files)
1. **frontend/.env.local** → `http://14.163.29.11:8086/api`
2. **frontend/lib/api.ts** → Fallback URL
3. **frontend/next.config.js** → Image domains
4. **frontend/contexts/ChatContext.tsx** → WebSocket URL
5. **frontend/app/post/[id]/page.tsx** → Hardcoded URLs
6. **frontend/app/dashboard/chat/page.tsx**
7. **frontend/app/dashboard/feed/page.tsx**
8. **frontend/app/dashboard/files/page.tsx**
9. **frontend/app/share/[token]/page.tsx**
10. **frontend/app/admin/page.tsx**

### Cấu hình môi trường (3 files)
1. **.env** → `http://14.163.29.11:8086/api`
2. **.env.docker** → `http://14.163.29.11:8080/api`
3. **frontend/.env.local** → `http://14.163.29.11:8086/api`

## Các bước Fix HOÀN CHỈNH

### Bước 1: Dừng tất cả containers
```bash
cd /home/hv/DuAn/PixShare
docker-compose down
```

### Bước 2: Xóa build cũ
```bash
# Xóa frontend build cũ
rm -rf frontend/.next
rm -rf frontend/node_modules/.cache

# Xóa backend build cũ (optional)
rm -rf backend/target
```

### Bước 3: Rebuild Docker images
```bash
# Rebuild cả 2 services với --no-cache để đảm bảo build mới hoàn toàn
docker-compose build --no-cache

# Hoặc rebuild từng service
docker-compose build --no-cache backend
docker-compose build --no-cache frontend
```

### Bước 4: Mở Firewall
```bash
# Chạy script đã tạo
sudo ./open-firewall.sh

# Hoặc thủ công:
sudo ufw allow 8086/tcp
sudo ufw allow 3006/tcp
sudo ufw reload
```

### Bước 5: Start lại containers
```bash
docker-compose up -d
```

### Bước 6: Kiểm tra logs
```bash
# Xem logs backend
docker-compose logs -f backend

# Xem logs frontend
docker-compose logs -f frontend

# Kiểm tra có lỗi không
docker-compose logs | grep -i error
```

### Bước 7: Test kết nối

#### Test Backend
```bash
# Test API endpoint
curl http://14.163.29.11:8086/api

# Test login endpoint
curl -X POST http://14.163.29.11:8086/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pixshare.com","password":"admin123"}'
```

#### Test Frontend
```bash
# Test frontend accessible
curl http://14.163.29.11:3006

# Hoặc mở browser
# http://14.163.29.11:3006
```

## Script tự động (Khuyến nghị)

Tạo file `rebuild-and-restart.sh`:

```bash
#!/bin/bash

echo "======================================"
echo "  REBUILD VÀ RESTART PIXSHARE"
echo "======================================"
echo ""

cd /home/hv/DuAn/PixShare

echo "1. Dừng containers..."
docker-compose down

echo ""
echo "2. Xóa build cũ..."
rm -rf frontend/.next
rm -rf frontend/node_modules/.cache
rm -rf backend/target

echo ""
echo "3. Rebuild Docker images..."
docker-compose build --no-cache

echo ""
echo "4. Start containers..."
docker-compose up -d

echo ""
echo "5. Đợi services khởi động (30s)..."
sleep 30

echo ""
echo "6. Kiểm tra status..."
docker-compose ps

echo ""
echo "7. Test kết nối..."
echo "Backend API:"
curl -s http://14.163.29.11:8086/api || echo "FAILED"

echo ""
echo "Frontend:"
curl -s http://14.163.29.11:3006 | head -5 || echo "FAILED"

echo ""
echo "======================================"
echo "  HOÀN TẤT"
echo "======================================"
echo ""
echo "Xem logs:"
echo "  docker-compose logs -f backend"
echo "  docker-compose logs -f frontend"
echo ""
echo "Truy cập ứng dụng:"
echo "  http://14.163.29.11:3006"
echo ""
```

Chạy:
```bash
chmod +x rebuild-and-restart.sh
./rebuild-and-restart.sh
```

## Troubleshooting chi tiết

### Vấn đề 1: Backend không start
**Triệu chứng**: Container backend exit ngay sau khi start

**Kiểm tra**:
```bash
docker-compose logs backend | tail -100
```

**Nguyên nhân thường gặp**:
- MySQL chưa cho phép kết nối từ Docker
- Port 8086 đã bị chiếm

**Fix**:
```bash
# Cấp quyền MySQL
mysql -u root -p1111 << EOF
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '1111';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EOF

# Kiểm tra port
netstat -tuln | grep 8086
```

### Vấn đề 2: Frontend build fail
**Triệu chứng**: `docker-compose build frontend` báo lỗi

**Kiểm tra**:
```bash
docker-compose build frontend 2>&1 | tee build.log
```

**Fix**:
```bash
# Xóa node_modules và rebuild
rm -rf frontend/node_modules
docker-compose build --no-cache frontend
```

### Vấn đề 3: CORS error trong browser
**Triệu chứng**: Console browser hiện lỗi CORS

**Kiểm tra**: Mở Developer Tools (F12) → Console

**Fix**: Đảm bảo backend đã rebuild với CORS config mới:
```bash
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Vấn đề 4: Connection timeout
**Triệu chứng**: Không thể kết nối đến `14.163.29.11:8086`

**Kiểm tra**:
```bash
# Test từ server
curl http://localhost:8086/api

# Test từ IP public
curl http://14.163.29.11:8086/api

# Kiểm tra firewall
sudo ufw status
netstat -tuln | grep 8086
```

**Fix**:
```bash
# Mở firewall
sudo ufw allow 8086/tcp
sudo ufw allow 3006/tcp
sudo ufw reload

# Nếu trên Cloud, kiểm tra Security Groups
```

### Vấn đề 5: Frontend vẫn dùng IP cũ
**Triệu chứng**: Trong browser Network tab, thấy request đến IP cũ

**Nguyên nhân**: Frontend chưa rebuild hoặc browser cache

**Fix**:
```bash
# 1. Xóa build cũ
rm -rf frontend/.next

# 2. Rebuild
docker-compose build --no-cache frontend
docker-compose up -d frontend

# 3. Clear browser cache
# Ctrl+Shift+Delete hoặc Hard Reload (Ctrl+Shift+R)
```

## Checklist cuối cùng

Sau khi làm tất cả các bước trên, kiểm tra:

- [ ] Backend container đang chạy: `docker-compose ps`
- [ ] Frontend container đang chạy: `docker-compose ps`
- [ ] MySQL kết nối OK: `docker-compose logs backend | grep "HikariPool"`
- [ ] Backend không có error: `docker-compose logs backend | grep -i error`
- [ ] Frontend không có error: `docker-compose logs frontend | grep -i error`
- [ ] Port 8086 đang listen: `netstat -tuln | grep 8086`
- [ ] Port 3006 đang listen: `netstat -tuln | grep 3006`
- [ ] Firewall đã mở port: `sudo ufw status | grep -E '8086|3006'`
- [ ] Backend API response: `curl http://14.163.29.11:8086/api`
- [ ] Frontend accessible: `curl http://14.163.29.11:3006`
- [ ] Browser có thể truy cập: `http://14.163.29.11:3006`
- [ ] Đăng nhập thành công từ browser
- [ ] Không có CORS error trong console
- [ ] WebSocket kết nối OK (nếu dùng chat)

## Lệnh nhanh để fix toàn bộ

```bash
cd /home/hv/DuAn/PixShare

# Stop
docker-compose down

# Clean
rm -rf frontend/.next frontend/node_modules/.cache backend/target

# Rebuild
docker-compose build --no-cache

# Start
docker-compose up -d

# Wait
sleep 30

# Check
docker-compose ps
docker-compose logs backend | tail -20
docker-compose logs frontend | tail -20

# Test
curl http://14.163.29.11:8086/api
curl http://14.163.29.11:3006 | head -10
```

## Nếu vẫn không được

1. **Kiểm tra biến môi trường trong container**:
```bash
docker exec pixshare-backend printenv | grep -E "SPRING|SERVER"
docker exec pixshare-frontend printenv | grep -E "NEXT|API"
```

2. **Kiểm tra file config đã mount đúng chưa**:
```bash
docker exec pixshare-backend cat /app/BOOT-INF/classes/application.yml | grep -E "url:|allowed-origins"
```

3. **Xem full logs**:
```bash
docker-compose logs --tail=200 > full_logs.txt
cat full_logs.txt | grep -i "error\|exception\|failed"
```

4. **Test từ trong container**:
```bash
docker exec pixshare-frontend sh -c "wget -O- http://14.163.29.11:8086/api"
```

5. **Kiểm tra network**:
```bash
docker network ls
docker network inspect pixshare_pixshare-network
```

## Liên hệ hỗ trợ

Nếu sau tất cả các bước trên vẫn không được, cung cấp:
1. Output của `docker-compose logs`
2. Output của `docker-compose ps`
3. Output của `curl http://14.163.29.11:8086/api`
4. Screenshot browser console (F12)
5. Output của `sudo ufw status`

---

**Cập nhật**: 28/12/2025
**IP mới**: 14.163.29.11
**Ports**: 8086 (Backend), 3006 (Frontend)
