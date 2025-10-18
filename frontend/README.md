# PixShare Frontend

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black.svg)
![React](https://img.shields.io/badge/React-18.2.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)

**Frontend cho PixShare - Nền tảng chia sẻ ảnh, video và nhắn tin trực tuyến**

Developed by [Nguyen Van Hoang](https://github.com/vanhoangtvu)

</div>

---

## 📋 Mục lục

- [Công nghệ](#-công-nghệ)
- [Tính năng](#-tính-năng)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Chạy ứng dụng](#-chạy-ứng-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Developer](#-developer)

---

## 🚀 Công nghệ

### Core Technologies
- **Framework**: Next.js 14.0.4 (App Router)
- **React**: 18.2.0
- **TypeScript**: 5.3.3
- **Styling**: TailwindCSS 3.4.0
- **Build Tool**: Node.js + npm

### Main Dependencies

```json
{
  "dependencies": {
    "@stomp/stompjs": "^7.2.0",      // WebSocket client (STOMP)
    "axios": "1.6.2",                 // HTTP client
    "date-fns": "3.0.6",              // Date formatting
    "jwt-decode": "4.0.0",            // JWT token decoding
    "next": "14.0.4",                 // React framework
    "qrcode.react": "3.1.0",          // QR code generation
    "react": "18.2.0",                // UI library
    "react-dom": "18.2.0",            // React DOM
    "react-icons": "^4.12.0",         // Icon library
    "react-toastify": "9.1.3",        // Toast notifications
    "recharts": "2.10.3",             // Charts library
    "sockjs-client": "^1.6.1"         // WebSocket fallback
  },
  "devDependencies": {
    "@types/node": "20.10.6",
    "@types/react": "18.2.46",
    "@types/react-dom": "18.2.18",
    "@types/sockjs-client": "^1.5.4",
    "autoprefixer": "10.4.16",
    "eslint": "8.56.0",
    "eslint-config-next": "14.0.4",
    "postcss": "8.4.32",
    "tailwindcss": "3.4.0",
    "typescript": "5.3.3"
  }
}
```

---

## ✨ Tính năng

### 🔐 Authentication
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập với email/password
- ✅ JWT token authentication
- ✅ Auto-redirect khi chưa đăng nhập
- ✅ Logout functionality

### 👤 User Profile
- ✅ Xem và cập nhật profile cá nhân
- ✅ Upload avatar & cover photo
- ✅ Cập nhật thông tin cá nhân đầy đủ:
  - Bio, phone, date of birth, gender, location
  - Social media links (Facebook, Instagram, Twitter, LinkedIn, Website)
  - Work & education (job, company, school, university)
  - Additional info (hometown, relationship, languages, interests)
- ✅ Xem profile người dùng khác
- ✅ Hiển thị trạng thái online/offline
- ✅ Badge xác thực (verified)

### 👥 Friends Management
- ✅ Tìm kiếm người dùng
- ✅ Gửi lời mời kết bạn
- ✅ Chấp nhận/từ chối lời mời kết bạn
- ✅ Danh sách bạn bè
- ✅ Xem số lượng lời mời đang chờ
- ✅ Xóa bạn bè

### 💬 Real-time Chat
- ✅ Chat 1-on-1 với bạn bè
- ✅ WebSocket realtime (STOMP over SockJS)
- ✅ Gửi tin nhắn văn bản
- ✅ Gửi file đính kèm
- ✅ Hiển thị trạng thái online/offline
- ✅ Đánh dấu tin nhắn đã đọc
- ✅ Số tin nhắn chưa đọc
- ✅ Thu hồi tin nhắn
- ✅ Xóa tin nhắn

### 👥 Group Chat
- ✅ Tạo nhóm chat với nhiều thành viên
- ✅ Upload group avatar
- ✅ Thêm/xóa thành viên (admin)
- ✅ Rời khỏi nhóm
- ✅ Xem danh sách thành viên
- ✅ Chat trong nhóm realtime

### 📱 Social Feed
- ✅ Xem feed bài viết công khai
- ✅ Tạo bài viết mới (text + media)
- ✅ Like/unlike bài viết
- ✅ Comment trên bài viết
- ✅ Xem danh sách likes và comments
- ✅ Xóa bài viết của mình
- ✅ Privacy settings (Public, Friends Only, Private)
- ✅ Xem bài viết theo user

### 📁 File Management
- ✅ Upload file (ảnh, video, document)
- ✅ Xem danh sách file đã upload
- ✅ Preview file (ảnh, video)
- ✅ Download file
- ✅ Xóa file
- ✅ Hiển thị storage quota & usage
- ✅ Progress bar khi upload

### 🔗 Public Sharing
- ✅ Tạo link chia sẻ công khai cho file
- ✅ Hiển thị QR code
- ✅ Copy link chia sẻ
- ✅ Xem danh sách shares
- ✅ Vô hiệu hóa share link
- ✅ Truy cập file qua share token (không cần login)

### 👨‍💼 Admin Dashboard
- ✅ Thống kê tổng quan (users, files, messages, storage)
- ✅ Biểu đồ thống kê (Recharts)
- ✅ Quản lý users (khóa/mở khóa, cập nhật quota)
- ✅ Quản lý files (xem, xóa)
- ✅ Top users theo storage usage
- ✅ Tìm kiếm và quản lý messages
- ✅ Xem admin logs
- ✅ Tìm kiếm logs theo action

### 🎨 UI/UX
- ✅ Modern, responsive design
- ✅ Dark mode ready (TailwindCSS)
- ✅ Toast notifications
- ✅ Loading states
- ✅ Confirm dialogs
- ✅ Beautiful icons (React Icons)
- ✅ Smooth animations

---

## 📦 Cài đặt

### Yêu cầu hệ thống

- 📦 **Node.js 18+**
- 📦 **npm** hoặc **yarn**
- 🔌 **Backend API** đang chạy (http://localhost:8086)

### Cách 1: Docker Compose (Khuyến nghị) 🐳

Chạy toàn bộ stack từ thư mục gốc:

```bash
cd /path/to/PixShare
docker-compose up -d
```

Frontend sẽ chạy tại: **http://localhost:3006**

### Cách 2: Chạy Local

#### 1. Clone và cài đặt dependencies

```bash
cd frontend
npm install
# hoặc
yarn install
```

#### 2. Tạo file cấu hình `.env.local`

```bash
# Trong thư mục frontend/
touch .env.local
```

Thêm vào `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8086
```

#### 3. Chạy development server

```bash
npm run dev
# hoặc
yarn dev
```

Ứng dụng sẽ chạy tại: **http://localhost:3006**

#### 4. Build production

```bash
npm run build
npm start
# hoặc
yarn build
yarn start
```

---

## ⚙️ Cấu hình

### Environment Variables

Tạo file `.env.local` trong thư mục `frontend/`:

```env
# API Backend URL (required)
NEXT_PUBLIC_API_URL=http://localhost:8086

# Node Environment
NODE_ENV=development
```

**Production:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NODE_ENV=production
```

### Next.js Configuration

File: `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', '113.170.159.180'],  // Add your domain
  },
}

module.exports = nextConfig
```

### TailwindCSS Configuration

File: `tailwind.config.js`

```javascript
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          // ... color palette
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
```

---

## 🚀 Chạy ứng dụng

### Development Mode

```bash
npm run dev
```

Truy cập: http://localhost:3006

**Features:**
- Hot reload
- Fast refresh
- Error overlay
- TypeScript checking

### Production Build

```bash
# Build
npm run build

# Start production server
npm start
```

### Lint Code

```bash
npm run lint
```

### Docker Build

```bash
cd frontend
docker build -t pixshare-frontend:latest .
docker run -p 3006:3006 -e NEXT_PUBLIC_API_URL=http://backend:8086 pixshare-frontend:latest
```

---

## 📂 Cấu trúc dự án

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (HTML, body)
│   ├── page.tsx                  # Home page (redirect to login)
│   ├── globals.css               # Global styles
│   │
│   ├── login/                    # Login page
│   │   └── page.tsx
│   │
│   ├── register/                 # Register page
│   │   └── page.tsx
│   │
│   ├── dashboard/                # Protected routes
│   │   ├── layout.tsx            # Dashboard layout (sidebar, header)
│   │   ├── page.tsx              # Dashboard home
│   │   │
│   │   ├── files/                # File management
│   │   │   └── page.tsx
│   │   │
│   │   ├── chat/                 # Chat interface
│   │   │   └── page.tsx
│   │   │
│   │   ├── friends/              # Friends management
│   │   │   └── page.tsx
│   │   │
│   │   ├── feed/                 # Social feed
│   │   │   └── page.tsx
│   │   │
│   │   ├── groups/               # Group chat
│   │   │   └── page.tsx
│   │   │
│   │   └── profile/              # User profiles
│   │       ├── page.tsx          # Own profile
│   │       └── [userId]/         # Other user's profile
│   │           └── page.tsx
│   │
│   ├── admin/                    # Admin dashboard
│   │   └── page.tsx
│   │
│   └── share/                    # Public share pages
│       └── [token]/
│           └── page.tsx
│
├── components/                   # React components
│   ├── ConfirmDialog.tsx         # Confirm dialog component
│   ├── NotificationContainer.tsx # Toast notifications
│   ├── icons/                    # Icon components
│   │   └── Icons.tsx
│   └── media/                    # Media components
│
├── contexts/                     # React Context providers
│   ├── AuthContext.tsx           # Authentication state & functions
│   ├── ChatContext.tsx           # WebSocket/Chat state
│   └── NotificationContext.tsx   # Notification state
│
├── lib/                          # Utilities & helpers
│   ├── api.ts                    # Axios API client
│   ├── auth.ts                   # Auth helpers (token, storage)
│   ├── notifications.ts          # Notification helpers
│   └── utils.ts                  # Utility functions
│
├── public/                       # Static files
│
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.js            # TailwindCSS config
├── postcss.config.js             # PostCSS config
├── next.config.js                # Next.js config
├── next-env.d.ts                 # Next.js types
└── README.md                     # This file
```

### Key Files Explanation

#### `lib/api.ts` - API Client
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

#### `contexts/AuthContext.tsx` - Authentication
```typescript
'use client';
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  // ... authentication logic
  
  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### `contexts/ChatContext.tsx` - WebSocket
```typescript
'use client';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function ChatProvider({ children }) {
  const [stompClient, setStompClient] = useState(null);
  
  const connect = () => {
    const socket = new SockJS(`${API_URL}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        client.subscribe('/user/queue/messages', onMessageReceived);
      },
    });
    
    client.activate();
    setStompClient(client);
  };
  
  // ... chat logic
}
```

---

## 🔑 Tài khoản test

Sử dụng các tài khoản mẫu từ backend:

### Admin
- **Email:** `admin@pixshare.com`
- **Password:** `admin123`
- **Quota:** 10GB

### Users
- **Email:** `user1@pixshare.com` / `user2@pixshare.com` / `user3@pixshare.com`
- **Password:** `user123`
- **Quota:** 5GB mỗi user

---

## 🛠️ Development

### Adding New Pages

1. Create file in `app/your-page/page.tsx`:

```typescript
export default function YourPage() {
  return (
    <div>
      <h1>Your Page</h1>
    </div>
  );
}
```

2. Add to navigation/sidebar if needed

### API Calls

```typescript
import api from '@/lib/api';

// GET request
const response = await api.get('/api/users/me');

// POST request
const response = await api.post('/api/posts', {
  content: 'Hello world!',
  privacy: 'PUBLIC',
});

// Upload file
const formData = new FormData();
formData.append('file', file);
const response = await api.post('/api/files', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

### Toast Notifications

```typescript
import { showSuccess, showError } from '@/lib/notifications';

showSuccess('File uploaded successfully!');
showError('Failed to upload file');
```

### Protected Routes

```typescript
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated]);
  
  return <div>Protected content</div>;
}
```

---

## 📱 Pages Overview

### Public Pages
- `/` - Home (redirect to login/dashboard)
- `/login` - Login page
- `/register` - Register page
- `/share/[token]` - Public file access

### Protected Pages
- `/dashboard` - Dashboard home
- `/dashboard/files` - File management
- `/dashboard/chat` - Chat interface
- `/dashboard/friends` - Friends management
- `/dashboard/feed` - Social feed
- `/dashboard/groups` - Group chat
- `/dashboard/profile` - User profile
- `/dashboard/profile/[userId]` - Other user's profile

### Admin Pages (ADMIN only)
- `/admin` - Admin dashboard

---

## 🐛 Troubleshooting

### Port already in use

```bash
# Kill process on port 3006
npx kill-port 3006
# or
lsof -ti:3006 | xargs kill -9
```

### API Connection Error

```bash
# Check backend is running
curl http://localhost:8086/api/users/me

# Check NEXT_PUBLIC_API_URL in .env.local
echo $NEXT_PUBLIC_API_URL
```

### WebSocket not connecting

```javascript
// Check WebSocket URL
const WS_URL = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') + '/ws';
console.log('WebSocket URL:', WS_URL);
```

### Clear cache

```bash
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

---

## 👨‍💻 Developer

<div align="center">

### Nguyen Van Hoang
**Full-stack Developer | Backend Specialist**

[![Email](https://img.shields.io/badge/Email-nguyenhoang4556z%40gmail.com-red?style=flat-square&logo=gmail)](mailto:nguyenhoang4556z@gmail.com)
[![Phone](https://img.shields.io/badge/Phone-0889559357-green?style=flat-square&logo=phone)](tel:0889559357)
[![GitHub](https://img.shields.io/badge/GitHub-vanhoangtvu-black?style=flat-square&logo=github)](https://github.com/vanhoangtvu)

---

💡 **About Me:**
- 🌟 Passionate developer who loves crafting robust and scalable web applications
- 🔨 Currently working with **Spring Boot**, **Java**, and **Next.js**
- 📚 Learning **Microservices Architecture** and **Cloud Technologies**
- 💼 Experience in building **REST APIs** and modern web applications

🎯 **Tech Stack:**
- **Backend:** Java 17, Spring Boot, MySQL, JWT, WebSocket
- **Frontend:** Next.js, React, TypeScript, TailwindCSS
- **Tools:** Docker, Git, Maven, npm

</div>

---

## 📄 License

MIT License

Copyright (c) 2024 Nguyen Van Hoang

---

<div align="center">

**⭐ Star this project if you find it helpful! ⭐**

Made with ❤️ by [Nguyen Van Hoang](https://github.com/vanhoangtvu)

</div>
