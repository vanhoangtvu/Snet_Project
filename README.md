# PixShare

<div align="center">

![PixShare Logo](https://img.shields.io/badge/PixShare-Social%20Platform-blue?style=for-the-badge)

**Nền tảng chia sẻ ảnh, video và nhắn tin trực tuyến**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black.svg)](https://nextjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

**👨‍💻 Developed by:** [Nguyen Van Hoang](https://github.com/vanhoangtvu) | 📧 nguyenhoang4556z@gmail.com | 📱 0889559357

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Chạy ứng dụng](#-chạy-ứng-dụng)
- [API Documentation](#-api-documentation)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Tài khoản test](#-tài-khoản-test)
- [Phát triển](#-phát-triển)
- [Triển khai](#-triển-khai)
- [Đóng góp](#-đóng-góp)
- [License](#-license)
- [Authors](#-authors)
- [Support](#-support)

---

## 🎯 Giới thiệu

**PixShare** là một nền tảng mạng xã hội hiện đại cho phép người dùng:
- Chia sẻ ảnh, video và tài liệu
- Nhắn tin realtime với bạn bè
- Tạo và tham gia nhóm chat
- Đăng bài viết và tương tác xã hội (posts, comments, likes)
- Chia sẻ file công khai qua link và QR code
- Quản lý profile cá nhân chi tiết

Ứng dụng được xây dựng với kiến trúc full-stack hiện đại, tích hợp WebSocket để chat realtime, và hệ thống quản trị toàn diện.

> **Developed by:** [Nguyen Van Hoang](https://github.com/vanhoangtvu) - Backend Developer chuyên về Java Spring Boot, với đam mê xây dựng các ứng dụng web mạnh mẽ và có khả năng mở rộng.

---

## ✨ Tính năng

### 👤 Quản lý người dùng
- ✅ Đăng ký/Đăng nhập với JWT authentication
- ✅ Quản lý profile cá nhân (avatar, bio, địa chỉ, số điện thoại)
- ✅ Thông tin mở rộng (công việc, học vấn, sở thích, ngôn ngữ)
- ✅ Social links (Website, Facebook, Twitter, Instagram, LinkedIn)
- ✅ Trạng thái online/offline realtime
- ✅ Tìm kiếm người dùng
- ✅ Xem profile người dùng khác

### 👥 Bạn bè & Kết nối
- ✅ Gửi lời mời kết bạn
- ✅ Chấp nhận/từ chối lời mời
- ✅ Danh sách bạn bè
- ✅ Xóa bạn bè
- ✅ Thông báo lời mời kết bạn

### 💬 Chat & Nhắn tin
- ✅ Chat realtime với WebSocket (STOMP)
- ✅ Chat 1-1 với bạn bè
- ✅ Nhóm chat (group chat)
- ✅ Gửi tin nhắn văn bản
- ✅ Gửi file đính kèm trong chat
- ✅ Đánh dấu tin nhắn đã đọc/chưa đọc
- ✅ Hiển thị số tin nhắn chưa đọc
- ✅ Xóa tin nhắn
- ✅ Typing indicator

### 📁 Quản lý File
- ✅ Upload file (ảnh, video, tài liệu) - tối đa 1GB/file
- ✅ Lưu trữ file trong MySQL (LONGBLOB)
- ✅ Tự động tạo thumbnail cho ảnh
- ✅ Xem trước file (preview)
- ✅ Tải xuống file
- ✅ Xóa file
- ✅ Quản lý quota dung lượng (mặc định 5GB/user)
- ✅ Phân loại file theo danh mục (IMAGE, VIDEO, DOCUMENT)

### 🔗 Chia sẻ công khai
- ✅ Tạo link chia sẻ công khai cho file
- ✅ Tạo QR code cho link chia sẻ
- ✅ Truy cập file không cần đăng nhập
- ✅ Vô hiệu hóa link chia sẻ
- ✅ Theo dõi lượt truy cập

### 📱 Social Feed
- ✅ Đăng bài viết (text, image, video)
- ✅ Like/Unlike bài viết
- ✅ Comment trên bài viết
- ✅ Xem feed từ bạn bè
- ✅ Chế độ riêng tư (Public, Friends Only, Private)
- ✅ Đếm số lượt like và comment
- ✅ Xóa/Sửa bài viết của mình

### 👨‍💼 Admin Dashboard
- ✅ Thống kê tổng quan (users, files, messages, storage)
- ✅ Biểu đồ thống kê (Recharts)
- ✅ Quản lý người dùng (khóa/mở khóa tài khoản, cập nhật quota)
- ✅ Quản lý file (xem, xóa, thống kê theo loại)
- ✅ Top users chiếm nhiều dung lượng
- ✅ Tìm kiếm và quản lý tin nhắn
- ✅ Nhật ký hoạt động admin (admin logs)
- ✅ Tìm kiếm logs theo hành động

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                        │
│  ┌───────────────────────────────────────────────────────┐ │
│  │      Next.js 14 (React 18) + TypeScript              │ │
│  │  - App Router                                         │ │
│  │  - TailwindCSS                                        │ │
│  │  - Axios (HTTP Client)                                │ │
│  │  - STOMP over WebSocket                               │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
              HTTP/HTTPS + WebSocket (wss://)
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      Backend Layer                          │
│  ┌───────────────────────────────────────────────────────┐ │
│  │      Spring Boot 3.2.0 (Java 17)                     │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  Controllers (REST API)                         │ │ │
│  │  │  - AuthController                               │ │ │
│  │  │  - UserController                               │ │ │
│  │  │  - FileController                               │ │ │
│  │  │  - MessageController (WebSocket)                │ │ │
│  │  │  - PostController                               │ │ │
│  │  │  - GroupController                              │ │ │
│  │  │  - AdminController                              │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  Services (Business Logic)                      │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  Security (JWT + Spring Security)               │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  Data Layer (Spring Data JPA)                   │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
                         JDBC Connection
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              MySQL 8.0                                │ │
│  │  - Users, Friendships, Messages                       │ │
│  │  - Files (LONGBLOB), Posts, Comments                  │ │
│  │  - Groups, Admin Logs                                 │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Luồng dữ liệu

#### REST API Flow
```
Client → HTTP Request → Backend Controller → Service → Repository → MySQL
                                                          ↓
Client ← HTTP Response ← DTO ← Entity ← ───────────────────
```

#### WebSocket Flow (Chat)
```
Client A → WebSocket (STOMP) → MessageController → MessageService
                                      ↓
                                  Save to DB
                                      ↓
Client B ← WebSocket Broadcast ← WebSocket Endpoint
```

---

## 🛠️ Công nghệ sử dụng

### Backend
| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| **Spring Boot** | 3.2.0 | Framework chính |
| **Java** | 17 | Ngôn ngữ lập trình |
| **Spring Security** | 6.x | Xác thực & phân quyền |
| **Spring Data JPA** | 3.x | ORM & Database access |
| **Spring WebSocket** | 6.x | Real-time communication |
| **MySQL Connector** | 8.0 | Database driver |
| **JWT (jjwt)** | 0.12.3 | Token authentication |
| **ZXing** | 3.5.2 | QR Code generation |
| **SpringDoc OpenAPI** | 2.3.0 | API documentation (Swagger) |
| **Lombok** | Latest | Giảm boilerplate code |
| **Maven** | 3.x | Build tool |

### Frontend
| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| **Next.js** | 14.0.4 | React framework |
| **React** | 18.2.0 | UI library |
| **TypeScript** | 5.3.3 | Type safety |
| **TailwindCSS** | 3.4.0 | Styling |
| **Axios** | 1.6.2 | HTTP client |
| **STOMP.js** | 7.2.0 | WebSocket client |
| **SockJS** | 1.6.1 | WebSocket fallback |
| **React Icons** | 4.12.0 | Icon library |
| **Recharts** | 2.10.3 | Charts & graphs |
| **qrcode.react** | 3.1.0 | QR code rendering |
| **date-fns** | 3.0.6 | Date formatting |
| **jwt-decode** | 4.0.0 | JWT decoding |

### Database
- **MySQL 8.0** - Relational database
  - Lưu trữ users, files (LONGBLOB), messages, posts
  - Hỗ trợ transactions & foreign keys
  - Tối ưu cho large file storage

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Git** - Version control

---

## 📦 Cài đặt

### Yêu cầu hệ thống

- **Java 17+** (JDK)
- **Node.js 18+** và npm/yarn
- **MySQL 8.0+**
- **Docker & Docker Compose** (khuyến nghị)
- **Maven 3.6+** (nếu chạy local backend)
- **Git**

### Clone Repository

```bash
git clone https://github.com/yourusername/PixShare.git
cd PixShare
```

---

## ⚙️ Cấu hình

### Backend Configuration

Tệp cấu hình: `backend/src/main/resources/application.yml`

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/PixShare_db
    username: root
    password: your_password
  
  jpa:
    hibernate:
      ddl-auto: update  # Tự động tạo/update database schema
  
  servlet:
    multipart:
      max-file-size: 1GB  # Kích thước file tối đa
      max-request-size: 1GB

server:
  port: 8086
  url: http://localhost:8086  # URL public cho QR code, share links

jwt:
  secret: your-secret-key-here
  expiration: 86400000  # 24 hours

file:
  default-quota: 5368709120  # 5GB
  max-file-size: 1073741824  # 1GB

cors:
  allowed-origins: http://localhost:3000
```

### Frontend Configuration

Tạo file `.env.local` trong thư mục `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8086
```

### Docker Configuration

File `docker-compose.yml` đã được cấu hình sẵn. Có thể tùy chỉnh qua file `.env`:

```env
# Database
MYSQL_ROOT_PASSWORD=1111
MYSQL_DATABASE=PixShare_db

# Ports
BACKEND_PORT=8086
FRONTEND_PORT=3006

# API URL for client browser
NEXT_PUBLIC_API_URL=http://localhost:8086

# Server Address (for public deployment)
SERVER_ADDRESS=0.0.0.0
```

---

## 🚀 Chạy ứng dụng

### Cách 1: Docker Compose (Khuyến nghị) 🐳

Cách đơn giản nhất để chạy toàn bộ stack:

```bash
# Chạy tất cả services (MySQL, Backend, Frontend)
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down

# Xóa cả volumes (reset database)
docker-compose down -v
```

**Truy cập ứng dụng:**
- Frontend: http://localhost:3006
- Backend API: http://localhost:8086
- Swagger UI: http://localhost:8086/swagger-ui.html
- MySQL: localhost:3306

### Cách 2: Chạy Local (Development)

#### 1. Khởi động MySQL

```bash
# Sử dụng Docker
docker run -d \
  --name pixshare-mysql \
  -e MYSQL_ROOT_PASSWORD=1111 \
  -e MYSQL_DATABASE=PixShare_db \
  -p 3306:3306 \
  mysql:8.0

# Hoặc sử dụng MySQL đã cài sẵn
mysql -u root -p
CREATE DATABASE PixShare_db;
```

#### 2. Chạy Backend

```bash
cd backend

# Build project
mvn clean install

# Run application
mvn spring-boot:run

# Hoặc chạy JAR file
java -jar target/pixshare-backend-1.0.0.jar
```

Backend sẽ chạy tại: http://localhost:8086

#### 3. Chạy Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Hoặc build và chạy production
npm run build
npm start
```

Frontend sẽ chạy tại: http://localhost:3006

#### 4. Khởi tạo dữ liệu mẫu

Database schema sẽ tự động được tạo khi backend khởi động (JPA `ddl-auto: update`).

Để thêm posts và comments tables, chạy SQL scripts:

```bash
# Trong MySQL console
mysql -u root -p PixShare_db < backend/add_social_feed_tables.sql
mysql -u root -p PixShare_db < backend/add_profile_fields.sql
```

---

## 📚 API Documentation

### Swagger UI

Truy cập API documentation tại: **http://localhost:8086/swagger-ui.html**

### Các nhóm API chính

#### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/register` | Đăng ký tài khoản mới | ❌ |
| POST | `/api/auth/login` | Đăng nhập | ❌ |

**Request Body - Register:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

**Request Body - Login:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "USER"
  }
}
```

#### 👤 Users (`/api/users`)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/users/me` | Thông tin user hiện tại | ✅ |
| GET | `/api/users/{userId}` | Thông tin user theo ID | ✅ |
| PUT | `/api/users/profile` | Cập nhật profile | ✅ |
| POST | `/api/users/avatar` | Upload avatar | ✅ |
| GET | `/api/users/search?keyword={keyword}` | Tìm kiếm user | ✅ |
| GET | `/api/users/online` | Danh sách user online | ✅ |

#### 👥 Friends (`/api/friends`)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/friends` | Danh sách bạn bè | ✅ |
| POST | `/api/friends/request/{friendId}` | Gửi lời mời kết bạn | ✅ |
| POST | `/api/friends/accept/{requestId}` | Chấp nhận lời mời | ✅ |
| POST | `/api/friends/reject/{requestId}` | Từ chối lời mời | ✅ |
| DELETE | `/api/friends/{friendshipId}` | Xóa bạn bè | ✅ |
| GET | `/api/friends/requests/pending` | Lời mời đang chờ | ✅ |

#### 💬 Messages (`/api/messages`)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/messages/chat/{userId}` | Lịch sử chat với user | ✅ |
| POST | `/api/messages/{messageId}/read` | Đánh dấu đã đọc | ✅ |
| DELETE | `/api/messages/{messageId}` | Xóa tin nhắn | ✅ |
| GET | `/api/messages/unread-count` | Số tin nhắn chưa đọc | ✅ |

**WebSocket Endpoint:** `/ws`

**Subscribe to:** `/user/queue/messages`

**Send to:** `/app/chat.sendMessage`

#### 📁 Files (`/api/files`)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/files` | Upload file | ✅ |
| GET | `/api/files/{fileId}` | Thông tin file | ✅ |
| GET | `/api/files/{fileId}/download` | Tải file | ✅ |
| GET | `/api/files/{fileId}/preview` | Xem trước file | ✅ |
| GET | `/api/files/{fileId}/thumbnail` | Thumbnail (ảnh) | ✅ |
| GET | `/api/files/my-files` | Danh sách file của user | ✅ |
| DELETE | `/api/files/{fileId}` | Xóa file | ✅ |

#### 📱 Posts (`/api/posts`)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/posts` | Tạo bài viết mới | ✅ |
| GET | `/api/posts/feed` | Lấy feed bài viết | ✅ |
| GET | `/api/posts/{postId}` | Chi tiết bài viết | ✅ |
| PUT | `/api/posts/{postId}` | Cập nhật bài viết | ✅ |
| DELETE | `/api/posts/{postId}` | Xóa bài viết | ✅ |
| POST | `/api/posts/{postId}/like` | Like bài viết | ✅ |
| DELETE | `/api/posts/{postId}/like` | Unlike bài viết | ✅ |
| POST | `/api/posts/{postId}/comments` | Thêm comment | ✅ |
| GET | `/api/posts/{postId}/comments` | Lấy comments | ✅ |

#### 👥 Groups (`/api/groups`)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/groups` | Tạo group chat | ✅ |
| GET | `/api/groups` | Danh sách groups | ✅ |
| GET | `/api/groups/{groupId}` | Chi tiết group | ✅ |
| PUT | `/api/groups/{groupId}` | Cập nhật group | ✅ |
| DELETE | `/api/groups/{groupId}` | Xóa group | ✅ |
| POST | `/api/groups/{groupId}/members` | Thêm thành viên | ✅ |
| DELETE | `/api/groups/{groupId}/members/{userId}` | Xóa thành viên | ✅ |

#### 🔗 Public Share (`/api/public`)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/public/share/{fileId}` | Tạo link chia sẻ | ✅ |
| GET | `/api/public/share/{shareToken}` | Truy cập file (public) | ❌ |
| GET | `/api/public/share/{shareToken}/info` | Thông tin share | ❌ |
| GET | `/api/public/share/{shareToken}/qrcode` | QR code (PNG) | ❌ |
| DELETE | `/api/public/share/{shareId}` | Vô hiệu hóa share | ✅ |
| GET | `/api/public/shares/my-shares` | Danh sách shares của user | ✅ |

#### 👨‍💼 Admin (`/api/admin`) - Chỉ ADMIN

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/dashboard/stats` | Thống kê tổng quan |
| GET | `/api/admin/users` | Danh sách users |
| POST | `/api/admin/users/{userId}/lock` | Khóa tài khoản |
| POST | `/api/admin/users/{userId}/unlock` | Mở khóa tài khoản |
| PUT | `/api/admin/users/{userId}/quota` | Cập nhật quota |
| GET | `/api/admin/files` | Danh sách files |
| DELETE | `/api/admin/files/{fileId}` | Xóa file |
| GET | `/api/admin/files/top-users` | Top users theo storage |
| GET | `/api/admin/messages/search` | Tìm kiếm messages |
| GET | `/api/admin/logs` | Admin logs |

### Authentication Header

Tất cả các API cần authentication phải gửi JWT token trong header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📂 Cấu trúc dự án

```
PixShare/
│
├── backend/                          # Spring Boot Backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/pixshare/
│   │       │   ├── config/              # Security, JWT, WebSocket config
│   │       │   │   ├── SecurityConfig.java
│   │       │   │   ├── JwtService.java
│   │       │   │   ├── WebSocketConfig.java
│   │       │   │   └── ...
│   │       │   ├── controller/          # REST Controllers
│   │       │   │   ├── AuthController.java
│   │       │   │   ├── UserController.java
│   │       │   │   ├── FileController.java
│   │       │   │   ├── MessageController.java (WebSocket)
│   │       │   │   ├── PostController.java
│   │       │   │   ├── GroupController.java
│   │       │   │   └── AdminController.java
│   │       │   ├── dto/                 # Data Transfer Objects
│   │       │   │   ├── LoginRequest.java
│   │       │   │   ├── AuthResponse.java
│   │       │   │   ├── UserResponse.java
│   │       │   │   └── ...
│   │       │   ├── model/               # JPA Entities
│   │       │   │   ├── User.java
│   │       │   │   ├── FileMetadata.java
│   │       │   │   ├── Message.java
│   │       │   │   ├── Post.java
│   │       │   │   ├── Friendship.java
│   │       │   │   └── ...
│   │       │   ├── repository/          # Spring Data JPA Repositories
│   │       │   │   ├── UserRepository.java
│   │       │   │   ├── FileMetadataRepository.java
│   │       │   │   └── ...
│   │       │   ├── service/             # Business Logic
│   │       │   │   ├── AuthService.java
│   │       │   │   ├── UserService.java
│   │       │   │   ├── FileService.java
│   │       │   │   ├── MessageService.java
│   │       │   │   └── ...
│   │       │   └── PixShareApplication.java  # Main class
│   │       └── resources/
│   │           └── application.yml      # Configuration
│   ├── uploads/                         # Temporary file storage
│   ├── add_profile_fields.sql          # SQL migration
│   ├── add_social_feed_tables.sql      # SQL migration
│   ├── pom.xml                         # Maven dependencies
│   ├── Dockerfile
│   └── README.md
│
├── frontend/                         # Next.js Frontend
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home (redirect to login)
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   ├── register/
│   │   │   └── page.tsx              # Register page
│   │   ├── dashboard/                # Protected dashboard
│   │   │   ├── layout.tsx            # Dashboard layout (sidebar)
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── files/                # File management
│   │   │   │   └── page.tsx
│   │   │   ├── chat/                 # Chat interface
│   │   │   │   └── page.tsx
│   │   │   ├── friends/              # Friends management
│   │   │   │   └── page.tsx
│   │   │   ├── feed/                 # Social feed
│   │   │   │   └── page.tsx
│   │   │   ├── groups/               # Group chat
│   │   │   │   └── page.tsx
│   │   │   └── profile/              # User profile
│   │   │       ├── page.tsx          # Own profile
│   │   │       └── [userId]/
│   │   │           └── page.tsx      # Other user's profile
│   │   ├── admin/                    # Admin dashboard
│   │   │   └── page.tsx
│   │   └── share/                    # Public share pages
│   │       └── [token]/
│   │           └── page.tsx
│   ├── components/                   # React components
│   │   ├── ConfirmDialog.tsx
│   │   ├── NotificationContainer.tsx
│   │   └── icons/
│   ├── contexts/                     # React Context
│   │   ├── AuthContext.tsx           # Authentication state
│   │   ├── ChatContext.tsx           # WebSocket/Chat state
│   │   └── NotificationContext.tsx   # Notifications
│   ├── lib/                          # Utilities
│   │   ├── api.ts                    # Axios API client
│   │   ├── auth.ts                   # Auth helpers
│   │   ├── notifications.ts          # Notification helpers
│   │   └── utils.ts                  # Utility functions
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   ├── Dockerfile
│   └── README.md
│
├── docker-compose.yml                # Docker orchestration
├── .env                              # Environment variables
├── .gitignore
├── LICENSE
└── README.md                         # This file
```

---

## 🔑 Tài khoản test

Khi khởi động lần đầu, hệ thống tự động tạo các tài khoản mẫu:

### Admin
- **Email:** `admin@pixshare.com`
- **Password:** `admin123`
- **Role:** ADMIN
- **Quota:** 10GB
- **Quyền:** Toàn quyền quản trị hệ thống

### Users
1. **User 1**
   - Email: `user1@pixshare.com`
   - Password: `user123`
   - Role: USER
   - Quota: 5GB

2. **User 2**
   - Email: `user2@pixshare.com`
   - Password: `user123`
   - Role: USER
   - Quota: 5GB

3. **User 3**
   - Email: `user3@pixshare.com`
   - Password: `user123`
   - Role: USER
   - Quota: 5GB

> **Lưu ý:** Các user mẫu đã được tự động kết bạn với nhau để test tính năng chat và social feed.

---

## 💻 Phát triển

### Backend Development

#### Build project
```bash
cd backend
mvn clean install
```

#### Run tests
```bash
mvn test
```

#### Package to JAR
```bash
mvn clean package
# Output: target/pixshare-backend-1.0.0.jar
```

#### Hot reload (DevTools)
Spring Boot DevTools tự động restart khi có thay đổi code.

#### Database Migration
```bash
# Thêm social feed tables
mysql -u root -p PixShare_db < backend/add_social_feed_tables.sql

# Thêm profile fields
mysql -u root -p PixShare_db < backend/add_profile_fields.sql
```

### Frontend Development

#### Install dependencies
```bash
cd frontend
npm install
```

#### Development server
```bash
npm run dev
# Runs on http://localhost:3000
```

#### Build for production
```bash
npm run build
npm start
```

#### Lint code
```bash
npm run lint
```

### Code Style & Conventions

#### Backend (Java)
- **Package naming:** `com.pixshare.<module>`
- **Class naming:** PascalCase
- **Method naming:** camelCase
- **Constants:** UPPER_SNAKE_CASE
- **Annotations:** Lombok để giảm boilerplate
- **Exception handling:** GlobalExceptionHandler

#### Frontend (TypeScript/React)
- **Component naming:** PascalCase (e.g., `UserProfile.tsx`)
- **Function naming:** camelCase
- **CSS:** Tailwind utility classes
- **State management:** React Context API
- **Type safety:** TypeScript strict mode

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

---

## 🚢 Triển khai

### Docker Production Deployment

#### 1. Build images
```bash
docker-compose build
```

#### 2. Run containers
```bash
docker-compose up -d
```

#### 3. Check status
```bash
docker-compose ps
docker-compose logs -f
```

#### 4. Scale services (optional)
```bash
docker-compose up -d --scale backend=3
```

### Manual Deployment

#### Backend (JAR)
```bash
cd backend
mvn clean package -DskipTests
java -jar target/pixshare-backend-1.0.0.jar
```

#### Frontend (Next.js)
```bash
cd frontend
npm run build
npm start
# Or use PM2 for production
pm2 start npm --name "pixshare-frontend" -- start
```

### Environment Variables

Production `.env`:
```env
# Database
MYSQL_ROOT_PASSWORD=strong_password_here
MYSQL_DATABASE=PixShare_db

# Backend
BACKEND_PORT=8080
SERVER_ADDRESS=0.0.0.0
JWT_SECRET=your-256-bit-secret-key-here

# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NODE_ENV=production
```

### Nginx Reverse Proxy (Optional)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8086/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://localhost:8086/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication
- Token expiration: 24 hours
- Password hashing with BCrypt
- Role-based access control (USER, ADMIN)

### API Security
- CORS configuration
- CSRF protection
- SQL injection prevention (JPA Prepared Statements)
- XSS protection

### File Security
- File size limits (max 1GB)
- User quota management (default 5GB)
- Content type validation
- Secure file storage in database

### Best Practices
- Never commit sensitive data (`.env`, `application.yml` với passwords)
- Use environment variables for secrets
- Regular security updates
- HTTPS in production

---

## 🐛 Troubleshooting

### Backend không khởi động được

**Lỗi:** `Cannot connect to database`

**Giải pháp:**
```bash
# Kiểm tra MySQL đang chạy
docker ps | grep mysql

# Kiểm tra connection string trong application.yml
# Đảm bảo MySQL đã tạo database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS PixShare_db;"
```

### Frontend không kết nối được Backend

**Lỗi:** `Network Error` hoặc CORS error

**Giải pháp:**
```bash
# Kiểm tra NEXT_PUBLIC_API_URL trong .env.local
echo $NEXT_PUBLIC_API_URL

# Kiểm tra CORS trong backend application.yml
# Thêm frontend URL vào allowed-origins
```

### WebSocket không hoạt động

**Lỗi:** Chat không realtime

**Giải pháp:**
```javascript
// Kiểm tra WebSocket URL
const WS_URL = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') + '/ws';

// Kiểm tra backend WebSocketConfig.java
// Đảm bảo setAllowedOrigins chứa frontend URL
```

### Docker build lỗi

**Lỗi:** `Cannot build image`

**Giải pháp:**
```bash
# Xóa cache và rebuild
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### MySQL out of memory

**Lỗi:** File uploads bị lỗi với file lớn

**Giải pháp:**
```yaml
# Trong docker-compose.yml, tăng MySQL limits
command: [
  "mysqld",
  "--max_allowed_packet=1G",
  "--innodb_log_buffer_size=512M"
]
```

---

## 📊 Database Schema

### Main Tables

#### Users Table
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  bio TEXT,
  avatar_data LONGBLOB,
  role ENUM('USER', 'ADMIN'),
  status ENUM('ACTIVE', 'LOCKED'),
  storage_quota BIGINT,
  storage_used BIGINT,
  phone_number VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  website_url VARCHAR(255),
  facebook_url VARCHAR(255),
  twitter_url VARCHAR(255),
  instagram_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  current_job VARCHAR(255),
  company VARCHAR(255),
  school VARCHAR(255),
  university VARCHAR(255),
  hometown VARCHAR(255),
  relationship_status VARCHAR(50),
  languages VARCHAR(255),
  interests VARCHAR(300),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### File Metadata Table
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

#### Messages Table
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
  FOREIGN KEY (file_id) REFERENCES file_metadata(id)
);
```

#### Posts Table
```sql
CREATE TABLE posts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
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
```

---

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! 

### Cách đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

### Coding Guidelines

- Viết code rõ ràng, dễ hiểu
- Thêm comments cho logic phức tạp
- Viết tests cho features mới
- Follow existing code style
- Update documentation khi cần

---

## 📝 Changelog

### Version 1.0.0 (2024)
- ✅ Initial release
- ✅ User authentication & authorization
- ✅ File upload & management
- ✅ Real-time chat with WebSocket
- ✅ Social feed (posts, likes, comments)
- ✅ Group chat
- ✅ Public file sharing with QR code
- ✅ Admin dashboard
- ✅ Docker support

---

## 📄 License

MIT License

Copyright (c) 2024 Nguyen Van Hoang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 👥 Authors

### 👨‍💻 Nguyen Van Hoang
**Backend Developer | Java Spring Boot Specialist**

- 🌟 Passionate backend developer who loves crafting robust and scalable web applications
- 🔨 Currently working with **Spring Boot** and **Java**
- 📚 Learning **Microservices Architecture** and **Cloud Technologies**
- 💼 Experience in building **REST APIs** and **Database Design**
- 🎯 Core Technologies: Java, Spring Boot, MySQL, Hibernate, JWT, WebSocket

**Connect with me:**
- 📧 Email: [nguyenhoang4556z@gmail.com](mailto:nguyenhoang4556z@gmail.com)
- 📱 Phone: 0889559357
- 💻 GitHub: [@vanhoangtvu](https://github.com/vanhoangtvu)

---

## 🙏 Acknowledgments

- Spring Boot Team
- Next.js Team
- React Community
- MySQL
- All open source contributors

---

## 📞 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi:

- 📧 Email: [nguyenhoang4556z@gmail.com](mailto:nguyenhoang4556z@gmail.com)
- 📱 Phone: 0889559357
- 💻 GitHub: [@vanhoangtvu](https://github.com/vanhoangtvu)
- 🐛 Issues: [GitHub Issues](https://github.com/vanhoangtvu/PixShare/issues)
- 📖 Documentation: [Project Wiki](https://github.com/vanhoangtvu/PixShare/wiki)

---

<div align="center">

**⭐ Đừng quên star repo nếu project hữu ích! ⭐**

Made with ❤️ by [Nguyen Van Hoang](https://github.com/vanhoangtvu)

</div>

