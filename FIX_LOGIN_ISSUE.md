# Hướng dẫn Fix lỗi không đăng nhập được từ Frontend

## Vấn đề hiện tại

Frontend không thể kết nối đến Backend qua IP public `14.163.29.11:8086`

## Nguyên nhân

1. ✅ **Backend đang chạy** - Container backend đã start thành công
2. ✅ **MySQL đã kết nối** - Database connection OK
3. ✅ **Localhost hoạt động** - `curl http://localhost:8086` OK
4. ❌ **IP Public bị chặn** - `curl http://14.163.29.11:8086` TIMEOUT

→ **Firewall đang chặn port 8086 từ bên ngoài**

## Giải pháp

### Bước 1: Kiểm tra Firewall (UFW)

```bash
sudo ufw status
```

Nếu firewall đang active, cần mở port:

```bash
# Mở port 8086 cho backend
sudo ufw allow 8086/tcp

# Mở port 3006 cho frontend
sudo ufw allow 3006/tcp

# Kiểm tra lại
sudo ufw status numbered
```

### Bước 2: Kiểm tra iptables

```bash
# Xem rules hiện tại
sudo iptables -L -n -v

# Nếu cần, thêm rule cho phép port 8086
sudo iptables -A INPUT -p tcp --dport 8086 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3006 -j ACCEPT

# Lưu rules
sudo netfilter-persistent save
```

### Bước 3: Kiểm tra Docker binding

```bash
# Xem Docker đang bind port như thế nào
docker-compose ps
netstat -tuln | grep -E '8086|3006'
```

Đảm bảo trong `docker-compose.yml` có:
```yaml
ports:
  - "0.0.0.0:8086:8086"  # Bind vào tất cả interfaces
```

### Bước 4: Test kết nối

```bash
# Test từ localhost
curl http://localhost:8086/api

# Test từ IP local
curl http://127.0.0.1:8086/api

# Test từ IP public (từ máy khác hoặc dùng telnet)
telnet 14.163.29.11 8086

# Hoặc dùng nc
nc -zv 14.163.29.11 8086
```

### Bước 5: Kiểm tra Cloud/VPS Firewall

Nếu server đang chạy trên Cloud (AWS, GCP, Azure, DigitalOcean, v.v.), cần:

1. **Vào Security Groups / Firewall settings**
2. **Thêm Inbound Rules**:
   - Port: 8086, Protocol: TCP, Source: 0.0.0.0/0 (hoặc IP cụ thể)
   - Port: 3006, Protocol: TCP, Source: 0.0.0.0/0

### Bước 6: Restart services

```bash
# Restart Docker
docker-compose down
docker-compose up -d

# Xem logs
docker-compose logs -f backend
```

## Giải pháp tạm thời (Development)

Nếu đang test local và không muốn mở firewall, có thể:

### Option 1: Sử dụng SSH Tunnel

```bash
# Từ máy client
ssh -L 8086:localhost:8086 user@14.163.29.11
ssh -L 3006:localhost:3006 user@14.163.29.11

# Sau đó truy cập http://localhost:8086 và http://localhost:3006
```

### Option 2: Thay đổi cấu hình để dùng localhost

Nếu bạn đang test trên cùng máy server:

1. Sửa `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8086/api
```

2. Rebuild frontend:
```bash
cd frontend
npm run build
cd ..
docker-compose restart frontend
```

3. Truy cập: `http://localhost:3006`

## Kiểm tra sau khi fix

### 1. Test API endpoint
```bash
curl http://14.163.29.11:8086/api
# Kỳ vọng: Không timeout, có response
```

### 2. Test login endpoint
```bash
curl -X POST http://14.163.29.11:8086/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pixshare.com","password":"admin123"}'
# Kỳ vọng: Trả về token
```

### 3. Test từ browser
1. Mở browser
2. Truy cập `http://14.163.29.11:3006`
3. Mở Developer Tools (F12) → Console
4. Thử đăng nhập
5. Xem Network tab để check request đến backend

## Troubleshooting

### Lỗi: Connection refused
```bash
# Backend chưa start hoặc crashed
docker-compose logs backend

# Restart
docker-compose restart backend
```

### Lỗi: Connection timeout
```bash
# Firewall đang chặn
sudo ufw allow 8086/tcp
sudo ufw allow 3006/tcp
```

### Lỗi: CORS
Nếu thấy lỗi CORS trong browser console:
```bash
# Kiểm tra backend có cấu hình CORS đúng không
docker-compose logs backend | grep -i cors
```

Backend cần có:
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("*"); // Hoặc specific domain
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        return new CorsFilter(source);
    }
}
```

### Lỗi: 500 Internal Server Error
```bash
# Xem logs chi tiết
docker-compose logs backend | tail -100

# Thường do:
# - Database connection issue
# - Missing environment variables
# - Code error
```

## Checklist hoàn chỉnh

- [ ] Backend container đang chạy
- [ ] MySQL kết nối thành công
- [ ] Port 8086 đã mở trong firewall (ufw/iptables)
- [ ] Port 3006 đã mở trong firewall
- [ ] Cloud Security Group đã cấu hình (nếu có)
- [ ] Test `curl http://14.163.29.11:8086/api` thành công
- [ ] Test `curl http://14.163.29.11:3006` thành công
- [ ] Browser có thể truy cập frontend
- [ ] Browser console không có lỗi CORS
- [ ] Đăng nhập thành công từ browser

## Lệnh nhanh để fix

```bash
# 1. Mở firewall
sudo ufw allow 8086/tcp
sudo ufw allow 3006/tcp

# 2. Restart Docker
cd /home/hv/DuAn/PixShare
docker-compose down
docker-compose up -d

# 3. Kiểm tra logs
docker-compose logs -f backend

# 4. Test
curl http://14.163.29.11:8086/api
curl http://14.163.29.11:3006

# 5. Nếu OK, test login từ browser
# Truy cập: http://14.163.29.11:3006
```

## Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề, cung cấp thông tin sau:
1. Output của `docker-compose logs backend`
2. Output của `sudo ufw status`
3. Output của `netstat -tuln | grep -E '8086|3006'`
4. Screenshot lỗi trong browser console
