# Tài liệu cập nhật địa chỉ IP Server

## Thông tin cập nhật
- **Ngày cập nhật**: 28/12/2025
- **IP cũ**: 113.187.152.149, 113.170.159.180
- **IP mới**: 14.163.29.11

## Danh sách các file đã cập nhật

### 1. File cấu hình môi trường

#### `.env`
- **Mục đích**: Cấu hình cho Docker Compose (production)
- **Port**: 8086
- **Thay đổi**:
  ```
  NEXT_PUBLIC_API_URL=http://14.163.29.11:8086/api
  ```

#### `.env.docker`
- **Mục đích**: Cấu hình Docker alternative
- **Port**: 8080
- **Thay đổi**:
  ```
  NEXT_PUBLIC_API_URL=http://14.163.29.11:8080/api
  ```

#### `frontend/.env.local`
- **Mục đích**: Cấu hình local development cho Next.js
- **Port**: 8086
- **Thay đổi**:
  ```
  NEXT_PUBLIC_API_URL=http://14.163.29.11:8086/api
  ```

### 2. File mã nguồn Frontend

#### `frontend/lib/api.ts`
- **Dòng 3**: API_BASE_URL fallback
- **Thay đổi**:
  ```typescript
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://14.163.29.11:8086/api';
  ```

#### `frontend/app/post/[id]/page.tsx`
- **Các vị trí**: 
  - Dòng 42: API_URL constant
  - Dòng 131: User avatar URL
  - Dòng 158: File preview URL
  - Dòng 169: File preview URL (video)
- **Thay đổi**: Tất cả hardcoded URLs từ `113.187.152.149:8086` → `14.163.29.11:8086`

#### `frontend/app/dashboard/chat/page.tsx`
- **Dòng 856**: File thumbnail URL
- **Thay đổi**: `113.187.152.149:8086` → `14.163.29.11:8086`

#### `frontend/app/dashboard/feed/page.tsx`
- **Các vị trí**:
  - Dòng 553: User avatar
  - Dòng 678, 680, 686: Post images
  - Dòng 727: Video streaming
  - Dòng 867, 955: User avatars
  - Dòng 986, 992: File preview
  - Dòng 1130, 1137: File grid
- **Thay đổi**: Tất cả URLs từ `113.187.152.149:8086` → `14.163.29.11:8086`

#### `frontend/app/dashboard/files/page.tsx`
- **Các vị trí**:
  - Dòng 174, 334: API URL constants
  - Dòng 1170: Video streaming
- **Thay đổi**: `113.187.152.149:8086` → `14.163.29.11:8086`

#### `frontend/app/share/[token]/page.tsx`
- **Các vị trí**:
  - Dòng 43, 73, 88: API URL constants
- **Thay đổi**: `113.187.152.149:8086` → `14.163.29.11:8086`

#### `frontend/app/admin/page.tsx`
- **Các vị trí**:
  - Dòng 79: API URL constant
  - Dòng 1158, 1231: File download URLs
- **Thay đổi**: `113.187.152.149:8086` → `14.163.29.11:8086`

#### `frontend/contexts/ChatContext.tsx`
- **Dòng 67**: WebSocket URL
- **Thay đổi**: 
  ```typescript
  const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://14.163.29.11:8086';
  ```

#### `frontend/next.config.js`
- **Dòng 5**: Next.js Image Optimization domains
- **Thay đổi**:
  ```javascript
  domains: ['localhost', '14.163.29.11']
  ```

## Tổng kết

### Thống kê
- **Tổng số file đã cập nhật**: 13 files
- **File cấu hình**: 3 files
- **File mã nguồn**: 10 files
- **Tổng số vị trí thay đổi**: ~30 locations

### Các thành phần đã được cập nhật
1. ✅ API Base URL (fallback values)
2. ✅ Environment configuration files
3. ✅ User avatar URLs
4. ✅ File preview/download URLs
5. ✅ Video streaming URLs
6. ✅ WebSocket connection URLs
7. ✅ Next.js image optimization domains
8. ✅ Public share URLs
9. ✅ Admin panel URLs
10. ✅ Chat/messaging URLs

### Lưu ý quan trọng

#### Port configuration
- **Production (`.env`)**: Port 8086
- **Docker alternative (`.env.docker`)**: Port 8080
- **Local development**: Port 8086

#### Sau khi cập nhật cần:
1. **Restart Docker containers**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

2. **Rebuild frontend** (nếu cần):
   ```bash
   cd frontend
   npm run build
   ```

3. **Clear browser cache** để đảm bảo không còn cache URLs cũ

4. **Kiểm tra kết nối**:
   - Test API endpoint: `http://14.163.29.11:8086/api`
   - Test WebSocket: `ws://14.163.29.11:8086`

#### Các endpoint cần kiểm tra
- [ ] Login/Register
- [ ] File upload/download
- [ ] Image preview
- [ ] Video streaming
- [ ] WebSocket chat
- [ ] User avatars
- [ ] Public sharing
- [ ] Admin panel

### Backup
Trước khi deploy, đảm bảo đã backup:
- Database
- Uploaded files
- Configuration files

### Rollback
Nếu cần rollback về IP cũ, chạy:
```bash
# Rollback .env
sed -i 's|14.163.29.11:8086|113.187.152.149:8086|g' .env

# Rollback .env.docker
sed -i 's|14.163.29.11:8080|113.170.159.180:8080|g' .env.docker

# Rollback frontend/.env.local
sed -i 's|14.163.29.11:8086|113.187.152.149:8086|g' frontend/.env.local

# Rollback source files
find frontend -name "*.tsx" -o -name "*.ts" -o -name "*.js" | xargs sed -i 's|14.163.29.11:8086|113.187.152.149:8086|g'
```

## Kiểm tra sau cập nhật

### 1. Kiểm tra file cấu hình
```bash
grep -r "14.163.29.11" .env* frontend/.env.local
```

### 2. Kiểm tra source code
```bash
grep -r "14.163.29.11" frontend/lib/ frontend/app/ frontend/contexts/
```

### 3. Kiểm tra không còn IP cũ
```bash
grep -r "113.187.152.149\|113.170.159.180" frontend/ --include="*.ts" --include="*.tsx" --include="*.js"
```

### 4. Test kết nối
```bash
# Test API
curl http://14.163.29.11:8086/api/health

# Test WebSocket (nếu có endpoint test)
wscat -c ws://14.163.29.11:8086
```

## Changelog

### Version 1.0 - 28/12/2025
- Cập nhật toàn bộ IP server từ 113.187.152.149 và 113.170.159.180 sang 14.163.29.11
- Cập nhật 13 files bao gồm cấu hình và source code
- Đảm bảo tất cả các chức năng (API, WebSocket, file serving) sử dụng IP mới
