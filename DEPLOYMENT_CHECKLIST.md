# Checklist Deploy với IP mới 14.163.29.11

## Trước khi deploy

- [x] Cập nhật tất cả file cấu hình (.env, .env.docker, .env.local)
- [x] Cập nhật tất cả file source code
- [x] Verify không còn IP cũ trong code
- [x] Tạo script kiểm tra tự động
- [x] Tạo tài liệu hướng dẫn

## Deploy lên server

### Bước 1: Backup dữ liệu
```bash
# Backup database
docker exec pixshare-mysql-1 mysqldump -u root -p1111 PixShare_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup uploaded files (nếu có)
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz backend/uploads/
```
- [ ] Database đã backup
- [ ] Files đã backup

### Bước 2: Stop services hiện tại
```bash
docker-compose down
```
- [ ] Services đã dừng

### Bước 3: Pull code mới (nếu dùng Git)
```bash
git pull origin main
# hoặc upload files thủ công
```
- [ ] Code mới đã có trên server

### Bước 4: Rebuild và start
```bash
# Build lại frontend
cd frontend
npm install  # nếu có dependencies mới
npm run build
cd ..

# Start Docker
docker-compose up -d --build
```
- [ ] Frontend đã build
- [ ] Docker containers đã start

### Bước 5: Kiểm tra logs
```bash
# Xem logs
docker-compose logs -f

# Hoặc xem từng service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```
- [ ] Backend khởi động thành công
- [ ] Frontend khởi động thành công
- [ ] MySQL kết nối OK
- [ ] Không có lỗi nghiêm trọng

### Bước 6: Test kết nối
```bash
# Test API
curl http://14.163.29.11:8086/api

# Test frontend
curl http://14.163.29.11:3006
```
- [ ] API response OK
- [ ] Frontend accessible

## Kiểm tra chức năng

### Authentication
- [ ] Đăng ký tài khoản mới
- [ ] Đăng nhập
- [ ] Đăng xuất
- [ ] Token được lưu và sử dụng đúng

### File Management
- [ ] Upload file nhỏ (<10MB)
- [ ] Upload file lớn (>50MB)
- [ ] Download file
- [ ] Preview ảnh
- [ ] Stream video
- [ ] Delete file

### Social Features
- [ ] Tạo post mới
- [ ] Like/Unlike post
- [ ] Comment
- [ ] View user profile
- [ ] User avatar hiển thị đúng

### Chat/Messaging
- [ ] Gửi tin nhắn text
- [ ] Gửi file qua chat
- [ ] WebSocket kết nối OK
- [ ] Nhận tin nhắn realtime
- [ ] Notification hoạt động

### Public Sharing
- [ ] Tạo public share link
- [ ] Truy cập share link (không cần login)
- [ ] QR code hiển thị
- [ ] Download từ share link

### Admin Panel
- [ ] Truy cập admin panel
- [ ] Xem dashboard stats
- [ ] Quản lý users
- [ ] Quản lý files
- [ ] View logs

## Performance Check

- [ ] Trang load nhanh (<3s)
- [ ] Upload file không bị timeout
- [ ] Video stream mượt
- [ ] WebSocket stable (không disconnect liên tục)
- [ ] Memory usage ổn định

## Security Check

- [ ] HTTPS (nếu có SSL)
- [ ] CORS configured đúng
- [ ] Authentication required cho protected routes
- [ ] File upload validation hoạt động
- [ ] SQL injection protected

## Browser Compatibility

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (nếu có)
- [ ] Mobile browsers

## Monitoring

### Kiểm tra resource usage
```bash
# CPU, Memory
docker stats

# Disk space
df -h

# Network
netstat -tuln | grep -E '8086|3006'
```
- [ ] CPU usage < 80%
- [ ] Memory usage < 80%
- [ ] Disk space đủ
- [ ] Ports đang listen

### Log monitoring
```bash
# Theo dõi logs realtime
docker-compose logs -f --tail=100

# Tìm errors
docker-compose logs | grep -i error
docker-compose logs | grep -i exception
```
- [ ] Không có errors nghiêm trọng
- [ ] Warnings được xử lý

## Troubleshooting

### Nếu frontend không kết nối được backend:
1. Kiểm tra NEXT_PUBLIC_API_URL trong .env
2. Rebuild frontend: `cd frontend && npm run build`
3. Clear browser cache
4. Restart containers: `docker-compose restart`

### Nếu WebSocket không hoạt động:
1. Kiểm tra ChatContext.tsx có đúng IP
2. Kiểm tra firewall cho phép port 8086
3. Kiểm tra backend logs: `docker-compose logs backend | grep -i websocket`

### Nếu upload file bị lỗi:
1. Kiểm tra disk space: `df -h`
2. Kiểm tra permissions: `ls -la backend/uploads/`
3. Kiểm tra nginx/proxy timeout settings
4. Xem backend logs khi upload

### Nếu database không kết nối:
1. Kiểm tra MySQL container: `docker-compose ps`
2. Kiểm tra MySQL logs: `docker-compose logs mysql`
3. Test connection: `docker exec -it pixshare-mysql-1 mysql -u root -p1111`

## Rollback Plan

Nếu có vấn đề nghiêm trọng:

```bash
# 1. Stop current version
docker-compose down

# 2. Restore database
docker-compose up -d mysql
docker exec -i pixshare-mysql-1 mysql -u root -p1111 PixShare_db < backup_YYYYMMDD_HHMMSS.sql

# 3. Rollback code (nếu dùng Git)
git checkout <previous-commit-hash>

# 4. Rollback IP changes
sed -i 's|14.163.29.11:8086|113.187.152.149:8086|g' .env frontend/.env.local
sed -i 's|14.163.29.11:8080|113.170.159.180:8080|g' .env.docker
find frontend -name "*.tsx" -o -name "*.ts" -o -name "*.js" | xargs sed -i 's|14.163.29.11|113.187.152.149|g'

# 5. Rebuild and restart
cd frontend && npm run build && cd ..
docker-compose up -d --build
```

## Post-deployment

- [ ] Thông báo cho users về IP mới (nếu cần)
- [ ] Update DNS records (nếu có domain)
- [ ] Update documentation
- [ ] Monitor trong 24h đầu
- [ ] Backup lại sau khi stable

## Notes

- Server IP: 14.163.29.11
- Backend Port: 8086
- Frontend Port: 3006
- Database: MySQL 8.0
- Deployment method: Docker Compose

---

**Người thực hiện**: _______________
**Ngày deploy**: _______________
**Kết quả**: [ ] Thành công  [ ] Có vấn đề  [ ] Rollback
**Ghi chú**: _______________________________________________
