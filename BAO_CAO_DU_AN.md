# BÁO CÁO DỰ ÁN SNET - MẠNG XÃ HỘI TÍCH HỢP

**Ngày báo cáo:** 02/02/2026  
**Developer:** Nguyen Van Hoang  
**Email:** nguyenhoang4556z@gmail.com  
**Domain:** https://snet.io.vn

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Thông tin cơ bản
- **Tên dự án:** SNet (Social Network)
- **Phiên bản:** 2.0.0
- **Mô tả:** Nền tảng mạng xã hội tích hợp đầy đủ tính năng chia sẻ file, chat realtime, quản lý nội dung và tích hợp AI
- **Trạng thái:** Đang phát triển

### 1.2 Kiến trúc hệ thống
```
┌─────────────────┐         ┌──────────────────┐
│   Frontend      │ ◄─────► │    Backend       │
│   Next.js 14   │  REST   │  Spring Boot 3.2 │
│   React 18     │  WebSocket│   Java 21       │
└─────────────────┘         └──────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │   MySQL 8.0+     │
                            │   Database       │
                            └──────────────────┘
```

---

## 2. CÔNG NGHỆ SỬ DỤNG

### 2.1 Backend Stack
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| Spring Boot | 3.2.0 | Framework chính |
| Java | 21 | Ngôn ngữ lập trình |
| MySQL | 8.0+ | Cơ sở dữ liệu |
| JWT | 0.12.3 | Authentication |
| WebSocket (STOMP) | - | Realtime communication |
| Spring Security | 3.2.0 | Bảo mật |
| Spring Data JPA | 3.2.0 | ORM |
| Lombok | - | Code generation |
| ZXing | 3.5.2 | QR Code generation |
| Swagger/OpenAPI | 2.3.0 | API documentation |

### 2.2 Frontend Stack
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| Next.js | 14.0.4 | React framework |
| React | 18.2.0 | UI library |
| TypeScript | 5.3.3 | Type safety |
| Tailwind CSS | 3.4.0 | Styling |
| Axios | 1.6.2 | HTTP client |
| STOMP.js | 7.2.0 | WebSocket client |
| SockJS | 1.6.1 | WebSocket fallback |
| React Icons | 4.12.0 | Icon library |
| Lottie React | 2.4.1 | Animations |
| QRCode.react | 3.1.0 | QR code display |

### 2.3 Infrastructure
- **Tunnel:** Cloudflare Tunnel
- **Domain:** snet.io.vn
- **API Domain:** api.snet.io.vn
- **Port Backend:** 8080
- **Port Frontend:** 3006

---

## 3. CẤU TRÚC DỰ ÁN

### 3.1 Backend Structure
```
backend/
├── src/main/java/com/snet/
│   ├── config/              # Cấu hình (Security, JWT, WebSocket, CORS)
│   │   ├── SecurityConfig.java
│   │   ├── JwtService.java
│   │   ├── WebSocketConfig.java
│   │   └── ...
│   ├── controller/          # REST API Controllers
│   │   ├── AuthController.java
│   │   ├── PostController.java
│   │   ├── MessageController.java
│   │   ├── FriendshipController.java
│   │   ├── FileController.java
│   │   ├── NotificationController.java
│   │   └── AdminController.java
│   ├── service/             # Business Logic
│   │   ├── AuthService.java
│   │   ├── PostService.java
│   │   ├── MessageService.java
│   │   ├── FriendshipService.java
│   │   ├── FileService.java
│   │   └── NotificationService.java
│   ├── repository/          # Data Access Layer
│   │   ├── UserRepository.java
│   │   ├── PostRepository.java
│   │   ├── MessageRepository.java
│   │   └── ...
│   ├── model/               # Entity Models
│   │   ├── User.java
│   │   ├── Post.java
│   │   ├── Message.java
│   │   ├── Friendship.java
│   │   └── ...
│   └── dto/                 # Data Transfer Objects
│       ├── AuthResponse.java
│       ├── PostDTO.java
│       └── ...
└── pom.xml
```

