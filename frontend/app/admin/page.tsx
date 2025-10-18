'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { apiService } from '@/lib/api';
import { formatFileSize, formatDate } from '@/lib/utils';
import { VerifiedIcon } from '@/components/icons/Icons';
import { 
  FiUsers, FiFileText, FiBarChart2, FiBook, FiShield, FiArrowLeft,
  FiEye, FiTrash2, FiLock, FiUnlock, FiCheckCircle, FiXCircle,
  FiHardDrive, FiImage, FiVideo, FiMusic, FiFile, FiPackage,
  FiDownload, FiX, FiCalendar, FiUser, FiMail
} from 'react-icons/fi';
import { 
  HiOutlineUserGroup, HiOutlineDocumentText, HiOutlineChartBar,
  HiOutlineClipboardList, HiOutlineShieldCheck
} from 'react-icons/hi';
import { 
  MdAdminPanelSettings, MdVerified, MdStorage, MdOnlinePrediction 
} from 'react-icons/md';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { success, error, warning, info } = useNotification();
  const { confirm } = useConfirmDialog();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [quotaGB, setQuotaGB] = useState('5');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      loadData();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (previewFile) {
      setPreviewLoading(true);
      loadPreview(previewFile.id);
    } else {
      // Cleanup object URL when closing modal
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }
      setPreviewLoading(false);
    }
    
    // Cleanup on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewFile]);

  const loadPreview = async (fileId: number) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api';
      console.log('🔍 Loading preview for file:', fileId);
      console.log('📍 API URL:', `${apiUrl}/files/${fileId}/preview`);
      console.log('🔑 Token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        console.error('❌ No authentication token found');
        error('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại');
        setPreviewUrl('');
        setPreviewLoading(false);
        return;
      }
      
      const response = await fetch(`${apiUrl}/files/${fileId}/preview`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        },
        credentials: 'include'
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('✅ Preview loaded - Size:', blob.size, 'Type:', blob.type);
        
        // Cleanup old URL before creating new one
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPreviewLoading(false);
      } else {
        const errorText = await response.text();
        console.error('❌ Preview failed:', response.status);
        console.error('📄 Error:', errorText);
        error('Không thể tải preview', response.status === 403 ? 'Không có quyền truy cập' : response.statusText);
        setPreviewUrl('');
        setPreviewLoading(false);
      }
    } catch (err) {
      console.error('💥 Exception loading preview:', err);
      error('Lỗi khi tải preview', String(err));
      setPreviewUrl('');
      setPreviewLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [statsData, usersData, filesData, logsData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getAllUsers(),
        apiService.getAllFiles(),
        apiService.getAdminLogs(0, 50),
      ]);
      
      setStats(statsData);
      setUsers(usersData);
      setFiles(filesData);
      setLogs(Array.isArray(logsData) ? logsData : (logsData.content || []));
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        router.push('/login');
        return;
      }
      setStats({ totalUsers: 0, onlineUsers: 0, totalFiles: 0, totalStorage: 0 });
      setUsers([]);
      setFiles([]);
      setLogs([]);
    }
  };

  const handleLockUser = async (userId: number) => {
    const confirmed = await confirm({
      title: 'Xác nhận khóa người dùng',
      message: 'Bạn có chắc muốn khóa người dùng này?',
      confirmText: 'Khóa',
      cancelText: 'Hủy'
    });
    if (!confirmed) return;
    try {
      await apiService.lockUser(userId);
      await loadData();
      success('Khóa thành công', 'Đã khóa người dùng');
    } catch (error: any) {
      error('Khóa thất bại', error.response?.data?.message || 'Không thể khóa người dùng');
    }
  };

  const handleUnlockUser = async (userId: number) => {
    try {
      await apiService.unlockUser(userId);
      await loadData();
      success('Mở khóa thành công', 'Đã mở khóa người dùng');
    } catch (err: any) {
      error('Mở khóa thất bại', err.response?.data?.message || 'Không thể mở khóa');
    }
  };

  const handleVerifyUser = async (userId: number) => {
    try {
      await apiService.verifyUser(userId);
      await loadData();
      success('Cấp tích xanh thành công', 'Đã cấp tích xanh cho người dùng');
    } catch (err: any) {
      error('Cấp tích xanh thất bại', err.response?.data?.message || 'Không thể cấp tích xanh');
    }
  };

  const handleUnverifyUser = async (userId: number) => {
    try {
      await apiService.unverifyUser(userId);
      await loadData();
      success('Thu hồi thành công', 'Đã thu hồi tích xanh');
    } catch (err: any) {
      error('Thu hồi thất bại', err.response?.data?.message || 'Không thể thu hồi tích xanh');
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string, userRole: string) => {
    // Prevent deleting self
    if (userId === user?.id) {
      error('Không thể xóa chính mình', 'Bạn không thể xóa tài khoản admin đang đăng nhập');
      return;
    }

    // Prevent deleting other admins
    if (userRole === 'ADMIN') {
      error('Không thể xóa admin khác', 'Không được phép xóa tài khoản admin khác');
      return;
    }

    const confirmed = await confirm({
      title: 'Xác nhận xóa người dùng',
      message: `Bạn chắc chắn muốn xóa người dùng?\n\nEmail: ${userEmail}\n\n⚠️ CẢNH BÁO:\n• Tất cả file của user sẽ bị xóa\n• Tất cả tin nhắn sẽ bị xóa\n• Không thể khôi phục\n• Hành động này không thể hoàn tác`,
      type: 'danger',
      confirmText: 'Xóa người dùng',
      cancelText: 'Hủy',
      requireConfirmText: 'DELETE'
    });

    if (!confirmed) {
      info('Đã hủy', 'Không xóa người dùng');
      return;
    }

    try {
      await apiService.deleteUser(userId);
      await loadData();
      success('Xóa thành công', `Đã xóa người dùng ${userEmail} và tất cả dữ liệu liên quan`);
    } catch (err: any) {
      error('Xóa thất bại', err.response?.data?.message || 'Không thể xóa người dùng');
    }
  };

  const handleUpdateQuota = async () => {
    if (!selectedUserId) return;
    try {
      const quotaBytes = parseFloat(quotaGB) * 1024 * 1024 * 1024;
      await apiService.updateUserQuota(selectedUserId, quotaBytes);
      await loadData();
      setShowQuotaModal(false);
      setSelectedUserId(null);
      setQuotaGB('5');
      success('Cập nhật thành công', `Đã cập nhật quota thành ${quotaGB}GB`);
    } catch (err: any) {
      error('Cập nhật thất bại', err.response?.data?.message || 'Không thể cập nhật quota');
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa file',
      message: 'Bạn có chắc muốn xóa file này?\n\nHành động này không thể hoàn tác.',
      type: 'warning',
      confirmText: 'Xóa file',
      cancelText: 'Hủy'
    });
    
    if (!confirmed) return;
    
    try {
      await apiService.deleteFile(fileId);
      await loadData();
      success('Xóa thành công', 'Đã xóa file');
    } catch (err: any) {
      error('Xóa thất bại', err.response?.data?.message || 'Không thể xóa file');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'online' && u.online) ||
                         (filterStatus === 'verified' && u.verified) ||
                         (filterStatus === 'locked' && u.status === 'LOCKED');
    return matchesSearch && matchesFilter;
  });

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: HiOutlineChartBar },
    { id: 'users', label: 'Người dùng', icon: HiOutlineUserGroup, count: users.length },
    { id: 'files', label: 'Files', icon: HiOutlineDocumentText, count: files.length },
    { id: 'logs', label: 'Nhật ký', icon: HiOutlineClipboardList, count: logs.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Mobile Header */}
          <div className="flex flex-col gap-4 md:hidden">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <HiOutlineShieldCheck className="text-primary-600" size={24} />
                Admin
              </h1>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-all shadow-md font-medium flex items-center gap-2 border-2 border-gray-200"
                title="Về Dashboard"
              >
                <FiArrowLeft size={16} />
                <span>Thoát</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg border-2 border-gray-200">
                <img
                  src={`${apiService.getUserAvatar(user?.id ?? 0)}?t=${Date.now()}`}
                  alt={user?.displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If avatar fails to load, show fallback
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.avatar-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'avatar-fallback w-full h-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm';
                      fallback.textContent = user?.displayName?.charAt(0).toUpperCase() || 'A';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <div>
                <p className="text-xs text-gray-600">Xin chào,</p>
                <p className="font-semibold text-gray-900 text-sm">{user?.displayName}</p>
              </div>
            </div>
          </div>
          
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <HiOutlineShieldCheck className="text-primary-600" size={36} />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">Quản trị hệ thống PixShare</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-all shadow-md font-medium flex items-center gap-2 border-2 border-gray-200"
                title="Về Dashboard"
              >
                <FiArrowLeft size={18} />
                <span>Thoát</span>
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-600">Xin chào,</p>
                <p className="font-semibold text-gray-900">{user?.displayName}</p>
              </div>
              <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-gray-200">
                <img
                  src={`${apiService.getUserAvatar(user?.id || 0)}?t=${Date.now()}`}
                  alt={user?.displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If avatar fails to load, show fallback
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.avatar-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'avatar-fallback w-full h-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl';
                      fallback.textContent = user?.displayName?.charAt(0).toUpperCase() || 'A';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex gap-2 mt-4 sm:mt-6 overflow-x-auto scrollbar-hide pb-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-2 text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow'
                  }`}
                >
                  <IconComponent size={18} className="sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline sm:inline">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id ? 'bg-white text-primary-600' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm mb-1">Tổng người dùng</p>
                    <p className="text-3xl sm:text-4xl font-bold">{stats.totalUsers}</p>
                    <p className="text-blue-100 text-xs mt-1 sm:mt-2">+5% so với tháng trước</p>
                  </div>
                  <FiUsers className="text-white opacity-20" size={48} />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs sm:text-sm mb-1">Đang online</p>
                    <p className="text-3xl sm:text-4xl font-bold">{stats.onlineUsers}</p>
                    <p className="text-green-100 text-xs mt-1 sm:mt-2">
                      {((stats.onlineUsers / stats.totalUsers) * 100).toFixed(1)}% hoạt động
                    </p>
                  </div>
                  <MdOnlinePrediction className="text-white opacity-20" size={48} />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs sm:text-sm mb-1">Tổng files</p>
                    <p className="text-3xl sm:text-4xl font-bold">{stats.totalFiles}</p>
                    <p className="text-purple-100 text-xs mt-1 sm:mt-2">
                      TB: {(stats.totalFiles / (stats.totalUsers || 1)).toFixed(0)} files/user
                    </p>
                  </div>
                  <FiFileText className="text-white opacity-20" size={48} />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs sm:text-sm mb-1">Dung lượng</p>
                    <p className="text-2xl sm:text-3xl font-bold">{formatFileSize(stats.totalStorage)}</p>
                    <p className="text-orange-100 text-xs mt-1 sm:mt-2">
                      TB: {formatFileSize(stats.totalStorage / (stats.totalUsers || 1))}/user
                    </p>
                  </div>
                  <MdStorage className="text-white opacity-20" size={48} />
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>⚡</span> Thao tác nhanh
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('users')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-between group"
                  >
                    <span>👥 Quản lý người dùng</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('files')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-between group"
                  >
                    <span>📁 Quản lý files</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-md hover:shadow-lg flex items-center justify-between group"
                  >
                    <span>📜 Xem nhật ký</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  <button
                    onClick={loadData}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-between group"
                  >
                    <span>🔄 Làm mới dữ liệu</span>
                    <span className="transform group-hover:rotate-180 transition-transform">↻</span>
                  </button>
                </div>
              </div>

              {/* System Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📊</span> Thống kê hệ thống
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Người dùng hoạt động</span>
                      <span className="font-semibold text-gray-900">
                        {stats.onlineUsers}/{stats.totalUsers}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${(stats.onlineUsers / stats.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Dung lượng sử dụng</span>
                      <span className="font-semibold text-gray-900">
                        {formatFileSize(stats.totalStorage)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((stats.totalStorage / (stats.totalUsers * 5 * 1024 * 1024 * 1024)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-3 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tổng files:</span>
                      <span className="font-semibold">{stats.totalFiles}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">TB files/user:</span>
                      <span className="font-semibold">{(stats.totalFiles / (stats.totalUsers || 1)).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">TB dung lượng/user:</span>
                      <span className="font-semibold">{formatFileSize(stats.totalStorage / (stats.totalUsers || 1))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hướng dẫn */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>📌</span> Hướng dẫn
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-200">✓</span>
                    <span><strong>Tích xanh:</strong> Cấp/Thu hồi verified badge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-200">✓</span>
                    <span><strong>Quota:</strong> Quản lý dung lượng (5GB - 1TB)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-200">✓</span>
                    <span><strong>Khóa:</strong> Vô hiệu hóa tài khoản</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-200">✓</span>
                    <span><strong>Xóa file:</strong> Xóa nội dung vi phạm</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-200">✓</span>
                    <span><strong>Logs:</strong> Theo dõi mọi thao tác</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="🔍 Tìm kiếm theo tên hoặc email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
                      filterStatus === 'all'
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setFilterStatus('online')}
                    className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
                      filterStatus === 'online'
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🟢 Online
                  </button>
                  <button
                    onClick={() => setFilterStatus('verified')}
                    className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
                      filterStatus === 'verified'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ✓ Verified
                  </button>
                  <button
                    onClick={() => setFilterStatus('locked')}
                    className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
                      filterStatus === 'locked'
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🔒 Locked
                  </button>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-3">
                Hiển thị {filteredUsers.length} / {users.length} người dùng
              </p>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border-2 border-gray-100 hover:border-primary-200"
                >
                  <div className={`h-1.5 sm:h-2 ${u.online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-full overflow-hidden shadow-lg border-2 border-gray-200">
                          <img
                            src={`${apiService.getUserAvatar(u.id)}?t=${Date.now()}`}
                            alt={u.displayName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // If avatar fails to load, show fallback
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('.avatar-fallback')) {
                                const fallback = document.createElement('div');
                                fallback.className = 'avatar-fallback w-full h-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl';
                                fallback.textContent = u.displayName?.charAt(0).toUpperCase() || '?';
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{u.displayName}</h3>
                            {u.verified && <VerifiedIcon size={14} className="text-blue-500 flex-shrink-0 sm:w-4 sm:h-4" />}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{u.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                        u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {u.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Quota:</span>
                        <span className="font-medium">{formatFileSize(u.storageQuota)}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Đã dùng:</span>
                        <span className="font-medium text-orange-600">{formatFileSize(u.storageUsed)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-gradient-to-r from-orange-400 to-orange-600 h-1.5 sm:h-2 rounded-full"
                          style={{ width: `${Math.min((u.storageUsed / u.storageQuota) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      {u.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleLockUser(u.id)}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-xs sm:text-sm font-medium shadow-md flex items-center justify-center gap-1"
                        >
                          <FiLock size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden xs:inline sm:inline">Khóa</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnlockUser(u.id)}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-xs sm:text-sm font-medium shadow-md flex items-center justify-center gap-1"
                        >
                          <FiUnlock size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden xs:inline sm:inline">Mở</span>
                        </button>
                      )}
                      
                      {u.verified ? (
                        <button
                          onClick={() => handleUnverifyUser(u.id)}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all text-xs sm:text-sm font-medium shadow-md flex items-center justify-center gap-1"
                        >
                          <FiXCircle size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden xs:inline sm:inline">Bỏ tick</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerifyUser(u.id)}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-xs sm:text-sm font-medium shadow-md flex items-center justify-center gap-1"
                        >
                          <FiCheckCircle size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden xs:inline sm:inline">Cấp tick</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteUser(u.id, u.email, u.role)}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-xs sm:text-sm font-medium shadow-md flex items-center justify-center gap-1"
                      >
                        <FiTrash2 size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden xs:inline sm:inline">Xóa</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedUserId(u.id);
                          setQuotaGB(String((u.storageQuota / (1024 * 1024 * 1024)).toFixed(0)));
                          setShowQuotaModal(true);
                        }}
                        className="col-span-3 px-2 sm:px-3 py-1.5 sm:py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all text-xs sm:text-sm font-medium shadow-md flex items-center justify-center gap-1"
                      >
                        <FiHardDrive size={12} className="sm:w-3.5 sm:h-3.5" /> Sửa quota
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
              <h2 className="text-2xl font-bold text-gray-900">📁 Quản lý Files</h2>
              <p className="text-gray-600 mt-1">Tổng số: {files.length} files</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">File</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Người tải lên</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kích thước</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ngày tải</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.slice(0, 50).map((file: any) => {
                    const getFileIcon = () => {
                      if (file.fileType?.startsWith('image/')) return <FiImage className="text-blue-500" size={24} />;
                      if (file.fileType?.startsWith('video/')) return <FiVideo className="text-purple-500" size={24} />;
                      if (file.fileType?.startsWith('audio/')) return <FiMusic className="text-green-500" size={24} />;
                      if (file.fileType?.includes('pdf')) return <FiFile className="text-red-500" size={24} />;
                      if (file.fileType?.includes('zip')) return <FiPackage className="text-orange-500" size={24} />;
                      return <FiFile className="text-gray-500" size={24} />;
                    };
                    
                    return (
                      <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {getFileIcon()}
                            <div>
                              <p className="font-medium text-gray-900">{file.fileName}</p>
                              <p className="text-xs text-gray-500">{file.fileType}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {file.uploaderId ? (
                              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                                <img
                                  src={`${apiService.getUserAvatar(file.uploaderId)}?t=${Date.now()}`}
                                  alt={file.uploaderName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // If avatar fails to load, show fallback
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent && !parent.querySelector('.avatar-fallback')) {
                                      const fallback = document.createElement('div');
                                      fallback.className = 'avatar-fallback w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-xs';
                                      fallback.textContent = (file.uploaderName || 'U').charAt(0).toUpperCase();
                                      parent.appendChild(fallback);
                                    }
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-xs">
                                {(file.uploaderName || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm text-gray-600">{file.uploaderName || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatFileSize(file.fileSize)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(file.uploadedAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setPreviewFile(file);
                                setShowPreviewModal(true);
                              }}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium shadow-md flex items-center gap-1"
                            >
                              <FiEye size={16} /> Xem
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium shadow-md flex items-center gap-1"
                            >
                              <FiTrash2 size={16} /> Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 border-b">
              <h2 className="text-2xl font-bold text-gray-900">📜 Nhật ký hoạt động</h2>
              <p className="text-gray-600 mt-1">Lịch sử {logs.length} thao tác gần đây</p>
            </div>
            <div className="p-6 space-y-3">
              {logs.map((log: any, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 transition-all border-l-4 border-primary-500"
                >
                  <div className="text-3xl">{
                    log.action?.includes('LOCK') ? '🔒' :
                    log.action?.includes('UNLOCK') ? '🔓' :
                    log.action?.includes('VERIFY') ? '✓' :
                    log.action?.includes('QUOTA') ? '💾' :
                    log.action?.includes('DELETE') ? '🗑️' : '📝'
                  }</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{log.action}</p>
                    <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs text-gray-500">
                        {formatDate(log.createdAt)} • Admin:
                      </p>
                      {log.adminId ? (
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full overflow-hidden border border-gray-300">
                            <img
                              src={`${apiService.getUserAvatar(log.adminId)}?t=${Date.now()}`}
                              alt={log.adminName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // If avatar fails to load, show fallback
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector('.avatar-fallback')) {
                                  const fallback = document.createElement('div');
                                  fallback.className = 'avatar-fallback w-full h-full bg-gradient-to-r from-red-400 to-orange-400 flex items-center justify-center text-white font-bold text-xs';
                                  fallback.textContent = (log.adminName || 'A').charAt(0).toUpperCase();
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{log.adminName}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-xs">
                            {(log.adminName || 'A').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-gray-500">{log.adminName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quota Modal */}
      {showQuotaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-bounce-in">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiHardDrive className="text-primary-600" size={28} /> Cập nhật Quota
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dung lượng (GB)
                </label>
                <input
                  type="number"
                  value={quotaGB}
                  onChange={(e) => setQuotaGB(e.target.value)}
                  min="5"
                  max="1024"
                  step="1"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg font-semibold"
                  placeholder="VD: 10"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Khoảng: 5GB - 1TB (1024GB)
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleUpdateQuota}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg hover:from-primary-700 hover:to-purple-700 font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <FiCheckCircle size={18} /> Cập nhật
                </button>
                <button
                  onClick={() => {
                    setShowQuotaModal(false);
                    setSelectedUserId(null);
                    setQuotaGB('5');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <FiX size={18} /> Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowPreviewModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FiEye className="text-blue-600" size={28} /> Xem trước File
                </h3>
                <p className="text-sm text-gray-600 mt-1">{previewFile.fileName}</p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all text-gray-600 hover:text-gray-900"
                title="Đóng"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Image Preview */}
              {previewFile.fileType?.startsWith('image/') && (
                <div className="flex justify-center bg-gray-100 rounded p-4">
                  {previewLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-4">Đang tải hình ảnh...</p>
                    </div>
                  ) : previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={previewFile.fileName}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="text-center py-8">
                      <FiImage className="text-gray-400 mx-auto mb-4" size={64} />
                      <p className="text-gray-600 mb-2">Không thể tải hình ảnh</p>
                      <p className="text-sm text-gray-500">Vui lòng kiểm tra console để xem lỗi chi tiết</p>
                    </div>
                  )}
                </div>
              )}

              {/* Video Preview */}
              {previewFile.fileType?.startsWith('video/') && (
                <div className="flex justify-center bg-black rounded">
                  {previewLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                      <p className="text-white mt-4">Đang tải video...</p>
                    </div>
                  ) : previewUrl ? (
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      className="max-w-full max-h-[70vh] rounded-lg"
                      crossOrigin="anonymous"
                      onLoadStart={(e) => console.log('Video loading started')}
                      onCanPlay={(e) => {
                        console.log('Video can play');
                        // Auto play on user interaction (Safari compatible)
                        const video = e.target as HTMLVideoElement;
                        video.play().catch(err => console.log('Autoplay prevented:', err));
                      }}
                      onError={(e) => {
                        console.error('Video error:', e);
                        const video = e.target as HTMLVideoElement;
                        if (video.error) {
                          console.error('Error code:', video.error.code);
                          console.error('Error message:', video.error.message);
                        }
                      }}
                    >
                      <source src={previewUrl} type={previewFile.fileType || 'video/mp4'} />
                      Trình duyệt không hỗ trợ video.
                    </video>
                  ) : (
                    <div className="text-center py-8">
                      <FiVideo className="text-white mx-auto mb-4" size={64} />
                      <p className="text-white mb-2">Không thể tải video</p>
                      <p className="text-sm text-gray-300">Vui lòng kiểm tra console để xem lỗi chi tiết</p>
                    </div>
                  )}
                </div>
              )}

              {/* Audio Preview */}
              {previewFile.fileType?.startsWith('audio/') && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <FiMusic className="text-blue-500 mx-auto mb-4" size={64} />
                    {previewLoading ? (
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    ) : previewUrl ? (
                      <audio
                        controls
                        src={previewUrl}
                        className="w-full max-w-md"
                        autoPlay
                      >
                        Trình duyệt của bạn không hỗ trợ phát audio.
                      </audio>
                    ) : (
                      <p className="text-gray-600">Không thể tải audio</p>
                    )}
                  </div>
                </div>
              )}

              {/* PDF Preview */}
              {previewFile.fileType?.includes('pdf') && (
                <div className="w-full h-[70vh]">
                  {previewLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-4">Đang tải PDF...</p>
                    </div>
                  ) : previewUrl ? (
                    <iframe
                      src={previewUrl}
                      className="w-full h-full rounded-lg shadow-lg"
                      title={previewFile.fileName}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <FiFile className="text-gray-400 mx-auto mb-4" size={64} />
                      <p className="text-gray-600 mb-2">Không thể tải PDF</p>
                      <p className="text-sm text-gray-500">Vui lòng kiểm tra console để xem lỗi chi tiết</p>
                    </div>
                  )}
                </div>
              )}

              {/* Other Files - Show message */}
              {!previewFile.fileType?.startsWith('image/') && 
               !previewFile.fileType?.startsWith('video/') && 
               !previewFile.fileType?.startsWith('audio/') &&
               !previewFile.fileType?.includes('pdf') && (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
                  {previewFile.fileType?.includes('zip') ? (
                    <FiPackage className="text-orange-500 mb-4" size={64} />
                  ) : (
                    <FiFile className="text-gray-500 mb-4" size={64} />
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Không thể xem trước</h3>
                  <p className="text-gray-600 text-center mb-4">
                    File loại <span className="font-mono bg-gray-200 px-2 py-1 rounded">{previewFile.fileType || 'unknown'}</span> không hỗ trợ xem trước.
                  </p>
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api'}/files/${previewFile.id}/download`}
                    download={previewFile.fileName}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all shadow-lg flex items-center gap-2"
                  >
                    <FiDownload size={18} /> Tải xuống để xem
                  </a>
                </div>
              )}

              {/* File Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FiFileText size={20} className="text-gray-600" /> Thông tin file
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Tên file:</span>
                    <p className="font-medium text-gray-900">{previewFile.fileName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Loại file:</span>
                    <p className="font-medium text-gray-900">{previewFile.fileType}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Kích thước:</span>
                    <p className="font-medium text-gray-900">{formatFileSize(previewFile.fileSize)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Người tải lên:</span>
                    <div className="flex items-center gap-2 mt-1">
                      {previewFile.uploaderId ? (
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200">
                          <img
                            src={`${apiService.getUserAvatar(previewFile.uploaderId)}?t=${Date.now()}`}
                            alt={previewFile.uploaderName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // If avatar fails to load, show fallback
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('.avatar-fallback')) {
                                const fallback = document.createElement('div');
                                fallback.className = 'avatar-fallback w-full h-full bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center text-white font-bold text-xs';
                                fallback.textContent = (previewFile.uploaderName || 'U').charAt(0).toUpperCase();
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-xs">
                          {(previewFile.uploaderName || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <p className="font-medium text-gray-900">{previewFile.uploaderName || 'Unknown'}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày tải:</span>
                    <p className="font-medium text-gray-900">{formatDate(previewFile.uploadedAt)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">File ID:</span>
                    <p className="font-medium text-gray-900">#{previewFile.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t flex gap-3">
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api'}/files/${previewFile.id}/download`}
                download={previewFile.fileName}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all shadow-lg text-center flex items-center justify-center gap-2"
              >
                <FiDownload size={18} /> Tải xuống
              </a>
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn xóa file này?')) {
                    handleDeleteFile(previewFile.id);
                    setShowPreviewModal(false);
                  }
                }}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <FiTrash2 size={18} /> Xóa file
              </button>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
