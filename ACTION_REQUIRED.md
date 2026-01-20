# SUMMARY - Cập nhật IP Server 14.163.29.11

## ✅ ĐÃ HOÀN THÀNH

### 📝 Tổng số files đã cập nhật: 16 files

#### Backend (3 files)
1. ✅ `backend/src/main/resources/application.yml`
   - Dòng 48: server.url
   - Dòng 84: cors.allowed-origins

2. ✅ `backend/src/main/java/com/pixshare/config/SecurityConfig.java`
   - Dòng 56-60: CORS configuration

3. ✅ `backend/src/main/java/com/pixshare/config/WebSocketConfig.java`
   - Dòng 28-31: WebSocket allowed origins

#### Frontend (10 files)
4. ✅ `.env`
5. ✅ `.env.docker`
6. ✅ `frontend/.env.local`
7. ✅ `frontend/lib/api.ts`
8. ✅ `frontend/next.config.js`
9. ✅ `frontend/contexts/ChatContext.tsx`
10. ✅ `frontend/app/post/[id]/page.tsx`
11. ✅ `frontend/app/dashboard/chat/page.tsx`
12. ✅ `frontend/app/dashboard/feed/page.tsx`
13. ✅ `frontend/app/dashboard/files/page.tsx`
14. ✅ `frontend/app/share/[token]/page.tsx`
15. ✅ `frontend/app/admin/page.tsx`

#### Build đã xóa
16. ✅ `frontend/.next` (đã xóa - cần rebuild)

---

## 🚀 HÀNH ĐỘNG CẦN LÀM

### Option 1: Chạy script tự động (KHUYẾN NGHỊ)
```bash
./rebuild-and-restart.sh
```

### Option 2: Thủ công từng bước

#### Bước 1: Rebuild và restart
```bash
docker-compose down
rm -rf frontend/.next backend/target
docker-compose build --no-cache
docker-compose up -d
```

#### Bước 2: Mở firewall
```bash
sudo ./open-firewall.sh
```

#### Bước 3: Kiểm tra
```bash
docker-compose ps
docker-compose logs backend | tail -20
docker-compose logs frontend | tail -20
```

#### Bước 4: Test
```bash
curl http://14.163.29.11:8086/api
curl http://14.163.29.11:3006
```

---

## 📋 CHECKLIST

### Trước khi rebuild
- [x] Đã cập nhật tất cả file backend config
- [x] Đã cập nhật tất cả file frontend config
- [x] Đã xóa build cũ (.next folder)
- [ ] Đã backup database (nếu cần)

### Sau khi rebuild
- [ ] Backend container đang chạy
- [ ] Frontend container đang chạy
- [ ] Không có error trong logs
- [ ] Port 8086 và 3006 đã mở trong firewall
- [ ] Test API thành công: `curl http://14.163.29.11:8086/api`
- [ ] Test frontend thành công: `curl http://14.163.29.11:3006`

### Test từ browser
- [ ] Truy cập được `http://14.163.29.11:3006`
- [ ] Không có CORS error trong console (F12)
- [ ] Đăng nhập thành công
- [ ] Upload/download file OK
- [ ] Chat/WebSocket hoạt động

---

## 🔍 KIỂM TRA NHANH

### Kiểm tra IP trong config
```bash
# Backend
grep -r "113.187\|113.170" backend/src/ --include="*.java" --include="*.yml"
# Kỳ vọng: Không có kết quả

# Frontend source
grep -r "113.187\|113.170" frontend/ --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir=".next" --exclude-dir="node_modules"
# Kỳ vọng: Không có kết quả

# Env files
cat .env | grep API
cat .env.docker | grep API
cat frontend/.env.local | grep API
# Kỳ vọng: Tất cả đều là 14.163.29.11
```

### Kiểm tra containers
```bash
docker-compose ps
# Kỳ vọng: Cả 2 containers đều "Up"

docker exec pixshare-backend printenv | grep -E "SPRING|SERVER"
docker exec pixshare-frontend printenv | grep API
# Kỳ vọng: Có biến môi trường đúng
```

### Kiểm tra ports
```bash
netstat -tuln | grep -E '8086|3006'
# Kỳ vọng: 
# 0.0.0.0:8086 LISTEN
# 0.0.0.0:3006 LISTEN
```

### Kiểm tra firewall
```bash
sudo ufw status | grep -E '8086|3006'
# Kỳ vọng:
# 8086/tcp ALLOW
# 3006/tcp ALLOW
```

---

## ❗ TROUBLESHOOTING

### Vấn đề: Frontend vẫn dùng IP cũ
**Nguyên nhân**: Build cũ chưa xóa hoặc browser cache

**Fix**:
```bash
# 1. Xóa build
rm -rf frontend/.next

# 2. Rebuild
docker-compose build --no-cache frontend
docker-compose up -d frontend

# 3. Clear browser cache (Ctrl+Shift+Delete)
```

### Vấn đề: CORS error
**Nguyên nhân**: Backend chưa rebuild với config mới

**Fix**:
```bash
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Vấn đề: Connection timeout
**Nguyên nhân**: Firewall chặn port

**Fix**:
```bash
sudo ufw allow 8086/tcp
sudo ufw allow 3006/tcp
sudo ufw reload
```

### Vấn đề: Backend crash
**Nguyên nhân**: MySQL không cho phép kết nối từ Docker

**Fix**:
```bash
mysql -u root -p1111 << EOF
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '1111';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EOF

docker-compose restart backend
```

---

## 📚 TÀI LIỆU THAM KHẢO

1. **COMPLETE_FIX_GUIDE.md** - Hướng dẫn chi tiết đầy đủ
2. **DOC_UPDATE_IP_SERVER.md** - Tài liệu kỹ thuật về cập nhật IP
3. **IP_UPDATE_SUMMARY.md** - Tóm tắt ngắn gọn
4. **DEPLOYMENT_CHECKLIST.md** - Checklist deploy production
5. **FIX_LOGIN_ISSUE.md** - Fix lỗi đăng nhập cụ thể

## 🛠️ SCRIPTS HỖ TRỢ

1. **rebuild-and-restart.sh** - Rebuild và restart tự động
2. **open-firewall.sh** - Mở firewall tự động
3. **verify-ip-update.sh** - Kiểm tra IP đã cập nhật đúng chưa

---

## 📞 LIÊN HỆ

Nếu sau tất cả các bước vẫn không được, cung cấp:

```bash
# Thu thập thông tin debug
docker-compose ps > debug_info.txt
docker-compose logs >> debug_info.txt
sudo ufw status >> debug_info.txt
netstat -tuln | grep -E '8086|3006' >> debug_info.txt
curl -v http://14.163.29.11:8086/api 2>&1 >> debug_info.txt

# Gửi file debug_info.txt
```

---

**Ngày cập nhật**: 28/12/2025  
**IP cũ**: 113.187.152.149, 113.170.159.180  
**IP mới**: 14.163.29.11  
**Status**: ✅ Code đã cập nhật, ⏳ Cần rebuild và restart