### 3.2 Frontend Structure
```
frontend/
├── app/                     # Next.js App Router
│   ├── page.tsx            # Landing page
│   ├── layout.tsx          # Root layout
│   ├── login/              # Login page
│   ├── register/           # Register page
│   ├── dashboard/          # Main dashboard
│   │   ├── page.tsx        # Feed
│   │   ├── friends/        # Friends management
│   │   ├── chat/           # Chat interface
│   │   └── profile/        # User profile
│   └── public/             # Public shared posts
├── components/             # Reusable components
│   ├── SharePostModal.tsx
│   ├── EditProfileModal.tsx
│   ├── MentionInput.tsx
│   └── icons/
├── contexts/               # React Context
│   └── AuthContext.tsx
├── lib/                    # Utilities
│   ├── api.ts             # API service
│   ├── auth.ts            # Auth utilities
│   ├── websocket.ts       # WebSocket service
│   └── utils.ts
└── package.json
```

---

## 4. CHỨC NĂNG CHÍNH

### 4.1 Authentication & Authorization
**Mô tả:** Hệ thống xác thực và phân quyền người dùng

**Công nghệ:**
- JWT (JSON Web Token) cho authentication
- Spring Security cho authorization
- Password encryption với BCrypt

**Tính năng:**
- ✅ Đăng ký tài khoản
- ✅ Đăng nhập
- ✅ Đăng xuất
- ✅ Token refresh
- ✅ Role-based access (USER, ADMIN)
- ✅ Account status (ACTIVE, LOCKED)

**API Endpoints:**
```
POST /api/auth/register
POST /api/auth/login
GET  /api/users/me
```

### 4.2 Mạng Xã Hội (Social Feed)
**Mô tả:** Tính năng đăng bài, tương tác như Facebook

**Tính năng:**
- ✅ Tạo bài viết (text, image, video)
- ✅ Upload hình ảnh/video
- ✅ Embed video từ YouTube, TikTok
- ✅ Privacy settings (PUBLIC, FRIENDS_ONLY, PRIVATE)
- ✅ Like bài viết
- ✅ Comment bài viết
- ✅ Reply comment (nested comments)
- ✅ Like comment
- ✅ Mention người dùng (@username)
- ✅ Share bài viết
- ✅ Edit/Delete bài viết
- ✅ Lazy loading (infinite scroll)
- ✅ Xem bài viết đã like

**API Endpoints:**
```
GET    /api/posts                    # Get feed
GET    /api/posts/{id}               # Get single post
POST   /api/posts                    # Create post
PUT    /api/posts/{id}               # Update post
DELETE /api/posts/{id}               # Delete post
POST   /api/posts/{id}/like          # Like post
DELETE /api/posts/{id}/like          # Unlike post
GET    /api/posts/{id}/likes         # Get likes
POST   /api/posts/{id}/comments      # Add comment
GET    /api/posts/{id}/comments      # Get comments
POST   /api/posts/{id}/share         # Share post
```

**Models:**
```java
Post {
  id, userId, content, fileId, videoUrl, videoPlatform,
  privacy, likeCount, commentCount, createdAt, updatedAt
}

PostComment {
  id, postId, userId, content, parentCommentId,
  likeCount, createdAt
}

PostLike {
  id, postId, userId, createdAt
}
```

### 4.3 Quản Lý Bạn Bè
**Mô tả:** Hệ thống kết bạn như Facebook

**Tính năng:**
- ✅ Gửi lời mời kết bạn
- ✅ Chấp nhận/Từ chối lời mời
- ✅ Hủy kết bạn
- ✅ Danh sách bạn bè
- ✅ Danh sách lời mời đã gửi
- ✅ Danh sách lời mời nhận được
- ✅ Tìm kiếm người dùng
- ✅ Trạng thái online/offline

**API Endpoints:**
```
POST   /api/friends/request          # Send friend request
GET    /api/friends/requests         # Get pending requests
POST   /api/friends/accept/{id}      # Accept request
POST   /api/friends/reject/{id}      # Reject request
DELETE /api/friends/{id}             # Unfriend
GET    /api/friends                  # Get friends list
GET    /api/friends/sent             # Get sent requests
```

**Models:**
```java
Friendship {
  id, userId, friendId, status (PENDING, ACCEPTED, REJECTED),
  createdAt, acceptedAt
}
```

### 4.4 Chat Realtime
**Mô tả:** Hệ thống chat realtime với WebSocket

**Công nghệ:**
- STOMP over WebSocket
- SockJS fallback
- Spring WebSocket

