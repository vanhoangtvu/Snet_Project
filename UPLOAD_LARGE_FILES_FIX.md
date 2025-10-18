# Fix Upload Large Files (60-100MB+)

## 🔍 Vấn đề
Upload file từ 60-70MB trở lên bị lỗi sau khi progress bar chạy đến 100%.

## ✅ Các thay đổi đã thực hiện

### 1. Frontend Timeout (`frontend/lib/api.ts`)
**Trước:**
```typescript
timeout: 600000, // 10 minutes
```

**Sau:**
```typescript
timeout: 1800000, // 30 minutes timeout for large files (60-100MB)
```

### 2. Backend MySQL Connection (`backend/application.yml`)

#### Thêm MySQL Connection & Socket Timeout
```yaml
datasource:
  url: jdbc:mysql://...&connectTimeout=300000&socketTimeout=600000
  hikari:
    connection-timeout: 300000  # 5 minutes
    maximum-pool-size: 20
    minimum-idle: 5
    idle-timeout: 600000  # 10 minutes
    max-lifetime: 1800000  # 30 minutes
```

#### Optimize Hibernate cho BLOB lớn
```yaml
jpa:
  properties:
    hibernate:
      jdbc:
        batch_size: 20
      order_inserts: true
      order_updates: true
```

#### Tăng Tomcat Timeout
```yaml
server:
  tomcat:
    connection-timeout: 600000  # 10 minutes
    keep-alive-timeout: 600000  # 10 minutes
    max-keep-alive-requests: 100
    accept-count: 100
    max-connections: 10000
```

### 3. MySQL Configuration (Docker Compose)
```yaml
mysql:
  command: [
    "mysqld",
    "--max_allowed_packet=1G",
    "--innodb_log_file_size=1G",
    "--innodb_log_buffer_size=256M"
  ]
```

## 🔧 Cách áp dụng

### Nếu chạy Docker:
```bash
cd /home/hv/DuAn/PixShare

# Stop containers
docker-compose down

# Rebuild
docker-compose up --build -d

# Xem logs để kiểm tra
docker-compose logs -f backend
```

### Nếu chạy Local:

#### Backend:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

#### Frontend:
```bash
cd frontend
npm install  # Không cần vì chỉ sửa file TS
npm run dev
```

#### MySQL Local:
```bash
# Kiểm tra max_allowed_packet hiện tại
mysql -u root -p -e "SHOW VARIABLES LIKE 'max_allowed_packet';"

# Nếu < 1GB, cập nhật trong /etc/mysql/my.cnf hoặc my.ini:
[mysqld]
max_allowed_packet=1G
innodb_log_file_size=1G
innodb_log_buffer_size=256M

# Restart MySQL
sudo systemctl restart mysql
# hoặc trên Windows: net stop mysql && net start mysql
```

## 🧪 Test Upload

### Test với file 70MB:
```bash
# Tạo file test 70MB
dd if=/dev/zero of=test70mb.bin bs=1M count=70

# Upload qua UI: http://localhost:3006/dashboard/files
```

### Theo dõi logs:

**Backend logs:**
```bash
# Docker
docker-compose logs -f backend

# Local
tail -f backend/logs/spring.log
```

**Frontend console:**
- Mở Developer Tools (F12)
- Tab Console
- Tab Network để xem upload progress

## 📊 Timeout Summary

| Component | Timeout | Mục đích |
|-----------|---------|----------|
| Frontend axios | 30 phút | Upload request timeout |
| Tomcat connection | 10 phút | HTTP connection timeout |
| MySQL connect | 5 phút | Initial connection |
| MySQL socket | 10 phút | Query execution timeout |
| HikariCP connection | 5 phút | Pool get connection |
| HikariCP idle | 10 phút | Keep connection alive |

## ⚠️ Lưu ý quan trọng

1. **Mạng chậm:** Nếu mạng upload < 1Mbps, file 70MB có thể mất > 10 phút
2. **MySQL insert:** Insert LONGBLOB 70MB có thể mất 1-3 phút
3. **Progress bar:** Chạy đến 100% không có nghĩa đã save vào DB
4. **RAM:** Upload file lớn tốn RAM (70MB file = ~140MB RAM usage)

## 🐛 Nếu vẫn lỗi

### Kiểm tra logs backend:
```bash
grep -i "error\|exception\|timeout" backend/logs/spring.log
# Hoặc
docker-compose logs backend | grep -i "error\|timeout"
```

### Các lỗi thường gặp:

**1. MySQL Packet too large:**
```
Packet for query is too large (X > 67108864)
```
**Fix:** Tăng `max_allowed_packet` trong MySQL

**2. Timeout waiting for connection:**
```
Connection is not available, request timed out after...
```
**Fix:** Tăng `hikari.maximum-pool-size`

**3. SocketTimeoutException:**
```
Read timed out
```
**Fix:** Tăng `socketTimeout` trong JDBC URL

**4. OutOfMemoryError:**
```
Java heap space
```
**Fix:** Tăng JVM memory:
```bash
# Docker: trong Dockerfile
ENV JAVA_OPTS="-Xms512m -Xmx2048m"

# Local: khi chạy
java -Xmx2048m -jar app.jar
```

## 📈 Monitor upload

### Kiểm tra trong MySQL:
```sql
-- Kiểm tra file đã save chưa
SELECT id, file_name, file_size, upload_date 
FROM file_metadata 
ORDER BY upload_date DESC 
LIMIT 5;

-- Kiểm tra storage user
SELECT email, storage_used, storage_quota 
FROM users 
WHERE storage_used > 50000000  -- > 50MB
ORDER BY storage_used DESC;
```

### Kiểm tra system resources:
```bash
# Docker stats
docker stats pixshare-backend pixshare-mysql

# Memory
free -h

# Disk I/O
iostat -x 1
```

## ✅ Expected Behavior

**Khi upload file 70MB thành công:**

1. ⏳ Progress bar: 0% → 100% (2-5 phút tùy mạng)
2. 💾 Backend nhận file (log: "Received file upload...")
3. 📊 Backend insert vào MySQL (1-3 phút, có thể im lặng)
4. ✅ Response success + file info
5. 🎉 Hiển thị file trong list

**Timeline dự kiến cho 70MB:**
- Upload network: 1-3 phút (với 3-5 Mbps)
- Backend process: 30 giây
- MySQL insert: 1-2 phút
- **Tổng:** 3-6 phút

