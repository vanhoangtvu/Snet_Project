# Icon System - PixShare

## 📌 Tổng quan

Dự án PixShare đã được nâng cấp với hệ thống icon SVG chuyên nghiệp theo phong cách **Facebook/Material Design**, thay thế hoàn toàn các emoji trước đây.

## ✨ Đặc điểm

- **SVG Icons**: Vector graphics, scale hoàn hảo ở mọi kích thước
- **Customizable**: Dễ dàng thay đổi màu sắc, kích thước qua props
- **Consistent**: Thiết kế đồng nhất, chuyên nghiệp
- **Accessible**: Hỗ trợ screen readers tốt hơn emoji
- **Performance**: Nhẹ hơn, render nhanh hơn
- **Modern**: Phù hợp với các ứng dụng web hiện đại

## 📦 Danh sách Icons

### Navigation Icons
- `HomeIcon` - Trang chủ
- `FilesIcon` - File/Documents
- `ChatIcon` - Trò chuyện
- `FriendsIcon` - Bạn bè
- `ProfileIcon` - Hồ sơ cá nhân
- `AdminIcon` - Quản trị

### Action Icons
- `UploadIcon` - Upload file
- `DownloadIcon` - Tải xuống
- `ShareIcon` - Chia sẻ
- `DeleteIcon` - Xóa
- `EyeIcon` - Xem/Preview
- `SendIcon` - Gửi message
- `AttachIcon` - Đính kèm file
- `SearchIcon` - Tìm kiếm
- `AddIcon` - Thêm/Kết bạn
- `CheckIcon` - Chấp nhận
- `CloseIcon` - Đóng/Từ chối
- `BackIcon` - Quay lại
- `LogoutIcon` - Đăng xuất

### UI Icons
- `MenuIcon` - Hamburger menu
- `VerifiedIcon` - Tick xanh xác minh
- `NotificationIcon` - Thông báo
- `SettingsIcon` - Cài đặt

### Content Icons
- `ImageIcon` - Hình ảnh
- `VideoIcon` - Video
- `DocumentIcon` - Tài liệu

### Admin Icons
- `StatsIcon` - Thống kê
- `UsersIcon` - Người dùng
- `LogIcon` - Nhật ký

## 🎯 Cách sử dụng

### Import Icons

```tsx
import { 
  HomeIcon, 
  ChatIcon, 
  FilesIcon,
  SendIcon 
} from '@/components/icons/Icons';
```

### Sử dụng cơ bản

```tsx
// Default size (24px)
<HomeIcon />

// Custom size
<HomeIcon size={32} />

// Custom className (màu sắc, v.v.)
<HomeIcon className="text-primary-600" />
<ChatIcon className="text-blue-500 hover:text-blue-700" />

// Kết hợp size và className
<FilesIcon 
  size={20} 
  className="text-gray-600 group-hover:text-primary-600" 
/>
```

### Trong Buttons

```tsx
<button className="flex items-center gap-2">
  <SendIcon size={18} />
  <span>Gửi tin nhắn</span>
</button>

<button className="p-2 rounded-lg hover:bg-gray-100">
  <SearchIcon size={24} className="text-gray-600" />
</button>
```

### Trong Navigation

```tsx
<Link 
  href="/dashboard" 
  className="flex items-center gap-3 px-4 py-3 rounded-lg"
>
  <HomeIcon size={20} />
  <span>Trang chủ</span>
</Link>
```

### Với Animation

```tsx
<div className="group">
  <FilesIcon 
    size={48} 
    className="text-primary-600 group-hover:scale-110 transition-transform" 
  />
</div>
```

## 🎨 Styling Guidelines

### Màu sắc phổ biến

```tsx
// Primary actions
className="text-primary-600 hover:text-primary-700"

// Success/Positive
className="text-green-600 hover:text-green-700"

// Warning/Attention
className="text-yellow-600 hover:text-yellow-700"

// Danger/Delete
className="text-red-600 hover:text-red-700"

// Neutral/Gray
className="text-gray-600 hover:text-gray-700"

// Info
className="text-blue-600 hover:text-blue-700"
```