**Tính năng:**
- ✅ Chat 1-1 với bạn bè
- ✅ Nhóm chat
- ✅ Gửi tin nhắn text
- ✅ Gửi file/hình ảnh
- ✅ Realtime message delivery
- ✅ Message status (SENT, DELIVERED, READ)
- ✅ Thu hồi tin nhắn
- ✅ Xóa tin nhắn
- ✅ Typing indicator
- ✅ Online status

**API Endpoints:**
```
POST   /api/messages/send            # Send message (REST)
GET    /api/messages/chat/{userId}   # Get chat history
GET    /api/messages/group/{groupId} # Get group messages
POST   /api/messages/{id}/read       # Mark as read
DELETE /api/messages/{id}            # Delete message
POST   /api/messages/{id}/recall     # Recall message

WebSocket:
/app/chat.send                       # Send message
/user/queue/messages                 # Receive messages
/topic/online-users                  # Online users updates
```

**Models:**
```java
Message {
  id, senderId, receiverId, groupId, content,
  type (TEXT, IMAGE, FILE, VIDEO),
  status (SENT, DELIVERED, READ),
  fileId, sentAt, readAt, deleted
}

ChatGroup {
  id, name, creatorId, members, createdAt
}
```

### 4.5 Chia Sẻ File
**Mô tả:** Upload và chia sẻ file với QR code

**Tính năng:**
- ✅ Upload file (image, video, document)
- ✅ Thumbnail tự động cho hình ảnh
- ✅ EXIF rotation correction
- ✅ Chia sẻ công khai với QR code
- ✅ Download file
- ✅ Quản lý dung lượng (5GB default)
- ✅ File categories (IMAGE, VIDEO, DOCUMENT, OTHER)
- ✅ Video streaming

**API Endpoints:**
```
POST   /api/files/upload             # Upload file
GET    /api/files/{id}/download      # Download file
GET    /api/files/{id}/thumbnail     # Get thumbnail
POST   /api/files/{id}/share         # Create public share
GET    /api/files/my-files           # Get user files
DELETE /api/files/{id}               # Delete file
GET    /api/public/share/{token}     # Access public share
GET    /api/video/stream/{fileId}    # Stream video
```

**Models:**
```java
FileMetadata {
  id, userId, fileName, fileType, fileSize,
  category, thumbnailData, createdAt
}

PublicShare {
  id, fileId, shareToken, qrCode,
  expiresAt, createdAt
}
```

### 4.6 Thông Báo Realtime
**Mô tả:** Hệ thống thông báo realtime

**Tính năng:**
- ✅ Thông báo like bài viết
- ✅ Thông báo comment
- ✅ Thông báo mention
- ✅ Thông báo lời mời kết bạn
- ✅ Thông báo chấp nhận kết bạn
- ✅ Realtime push qua WebSocket
- ✅ Đánh dấu đã đọc

**API Endpoints:**
```
GET    /api/notifications            # Get notifications
POST   /api/notifications/{id}/read  # Mark as read
POST   /api/notifications/read-all   # Mark all as read
DELETE /api/notifications/{id}       # Delete notification
```

**Models:**
```java
Notification {
  id, userId, type, content, relatedId,
  read, createdAt
}
```

### 4.7 User Profile
**Mô tả:** Hồ sơ người dùng chi tiết

**Tính năng:**
- ✅ Avatar & Cover photo
- ✅ Bio
- ✅ Personal info (phone, DOB, gender, location)
- ✅ Social media links (Facebook, Instagram, Twitter, LinkedIn)
- ✅ Work & Education
- ✅ Relationship status
- ✅ Languages & Interests
- ✅ Verified badge
- ✅ Edit profile

**API Endpoints:**
```
GET    /api/users/{id}               # Get user profile
PUT    /api/users/profile            # Update profile
POST   /api/users/avatar             # Upload avatar
POST   /api/users/cover              # Upload cover photo
```

### 4.8 Admin Dashboard
**Mô tả:** Quản trị hệ thống

**Tính năng:**
- ✅ Thống kê tổng quan (users, posts, files, storage)
- ✅ Quản lý users (lock/unlock account)
- ✅ Quản lý files
- ✅ Xem logs
- ✅ Charts & Analytics

