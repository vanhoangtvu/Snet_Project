# SNet - Mạng Xã Hội Tích Hợp

Dự án mạng xã hội tích hợp tất cả các tiện ích cần thiết cho người dùng.

> ⚠️ **Lưu ý:** Dự án hiện đang trong quá trình phát triển và chưa hoàn thiện.

## Thông tin dự án

**Tên dự án:** SNet  
**Mô tả:** Nền tảng mạng xã hội tích hợp đầy đủ tính năng chia sẻ file, chat realtime, quản lý nội dung và tích hợp AI.  
**Developer:** Nguyen Van Hoang  
**Email:** nguyenhoang4556z@gmail.com  
**Domain:** https://snet.io.vn

## Tính năng chính

### 1. Mạng xã hội
- Đăng bài viết (text, hình ảnh, video)
- Like và comment
- Mention người dùng
- Privacy settings (public/friends/private)

### 2. Quản lý bạn bè
- Gửi/chấp nhận lời mời kết bạn
- Danh sách bạn bè
- Trạng thái online/offline

### 3. Chat realtime
- Chat 1-1 với bạn bè
- Nhóm chat
- WebSocket realtime
- Thu hồi tin nhắn

### 4. Chia sẻ file
- Upload file (hình ảnh, video, documents)
- Chia sẻ công khai với QR code
- Quản lý dung lượng
- Thumbnail tự động

### 5. Thông báo
- Thông báo realtime
- Like, comment, mention
- Lời mời kết bạn

### 6. Admin Dashboard
- Thống kê hệ thống
- Quản lý users
- Quản lý files
- Xem logs

## Công nghệ sử dụng

### Backend
- **Framework:** Spring Boot 3.2.0 (Java 21)
- **Database:** MySQL
- **Authentication:** JWT
- **WebSocket:** STOMP
- **API Docs:** Swagger/OpenAPI

### Frontend
- **Framework:** Next.js 14 (React 18)
- **UI:** Tailwind CSS
- **State:** React Context
- **Realtime:** WebSocket client

### Infrastructure
- **Tunnel:** Cloudflare Tunnel
- **Domain:** snet.io.vn
- **API:** api.snet.io.vn

## Cài đặt

### Yêu cầu
- Java 21
- Node.js 18+
- MySQL 8.0+

### Backend
```bash
cd backend
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Quản lý Cloudflare Tunnel

```bash
# Khởi động tunnel
./manage-tunnel.sh start

# Dừng tunnel
./manage-tunnel.sh stop

# Kiểm tra trạng thái
./manage-tunnel.sh status

# Xem log
./manage-tunnel.sh log
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### Posts
- `GET /api/posts` - Lấy danh sách bài viết
- `POST /api/posts` - Tạo bài viết
- `POST /api/posts/{id}/like` - Like bài viết
- `POST /api/posts/{id}/comments` - Comment

### Friends
- `POST /api/friends/request` - Gửi lời mời
- `GET /api/friends` - Danh sách bạn bè

### Messages
- `POST /api/messages` - Gửi tin nhắn
- `GET /api/messages/chat/{userId}` - Lịch sử chat

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files/{id}/download` - Download file

## Liên hệ

**Developer:** Nguyen Van Hoang  
**Email:** nguyenhoang4556z@gmail.com  
**Website:** https://snet.io.vn

---

© 2026 SNet - Mạng xã hội tích hợp
