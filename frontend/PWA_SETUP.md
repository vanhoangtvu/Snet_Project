# 📱 PWA Setup Guide - PixShare

## ✅ Đã Hoàn Thành

### 1. **Cấu Hình PWA** ✓
- ✅ `manifest.json` đã được tạo trong `/public`
- ✅ Metadata và viewport đã được cấu hình trong `app/layout.tsx`
- ✅ Favicon tự động được generate từ `app/icon.tsx`
- ✅ Apple Touch Icon được generate từ `app/apple-icon.tsx`
- ✅ Open Graph image được generate từ `app/opengraph-image.tsx`

### 2. **Install Prompt** ✓
- ✅ PWA Install Prompt component đã được tạo
- ✅ Hỗ trợ Android/Chrome (beforeinstallprompt)
- ✅ Hỗ trợ iOS (hướng dẫn manual install)
- ✅ Auto-dismiss sau 7 ngày nếu user từ chối

### 3. **Features**
- ✅ **Standalone mode** - App chạy như native app
- ✅ **Theme color** - Màu #8b5cf6 (purple)
- ✅ **Shortcuts** - Quick actions từ home screen
  - Bảng tin
  - Tải file lên
  - Trò chuyện
- ✅ **Responsive** - Hoạt động tốt trên mọi thiết bị

## 🎨 Tạo PWA Icons

### Cách 1: Sử Dụng Online Tool (Dễ Nhất)

1. Truy cập: https://www.pwabuilder.com/imageGenerator
2. Upload logo của bạn (512x512px recommended)
3. Chọn padding và background color (#8b5cf6)
4. Download zip file
5. Giải nén và copy các file vào `/frontend/public/`

### Cách 2: Sử Dụng CLI Tool (@pwa/asset-generator)

```bash
# Install tool
npm install -g @pwa/asset-generator

# Generate icons (from frontend directory)
pwa-asset-generator logo.svg public/ \
  --padding "10%" \
  --background "#8b5cf6" \
  --index index.html \
  --manifest manifest.json
```

### Cách 3: Manual Creation

Tạo các file PNG với kích thước sau và đặt vào `/frontend/public/`:

**Required Icons:**
- `icon-72.png` - 72x72px
- `icon-96.png` - 96x96px
- `icon-128.png` - 128x128px
- `icon-144.png` - 144x144px
- `icon-152.png` - 152x152px
- `icon-192.png` - 192x192px ⭐ (most important)
- `icon-384.png` - 384x384px
- `icon-512.png` - 512x512px ⭐ (most important)
- `apple-touch-icon.png` - 180x180px (for iOS)

**Tips:**
- Sử dụng logo đơn giản, dễ nhận biết
- Background màu #8b5cf6 (primary color)
- Logo ở giữa với padding ~10%
- Format: PNG với alpha channel

## 🚀 Test PWA

### Desktop (Chrome/Edge)
1. Build app: `npm run build`
2. Start: `npm start`
3. Mở Chrome DevTools > Application > Manifest
4. Kiểm tra manifest.json đã load đúng
5. Click "Install app" button trên address bar

### Mobile (Android)
1. Deploy app lên server HTTPS
2. Truy cập từ Chrome mobile
3. Banner "Add to Home Screen" sẽ xuất hiện
4. Hoặc: Menu (⋮) > "Install app"

### Mobile (iOS/Safari)
1. Deploy app lên server HTTPS  
2. Truy cập từ Safari
3. Popup hướng dẫn sẽ hiện ra
4. Follow instructions:
   - Tap Share button (📤)
   - Tap "Add to Home Screen" (➕)
   - Tap "Add"

## 📋 Checklist

- [x] manifest.json created
- [x] Metadata configured
- [x] Favicon auto-generated
- [x] Apple touch icon auto-generated
- [x] OG image auto-generated
- [x] PWA install prompt component
- [x] Theme color set
- [x] Shortcuts configured
- [ ] **PWA icons generated** ⚠️ (còn thiếu - cần generate)
- [ ] Service Worker (optional - for offline support)

## 🎯 Next Steps

1. **Generate Icons** - Chọn một trong 3 cách ở trên
2. **Test on Mobile** - Deploy và test install
3. **Optional: Service Worker** - Add offline support
4. **Optional: Push Notifications** - Add web push

## 📖 Resources

- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)

## 🎨 Icon Design Tips

Logo hiện tại của PixShare:
- Camera icon với lens màu gradient (purple → pink)
- Share icon với màu vàng/orange
- Background gradient từ purple → pink → orange
- Modern, clean, professional

**Icon PWA nên:**
- Đơn giản hơn (ít chi tiết)
- Dễ nhận biết ở size nhỏ
- Consistent với brand colors
- Có contrast tốt với background

---

✅ **Sau khi generate icons, PWA sẽ sẵn sàng để install!**