**API Endpoints:**
```
GET    /api/admin/stats              # Dashboard stats
GET    /api/admin/users              # Get all users
POST   /api/admin/users/{id}/lock    # Lock user
POST   /api/admin/users/{id}/unlock  # Unlock user
GET    /api/admin/files              # Get all files
DELETE /api/admin/files/{id}         # Delete file
GET    /api/admin/logs               # Get system logs
```

---

## 5. DATABASE SCHEMA

### 5.1 Core Tables

**users**
```sql
- id (PK)
- email (UNIQUE)
- password
- display_name
- avatar (LONGBLOB)
- cover_photo (LONGBLOB)
- bio
- phone_number, date_of_birth, gender, location, website
- facebook_url, instagram_url, twitter_url, linkedin_url
- current_job, company, school, university
- hometown, relationship_status, languages, interests
- role (USER, ADMIN)
- status (ACTIVE, LOCKED)
- storage_quota, storage_used
- verified (boolean)
- online (boolean)
- last_seen
- created_at, updated_at
```

**posts**
```sql
- id (PK)
- user_id (FK)
- content (TEXT)
- file_id (FK)
- video_url, video_platform
- privacy (PUBLIC, FRIENDS_ONLY, PRIVATE)
- like_count, comment_count
- created_at, updated_at
```

**friendships**
```sql
- id (PK)
- user_id (FK)
- friend_id (FK)
- status (PENDING, ACCEPTED, REJECTED)
- created_at, accepted_at
```

**messages**
```sql
- id (PK)
- sender_id (FK)
- receiver_id (FK)
- group_id (FK)
- content (TEXT)
- type (TEXT, IMAGE, FILE, VIDEO)
- file_id (FK)
- status (SENT, DELIVERED, READ)
- sent_at, read_at
- deleted (boolean)
```

**file_metadata**
```sql
- id (PK)
- user_id (FK)
- file_name
- file_type
- file_size
- category (IMAGE, VIDEO, DOCUMENT, OTHER)
- file_data (LONGBLOB)
- thumbnail_data (LONGBLOB)
- created_at
```

**notifications**
```sql
- id (PK)
- user_id (FK)
- type
- content
- related_id
- read (boolean)
- created_at
```

### 5.2 Relationships
```
users (1) ──── (N) posts
users (1) ──── (N) messages
users (1) ──── (N) file_metadata
users (N) ──── (N) users (friendships)
posts (1) ──── (N) post_likes
posts (1) ──── (N) post_comments
posts (1) ──── (N) post_shares
```

---

## 6. SECURITY

### 6.1 Authentication Flow
```
1. User login → POST /api/auth/login
2. Backend validates credentials
3. Generate JWT token (expires in 24h)
4. Return token + user info
5. Frontend stores token in localStorage
6. All requests include: Authorization: Bearer {token}
7. Backend validates token via JwtAuthenticationFilter
```

### 6.2 Security Features
- ✅ Password encryption (BCrypt)
- ✅ JWT token authentication
- ✅ CORS configuration
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Role-based access control
- ✅ Input validation
- ✅ File upload validation
- ✅ SQL injection prevention (JPA)

### 6.3 WebSocket Security
- ✅ JWT authentication for WebSocket connections
- ✅ User-specific message queues
- ✅ Authorization checks before message delivery

---

## 7. API DOCUMENTATION

### 7.1 Swagger/OpenAPI
- **URL:** http://api.snet.io.vn/swagger-ui.html
- **Spec:** http://api.snet.io.vn/v3/api-docs

### 7.2 API Response Format
```json
// Success
{
  "data": {...},
  "message": "Success"
}

// Error
{
  "error": "Error message",
  "status": 400
}
```

---

## 8. DEPLOYMENT

### 8.1 Backend Deployment
```bash
cd backend
mvn clean package
java -jar target/snet-backend-2.0.0.jar
```

**Environment Variables:**
- `MYSQL_HOST`: Database host
- `MYSQL_PORT`: Database port
- `MYSQL_DATABASE`: Database name
- `MYSQL_USER`: Database user
- `MYSQL_PASSWORD`: Database password
- `JWT_SECRET`: JWT secret key

### 8.2 Frontend Deployment
```bash
cd frontend
npm install
npm run build
npm start
```

**Environment Variables:**
- `NEXT_PUBLIC_API_URL`: Backend API URL

