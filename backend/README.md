# PixShare Backend

<div align="center">

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)
![Java](https://img.shields.io/badge/Java-17-orange.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)

**Backend API cho PixShare - Nền tảng chia sẻ ảnh, video & nhắn tin trực tuyến**

Developed by [Nguyen Van Hoang](https://github.com/vanhoangtvu)

</div>

---

## 📋 Mục lục

- [Công nghệ](#-công-nghệ)
- [Tính năng](#-tính-năng)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [WebSocket](#-websocket)
- [Development](#-development)
- [Developer](#-developer)

---

## 🚀 Công nghệ

### Core Technologies
- **Framework**: Spring Boot 3.2.0
- **Java**: 17 (LTS)
- **Database**: MySQL 8.0
- **Security**: Spring Security 6.x + JWT Authentication
- **WebSocket**: STOMP over WebSocket
- **Build Tool**: Maven 3.x
- **ORM**: Spring Data JPA (Hibernate)

### Main Dependencies
```xml
<!-- Spring Boot Starters -->
spring-boot-starter-web          # RESTful API
spring-boot-starter-data-jpa     # Database ORM
spring-boot-starter-security     # Authentication & Authorization
spring-boot-starter-websocket    # Real-time communication
spring-boot-starter-validation   # Input validation

<!-- Security & JWT -->
io.jsonwebtoken:jjwt-api:0.12.3        # JWT token
io.jsonwebtoken:jjwt-impl:0.12.3
io.jsonwebtoken:jjwt-jackson:0.12.3

<!-- QR Code Generation -->
com.google.zxing:core:3.5.2            # QR code library
com.google.zxing:javase:3.5.2

<!-- API Documentation -->
springdoc-openapi-starter:2.3.0        # Swagger/OpenAPI

<!-- Utilities -->
org.projectlombok:lombok                # Reduce boilerplate
mysql-connector-j                       # MySQL driver
```

---

## ✨ Tính năng

### 🔐 Authentication & Authorization
- ✅ JWT-based authentication (Bearer Token)
- ✅ User registration with email validation
- ✅ Secure password hashing (BCrypt)
- ✅ Role-based access control (USER, ADMIN)
- ✅ Token expiration (24 hours default)

### 👤 User Management
- ✅ Complete user profile management
- ✅ Avatar & cover photo upload (stored in MySQL LONGBLOB)
- ✅ Extended profile fields:
  - Personal info (bio, phone, date of birth, gender, location)
  - Social media links (Facebook, Instagram, Twitter, LinkedIn, Website)
  - Work & education (current job, company, school, university)
  - Additional info (hometown, relationship status, languages, interests)
- ✅ User search by display name
- ✅ Online/offline status tracking
- ✅ User verification badge
- ✅ Last seen timestamp

### 👥 Friends & Social Connections
- ✅ Send friend requests
- ✅ Accept/reject friend requests
- ✅ View friends list
- ✅ Remove friends
- ✅ Pending requests management

### 💬 Real-time Chat
- ✅ 1-on-1 private chat via WebSocket
- ✅ Group chat functionality
- ✅ Message types: TEXT, FILE, IMAGE
- ✅ Message status: SENT, DELIVERED, READ
- ✅ Message recall/delete
- ✅ Chat history pagination
- ✅ Unread message count
- ✅ Typing indicators (via WebSocket)

### 👥 Group Chat
- ✅ Create chat groups with multiple members
- ✅ Group avatar upload
- ✅ Group admin management
- ✅ Add/remove group members
- ✅ Leave group
- ✅ Group description & settings

### 📁 File Management
- ✅ Upload files (images, videos, documents)
- ✅ Maximum file size: 1GB
- ✅ Storage in MySQL database (LONGBLOB)
- ✅ Automatic thumbnail generation for images
- ✅ File preview functionality
- ✅ File download
- ✅ File categorization (IMAGE, VIDEO, DOCUMENT)
- ✅ User storage quota management (default 5GB)
- ✅ Storage usage tracking

### 📱 Social Feed (Posts)
- ✅ Create posts with text and/or media
- ✅ Like/unlike posts
- ✅ Comment on posts
- ✅ Privacy settings (PUBLIC, FRIENDS_ONLY, PRIVATE)
- ✅ View public feed
- ✅ View user-specific posts
- ✅ Get post likes and comments
- ✅ Delete own posts
- ✅ Automatic like/comment counters (via MySQL triggers)

### 🔗 Public File Sharing
- ✅ Generate public share links for files
- ✅ QR code generation for share links
- ✅ Access files without authentication via token
- ✅ View share information
- ✅ Disable/delete share links
- ✅ Share expiration management

### 👨‍💼 Admin Dashboard
- ✅ System statistics (users, files, messages, storage)
- ✅ User management (view, lock, unlock accounts)
- ✅ Storage quota management
- ✅ File management (view, delete files)
- ✅ Top users by storage usage
- ✅ File statistics by category
- ✅ Message search and management
- ✅ Admin activity logs
- ✅ Log search by action type

---

## 📦 Cài đặt

### Yêu cầu hệ thống

- ☕ **Java 17+** (JDK)
- 📦 **Maven 3.6+**
- 🗄️ **MySQL 8.0+**
- 🐳 **Docker & Docker Compose** (khuyến nghị)

### Cách 1: Docker Compose (Khuyến nghị) 🐳

Chạy toàn bộ stack (MySQL + Backend + Frontend) từ thư mục gốc:

```bash
cd /path/to/PixShare
docker-compose up -d
```

Backend sẽ chạy tại: **http://localhost:8086**

### Cách 2: Chạy Local

#### 1. Cài đặt MySQL

```bash
# Sử dụng Docker
docker run -d \
  --name pixshare-mysql \
  -e MYSQL_ROOT_PASSWORD=1111 \
  -e MYSQL_DATABASE=PixShare_db \
  -p 3306:3306 \
  mysql:8.0

# Hoặc cài MySQL và tạo database
mysql -u root -p
CREATE DATABASE PixShare_db;
```

#### 2. Cấu hình application.yml

Cập nhật file `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/PixShare_db
    username: root
    password: your_password
```

#### 3. Build và chạy

```bash
cd backend

# Build project
mvn clean install

# Run application
mvn spring-boot:run

# Hoặc chạy JAR file
java -jar target/pixshare-backend-1.0.0.jar
```

Backend sẽ khởi động tại: **http://localhost:8086**

#### 4. Khởi tạo dữ liệu mẫu

Khi backend khởi động lần đầu, `InitialDataLoader` sẽ tự động tạo:
- Admin account: `admin@pixshare.com` / `admin123`
- Test users: `user1@pixshare.com`, `user2@pixshare.com`, `user3@pixshare.com` / `user123`

#### 5. Chạy SQL migrations (Optional)

```bash
# Thêm social feed tables
mysql -u root -p PixShare_db < add_social_feed_tables.sql

# Thêm profile fields (nếu chưa có)
mysql -u root -p PixShare_db < add_profile_fields.sql
```

---

## ⚙️ Cấu hình

### Application Configuration

File: `src/main/resources/application.yml`

```yaml
spring:
  application:
    name: pixshare-backend
  
  # Database Configuration
  datasource:
    url: jdbc:mysql://localhost:3306/PixShare_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: root
    password: 1111
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  # JPA/Hibernate Configuration
  jpa:
    hibernate:
      ddl-auto: update  # Tự động tạo/update database schema
    show-sql: true      # Log SQL queries
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        format_sql: true
  
  # File Upload Configuration
  servlet:
    multipart:
      enabled: true
      max-file-size: 1GB      # Maximum file size
      max-request-size: 1GB   # Maximum request size
      file-size-threshold: 10MB
      location: /tmp

# Server Configuration
server:
  port: 8086
  address: 0.0.0.0
  url: http://localhost:8086  # Public URL for QR codes and share links
  tomcat:
    max-swallow-size: -1
    max-http-post-size: -1
    connection-timeout: 300000  # 5 minutes
    threads:
      max: 200
      min-spare: 10

# JWT Configuration
jwt:
  secret: 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
  expiration: 86400000  # 24 hours in milliseconds

# File Storage Configuration
file:
  default-quota: 5368709120  # 5GB in bytes
  max-file-size: 1073741824  # 1GB in bytes

# CORS Configuration
cors:
  allowed-origins: http://localhost:3006,http://113.170.159.180:3006
  allowed-methods: GET,POST,PUT,DELETE,OPTIONS
  allowed-headers: "*"
  allow-credentials: true

# Logging
logging:
  level:
    com.pixshare: DEBUG
    org.springframework.web: INFO
    org.hibernate: INFO
```

### Environment Variables

Production deployment với Docker:

```env
# Database
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/PixShare_db
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_password

# Server
SERVER_ADDRESS=0.0.0.0
SERVER_URL=https://api.yourdomain.com

# JWT (generate your own secret!)
JWT_SECRET=your-256-bit-secret-key
```

---

## 📚 API Documentation

### Swagger UI

Truy cập API documentation tại: **http://localhost:8086/swagger-ui.html**

### API Endpoints Overview

#### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Đăng ký tài khoản mới | ❌ |
| POST | `/api/auth/login` | Đăng nhập | ❌ |

**Example Request - Register:**
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

**Example Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "USER",
    "storageQuota": 5368709120,
    "storageUsed": 0
  }
}
```

#### 👤 Users (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/me` | Thông tin user hiện tại | ✅ |
| GET | `/api/users/{userId}` | Thông tin user theo ID | ✅ |
| PUT | `/api/users/profile` | Cập nhật profile đầy đủ | ✅ |
| GET | `/api/users/{userId}/avatar` | Lấy avatar image | ✅ |
| GET | `/api/users/{userId}/cover` | Lấy cover photo | ✅ |
| GET | `/api/users/search?keyword={keyword}` | Tìm kiếm user | ✅ |
| GET | `/api/users/online` | Danh sách user online | ✅ |
| POST | `/api/users/status?online={true/false}` | Cập nhật trạng thái online | ✅ |

**Update Profile Fields:**
```
PUT /api/users/profile
Content-Type: multipart/form-data

Fields:
- displayName, bio, phoneNumber, dateOfBirth, gender, location
- website, facebookUrl, instagramUrl, twitterUrl, linkedinUrl
- currentJob, company, school, university
- hometown, relationshipStatus, languages, interests
- avatar (file), coverPhoto (file)
```

#### 👥 Friends (`/api/friends`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/friends` | Danh sách bạn bè | ✅ |
| POST | `/api/friends/request/{friendId}` | Gửi lời mời kết bạn | ✅ |
| POST | `/api/friends/accept/{requestId}` | Chấp nhận lời mời | ✅ |
| POST | `/api/friends/reject/{requestId}` | Từ chối lời mời | ✅ |
| DELETE | `/api/friends/{friendshipId}` | Xóa bạn bè | ✅ |
| GET | `/api/friends/requests/pending` | Lời mời đang chờ | ✅ |

#### 💬 Messages (`/api/messages`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/messages/chat/{userId}` | Lịch sử chat với user | ✅ |
| GET | `/api/messages/group/{groupId}` | Tin nhắn trong group | ✅ |
| POST | `/api/messages/{messageId}/read` | Đánh dấu đã đọc | ✅ |
| POST | `/api/messages/{messageId}/recall` | Thu hồi tin nhắn | ✅ |
| DELETE | `/api/messages/{messageId}` | Xóa tin nhắn | ✅ |

**WebSocket Endpoint:** `/ws` (see WebSocket section)

#### 👥 Groups (`/api/groups`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/groups` | Tạo group chat mới | ✅ |
| GET | `/api/groups` | Danh sách groups của user | ✅ |
| GET | `/api/groups/{groupId}` | Chi tiết group | ✅ |
| POST | `/api/groups/{groupId}/avatar` | Upload group avatar | ✅ |
| GET | `/api/groups/{groupId}/avatar` | Lấy group avatar | ✅ |
| POST | `/api/groups/{groupId}/members/{userId}` | Thêm member (admin only) | ✅ |
| DELETE | `/api/groups/{groupId}/members/{userId}` | Xóa member (admin only) | ✅ |
| POST | `/api/groups/{groupId}/leave` | Rời khỏi group | ✅ |

**Create Group Request:**
```json
POST /api/groups
{
  "name": "My Friends Group",
  "description": "Group chat for friends",
  "memberIds": [2, 3, 4]
}
```

#### 📱 Posts (`/api/posts`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/posts?page=0&size=10` | Lấy public feed | ✅/❌ |
| GET | `/api/posts/user/{userId}` | Posts của user | ✅/❌ |
| GET | `/api/posts/{postId}` | Chi tiết post | ✅/❌ |
| POST | `/api/posts` | Tạo post mới | ✅ |
| DELETE | `/api/posts/{postId}` | Xóa post | ✅ |
| POST | `/api/posts/{postId}/like` | Toggle like | ✅ |
| POST | `/api/posts/{postId}/comments` | Thêm comment | ✅ |
| GET | `/api/posts/{postId}/comments` | Lấy comments | ✅ |
| GET | `/api/posts/{postId}/likes` | Users đã like | ✅ |

**Create Post:**
```json
POST /api/posts
{
  "content": "Hello world! This is my first post.",
  "fileId": 123,  // optional
  "privacy": "PUBLIC"  // PUBLIC, FRIENDS_ONLY, PRIVATE
}
```

#### 📁 Files (`/api/files`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/files` | Upload file | ✅ |
| GET | `/api/files/{fileId}` | Thông tin file | ✅ |
| GET | `/api/files/{fileId}/download` | Tải file | ✅ |
| GET | `/api/files/{fileId}/preview` | Xem trước file | ✅ |
| GET | `/api/files/{fileId}/thumbnail` | Thumbnail (ảnh) | ✅ |
| GET | `/api/files/my-files` | Danh sách file của user | ✅ |
| DELETE | `/api/files/{fileId}` | Xóa file | ✅ |

**Upload File:**
```
POST /api/files
Content-Type: multipart/form-data

file: <binary file data>
category: IMAGE | VIDEO | DOCUMENT
```

#### 🔗 Public Share (`/api/public`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/public/share/{fileId}` | Tạo link chia sẻ | ✅ |
| GET | `/api/public/share/{shareToken}` | Download file (public) | ❌ |
| GET | `/api/public/share/{shareToken}/info` | Thông tin share | ❌ |
| GET | `/api/public/share/{shareToken}/qrcode` | QR code PNG | ❌ |
| DELETE | `/api/public/share/{shareId}` | Vô hiệu hóa share | ✅ |
| GET | `/api/public/shares/my-shares` | Danh sách shares | ✅ |

#### 👨‍💼 Admin (`/api/admin`) - ADMIN ONLY

**Dashboard:**
- `GET /api/admin/dashboard/stats` - Thống kê tổng quan

**User Management:**
- `GET /api/admin/users` - Danh sách users
- `POST /api/admin/users/{userId}/lock` - Khóa tài khoản
- `POST /api/admin/users/{userId}/unlock` - Mở khóa
- `PUT /api/admin/users/{userId}/quota?quota={bytes}` - Cập nhật quota

**File Management:**
- `GET /api/admin/files` - Danh sách files
- `DELETE /api/admin/files/{fileId}` - Xóa file
- `GET /api/admin/files/top-users` - Top users by storage
- `GET /api/admin/files/stats-by-category` - Thống kê theo category

**Message Management:**
- `GET /api/admin/messages/search?keyword={keyword}` - Tìm kiếm messages
- `DELETE /api/admin/messages/{messageId}` - Xóa message

**Admin Logs:**
- `GET /api/admin/logs` - Xem logs
- `GET /api/admin/logs/search?action={action}` - Tìm kiếm logs

### Authentication

Tất cả endpoints yêu cầu authentication phải gửi JWT token:

```
Authorization: Bearer <your_jwt_token>
```

**Example:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     http://localhost:8086/api/users/me
```

---

## 🗄️ Database Schema

### Main Tables

#### users
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  avatar LONGBLOB,
  cover_photo LONGBLOB,
  bio VARCHAR(500),
  phone_number VARCHAR(20),
  date_of_birth VARCHAR(10),
  gender VARCHAR(20),
  location VARCHAR(255),
  website VARCHAR(255),
  facebook_url VARCHAR(255),
  instagram_url VARCHAR(255),
  twitter_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  current_job VARCHAR(255),
  company VARCHAR(255),
  school VARCHAR(255),
  university VARCHAR(255),
  hometown VARCHAR(255),
  relationship_status VARCHAR(50),
  languages VARCHAR(255),
  interests VARCHAR(300),
  role ENUM('USER', 'ADMIN') NOT NULL,
  status ENUM('ACTIVE', 'LOCKED') NOT NULL,
  storage_quota BIGINT NOT NULL,
  storage_used BIGINT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### file_metadata
```sql
CREATE TABLE file_metadata (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  filename VARCHAR(255),
  original_filename VARCHAR(255),
  file_size BIGINT,
  content_type VARCHAR(100),
  category ENUM('IMAGE', 'VIDEO', 'DOCUMENT'),
  file_data LONGBLOB,
  thumbnail_data LONGBLOB,
  user_id BIGINT,
  upload_date TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### messages
```sql
CREATE TABLE messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sender_id BIGINT,
  receiver_id BIGINT,
  group_id BIGINT,
  content TEXT,
  type ENUM('TEXT', 'FILE', 'IMAGE'),
  file_id BIGINT,
  status ENUM('SENT', 'DELIVERED', 'READ'),
  created_at TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id),
  FOREIGN KEY (group_id) REFERENCES chat_groups(id),
  FOREIGN KEY (file_id) REFERENCES file_metadata(id)
);
```

#### chat_groups
```sql
CREATE TABLE chat_groups (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  avatar LONGBLOB,
  creator_id BIGINT NOT NULL,
  deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

CREATE TABLE group_members (
  group_id BIGINT,
  user_id BIGINT,
  PRIMARY KEY (group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES chat_groups(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE group_admins (
  group_id BIGINT,
  user_id BIGINT,
  PRIMARY KEY (group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES chat_groups(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### posts
```sql
CREATE TABLE posts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  content TEXT,
  file_id BIGINT,
  privacy ENUM('PUBLIC', 'FRIENDS_ONLY', 'PRIVATE'),
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (file_id) REFERENCES file_metadata(id)
);

CREATE TABLE post_likes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at TIMESTAMP,
  UNIQUE KEY (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE post_comments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### friendships
```sql
CREATE TABLE friendships (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  friend_id BIGINT NOT NULL,
  status ENUM('PENDING', 'ACCEPTED', 'BLOCKED'),
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (friend_id) REFERENCES users(id)
);
```

#### public_shares
```sql
CREATE TABLE public_shares (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  file_id BIGINT NOT NULL,
  share_token VARCHAR(255) UNIQUE NOT NULL,
  user_id BIGINT NOT NULL,
  access_count INT DEFAULT 0,
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  enabled BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (file_id) REFERENCES file_metadata(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### admin_logs
```sql
CREATE TABLE admin_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  admin_id BIGINT NOT NULL,
  action VARCHAR(255) NOT NULL,
  target_type VARCHAR(100),
  target_id BIGINT,
  details TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id)
);
```

### Database Triggers

MySQL triggers tự động cập nhật counters cho posts:

```sql
-- Increment like count
CREATE TRIGGER increment_like_count 
AFTER INSERT ON post_likes
FOR EACH ROW
UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;

-- Decrement like count
CREATE TRIGGER decrement_like_count 
AFTER DELETE ON post_likes
FOR EACH ROW
UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;

-- Increment comment count
CREATE TRIGGER increment_comment_count 
AFTER INSERT ON post_comments
FOR EACH ROW
UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;

-- Decrement comment count
CREATE TRIGGER decrement_comment_count 
AFTER DELETE ON post_comments
FOR EACH ROW
UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
```

---

## 🔌 WebSocket

### STOMP WebSocket Configuration

**Endpoint:** `ws://localhost:8086/ws`

**Connect:**
```javascript
const socket = new SockJS('http://localhost:8086/ws');
const stompClient = Stomp.over(socket);

stompClient.connect(
  { Authorization: `Bearer ${token}` },
  (frame) => {
    console.log('Connected:', frame);
    
    // Subscribe to personal message queue
    stompClient.subscribe('/user/queue/messages', (message) => {
      const msg = JSON.parse(message.body);
      console.log('Received:', msg);
    });
  }
);
```

**Send Message:**
```javascript
// 1-on-1 chat
stompClient.send('/app/chat.send', {}, JSON.stringify({
  receiverId: 2,
  content: 'Hello!',
  type: 'TEXT'
}));

// Group chat
stompClient.send('/app/chat.send', {}, JSON.stringify({
  groupId: 5,
  content: 'Hello everyone!',
  type: 'TEXT'
}));
```

**Message Format:**
```json
{
  "id": 123,
  "senderId": 1,
  "receiverId": 2,
  "groupId": null,
  "content": "Hello!",
  "type": "TEXT",
  "status": "SENT",
  "createdAt": "2024-01-15T10:30:00"
}
```

---

## 🛠️ Development

### Build Project

```bash
mvn clean install
```

### Run Tests

```bash
mvn test
```

### Run with Development Profile

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Package to JAR

```bash
mvn clean package -DskipTests
```

JAR file output: `target/pixshare-backend-1.0.0.jar`

### Run JAR

```bash
java -jar target/pixshare-backend-1.0.0.jar
```

### Docker Build

```bash
cd backend
docker build -t pixshare-backend:latest .
docker run -p 8086:8086 pixshare-backend:latest
```

### Hot Reload

Spring Boot DevTools enabled - tự động restart khi code thay đổi.

### Code Structure

```
src/main/java/com/pixshare/
├── config/                    # Configuration classes
│   ├── SecurityConfig.java    # Spring Security config
│   ├── JwtService.java        # JWT token management
│   ├── WebSocketConfig.java   # WebSocket config
│   └── OpenApiConfig.java     # Swagger config
├── controller/                # REST Controllers
│   ├── AuthController.java
│   ├── UserController.java
│   ├── FileController.java
│   ├── MessageController.java
│   ├── PostController.java
│   ├── GroupController.java
│   └── AdminController.java
├── model/                     # JPA Entities
│   ├── User.java
│   ├── FileMetadata.java
│   ├── Message.java
│   ├── Post.java
│   ├── ChatGroup.java
│   └── Friendship.java
├── repository/                # Spring Data JPA Repositories
├── service/                   # Business Logic
├── dto/                       # Data Transfer Objects
└── PixShareApplication.java  # Main class
```

---

## 👨‍💻 Developer

<div align="center">

### Nguyen Van Hoang
**Backend Developer | Java Spring Boot Specialist**

[![Email](https://img.shields.io/badge/Email-nguyenhoang4556z%40gmail.com-red?style=flat-square&logo=gmail)](mailto:nguyenhoang4556z@gmail.com)
[![Phone](https://img.shields.io/badge/Phone-0889559357-green?style=flat-square&logo=phone)](tel:0889559357)
[![GitHub](https://img.shields.io/badge/GitHub-vanhoangtvu-black?style=flat-square&logo=github)](https://github.com/vanhoangtvu)

---

💡 **About Me:**
- 🌟 Passionate backend developer who loves crafting robust and scalable web applications
- 🔨 Currently working with **Spring Boot** and **Java**
- 📚 Learning **Microservices Architecture** and **Cloud Technologies**
- 💼 Experience in building **REST APIs** and **Database Design**

🎯 **Tech Stack:**
- Java 17, Spring Boot, Spring Security, Spring Data JPA
- MySQL, Hibernate, JWT Authentication
- WebSocket (STOMP), RESTful API Design
- Maven, Docker, Git

</div>

---

## 📄 License

MIT License

Copyright (c) 2024 Nguyen Van Hoang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction.

---

<div align="center">

**⭐ Star this project if you find it helpful! ⭐**

Made with ❤️ by [Nguyen Van Hoang](https://github.com/vanhoangtvu)

</div>
