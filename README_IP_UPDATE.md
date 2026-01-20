# 📋 Hướng dẫn cập nhật IP Server - PixShare Project

## 📌 Tổng quan

Dự án PixShare đã được cập nhật để kết nối đến server mới với địa chỉ IP: **14.163.29.11**

### Thông tin thay đổi
- **IP cũ**: 113.187.152.149, 113.170.159.180
- **IP mới**: 14.163.29.11
- **Ngày cập nhật**: 28/12/2025
- **Trạng thái**: ✅ Hoàn thành và đã kiểm tra

---

## 📁 Tài liệu liên quan

### 1. **IP_UPDATE_SUMMARY.md** 
📄 Tóm tắt ngắn gọn về việc cập nhật
- Danh sách files đã thay đổi
- Hướng dẫn rebuild và restart
- Lệnh rollback nhanh

**Đọc file này nếu**: Bạn cần overview nhanh về những gì đã thay đổi

### 2. **DOC_UPDATE_IP_SERVER.md**
📚 Tài liệu chi tiết đầy đủ
- Chi tiết từng file đã cập nhật
- Giải thích từng vị trí thay đổi
- Hướng dẫn kiểm tra và test
- Troubleshooting guide

**Đọc file này nếu**: Bạn cần hiểu chi tiết kỹ thuật hoặc debug vấn đề

### 3. **DEPLOYMENT_CHECKLIST.md**
✅ Checklist deploy production
- Các bước chuẩn bị trước deploy
- Quy trình deploy từng bước
- Kiểm tra chức năng đầy đủ
- Monitoring và troubleshooting
- Rollback plan

**Đọc file này nếu**: Bạn đang chuẩn bị deploy lên production

### 4. **verify-ip-update.sh**
🔍 Script tự động kiểm tra
- Verify tất cả files đã cập nhật đúng
- Kiểm tra không còn IP cũ
- Test kết nối server (optional)

**Chạy script này**: Trước và sau khi deploy để đảm bảo mọi thứ OK

---

## 🚀 Quick Start

### Kiểm tra cập nhật
```bash
# Chạy script verify
./verify-ip-update.sh
```

### Rebuild và Deploy
```bash
# 1. Build frontend
cd frontend
npm run build
cd ..

# 2. Restart Docker
docker-compose down
docker-compose up -d

# 3. Kiểm tra logs
docker-compose logs -f
```

### Test nhanh
```bash
# Test API
curl http://14.163.29.11:8086/api

# Test frontend
curl http://14.163.29.11:3006
```

---

## 📊 Thống kê cập nhật

- **Tổng số files**: 13 files
- **File cấu hình**: 3 files (.env, .env.docker, .env.local)
- **File source code**: 10 files (TypeScript/JavaScript)
- **Số vị trí thay đổi**: ~30 locations
- **Kiểm tra tự động**: ✅ 8/8 tests passed

---

## 🔧 Các thành phần đã cập nhật

✅ API Base URL (fallback values)  
✅ Environment configuration files  
✅ User avatar URLs  
✅ File preview/download URLs  
✅ Video streaming URLs  
✅ WebSocket connection URLs  
✅ Next.js image optimization domains  
✅ Public share URLs  
✅ Admin panel URLs  
✅ Chat/messaging URLs  

---

## ⚠️ Lưu ý quan trọng

### Port Configuration
- **Production (.env)**: Port 8086
- **Docker alternative (.env.docker)**: Port 8080
- **Frontend**: Port 3006

### Sau khi cập nhật code
1. ✅ Rebuild frontend: `cd frontend && npm run build`
2. ✅ Restart containers: `docker-compose restart`
3. ✅ Clear browser cache
4. ✅ Test các chức năng chính

### Trước khi deploy production
- [ ] Backup database
- [ ] Backup uploaded files
- [ ] Test trên môi trường staging (nếu có)
- [ ] Đọc DEPLOYMENT_CHECKLIST.md
- [ ] Chuẩn bị rollback plan

---

## 🆘 Troubleshooting

### Frontend không kết nối được backend
```bash
# Kiểm tra .env
cat frontend/.env.local

# Rebuild
cd frontend && npm run build && cd ..

# Restart
docker-compose restart frontend
```

### WebSocket không hoạt động
```bash
# Kiểm tra backend logs
docker-compose logs backend | grep -i websocket

# Kiểm tra firewall
sudo ufw status
```

### Upload file bị lỗi
```bash
# Kiểm tra disk space
df -h

# Kiểm tra permissions
ls -la backend/uploads/

# Xem logs
docker-compose logs backend | grep -i upload
```

---

## 🔄 Rollback

Nếu cần quay lại IP cũ:

```bash
# Rollback tất cả
sed -i 's|14.163.29.11:8086|113.187.152.149:8086|g' .env frontend/.env.local
sed -i 's|14.163.29.11:8080|113.170.159.180:8080|g' .env.docker
find frontend -name "*.tsx" -o -name "*.ts" -o -name "*.js" | xargs sed -i 's|14.163.29.11|113.187.152.149|g'

# Rebuild và restart
cd frontend && npm run build && cd ..
docker-compose down && docker-compose up -d
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Đọc DOC_UPDATE_IP_SERVER.md phần Troubleshooting
2. Kiểm tra logs: `docker-compose logs`
3. Chạy verify script: `./verify-ip-update.sh`
4. Xem DEPLOYMENT_CHECKLIST.md

---

## 📝 Changelog

### [1.0.0] - 2025-12-28
#### Changed
- Cập nhật IP server từ 113.187.152.149 → 14.163.29.11
- Cập nhật IP server từ 113.170.159.180 → 14.163.29.11
- Cập nhật 13 files (3 config + 10 source)

#### Added
- Script verify tự động (verify-ip-update.sh)
- Tài liệu chi tiết (DOC_UPDATE_IP_SERVER.md)
- Deployment checklist (DEPLOYMENT_CHECKLIST.md)
- Quick summary (IP_UPDATE_SUMMARY.md)

#### Verified
- ✅ Không còn IP cũ trong source code
- ✅ Tất cả file config đã cập nhật
- ✅ Script verify pass 8/8 tests

---

**Cập nhật lần cuối**: 28/12/2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