### 8.3 Cloudflare Tunnel
```bash
./manage-tunnel.sh start   # Start tunnel
./manage-tunnel.sh stop    # Stop tunnel
./manage-tunnel.sh status  # Check status
./manage-tunnel.sh log     # View logs
```

**Tunnel Configuration:**
- Backend: api.snet.io.vn → localhost:8080
- Frontend: snet.io.vn → localhost:3006

---

## 9. PERFORMANCE & OPTIMIZATION

### 9.1 Backend Optimization
- ✅ Lazy loading cho relationships
- ✅ Pagination cho danh sách
- ✅ Database indexing
- ✅ Connection pooling
- ✅ Caching (planned)

### 9.2 Frontend Optimization
- ✅ Lazy loading images
- ✅ Infinite scroll
- ✅ Code splitting
- ✅ Image optimization
- ✅ Debouncing search
- ✅ LocalStorage caching

### 9.3 File Storage
- ✅ Thumbnail generation
- ✅ Image compression
- ✅ EXIF rotation
- ✅ Storage quota management

---

## 10. TESTING

### 10.1 Backend Testing
- Unit tests với JUnit
- Integration tests
- API testing với Postman

### 10.2 Frontend Testing
- Component testing (planned)
- E2E testing (planned)

---

## 11. ROADMAP & TODO

### 11.1 Đã hoàn thành ✅
- [x] Authentication & Authorization
- [x] User Profile Management
- [x] Social Feed (Post, Like, Comment)
- [x] Friend Management
- [x] Realtime Chat (1-1 & Group)
- [x] File Upload & Sharing
- [x] Notifications
- [x] Admin Dashboard
- [x] QR Code Sharing
- [x] Video Embed (YouTube, TikTok)
- [x] Mention Users
- [x] Share Posts
- [x] Privacy Settings

### 11.2 Đang phát triển 🚧
- [ ] AI Integration
- [ ] Stories feature
- [ ] Live streaming
- [ ] Voice/Video call
- [ ] Mobile app (React Native)

### 11.3 Kế hoạch tương lai 📋
- [ ] Email verification
- [ ] Password reset
- [ ] Two-factor authentication
- [ ] Advanced search
- [ ] Hashtags
- [ ] Trending topics
- [ ] Events & Groups
- [ ] Marketplace
- [ ] Payment integration
- [ ] Analytics dashboard
- [ ] CDN integration
- [ ] Redis caching
- [ ] Elasticsearch
- [ ] Microservices architecture

---

## 12. ISSUES & BUGS

### 12.1 Known Issues
- [ ] Video upload size limit
- [ ] WebSocket reconnection handling
- [ ] Image rotation on some devices
- [ ] Notification badge count sync

### 12.2 Bug Fixes
- [x] CORS issues
- [x] JWT token expiration
- [x] File upload validation
- [x] WebSocket authentication

---

## 13. DEPENDENCIES & LICENSES

### 13.1 Backend Dependencies
- Spring Boot: Apache 2.0
- MySQL Connector: GPL 2.0
- JWT: Apache 2.0
- Lombok: MIT
- ZXing: Apache 2.0

### 13.2 Frontend Dependencies
- Next.js: MIT
- React: MIT
- Tailwind CSS: MIT
- Axios: MIT
- STOMP.js: Apache 2.0

---

## 14. TEAM & CONTACT

**Developer:** Nguyen Van Hoang  
**Email:** nguyenhoang4556z@gmail.com  
**Website:** https://snet.io.vn  
**GitHub:** (private repository)

---

## 15. CONCLUSION

Dự án SNet là một nền tảng mạng xã hội đầy đủ tính năng, được xây dựng với công nghệ hiện đại và kiến trúc scalable. Hệ thống đã triển khai thành công các tính năng cốt lõi của một mạng xã hội như Facebook, bao gồm:

- ✅ Social feed với post, like, comment
- ✅ Friend management
- ✅ Realtime chat
- ✅ File sharing với QR code
- ✅ Notifications
- ✅ Admin dashboard

Dự án đang trong giai đoạn phát triển và sẽ tiếp tục được cải thiện với các tính năng mới như AI integration, video call, và mobile app.

---

**© 2026 SNet - Mạng xã hội tích hợp**
