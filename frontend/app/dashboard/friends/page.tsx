'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { useNotification } from '@/contexts/NotificationContext';
import { 
  FriendsIcon, 
  SearchIcon, 
  AddIcon, 
  CheckIcon, 
  CloseIcon, 
  ProfileIcon, 
  ChatIcon, 
  VerifiedIcon 
} from '@/components/icons/Icons';

interface User {
  id: number;
  email: string;
  displayName: string;
  online: boolean;
  verified: boolean;
}

interface FriendRequest {
  id: number;
  sender: User;    // Người gửi lời mời
  receiver: User;  // Người nhận lời mời
  status: string;
  createdAt: string;
}

export default function FriendsPage() {
  const router = useRouter();
  const { success, error: showError, warning, info } = useNotification();
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, []);

  const loadFriends = async () => {
    try {
      const data = await apiService.getFriendsList();
      setFriends(data);
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const data = await apiService.getPendingRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;

    try {
      const data = await apiService.searchUsers(searchKeyword);
      setSearchResults(data);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const handleSendRequest = async (userId: number) => {
    try {
      console.log('Sending friend request to user:', userId);
      await apiService.sendFriendRequest(userId);
      success('Gửi lời mời thành công', 'Lời mời kết bạn đã được gửi!');
      setSearchResults([]);
      setSearchKeyword('');
      await loadRequests(); // Reload to see sent requests
    } catch (error: any) {
      console.error('Send friend request error:', error);
      const message = error.response?.data?.message || error.message || 'Gửi lời mời thất bại';
      showError('Gửi lời mời thất bại', message);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await apiService.acceptFriendRequest(requestId);
      await loadFriends();
      await loadRequests();
      success('Chấp nhận thành công', 'Đã chấp nhận lời mời kết bạn!');
    } catch (error: any) {
      showError('Chấp nhận thất bại', error.response?.data?.message || 'Không thể chấp nhận lời mời');
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await apiService.rejectFriendRequest(requestId);
      await loadRequests();
      success('Từ chối thành công', 'Đã từ chối lời mời kết bạn!');
    } catch (error: any) {
      showError('Từ chối thất bại', error.response?.data?.message || 'Không thể từ chối lời mời');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <FriendsIcon size={32} className="text-primary-600" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bạn bè</h1>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-4">
          <SearchIcon size={24} className="text-primary-600" />
          <h2 className="text-lg sm:text-xl font-semibold">Tìm kiếm người dùng</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <SearchIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Nhập tên hoặc email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm sm:text-base transition-colors"
          >
            <SearchIcon size={18} />
            <span>Tìm kiếm</span>
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((user) => (
              <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={apiService.getUserAvatar(user.id)}
                      alt={user.displayName}
                      className="w-12 h-12 rounded-full object-cover bg-primary-500"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.avatar-fallback')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'avatar-fallback w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold';
                          fallback.textContent = user.displayName.charAt(0).toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                    {user.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  {/* User Info */}
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium text-sm sm:text-base">{user.displayName}</span>
                      {user.verified && (
                        <VerifiedIcon size={18} className="ml-1 text-blue-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 break-all">{user.email}</div>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/profile/${user.id}`)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm transition-colors"
                  >
                    <ProfileIcon size={18} />
                    <span>Xem hồ sơ</span>
                  </button>
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm transition-colors"
                  >
                    <AddIcon size={18} />
                    <span>Kết bạn</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Friend Requests */}
      {requests.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Lời mời kết bạn ({requests.length})</h2>
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3">
                <div className="flex items-center space-x-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={apiService.getUserAvatar(request.sender.id)}
                      alt={request.sender.displayName}
                      className="w-12 h-12 rounded-full object-cover bg-primary-500"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.avatar-fallback')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'avatar-fallback w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-lg';
                          fallback.textContent = request.sender.displayName.charAt(0).toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center">
                      <span className="font-medium text-sm sm:text-base truncate">{request.sender.displayName}</span>
                      {request.sender.verified && (
                        <VerifiedIcon size={16} className="ml-1 flex-shrink-0 text-blue-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 truncate">{request.sender.email}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(request.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="flex items-center justify-center gap-1 flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm transition-colors"
                  >
                    <CheckIcon size={18} />
                    <span>Chấp nhận</span>
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    className="flex items-center justify-center gap-1 flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm transition-colors"
                  >
                    <CloseIcon size={18} />
                    <span>Từ chối</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Danh sách bạn bè ({friends.length})</h2>
        {friends.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend) => (
              <div key={friend.id} className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={apiService.getUserAvatar(friend.id)}
                      alt={friend.displayName}
                      className="w-12 h-12 rounded-full object-cover bg-primary-500"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.avatar-fallback')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'avatar-fallback w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-lg';
                          fallback.textContent = friend.displayName.charAt(0).toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                    {friend.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center">
                      <span className="font-medium text-sm sm:text-base truncate">{friend.displayName}</span>
                      {friend.verified && (
                        <VerifiedIcon size={16} className="ml-1 flex-shrink-0 text-blue-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 truncate">{friend.email}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${friend.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      {friend.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/profile/${friend.id}`)}
                    className="flex items-center justify-center gap-2 flex-1 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-xs sm:text-sm transition-colors"
                  >
                    <ProfileIcon size={16} />
                    <span>Xem trang cá nhân</span>
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/chat?user=${friend.id}`)}
                    className="flex items-center justify-center gap-2 flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs sm:text-sm transition-colors"
                  >
                    <ChatIcon size={16} />
                    <span>Nhắn tin</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8 text-sm">
            Chưa có bạn bè. Hãy tìm kiếm và kết bạn!
          </div>
        )}
      </div>
    </div>
  );
}
