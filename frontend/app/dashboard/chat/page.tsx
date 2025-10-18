'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { formatDate, getTimeAgo, getOnlineStatus } from '@/lib/utils';
import { 
  FiMessageCircle, FiSend, FiPaperclip, FiArrowLeft, FiUser, 
  FiCheck, FiX, FiUpload, FiImage, FiVideo, FiFile, FiDownload,
  FiSmile, FiMoreVertical, FiPhone, FiVideoOff, FiSearch, FiMusic, FiFileText, FiLoader,
  FiUserPlus, FiUsers
} from 'react-icons/fi';
import { VerifiedIcon } from '@/components/icons/Icons';

interface Friend {
  id: number;
  email: string;
  displayName: string;
  online: boolean;
  verified: boolean;
  lastSeen?: string | null;
}

interface Message {
  id: number;
  senderId: number;
  receiverId?: number;
  content: string;
  type: string;
  status: string;
  sentAt: string;
  readAt?: string | null;
  senderName?: string;
  fileId?: number;
  fileName?: string;
}

const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '👏', '🙏', '💪', '✨', '🎈'];
const MESSAGES_PER_PAGE = 20;

export default function ChatPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error, warning, info } = useNotification();
  const { sendMessage, messages: wsMessages, activeChat, setActiveChat, onlineUsers } = useChat();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [myFiles, setMyFiles] = useState<any[]>([]);
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState(0);
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalSrc, setImageModalSrc] = useState('');
  const [imageModalTitle, setImageModalTitle] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousScrollHeight = useRef<number>(0);

  // Prevent horizontal scroll on mobile
  useEffect(() => {
    document.body.style.overflowX = 'hidden';
    
    // Handle mobile viewport height changes (keyboard)
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      document.body.style.overflowX = 'auto';
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  useEffect(() => {
    loadFriends();
  }, []);

  useEffect(() => {
    if (friends.length > 0) {
      setFriends(prevFriends => 
        prevFriends.map(friend => ({
          ...friend,
          online: onlineUsers.includes(friend.email)
        }))
      );
    }
  }, [onlineUsers]);

  useEffect(() => {
    if (activeChat) {
      setCurrentPage(0);
      setHasMoreMessages(true);
      setInitialLoad(true);
      setChatHistory([]);
      loadChatHistory(activeChat, 0);
    }
  }, [activeChat]);

  useEffect(() => {
    if (wsMessages.length > 0 && activeChat) {
      const relevantMessages = wsMessages.filter(
        wsMessage => wsMessage.senderId === activeChat || wsMessage.receiverId === activeChat
      );
      
      if (relevantMessages.length > 0) {
        setChatHistory((prev) => {
          let updated = [...prev];
          
          relevantMessages.forEach((wsMessage) => {
            const existingIndex = updated.findIndex(msg => msg.id === wsMessage.id);
            
            if (existingIndex !== -1) {
              updated[existingIndex] = wsMessage;
            } else {
              updated.push(wsMessage);
            }
          });
          
          return updated;
        });
        
        relevantMessages.forEach((wsMessage) => {
          if (user && wsMessage.receiverId === user.id && !wsMessage.readAt) {
            apiService.markAsRead(wsMessage.id).catch(err => 
              console.error('Failed to mark message as read:', err)
            );
          }
        });
      }
    }
  }, [wsMessages, activeChat, user]);

  // Scroll to bottom only on initial load or new messages
  useEffect(() => {
    if (initialLoad && chatHistory.length > 0) {
      setTimeout(() => scrollToBottom('auto'), 100);
      setInitialLoad(false);
    }
  }, [chatHistory, initialLoad]);

  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const loadFriends = async () => {
    try {
      const data = await apiService.getFriendsList();
      setFriends(data);
    } catch (err) {
      console.error('Error loading friends:', err);
    }
  };

  const loadChatHistory = async (friendId: number, page: number) => {
    try {
      setLoadingMore(page > 0);
      const data = await apiService.getChatHistory(friendId, page, MESSAGES_PER_PAGE);
      const sortedData = Array.isArray(data.content) ? [...data.content].reverse() : [];
      
      if (page === 0) {
        setChatHistory(sortedData);
      } else {
        // Save current scroll position
        if (messagesContainerRef.current) {
          previousScrollHeight.current = messagesContainerRef.current.scrollHeight;
        }
        
        setChatHistory(prev => [...sortedData, ...prev]);
      }
      
      setHasMoreMessages(!data.last);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error:', err);
      if (page === 0) {
        setChatHistory([]);
      }
      setHasMoreMessages(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Maintain scroll position after loading more messages
  useEffect(() => {
    if (!initialLoad && previousScrollHeight.current > 0 && messagesContainerRef.current) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - previousScrollHeight.current;
      messagesContainerRef.current.scrollTop = scrollDiff;
      previousScrollHeight.current = 0;
    }
  }, [chatHistory, initialLoad]);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || loadingMore || !hasMoreMessages) return;
    
    const { scrollTop } = messagesContainerRef.current;
    
    // Load more when scrolled to top (within 50px)
    if (scrollTop < 50 && activeChat) {
      loadChatHistory(activeChat, currentPage + 1);
    }
  }, [loadingMore, hasMoreMessages, activeChat, currentPage]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeChat) return;
    sendMessage(activeChat, messageInput);
    setMessageInput('');
    setShowEmojiPicker(false);
    setTimeout(() => scrollToBottom('smooth'), 100);
  };

  const loadMyFiles = async () => {
    try {
      const data = await apiService.getMyFiles();
      setMyFiles(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSendFile = async (fileId: number, fileName: string) => {
    if (!activeChat) return;
    sendMessage(activeChat, `📎 ${fileName}`, fileId);
    setShowFileSelector(false);
    setTimeout(() => scrollToBottom('smooth'), 100);
  };

  const handleUploadAndSend = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !activeChat) return;
    
    const file = e.target.files[0];
    const maxSize = 1024 * 1024 * 1024;
    
    if (file.size > maxSize) {
      warning('File quá lớn', `Kích thước tối đa: 1GB. File của bạn: ${(file.size / 1024 / 1024 / 1024).toFixed(2)}GB`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    if (file.size > 100 * 1024 * 1024) {
      const confirmUpload = confirm(
        `File này khá lớn (${(file.size / 1024 / 1024).toFixed(2)}MB). Quá trình tải lên có thể mất vài phút. Tiếp tục?`
      );
      if (!confirmUpload) {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
    }
    
    setUploadingFile(true);
    setUploadFileName(file.name);
    setUploadFileSize(file.size);
    
    try {
      const uploadedFile = await apiService.uploadFile(file, undefined, (progress) => {
        setUploadProgress(progress);
      });
      
      await handleSendFile(uploadedFile.id, uploadedFile.filename);
      success('Gửi thành công', 'File đã được gửi!');
    } catch (err) {
      console.error('Error:', err);
      error('Gửi thất bại', 'Upload file thất bại. Vui lòng thử lại.');
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
      setUploadFileName('');
      setUploadFileSize(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRecallMessage = async (messageId: number) => {
    if (!confirm('Bạn có chắc muốn thu hồi tin nhắn này?')) {
      return;
    }

    try {
      const recalledMessage = await apiService.recallMessage(messageId);
      setChatHistory(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: recalledMessage.content, type: 'TEXT', fileId: undefined, fileName: undefined }
            : msg
        )
      );
    } catch (err: any) {
      console.error('Error:', err);
      error('Thu hồi thất bại', err.response?.data?.message || 'Không thể thu hồi tin nhắn');
    }
  };

  const getFileType = (fileName: string): 'image' | 'video' | 'audio' | 'pdf' | 'other' => {
    if (!fileName) return 'other';
    const ext = fileName.toLowerCase().split('.').pop();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
    const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
    
    if (imageExts.includes(ext || '')) return 'image';
    if (videoExts.includes(ext || '')) return 'video';
    if (audioExts.includes(ext || '')) return 'audio';
    if (ext === 'pdf') return 'pdf';
    return 'other';
  };

  const addEmoji = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const selectedFriend = friends.find((f) => f.id === activeChat);
  const filteredFriends = friends.filter(f => 
    f.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 overflow-hidden w-full fixed top-16 bottom-0 left-0 right-0 z-20 lg:relative lg:top-auto lg:bottom-auto lg:h-screen lg:-m-8 lg:z-auto" style={{ 
      height: 'calc(var(--vh, 1vh) * 100 - 64px)',
      minHeight: 'calc(var(--vh, 1vh) * 100 - 64px)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      <div className="h-full flex flex-col overflow-hidden p-0 sm:p-4 lg:p-6 max-w-full">
        {/* Header - Hidden on mobile, visible on desktop */}
        <div className="mb-0 sm:mb-6 flex-shrink-0 hidden lg:block px-2 sm:px-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FiMessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trò chuyện</h1>
              <p className="text-sm text-gray-600">{friends.length} bạn bè</p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 sm:gap-6 min-h-0 overflow-hidden max-w-full">
          {/* Friends List */}
          <div className={`${activeChat ? 'hidden lg:flex' : 'flex'} flex-col lg:col-span-1 min-h-0 overflow-hidden`}>
            <div className="bg-white rounded-none sm:rounded-2xl shadow-xl overflow-hidden border-0 sm:border-2 border-gray-100 flex flex-col h-full">
              {/* Mobile Header for Friends List */}
              <div className="lg:hidden p-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <FiMessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Trò chuyện</h2>
                  <p className="text-xs text-white/80">{friends.length} bạn bè</p>
                </div>
              </div>

              {/* Search */}
              <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0 space-y-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm bạn bè..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                
                {/* Friends Management Buttons - Only on mobile */}
                <div className="grid grid-cols-2 gap-2 lg:hidden">
                  <button
                    onClick={() => router.push('/dashboard/friends')}
                    className="px-3 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm"
                  >
                    <FiUserPlus className="w-4 h-4" />
                    <span>Thêm bạn</span>
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/friends')}
                    className="px-3 py-2.5 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary-500 text-gray-700 hover:text-primary-600 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md text-sm"
                  >
                    <FiUsers className="w-4 h-4" />
                    <span>Quản lý</span>
                  </button>
                </div>
              </div>

              {/* Friends */}
              <div className="divide-y divide-gray-100 overflow-y-auto flex-1 min-h-0">
                {filteredFriends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => setActiveChat(friend.id)}
                    className={`w-full p-4 text-left hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 transition-all ${
                      activeChat === friend.id ? 'bg-gradient-to-r from-primary-100 to-purple-100 border-l-4 border-primary-600' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={apiService.getUserAvatar(friend.id, 'thumbnail')}
                          alt={friend.displayName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.avatar-fallback')) {
                              const fallback = document.createElement('div');
                              fallback.className = 'avatar-fallback w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg border-2 border-gray-200';
                              fallback.textContent = friend.displayName.charAt(0).toUpperCase();
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                        {onlineUsers.includes(friend.email) && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                        {friend.verified && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                            <FiCheck className="w-3 h-3 text-white stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-gray-900 truncate">{friend.displayName}</span>
                        </div>
                        <div className="text-sm text-gray-500 truncate flex items-center gap-1">
                          <span className={`inline-block w-2 h-2 rounded-full ${onlineUsers.includes(friend.email) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                          {getOnlineStatus(onlineUsers.includes(friend.email), friend.lastSeen)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                {filteredFriends.length === 0 && searchQuery && (
                  <div className="p-8 text-center text-gray-500">
                    <FiSearch className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Không tìm thấy "{searchQuery}"</p>
                  </div>
                )}
                {friends.length === 0 && !searchQuery && (
                  <div className="p-6 sm:p-8 text-center text-gray-500">
                    <FiUsers className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-base font-semibold text-gray-700 mb-2">Chưa có bạn bè</p>
                    <p className="text-sm text-gray-500 mb-4">Thêm bạn bè để bắt đầu trò chuyện</p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center lg:hidden">
                      <button
                        onClick={() => router.push('/dashboard/friends')}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                      >
                        <FiUserPlus className="w-4 h-4" />
                        <span>Thêm bạn bè</span>
                      </button>
                      <button
                        onClick={() => router.push('/dashboard/friends')}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary-500 text-gray-700 hover:text-primary-600 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
                      >
                        <FiUsers className="w-4 h-4" />
                        <span>Quản lý bạn bè</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${!activeChat ? 'hidden lg:flex' : 'flex'} lg:col-span-2 flex-col min-h-0 overflow-hidden max-w-full`}>
            <div className="bg-white rounded-none sm:rounded-2xl shadow-xl overflow-hidden border-0 sm:border-2 border-gray-100 flex flex-col h-full">
              {activeChat && selectedFriend ? (
                <div className="flex flex-col h-full overflow-hidden">
                  {/* Chat Header */}
                  <div className="px-3 py-2.5 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-purple-600">
                    <div className="flex items-center gap-2">
                      {/* Back button - Mobile only */}
                      <button
                        onClick={() => setActiveChat(null)}
                        className="lg:hidden flex-shrink-0 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                        title="Quay lại danh sách"
                      >
                        <FiArrowLeft className="w-5 h-5 text-white" />
                      </button>

                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={apiService.getUserAvatar(selectedFriend.id, 'thumbnail')}
                          alt={selectedFriend.displayName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.avatar-fallback')) {
                              const fallback = document.createElement('div');
                              fallback.className = 'avatar-fallback w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-md';
                              fallback.textContent = selectedFriend.displayName.charAt(0).toUpperCase();
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-white font-bold text-base truncate drop-shadow-sm">
                            {selectedFriend.displayName}
                          </h3>
                          {selectedFriend.verified && (
                            <VerifiedIcon className="flex-shrink-0" size={18} />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${onlineUsers.includes(selectedFriend.email) ? 'bg-green-400 animate-pulse shadow-sm' : 'bg-gray-300'}`}></span>
                          <span className="text-white/95 text-xs truncate drop-shadow-sm">
                            {getOnlineStatus(onlineUsers.includes(selectedFriend.email), selectedFriend.lastSeen)}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => setActiveChat(null)}
                          className="lg:hidden p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all shadow-sm"
                          title="Đổi bạn bè"
                        >
                          <FiUsers className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/profile/${selectedFriend.id}`)}
                          className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all shadow-sm"
                          title="Xem hồ sơ"
                        >
                          <FiUser className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div 
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gradient-to-br from-gray-50 to-white min-h-0 overscroll-contain max-w-full"
                  >
                    {/* Load more indicator */}
                    {loadingMore && (
                      <div className="flex justify-center py-3">
                        <div className="flex items-center gap-2 text-primary-600">
                          <FiLoader className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Đang tải...</span>
                        </div>
                      </div>
                    )}
                    
                    {/* No more messages indicator */}
                    {!hasMoreMessages && chatHistory.length > 0 && (
                      <div className="flex justify-center py-2">
                        <span className="text-xs text-gray-400">Đã hiển thị tất cả tin nhắn</span>
                      </div>
                    )}

                    {chatHistory.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                          <FiMessageCircle className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                          <p>Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!</p>
                        </div>
                      </div>
                    ) : (
                      chatHistory.map((message) => {
                        const isMe = message.senderId === user?.id;
                        const isFileMessage = message.type === 'FILE' && message.fileId;
                        const isRecalled = message.content === 'Tin nhắn đã được thu hồi';
                        const fileType = isFileMessage ? getFileType(message.fileName || '') : 'other';
                        
                        return (
                          <div 
                            key={message.id} 
                            className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} group animate-fade-in`}
                            onMouseEnter={() => setHoveredMessageId(message.id)}
                            onMouseLeave={() => setHoveredMessageId(null)}
                          >
                            {/* Avatar */}
                            {!isMe && (
                              <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0">
                                <img
                                  src={apiService.getUserAvatar(selectedFriend.id, 'thumbnail')}
                                  alt={selectedFriend.displayName}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent && !parent.querySelector('.avatar-fallback')) {
                                      const fallback = document.createElement('div');
                                      fallback.className = 'avatar-fallback w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm border border-gray-200';
                                      fallback.textContent = selectedFriend.displayName.charAt(0).toUpperCase();
                                      parent.appendChild(fallback);
                                    }
                                  }}
                                />
                                {selectedFriend.verified && (
                                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                                    <FiCheck className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white stroke-[3]" />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Message Bubble */}
                            <div className={`max-w-[85%] sm:max-w-[75%] relative`}>
                              {/* Recall button - Desktop */}
                              {isMe && !isRecalled && hoveredMessageId === message.id && (
                                <button
                                  onClick={() => handleRecallMessage(message.id)}
                                  className="hidden sm:flex absolute -left-9 top-1 p-1.5 bg-red-50 hover:bg-red-100 rounded-full shadow-sm border border-red-200 z-10"
                                  title="Thu hồi tin nhắn"
                                >
                                  <FiX className="w-4 h-4 text-red-600" />
                                </button>
                              )}
                              
                              {/* Recall button - Mobile (long press) */}
                              {isMe && !isRecalled && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRecallMessage(message.id);
                                  }}
                                  className="sm:hidden absolute -top-2 -right-2 p-1 bg-red-50 hover:bg-red-100 rounded-full shadow-sm border border-red-200 z-10"
                                  title="Thu hồi"
                                >
                                  <FiX className="w-3 h-3 text-red-600" />
                                </button>
                              )}

                              <div
                                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-2xl shadow-md ${
                                  isRecalled
                                    ? 'bg-gray-100 text-gray-500 italic border border-gray-300'
                                    : isMe
                                    ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white'
                                    : 'bg-white text-gray-900 border border-gray-200'
                                }`}
                              >
                                {isRecalled ? (
                                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                                    <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>{message.content}</span>
                                  </div>
                                ) : isFileMessage ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <FiFile className="w-4 h-4 sm:w-5 sm:h-5" />
                                      <span className="text-xs sm:text-sm font-medium truncate">{message.fileName || 'File'}</span>
                                    </div>

                                    {fileType === 'image' && (
                                      <img 
                                        src={apiService.previewFile(message.fileId!, 'preview')}
                                        alt={message.fileName}
                                        className="rounded-lg max-w-full w-full h-auto max-h-48 sm:max-h-64 object-contain cursor-pointer hover:scale-105 transition-transform"
                                        loading="lazy"
                                        onClick={() => {
                                          setImageModalSrc(apiService.previewFile(message.fileId!, 'full'));
                                          setImageModalTitle(message.fileName || 'Image');
                                          setImageModalOpen(true);
                                        }}
                                      />
                                    )}

                                    {fileType === 'video' && (
                                      <video 
                                        controls
                                        className="rounded-lg max-w-full w-full h-auto max-h-48 sm:max-h-64"
                                      >
                                        <source src={apiService.previewFile(message.fileId!)} />
                                      </video>
                                    )}

                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => window.open(apiService.downloadFile(message.fileId!), '_blank')}
                                        className={`text-xs px-2 sm:px-3 py-1 rounded-lg flex items-center gap-1 ${
                                          isMe ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                      >
                                        <FiDownload className="w-3 h-3" />
                                        <span className="hidden sm:inline">Tải</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-xs sm:text-sm break-words whitespace-pre-wrap">{message.content}</div>
                                )}
                                <div className="flex items-center justify-between gap-2 mt-1">
                                  <div className={`text-[10px] sm:text-xs ${isMe ? 'text-white/70' : 'text-gray-500'}`}>
                                    {formatDate(message.sentAt)}
                                  </div>
                                  {isMe && (
                                    <div className={`text-[10px] sm:text-xs ${isMe ? 'text-white/70' : 'text-gray-500'}`}>
                                      {message.readAt ? '✓✓' : '✓'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {isMe && user && (
                              <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0">
                                <img
                                  src={apiService.getUserAvatar(user.id, 'thumbnail')}
                                  alt={user.displayName}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent && !parent.querySelector('.avatar-fallback')) {
                                      const fallback = document.createElement('div');
                                      fallback.className = 'avatar-fallback w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm border border-gray-200';
                                      fallback.textContent = user.displayName?.charAt(0).toUpperCase() || 'M';
                                      parent.appendChild(fallback);
                                    }
                                  }}
                                />
                                {user.verified && (
                                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                                    <FiCheck className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white stroke-[3]" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Upload Progress */}
                  {uploadingFile && (
                    <div className="px-3 py-2 sm:px-4 sm:py-3 bg-primary-50 border-t border-primary-200">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-primary-700 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                          <FiUpload className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="font-medium truncate">{uploadFileName}</span>
                        </div>
                        <span className="font-bold flex-shrink-0">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-primary-200 rounded-full h-1.5 sm:h-2">
                        <div 
                          className="bg-gradient-to-r from-primary-600 to-purple-600 h-1.5 sm:h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* File Selector Modal */}
                  {showFileSelector && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b bg-gradient-to-r from-primary-600 to-purple-600 text-white flex-shrink-0">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base sm:text-lg font-bold">Chọn file để gửi</h3>
                            <button
                              onClick={() => setShowFileSelector(false)}
                              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>
                          
                          {/* Search Bar */}
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Tìm kiếm file..."
                              value={fileSearchQuery}
                              onChange={(e) => setFileSearchQuery(e.target.value)}
                              className="w-full pl-10 pr-20 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all text-sm"
                            />
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-white/70">
                              {myFiles.filter(file => 
                                (file.fileName || file.filename)?.toLowerCase().includes(fileSearchQuery.toLowerCase())
                              ).length} / {myFiles.length}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50"
                             style={{ 
                               WebkitOverflowScrolling: 'touch',
                               overscrollBehavior: 'contain'
                             }}>
                          {myFiles.length > 0 ? (
                            <div className="space-y-2 sm:space-y-3">
                              {myFiles
                                .filter(file => 
                                  (file.fileName || file.filename)?.toLowerCase().includes(fileSearchQuery.toLowerCase())
                                )
                                .map((file) => (
                                <button
                                  key={file.id}
                                  onClick={() => handleSendFile(file.id, file.fileName || file.filename)}
                                  className="w-full flex items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group text-left active:scale-[0.98]"
                                >
                                  <div className="relative w-10 h-10 sm:w-16 sm:h-16 flex-shrink-0">
                                    {file.fileType?.startsWith('image/') ? (
                                      <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api'}/files/${file.id}/thumbnail`}
                                        alt={file.fileName || file.filename}
                                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                                        onError={(e) => {
                                          const target = e.currentTarget as HTMLImageElement;
                                          target.style.display = 'none';
                                          const parent = target.parentElement;
                                          if (parent && !parent.querySelector('.file-icon-fallback')) {
                                            const fallback = document.createElement('div');
                                            fallback.className = 'file-icon-fallback w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center';
                                            fallback.innerHTML = '<svg class="w-5 h-5 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg>';
                                            parent.appendChild(fallback);
                                          }
                                        }}
                                      />
                                    ) : file.fileType?.startsWith('video/') ? (
                                      <div className="w-full h-full bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                                        <FiVideo className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                                      </div>
                                    ) : file.fileType?.includes('pdf') ? (
                                      <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                                        <FiFileText className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                                      </div>
                                    ) : file.fileType?.startsWith('audio/') ? (
                                      <div className="w-full h-full bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                                        <FiMusic className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                                      </div>
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                                        <FiFile className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-900 truncate text-xs sm:text-base mb-0.5 sm:mb-1" title={file.fileName || file.filename}>
                                      {file.fileName || file.filename}
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-3 text-[10px] sm:text-sm text-gray-500">
                                      <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                      <span>•</span>
                                      <span className="capitalize truncate">{file.category?.toLowerCase() || 'File'}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex-shrink-0">
                                    <div className="w-7 h-7 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                      <FiSend className="w-3 h-3 sm:w-5 sm:h-5 text-primary-600 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : myFiles.length > 0 ? (
                            <div className="text-center text-gray-500 py-8 sm:py-12">
                              <FiSearch className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 text-gray-300" />
                              <p className="text-sm sm:text-base">Không tìm thấy file "{fileSearchQuery}"</p>
                              <button
                                onClick={() => setFileSearchQuery('')}
                                className="mt-2 text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium"
                              >
                                Xóa bộ lọc
                              </button>
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 py-8 sm:py-12">
                              <FiFile className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 text-gray-300" />
                              <p className="text-sm sm:text-base">Chưa có file nào</p>
                              <button
                                onClick={() => {
                                  setShowFileSelector(false);
                                }}
                                className="mt-2 text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium"
                              >
                                Tải file lên →
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Input */}
                  <div className="p-2 sm:p-4 border-t border-gray-200 bg-white flex-shrink-0 max-w-full overflow-hidden">
                    {showEmojiPicker && (
                      <div className="mb-2 sm:mb-3 p-2 bg-gray-50 rounded-xl flex flex-wrap gap-1 sm:gap-2 max-w-full overflow-x-auto">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addEmoji(emoji)}
                            className="text-xl sm:text-2xl hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1 sm:gap-2 max-w-full overflow-hidden">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleUploadAndSend}
                        className="hidden"
                      />
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                      >
                        <FiSmile className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={() => {
                          loadMyFiles();
                          setShowFileSelector(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                      >
                        <FiPaperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                      >
                        <FiUpload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      </button>
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => {
                          setTimeout(() => scrollToBottom('smooth'), 300);
                        }}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all min-w-0 text-sm"
                      />
                      <button
                        onClick={handleSendMessage}
                        className={`p-2 rounded-full transition-all flex-shrink-0 ${
                          messageInput.trim() 
                            ? 'bg-gradient-to-r from-primary-600 to-purple-600 hover:shadow-lg text-white' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!messageInput.trim()}
                      >
                        <FiSend className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 p-4">
                  <div className="text-center">
                    <FiMessageCircle className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                    <p className="text-base sm:text-lg font-medium">Chọn bạn bè để bắt đầu trò chuyện</p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2">Tin nhắn của bạn sẽ hiển thị ở đây</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {imageModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute top-2 right-2 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* Image Title */}
            <div className="bg-black/50 text-white px-4 py-2 rounded-t-lg mb-2">
              <h3 className="text-lg font-semibold truncate">{imageModalTitle}</h3>
            </div>

            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <img 
                src={imageModalSrc}
                alt={imageModalTitle}
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Download Button */}
            <div className="bg-black/50 px-4 py-3 rounded-b-lg mt-2 flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(imageModalSrc, '_blank');
                }}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <FiDownload className="w-5 h-5" />
                <span>Tải xuống</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
