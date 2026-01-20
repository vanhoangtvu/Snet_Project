# ✅ HOÀN TẤT: THAY ĐỔI TOÀN BỘ TỪ PIXSHARE → SNET

## 🎯 THAY ĐỔI ĐÃ THỰC HIỆN

### 1. **Backend Package**
- ❌ `com.pixshare` → ✅ `com.snet`
- ❌ `PixShareApplication.java` → ✅ `SnetApplication.java`
- Tất cả imports đã được cập nhật

### 2. **Database**
- ❌ `PixShare_db` → ✅ `Snet_db`
- Dữ liệu đã được copy sang database mới
- Schema giữ nguyên

### 3. **Email Domain**
- ❌ `@pixshare.com` → ✅ `@snet.com`
- Admin: `admin@snet.com`
- User: `user1@snet.com`

### 4. **Maven Artifact**
- Group ID: `com.snet`
- Artifact ID: `snet-backend`
- Version: `2.0.0`
- JAR: `snet-backend-2.0.0.jar`

### 5. **Application Name**
- Spring application: `snet-backend`
- Logs prefix: `[snet-backend]`

### 6. **Frontend**
- Package: `snet-frontend`
- Title: "Snet - Social Network & File Sharing"
- Version: `2.0.0`

---

## 🔐 TÀI KHOẢN MỚI

### Admin:
```
Email:    admin@snet.com
Password: hoangadmin@123
```

### User:
```
Email:    user1@snet.com
Password: user123
```

---

## 🌐 TRUY CẬP

**URL:** http://14.160.195.30:3006

---

## 📊 DATABASE

### Snet_db Tables:
```
users           -- User accounts (@snet.com)
files           -- File storage
posts           -- Social posts
post_likes      -- Likes
post_comments   -- Comments
messages        -- Chat messages
friendships     -- Friend relationships
chat_groups     -- Group chats
public_shares   -- Public shares
admin_logs      -- Admin logs
```

---

## 🚀 SERVICES

### Backend:
- JAR: `snet-backend-2.0.0.jar`
- Port: 8086
- Database: Snet_db
- Package: com.snet

### Frontend:
- Package: snet-frontend
- Port: 3006
- API: http://14.160.195.30:8086/api

---

## ✅ KIỂM TRA

```bash
# Backend logs
tail -f backend-snet.log

# Test API
curl http://14.160.195.30:8086/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@snet.com","password":"hoangadmin@123"}'

# Database
mysql -uroot -p1111 Snet_db -e "SELECT email FROM users;"
```

---

## 📝 KHÔNG CÒN PIXSHARE

Tất cả tham chiếu đến "PixShare" đã được thay thế:
- ✅ Package names
- ✅ Class names
- ✅ Database name
- ✅ Email domains
- ✅ Application names
- ✅ Maven artifacts
- ✅ Logs

---

## 🎉 HOÀN TẤT!

Dự án đã được đổi tên hoàn toàn từ **PixShare** → **Snet**

**Truy cập:** http://14.160.195.30:3006  
**Đăng nhập:** admin@snet.com / hoangadmin@123
