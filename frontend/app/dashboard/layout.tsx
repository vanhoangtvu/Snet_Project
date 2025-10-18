'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { formatFileSize } from '@/lib/utils';
import { 
  HomeIcon, 
  FilesIcon, 
  ChatIcon, 
  FriendsIcon, 
  GroupIcon,
  ProfileIcon, 
  AdminIcon, 
  LogoutIcon,
  MenuIcon,
  CloseIcon,
  LogoIcon,
  LogoMark,
  LogoWithText,
  VerifiedIcon,
  FeedIcon
} from '@/components/icons/Icons';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-30 px-4 py-3 flex items-center justify-between">
        <LogoWithText size="sm" />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
        >
          {sidebarOpen ? (
            <CloseIcon size={24} />
          ) : (
            <MenuIcon size={24} />
          )}
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <LogoWithText size="md" />
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Link 
              href="/dashboard" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard') 
                  ? 'bg-primary-100 text-primary-700 font-semibold' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HomeIcon size={20} />
              <span>Trang chủ</span>
            </Link>
            <Link 
              href="/dashboard/feed" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard/feed') 
                  ? 'bg-primary-100 text-primary-700 font-semibold' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FeedIcon size={20} />
              <span>Bảng tin</span>
            </Link>
            <Link 
              href="/dashboard/files" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard/files') 
                  ? 'bg-primary-100 text-primary-700 font-semibold' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FilesIcon size={20} />
              <span>File của tôi</span>
            </Link>
            <Link 
              href="/dashboard/chat" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard/chat') 
                  ? 'bg-primary-100 text-primary-700 font-semibold' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChatIcon size={20} />
              <span>Trò chuyện</span>
            </Link>
            <Link 
              href="/dashboard/groups" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard/groups') 
                  ? 'bg-primary-100 text-primary-700 font-semibold' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <GroupIcon size={20} />
              <span>Nhóm Chat</span>
            </Link>
            <Link 
              href="/dashboard/friends" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard/friends') 
                  ? 'bg-primary-100 text-primary-700 font-semibold' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FriendsIcon size={20} />
              <span>Bạn bè</span>
            </Link>
            <Link 
              href="/dashboard/profile" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard/profile') 
                  ? 'bg-primary-100 text-primary-700 font-semibold' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ProfileIcon size={20} />
              <span>Hồ sơ</span>
            </Link>
            {user.role === 'ADMIN' && (
              <Link 
                href="/admin" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <AdminIcon size={20} />
                <span>Quản trị</span>
              </Link>
            )}
          </nav>

          <div className="p-4 border-t">
            <div className="mb-4">
              <div className="flex items-center gap-1">
                <div className="text-sm font-medium text-gray-700 truncate">{user.displayName}</div>
                {user.verified && (
                  <VerifiedIcon size={16} className="flex-shrink-0 text-blue-500" />
                )}
              </div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Dung lượng</span>
                <span>{formatFileSize(user.storageUsed)} / {formatFileSize(user.storageQuota)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${Math.min((user.storageUsed / user.storageQuota) * 100, 100)}%` }}></div>
              </div>
            </div>
            <button 
              onClick={logout} 
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors"
            >
              <LogoutIcon size={18} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
