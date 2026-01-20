# 🎉 DỰ ÁN ĐÃ ĐỔI TÊN THÀNH CÔNG: SNET

## ✅ THAY ĐỔI ĐÃ THỰC HIỆN

### 1. **Tên Dự Án**
- ❌ Cũ: **PixShare**
- ✅ Mới: **Snet** (Social Network)

### 2. **Branding**
- Title: "Snet - Social Network & File Sharing"
- Description: "Modern social network platform with powerful file sharing capabilities"
- Theme Color: #6366f1 (Indigo)

### 3. **Frontend**
- Package name: `snet-frontend`
- Version: 2.0.0
- Hero text: "Snet - Kết nối & Chia sẻ"
- Gradient: Indigo → Blue → Cyan

### 4. **Backend**
- Application name: `snet-backend`
- Group ID: `com.snet`
- Artifact ID: `snet-backend`
- Version: 2.0.0

---

## 🌐 TRUY CẬP

**URL:** http://14.160.195.30:3006

---

## 🔐 TÀI KHOẢN

**Admin:**
- Email: `admin@pixshare.com`
- Password: `hoangadmin@123`

**User:**
- Email: `user1@pixshare.com`
- Password: `user123`

---

## 🎨 GIAO DIỆN MỚI

### Màu sắc chính:
- **Primary:** Indigo (#6366f1)
- **Secondary:** Blue (#3b82f6)
- **Accent:** Cyan (#06b6d4)

### Cải tiến:
- ✅ Hero section hiện đại hơn
- ✅ Gradient mới (Indigo-Blue-Cyan)
- ✅ Typography rõ ràng hơn
- ✅ Button style mới
- ✅ Responsive tốt hơn

---

## 📊 LOGIC HỆ THỐNG (Không đổi)

### **1. Authentication Flow**
```
User → Login → JWT Token → Access Resources
```

### **2. File Upload Flow**
```
Select File → Validate (size/quota) → Save to MySQL LONGBLOB → Generate Thumbnail
```

### **3. Real-time Chat Flow**
```
Send Message → WebSocket (STOMP) → Save DB → Broadcast to Receiver
```

### **4. Social Feed Flow**
```
Create Post → Save with File/Video → Display in Feed → Like/Comment
```

### **5. Public Sharing Flow**
```
Create Share → Generate UUID Token → QR Code → Public Access (no login)
```

---

## 🏗️ KIẾN TRÚC

```
┌─────────────────────────────────────┐
│  Frontend (Next.js 14 + React 18)  │
│  - Snet branding                    │
│  - Indigo theme                     │
│  - Modern UI/UX                     │
└──────────────┬──────────────────────┘
               │ HTTP + WebSocket
┌──────────────▼──────────────────────┐
│  Backend (Spring Boot 3.2)          │
│  - snet-backend                     │
│  - JWT Auth                         │
│  - WebSocket Server                 │
└──────────────┬──────────────────────┘
               │ JDBC
┌──────────────▼──────────────────────┐
│  MySQL 8.0                          │
│  - PixShare_db (tên DB giữ nguyên) │
│  - LONGBLOB storage                 │
└─────────────────────────────────────┘
```

---

## 🚀 TÍNH NĂNG CHÍNH

### 📱 **Social Network**
- ✅ User profiles với avatar/cover
- ✅ Friend system (add/accept/reject)
- ✅ Social feed (posts, likes, comments)
- ✅ Privacy settings (Public/Friends/Private)
- ✅ Online status tracking

### 💬 **Real-time Chat**
- ✅ Direct messaging (1-on-1)
- ✅ Group chat
- ✅ File attachments
- ✅ Read receipts
- ✅ Typing indicators
- ✅ Message recall

### 📁 **File Management**
- ✅ Upload files up to 1GB
- ✅ Storage quota (5GB default)
- ✅ Auto thumbnail generation
- ✅ File preview (images, videos, PDFs)
- ✅ Categories (Image/Video/Document/Audio/Other)

### 🎥 **Video Features**
- ✅ Auto-play videos
- ✅ Embedded videos (YouTube, TikTok, Vimeo)
- ✅ Video streaming
- ✅ Audio enabled by default

### 🔗 **Public Sharing**
- ✅ Generate share links
- ✅ QR code generation
- ✅ Access without login
- ✅ Access count tracking
- ✅ Link expiration

### 👨‍💼 **Admin Dashboard**
- ✅ User management
- ✅ File management
- ✅ Message moderation
- ✅ Statistics & charts
- ✅ Admin logs

---

## 🔒 BẢO MẬT

- ✅ JWT Authentication (24h expiration)
- ✅ BCrypt password hashing
- ✅ Role-based authorization (USER/ADMIN)
- ✅ CORS configuration
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ File size & quota limits

---

## 📝 CẤU TRÚC DATABASE

### **Core Tables:**
```sql
users           -- User accounts
files           -- File storage (LONGBLOB)
posts           -- Social posts
post_likes      -- Post likes
post_comments   -- Post comments
messages        -- Chat messages
friendships     -- Friend relationships
chat_groups     -- Group chats
public_shares   -- Public file shares
admin_logs      -- Admin activity logs
```

---

## 🎯 WORKFLOW EXAMPLES

### **1. Đăng bài có ảnh:**
```
1. Upload ảnh → files table
2. Tạo post → posts table (file_id reference)
3. Hiển thị feed → JOIN posts + files + users
4. Like/Comment → post_likes/post_comments tables
```

### **2. Chat real-time:**
```
1. User A gửi tin nhắn
2. Save vào messages table
3. WebSocket broadcast đến User B
4. User B nhận và hiển thị
5. Mark as read → update status
```

### **3. Chia sẻ file public:**
```
1. Tạo share link → public_shares table (UUID token)
2. Generate QR code
3. Anonymous user truy cập /share/{token}
4. Download file (không cần login)
5. Increment access_count
```

---

## 🔄 API ENDPOINTS

### **Authentication**
- POST `/api/auth/register` - Đăng ký
- POST `/api/auth/login` - Đăng nhập

### **Users**
- GET `/api/users/me` - Current user
- PUT `/api/users/profile` - Update profile
- GET `/api/users/search` - Search users

### **Files**
- POST `/api/files` - Upload file
- GET `/api/files/{id}/download` - Download
- GET `/api/files/{id}/preview` - Preview
- DELETE `/api/files/{id}` - Delete

### **Posts**
- POST `/api/posts` - Create post
- GET `/api/posts` - Get feed
- POST `/api/posts/{id}/like` - Like/Unlike
- POST `/api/posts/{id}/comments` - Add comment

### **Messages**
- WebSocket `/ws` - Real-time messaging
- GET `/api/messages/chat/{userId}` - Chat history
- POST `/api/messages/{id}/read` - Mark as read

### **Public Sharing**
- POST `/api/public/share/{fileId}` - Create share
- GET `/api/public/share/{token}` - Access shared file
- GET `/api/public/share/{token}/qrcode` - Get QR code

### **Admin**
- GET `/api/admin/dashboard/stats` - Dashboard stats
- GET `/api/admin/users` - All users
- POST `/api/admin/users/{id}/lock` - Lock user
- DELETE `/api/admin/files/{id}` - Delete file

---

## 📚 TECH STACK

### **Backend:**
- Java 17
- Spring Boot 3.2.0
- Spring Security 6
- Spring Data JPA
- WebSocket (STOMP)
- MySQL 8.0
- JWT (io.jsonwebtoken)
- Maven

### **Frontend:**
- Next.js 14.0.4
- React 18.2.0
- TypeScript 5.3.3
- TailwindCSS 3.4.0
- Axios 1.6.2
- SockJS + STOMP
- React Icons

---

## 🎉 HOÀN TẤT!

Dự án **Snet** đã sẵn sàng với:
- ✅ Tên mới: **Snet**
- ✅ Giao diện mới: **Indigo theme**
- ✅ Branding mới: **Social Network & File Sharing**
- ✅ Logic giữ nguyên: **Tất cả tính năng hoạt động**

**Truy cập ngay:** http://14.160.195.30:3006

---

**Developed by:** Nguyen Van Hoang  
**Email:** nguyenhoang4556z@gmail.com  
**Version:** 2.0.0
