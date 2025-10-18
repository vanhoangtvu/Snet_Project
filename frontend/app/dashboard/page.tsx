'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { HomeIcon, FilesIcon, ChatIcon, FriendsIcon, UsersIcon, StatsIcon } from '@/components/icons/Icons';
import { 
  FiTrendingUp, FiActivity, FiUser, FiShield, 
  FiFileText, FiMessageSquare, FiUserPlus, FiUpload,
  FiClock, FiZap, FiAward, FiStar, FiHeart, FiSettings,
  FiBarChart2, FiRss, FiGrid
} from 'react-icons/fi';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [userFileCount, setUserFileCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    loadStats();
    loadUserFiles();
  }, []);

  const loadStats = async () => {
    try {
      if (user?.role === 'ADMIN') {
        const data = await apiService.getDashboardStats();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadUserFiles = async () => {
    try {
      const files = await apiService.getMyFiles();
      setUserFileCount(files.length);
    } catch (error) {
      console.error('Failed to load user files:', error);
    }
  };

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Welcome Header with Modern Animated Background */}
      <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-2xl overflow-hidden">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 animate-gradient-xy"></div>
          
          {/* Floating Geometric Shapes */}
          <div className="absolute inset-0">
            {/* Large Circle */}
            <div className="absolute top-10 right-10 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full blur-2xl animate-float"></div>
            {/* Medium Square */}
            <div className="absolute bottom-20 left-10 w-24 h-24 sm:w-36 sm:h-36 bg-yellow-300/20 rounded-3xl blur-xl animate-float-delayed rotate-45"></div>
            {/* Small Circle */}
            <div className="absolute top-1/2 left-1/4 w-16 h-16 sm:w-24 sm:h-24 bg-blue-400/20 rounded-full blur-xl animate-float-slow"></div>
            {/* Triangle-ish */}
            <div className="absolute bottom-10 right-1/4 w-20 h-20 sm:w-32 sm:h-32 bg-pink-400/20 rounded-2xl blur-2xl animate-float-reverse"></div>
          </div>

          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
              animation: 'grid-move 20s linear infinite'
            }}></div>
          </div>

          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine"></div>
          
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mb-3">
                <span className="text-xs sm:text-sm lg:text-base font-medium bg-white/30 backdrop-blur-md px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/20 shadow-lg whitespace-nowrap">
                  {getGreeting()}
                </span>
                {user?.verified && (
                  <span className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm bg-yellow-400/30 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-yellow-200/30 shadow-lg animate-pulse whitespace-nowrap">
                    <FiAward className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Verified</span>
                  </span>
                )}
                {user?.role === 'ADMIN' && (
                  <span className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm bg-red-400/30 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-red-200/30 shadow-lg whitespace-nowrap">
                    <FiShield className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    Admin
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                {user?.displayName || 'User'}! 👋
              </h1>
              <p className="text-purple-100 text-sm sm:text-base lg:text-lg mb-2">
                Chào mừng trở lại với PixShare. Bạn có <span className="font-bold text-white">{userFileCount}</span> file đã upload.
              </p>
              <p className="text-xs sm:text-sm text-purple-200">
                📅 {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <a
                href="/dashboard/files"
                className="px-5 sm:px-7 py-2.5 sm:py-3.5 bg-white text-primary-600 rounded-xl font-bold hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 transition-all text-sm sm:text-base flex items-center gap-2 justify-center group"
              >
                <FiUpload className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                Upload File
              </a>
              <a
                href="/dashboard/feed"
                className="px-5 sm:px-7 py-2.5 sm:py-3.5 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl font-bold hover:bg-white/30 hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 transition-all text-sm sm:text-base flex items-center gap-2 justify-center group"
              >
                <FiRss className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                Bản tin
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid with Gradient Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Status Card */}
        <div className="group bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 sm:p-6 text-white hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div>
              <div className="text-xs sm:text-sm text-green-100 mb-1">Trạng thái</div>
              <div className="text-2xl sm:text-3xl font-bold">Online</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-xl group-hover:scale-110 transition-transform">
              <FiActivity className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs sm:text-sm">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-green-100">Đang hoạt động</span>
          </div>
        </div>

        {/* Role Card */}
        <div className="group bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 sm:p-6 text-white hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div>
              <div className="text-xs sm:text-sm text-purple-100 mb-1">Vai trò</div>
              <div className="text-xl sm:text-2xl font-bold">
                {user?.role === 'ADMIN' ? 'Admin' : 'Member'}
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-xl group-hover:scale-110 transition-transform">
              <FiShield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="text-xs sm:text-sm text-purple-100">
            {user?.role === 'ADMIN' ? 'Quản trị viên hệ thống' : 'Thành viên'}
          </div>
        </div>

        {/* Users Card (Admin only) */}
        {stats && (
          <div className="group bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 sm:p-6 text-white hover:-translate-y-1">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div>
                <div className="text-xs sm:text-sm text-blue-100 mb-1">Người dùng</div>
                <div className="text-2xl sm:text-3xl font-bold">{stats.totalUsers}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-xl group-hover:scale-110 transition-transform">
                <FiUser className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs sm:text-sm text-blue-100">
              <FiTrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>+12% tuần này</span>
            </div>
          </div>
        )}

        {/* Files Card (Admin only) */}
        {stats && (
          <div className="group bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 sm:p-6 text-white hover:-translate-y-1">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div>
                <div className="text-xs sm:text-sm text-purple-100 mb-1">Tổng file</div>
                <div className="text-2xl sm:text-3xl font-bold">{stats.totalFiles}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-xl group-hover:scale-110 transition-transform">
                <FiFileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs sm:text-sm text-purple-100">
              <FiTrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>+24% tuần này</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions - Modern Cards */}
      <div>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiZap className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            Bắt đầu nhanh
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Feed Card - NEW */}
          <a
            href="/dashboard/feed"
            className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 border-2 border-transparent hover:border-orange-500 overflow-hidden hover:-translate-y-2"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <FiRss size={24} className="sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Bản tin</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Chia sẻ và khám phá nội dung mới
              </p>
              <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm sm:text-base">
                <span>Xem ngay</span>
                <FiHeart className="w-4 h-4 group-hover:scale-125 transition-transform" />
              </div>
            </div>
          </a>

          {/* Files Card */}
          <a
            href="/dashboard/files"
            className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 border-2 border-transparent hover:border-primary-500 overflow-hidden hover:-translate-y-2"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <FilesIcon size={24} className="sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Quản lý file</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Upload, xem và chia sẻ file của bạn
              </p>
              <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm sm:text-base">
                <span>Mở ngay</span>
                <FiUpload className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform" />
              </div>
            </div>
          </a>

          {/* Chat Card */}
          <a
            href="/dashboard/chat"
            className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 border-2 border-transparent hover:border-blue-500 overflow-hidden hover:-translate-y-2"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <ChatIcon size={24} className="sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Trò chuyện</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Chat realtime với bạn bè và nhóm
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm sm:text-base">
                <span>Bắt đầu chat</span>
                <FiMessageSquare className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </a>

          {/* Friends Card */}
          <a
            href="/dashboard/friends"
            className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 border-2 border-transparent hover:border-pink-500 overflow-hidden hover:-translate-y-2"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <FriendsIcon size={24} className="sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Kết bạn</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Tìm kiếm và kết nối với bạn bè mới
              </p>
              <div className="flex items-center gap-2 text-pink-600 font-semibold text-sm sm:text-base">
                <span>Khám phá</span>
                <FiUserPlus className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </a>

          {/* Admin Panel - Only for Admin */}
          {user?.role === 'ADMIN' && (
            <a
              href="/admin"
              className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 border-2 border-transparent hover:border-red-500 overflow-hidden hover:-translate-y-2"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-rose-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <FiSettings size={24} className="sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Quản trị</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Quản lý hệ thống và người dùng
                </p>
                <div className="flex items-center gap-2 text-red-600 font-semibold text-sm sm:text-base">
                  <span>Admin Panel</span>
                  <FiBarChart2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </a>
          )}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiClock className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            Hoạt động gần đây
          </h2>
          <button className="text-sm sm:text-base text-primary-600 hover:text-primary-700 font-medium">
            Xem tất cả
          </button>
        </div>

        <div className="space-y-4">
          {/* Activity Items */}
          <div className="flex items-center gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiUpload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                Bạn đã upload file mới
              </p>
              <p className="text-xs sm:text-sm text-gray-600">2 phút trước</p>
            </div>
            <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">Vừa xong</span>
          </div>

          <div className="flex items-center gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiMessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                Tin nhắn mới từ bạn bè
              </p>
              <p className="text-xs sm:text-sm text-gray-600">15 phút trước</p>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm rounded-full flex-shrink-0">3 mới</span>
          </div>

          <div className="flex items-center gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiUserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                Lời mời kết bạn mới
              </p>
              <p className="text-xs sm:text-sm text-gray-600">1 giờ trước</p>
            </div>
            <button className="px-3 py-1 bg-primary-600 text-white text-xs sm:text-sm rounded-lg hover:bg-primary-700 transition-colors flex-shrink-0">
              Xem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
