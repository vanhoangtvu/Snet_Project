'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { SnetLogo } from '@/components/icons/SnetIcon';
import { 
  FiHome, FiUsers, FiMessageSquare, FiBell, FiSearch, 
  FiMenu, FiLogOut, FiSettings, FiUser, FiUserPlus, FiUserCheck, FiUserX
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

interface User {
  id: number;
  displayName: string;
  email: string;
}

interface FriendRequest {
  id: number;
  userId: number;
  userDisplayName: string;
  userEmail: string;
}

export default function FriendsPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');

  useEffect(() => {
    // Chờ auth loading xong
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }
    
    loadData();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [user, router, authLoading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [friendsData, requestsData] = await Promise.all([
        apiService.getFriendsList(),
        apiService.getPendingRequests()
      ]);
      setFriends(friendsData);
      setPendingRequests(requestsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await apiService.searchUsers(searchQuery);
      const filtered = results.filter((u: User) => 
        u.id !== user?.id && !friends.some(f => f.id === u.id)
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleSendRequest = async (friendId: number) => {
    try {
      await apiService.sendFriendRequest(friendId);
      setSearchResults(searchResults.filter(u => u.id !== friendId));
    } catch (error) {
      console.error('Failed to send request:', error);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await apiService.acceptFriendRequest(requestId);
      await loadData();
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await apiService.rejectFriendRequest(requestId);
      setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getUserInitial = (name: string) => {
    return name?.charAt(0).toUpperCase() || '?';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-16 md:pb-0">
      {/* Header - Same as Dashboard */}
      <header className="sticky top-0 z-[100] bg-black/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <SnetLogo size="md" className="text-primary-500" />
            <div className="hidden sm:flex items-center bg-white/5 rounded-full px-4 py-2 gap-2 border border-gray-700">
              <FiSearch className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="bg-transparent border-none outline-none text-sm w-48"
              />
            </div>
          </div>

          {/* Center - Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <FiHome className="w-6 h-6" />
            </button>
            <button 
              onClick={() => router.push('/dashboard/friends')}
              className="px-6 py-2 hover:bg-white/5 rounded-lg transition-colors border-b-2 border-primary-500"
            >
              <FiUsers className="w-6 h-6" />
            </button>
            <button 
              onClick={() => router.push('/dashboard/chat')}
              className="px-6 py-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <FiMessageSquare className="w-6 h-6" />
            </button>
          </nav>

          {/* Right */}

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <FiBell className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-sm md:text-base"
              >
                {user?.displayName?.charAt(0).toUpperCase()}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl border border-gray-700 py-2">
                  <button
                    onClick={() => router.push('/dashboard/profile')}
                    className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-2"
                  >
                    <FiUser className="w-4 h-4" />
                    Trang cá nhân
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/settings')}
                    className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-2"
                  >
                    <FiSettings className="w-4 h-4" />
                    Cài đặt
                  </button>
                  <hr className="my-2 border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-2 text-red-400"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="max-w-2xl mx-auto">
          {/* Tabs */}
          <div className="bg-white/5 rounded-xl p-1 mb-4 md:mb-6 flex gap-1">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg font-semibold text-sm md:text-base transition-all ${
                activeTab === 'friends'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiUsers className="inline mr-1 md:mr-2 w-4 h-4 md:w-5 md:h-5" />
              Bạn bè ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg font-semibold text-sm md:text-base transition-all relative ${
                activeTab === 'requests'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiUserPlus className="inline mr-1 md:mr-2 w-4 h-4 md:w-5 md:h-5" />
              Lời mời ({pendingRequests.length})
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg font-semibold text-sm md:text-base transition-all ${
                activeTab === 'search'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiSearch className="inline mr-1 md:mr-2 w-4 h-4 md:w-5 md:h-5" />
              Tìm kiếm
            </button>
          </div>

          {/* Friends List */}
          {activeTab === 'friends' && (
            <div className="space-y-3">
              {friends.length === 0 ? (
                <div className="bg-white/5 rounded-xl p-8 md:p-12 text-center">
                  <FiUsers className="mx-auto text-4xl md:text-5xl mb-4 opacity-50" />
                  <p className="text-gray-400 mb-4">Chưa có bạn bè nào</p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="px-4 md:px-6 py-2 bg-primary-500 rounded-lg font-semibold hover:shadow-lg transition-all text-sm md:text-base"
                  >
                    Tìm bạn bè
                  </button>
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-white/5 rounded-xl p-3 md:p-4 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-base md:text-lg flex-shrink-0">
                        {getUserInitial(friend.displayName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm md:text-base truncate">{friend.displayName}</h3>
                        <p className="text-xs md:text-sm text-gray-400 truncate">{friend.email}</p>
                      </div>
                      <button
                        onClick={() => router.push(`/dashboard/chat?userId=${friend.id}`)}
                        className="px-3 md:px-4 py-1.5 md:py-2 bg-primary-500 hover:bg-primary-600 rounded-lg font-semibold transition-all text-xs md:text-sm flex-shrink-0"
                      >
                        Nhắn tin
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pending Requests */}
          {activeTab === 'requests' && (
            <div className="space-y-3">
              {pendingRequests.length === 0 ? (
                <div className="bg-white/5 rounded-xl p-8 md:p-12 text-center">
                  <FiUserPlus className="mx-auto text-4xl md:text-5xl mb-4 opacity-50" />
                  <p className="text-gray-400">Không có lời mời kết bạn nào</p>
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white/5 rounded-xl p-3 md:p-4 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center font-bold text-base md:text-lg flex-shrink-0">
                        {getUserInitial(request.userDisplayName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm md:text-base truncate">{request.userDisplayName}</h3>
                        <p className="text-xs md:text-sm text-gray-400 truncate">{request.userEmail}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all"
                          title="Chấp nhận"
                        >
                          <FiUserCheck className="text-lg md:text-xl" />
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all"
                          title="Từ chối"
                        >
                          <FiUserX className="text-lg md:text-xl" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Search */}
          {activeTab === 'search' && (
            <div>
              <div className="flex gap-2 mb-4 md:mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  className="flex-1 bg-white/5 border border-gray-700 rounded-xl px-4 py-2 md:py-3 focus:outline-none focus:border-primary-500 transition-all text-sm md:text-base"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 md:px-6 py-2 md:py-3 bg-primary-500 rounded-xl font-semibold hover:shadow-lg transition-all flex-shrink-0"
                >
                  <FiSearch className="text-lg md:text-xl" />
                </button>
              </div>

              <div className="space-y-3">
                {searchResults.length === 0 && searchQuery && (
                  <div className="bg-white/5 rounded-xl p-8 md:p-12 text-center">
                    <p className="text-gray-400">Không tìm thấy kết quả</p>
                  </div>
                )}
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white/5 rounded-xl p-3 md:p-4 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center font-bold text-base md:text-lg flex-shrink-0">
                        {getUserInitial(user.displayName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm md:text-base truncate">{user.displayName}</h3>
                        <p className="text-xs md:text-sm text-gray-400 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => handleSendRequest(user.id)}
                        className="px-3 md:px-4 py-1.5 md:py-2 bg-primary-500 rounded-lg font-semibold hover:shadow-lg transition-all text-xs md:text-sm flex-shrink-0"
                      >
                        <FiUserPlus className="inline mr-1 md:mr-2 w-3 h-3 md:w-4 md:h-4" />
                        Kết bạn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav - Same as Dashboard */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800 px-4 py-2 z-[100]">
        <div className="flex items-center justify-around">
          <button 
            onClick={() => router.push('/dashboard')}
            className="p-3 hover:text-primary-500 transition-colors"
          >
            <FiHome className="w-6 h-6" />
          </button>
          <button 
            onClick={() => router.push('/dashboard/friends')}
            className="p-3 text-primary-500"
          >
            <FiUsers className="w-6 h-6" />
          </button>
          <button 
            onClick={() => router.push('/dashboard/chat')}
            className="p-3 hover:text-primary-500 transition-colors"
          >
            <FiMessageSquare className="w-6 h-6" />
          </button>
          <button className="p-3 hover:text-primary-500 transition-colors">
            <FiBell className="w-6 h-6" />
          </button>
          <button className="p-3 hover:text-primary-500 transition-colors">
            <FiMenu className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </div>
  );
}
