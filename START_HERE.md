# 🚨 HÀNH ĐỘNG NGAY - Cập nhật IP Server

## TÓM TẮT

Đã cập nhật **16 files** từ IP cũ sang IP mới **14.163.29.11**

**Trạng thái**: ✅ Code đã sửa | ⏳ Cần rebuild và restart

---

## 🎯 LÀM NGAY (1 lệnh)

```bash
./rebuild-and-restart.sh
```

**Sau đó mở firewall** (nếu cần):
```bash
sudo ./open-firewall.sh
```

---

## 📖 Chi tiết

- **ACTION_REQUIRED.md** - Xem checklist và hành động cần làm
- **COMPLETE_FIX_GUIDE.md** - Hướng dẫn đầy đủ nếu gặp vấn đề
- **DOC_UPDATE_IP_SERVER.md** - Tài liệu kỹ thuật chi tiết

---

## ✅ Test sau khi chạy

```bash
# Test API
curl http://14.163.29.11:8086/api

# Test Frontend  
curl http://14.163.29.11:3006

# Mở browser
http://14.163.29.11:3006
```

---

**IP mới**: 14.163.29.11  
**Ports**: 8086 (Backend), 3006 (Frontend)
