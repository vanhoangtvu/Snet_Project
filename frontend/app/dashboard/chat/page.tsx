'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { SnetLogo } from '@/components/icons/SnetIcon';
import { 
  FiHome, FiUsers, FiMessageSquare, FiBell, FiSearch, 
  FiUser, FiLogOut, FiSettings, FiSend, FiPaperclip, 
  FiMoreVertical, FiArrowLeft, FiPhone, FiVideo
} from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';
import { apiService } from '@/lib/api';
import { webSocketService } from '@/lib/websocket';

export default function ChatPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const avatarTimestamp = useRef(Math.floor(Date.now() / 60000) * 60000);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    
    loadFriends();

    // Refresh friends status mỗi 30 giây
    const interval = setInterval(() => {
      loadFriends();
    }, 30000);

    // Connect WebSocket
    webSocketService.connect(
      (message) => {
        // Nhận tin nhắn mới hoặc cập nhật trạng thái
        console.log('New message received:', message);
        if (selectedFriend && (message.senderId === selectedFriend.id || message.receiverId === selectedFriend.id)) {
          // Cập nhật tin nhắn nếu đã tồn tại (trạng thái đã xem)
          setMessages(prev => {
            const index = prev.findIndex(m => m.id === message.id);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = { ...updated[index], ...message };
              console.log('Updated message:', updated[index]);
              return updated;
            }
            return [...prev, message];
          });
          // Mark as read nếu là tin nhắn của bạn bè
          if (message.receiverId === user?.id && !message.readAt) {
            apiService.markAsRead(message.id).catch(err => console.error('Failed to mark as read:', err));
          }
        }
      },
      () => {
        console.log('WebSocket connected successfully');
        // Subscribe to user status updates sau khi connect
        setTimeout(() => {
          if (webSocketService.client) {
            webSocketService.client.subscribe('/topic/user-status', (msg) => {
              const status = JSON.parse(msg.body);
              if (selectedFriend && status.userId === selectedFriend.id) {
                setSelectedFriend(prev => ({
                  ...prev,
                  online: status.online,
                  lastSeen: status.lastSeen
                }));
                setFriends(prev => prev.map(f => 
                  f.id === status.userId 
                    ? { ...f, online: status.online, lastSeen: status.lastSeen }
                    : f
                ));
              }
            });
          }
        }, 100);
      }
    );

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      webSocketService.disconnect();
      clearInterval(interval);
    };
  }, [user, router, authLoading, selectedFriend]);

  useEffect(() => {
    if (selectedFriend) {
      loadMessages();
      setShowMobileSidebar(false);
    }
  }, [selectedFriend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFriendsList();
      // Fetch status cho mỗi bạn bè
      const friendsWithStatus = await Promise.all(
        response.map(async (friend: any) => {
          try {
            const status = await apiService.api.get(`/users/${friend.id}/status`);
            return { ...friend, ...status.data };
          } catch (err) {
            return friend;
          }
        })
      );
      setFriends(friendsWithStatus);
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedFriend) return;
    try {
      const response = await apiService.getChatHistory(selectedFriend.id, 0, 50);
      // Đảo ngược để tin nhắn cũ ở trên, tin nhắn mới ở dưới
      setMessages((response.content || []).reverse());
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedFriend) return;
    
    try {
      // Gửi qua REST API để lưu vào database
      const response = await apiService.sendMessage({
        receiverId: selectedFriend.id,
        content: messageText,
        type: 'TEXT'
      });
      
      // Thêm tin nhắn mới vào cuối array (ở dưới)
      setMessages([...messages, response]);
      
      // Gửi qua WebSocket để thông báo real-time
      webSocketService.sendMessage(selectedFriend.id, messageText, 'TEXT');
      
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getUserInitial = (name: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleBackToList = () => {
    setSelectedFriend(null);
    setShowMobileSidebar(true);
  };

  const handleAvatarError = (e: any, displayName?: string) => {
    e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect fill='%236366f1' width='40' height='40'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='white' text-anchor='middle' dy='.3em' font-family='Arial'%3E${displayName?.charAt(0).toUpperCase() || '?'}%3C/text%3E%3C/svg%3E`;
  };

  if (authLoading || (loading && friends.length === 0)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-black/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SnetLogo size="md" className="text-primary-500" />
            <h1 className="text-lg md:text-xl font-bold hidden sm:block">Tin nhắn</h1>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <FiHome className="w-6 h-6" />
            </button>
            <button 
              onClick={() => router.push('/dashboard/friends')}
              className="px-6 py-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <FiUsers className="w-6 h-6" />
            </button>
            <button 
              onClick={() => router.push('/dashboard/chat')}
              className="px-6 py-2 bg-white/10 rounded-lg transition-colors"
            >
              <FiMessageSquare className="w-6 h-6 text-primary-500" />
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <FiBell className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base overflow-hidden"
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}/avatar?size=medium&t=${avatarTimestamp.current}`}
                  alt={user?.displayName}
                  className="w-full h-full object-cover bg-gray-700"
                  onError={(e) => {
                    e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect fill='%236366f1' width='40' height='40'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='white' text-anchor='middle' dy='.3em' font-family='Arial'%3E${user?.displayName?.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`;
                  }}
                />
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
      <div className="flex h-[calc(100vh-3.5rem-4rem)] md:h-[calc(100vh-4rem)]">
        {/* Sidebar - Friends List */}
        <div className={`${showMobileSidebar ? 'block' : 'hidden'} md:block w-full md:w-80 lg:w-96 border-r border-gray-800 flex flex-col bg-black overflow-hidden`}>
          <div className="p-3 md:p-4 border-b border-gray-800">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full bg-white/5 border border-gray-700 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {friends.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <FiMessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Chưa có bạn bè nào</p>
              </div>
            ) : (
              friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => setSelectedFriend(friend)}
                  className={`w-full p-3 md:p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-gray-800/50 ${
                    selectedFriend?.id === friend.id ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="relative">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${friend.id}/avatar?size=medium&t=${avatarTimestamp.current}`}
                      alt={friend.displayName}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full flex-shrink-0 object-cover bg-gray-700"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 56'%3E%3Crect fill='%236366f1' width='56' height='56'/%3E%3Ctext x='50%25' y='50%25' font-size='28' fill='white' text-anchor='middle' dy='.3em' font-family='Arial'%3E${friend.displayName?.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-black"></div>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-semibold truncate text-sm md:text-base">{friend.displayName}</h3>
                    <p className="text-xs md:text-sm text-gray-400 truncate flex items-center gap-1">
                      {friend.online && <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>}
                      {friend.online ? 'Đang hoạt động' : `Hoạt động ${friend.lastSeen ? new Date(friend.lastSeen).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'}) : 'lâu'}`}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${!showMobileSidebar ? 'block' : 'hidden'} md:block flex-1 flex flex-col bg-black overflow-hidden`}>
          {selectedFriend ? (
            <>
              {/* Chat Header */}
              <div className="p-3 md:p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleBackToList}
                    className="md:hidden p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <FiArrowLeft className="w-5 h-5" />
                  </button>
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${selectedFriend?.id}/avatar?size=medium&t=${avatarTimestamp.current}`}
                    alt={selectedFriend?.displayName}
                    className="w-10 h-10 rounded-full object-cover bg-gray-700"
                    onError={(e) => {
                      e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect fill='%236366f1' width='40' height='40'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='white' text-anchor='middle' dy='.3em' font-family='Arial'%3E${selectedFriend?.displayName?.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`;
                    }}
                  />
                  <div>
                    <h2 className="font-bold text-sm md:text-base">{selectedFriend.displayName}</h2>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      {selectedFriend.online && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
                      {selectedFriend.online ? 'Đang hoạt động' : `Hoạt động ${selectedFriend.lastSeen ? new Date(selectedFriend.lastSeen).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'}) : 'lâu'}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <FiPhone className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <FiVideo className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <FiMoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 flex flex-col">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <FiMessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Chưa có tin nhắn nào</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => {
                      const isOwn = message.senderId === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isOwn && (
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${selectedFriend?.id}/avatar?size=medium&t=${avatarTimestamp.current}`}
                              alt="avatar"
                              className="w-8 h-8 rounded-full flex-shrink-0 object-cover bg-gray-700"
                              onError={(e) => {
                                e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect fill='%236366f1' width='32' height='32'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='white' text-anchor='middle' dy='.3em' font-family='Arial'%3E${selectedFriend?.displayName?.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`;
                              }}
                            />
                          )}
                          <div
                            className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-3 md:px-4 py-2 ${
                              isOwn
                                ? 'bg-primary-500 text-white'
                                : 'bg-white/10 text-white'
                            }`}
                          >
                            <p className="break-words text-sm md:text-base">{message.content}</p>
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <p className="text-xs opacity-70">
                                {new Date(message.sentAt).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {isOwn && (
                                <span className="text-xs opacity-70">
                                  {message.readAt ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="p-3 md:p-4 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-full transition-colors flex-shrink-0">
                    <FiPaperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Aa"
                    className="flex-1 bg-white/5 border border-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageText.trim()}
                    className="p-2 bg-primary-500 hover:bg-primary-600 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FiMessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Chọn một cuộc trò chuyện</p>
                <p className="text-sm mt-2">để bắt đầu nhắn tin</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
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
            className="p-3 hover:text-primary-500 transition-colors"
          >
            <FiUsers className="w-6 h-6" />
          </button>
          <button 
            onClick={() => router.push('/dashboard/chat')}
            className="p-3 text-primary-500"
          >
            <FiMessageSquare className="w-6 h-6" />
          </button>
          <button className="p-3 hover:text-primary-500 transition-colors">
            <FiBell className="w-6 h-6" />
          </button>
          <button 
            onClick={() => router.push('/dashboard/profile')}
            className="p-3 hover:text-primary-500 transition-colors"
          >
            <FiUser className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </div>
  );
}