### Kích thước phổ biến

```tsx
size={16}  // Extra small - trong text, badges
size={18}  // Small - buttons nhỏ
size={20}  // Medium - navigation, menu items
size={24}  // Default - buttons, actions
size={32}  // Large - headings, heros
size={48}  // Extra large - feature cards
```

## 📱 Responsive Best Practices

```tsx
// Desktop lớn, mobile nhỏ
<HomeIcon className="w-8 h-8 sm:w-10 sm:h-10" />

// Hoặc dùng size prop
<ChatIcon size={window.innerWidth < 640 ? 20 : 24} />
```

## ♿ Accessibility

### Thêm title cho screen readers

```tsx
<button aria-label="Gửi tin nhắn">
  <SendIcon size={20} />
</button>

// Hoặc với title trong SVG (đã có sẵn trong một số icon)
<VerifiedIcon /> // Có title="Đã xác minh"
```

### Focus states

```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-primary-500">
  <SearchIcon size={24} />
</button>
```

## 🔧 Customization

### Tạo icon mới

1. Tìm SVG icon (từ Material Icons, Heroicons, etc.)
2. Thêm vào `/components/icons/Icons.tsx`:

```tsx
export const MyIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M..." />
  </svg>
);
```

### Thay đổi default size

Sửa trong interface `IconProps`:

```tsx
interface IconProps {
  className?: string;
  size?: number; // Mặc định là 24
}
```

## 📊 So sánh: Icon vs Emoji

| Aspect | SVG Icons | Emoji |
|--------|-----------|-------|
| Scaling | ✅ Perfect | ❌ Pixelated |
| Màu sắc | ✅ Customizable | ❌ Fixed |
| Kích thước file | ✅ ~1KB | ✅ ~1KB |
| Accessibility | ✅ Good | ⚠️ Limited |
| Consistency | ✅ Uniform | ❌ Varies by OS |
| Professional | ✅ Yes | ⚠️ Casual |
| Animation | ✅ CSS/SVG | ❌ Limited |

## 🚀 Performance

- **Tất cả icons** trong một file: `/components/icons/Icons.tsx`
- Tree-shaking: Chỉ import icons được sử dụng
- No external dependencies (trừ React)
- Inline SVG: No HTTP requests
- Gzip well: SVG text compresses tốt

## 📝 Migration từ Emoji

### Trước
```tsx
<span>🏠 Trang chủ</span>
<button>📁 File của tôi</button>
```

### Sau
```tsx
<div className="flex items-center gap-2">
  <HomeIcon size={20} />
  <span>Trang chủ</span>
</div>

<button className="flex items-center gap-2">
  <FilesIcon size={20} />
  <span>File của tôi</span>
</button>
```

## 💡 Tips & Tricks

### 1. Group hover effects
```tsx
<div className="group hover:bg-primary-50">
  <FilesIcon className="text-gray-600 group-hover:text-primary-600" />
</div>
```

### 2. Loading states
```tsx
<SearchIcon className={`${loading ? 'animate-spin' : ''}`} />
```

### 3. Conditional rendering
```tsx
{isVerified && <VerifiedIcon size={16} className="text-blue-500" />}
```

### 4. Icon buttons
```tsx
<button className="p-2 rounded-full hover:bg-gray-100">
  <DeleteIcon size={20} className="text-red-600" />
</button>
```

## 🎓 Resources

- [Material Design Icons](https://material.io/resources/icons/)
- [Heroicons](https://heroicons.com/)
- [SVG Optimization](https://jakearchibald.github.io/svgomg/)
- [Accessible SVG](https://css-tricks.com/accessible-svgs/)

## ✅ Checklist Migration

- [x] Dashboard navigation
- [x] Files page actions
- [x] Chat interface
- [x] Friends page
- [x] Profile badges
- [x] Admin panel
- [ ] Notifications (future)
- [ ] Settings page (future)
- [ ] Modal dialogs (future)

---

**Version**: 2.0.0
**Last Updated**: 10/10/2025
**Maintained by**: Development Team
