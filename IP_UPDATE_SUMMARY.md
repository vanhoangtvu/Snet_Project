# Tóm tắt cập nhật IP Server

## Thông tin
- **Ngày**: 28/12/2025
- **IP cũ**: 113.187.152.149, 113.170.159.180
- **IP mới**: 14.163.29.11
- **Trạng thái**: ✅ Hoàn thành

## Files đã cập nhật (13 files)

### Cấu hình (3 files)
1. `.env` - Port 8086
2. `.env.docker` - Port 8080  
3. `frontend/.env.local` - Port 8086

### Source Code (10 files)
4. `frontend/lib/api.ts`
5. `frontend/next.config.js`
6. `frontend/contexts/ChatContext.tsx`
7. `frontend/app/post/[id]/page.tsx`
8. `frontend/app/dashboard/chat/page.tsx`
9. `frontend/app/dashboard/feed/page.tsx`
10. `frontend/app/dashboard/files/page.tsx`
11. `frontend/app/share/[token]/page.tsx`
12. `frontend/app/admin/page.tsx`

## Kiểm tra
Chạy script kiểm tra:
```bash
./verify-ip-update.sh
```

Kết quả: ✅ 8/8 tests passed

## Các bước tiếp theo

### 1. Rebuild Frontend
```bash
cd frontend
npm run build
cd ..
```

### 2. Restart Docker
```bash
docker-compose down
docker-compose up -d
```

### 3. Kiểm tra logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 4. Test các chức năng
- [ ] Login/Register
- [ ] Upload/Download files
- [ ] Chat/WebSocket
- [ ] Video streaming
- [ ] Public sharing
- [ ] Admin panel

## Rollback (nếu cần)
```bash
# Rollback tất cả
sed -i 's|14.163.29.11:8086|113.187.152.149:8086|g' .env frontend/.env.local
sed -i 's|14.163.29.11:8080|113.170.159.180:8080|g' .env.docker
find frontend -name "*.tsx" -o -name "*.ts" -o -name "*.js" | xargs sed -i 's|14.163.29.11|113.187.152.149|g'

# Restart
docker-compose restart
```

## Tài liệu chi tiết
Xem file: `DOC_UPDATE_IP_SERVER.md`
