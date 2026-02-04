'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { SnetLogo } from '@/components/icons/SnetIcon';
import { VerifiedIcon } from '@/components/icons/Icons';
import { 
  FiHome, FiUsers, FiMessageSquare, FiBell, FiSearch, 
  FiMenu, FiLogOut, FiSettings, FiUser, FiCalendar, FiEdit2,
  FiMapPin, FiLink, FiBriefcase, FiBuilding,
  FiFacebook, FiInstagram, FiTwitter, FiLinkedin, FiX,
  FiMessageCircle, FiThumbsUp, FiVideo, FiPlay, FiShare2,
  FiHeart, FiUserPlus
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import EditProfileModal from '@/components/EditProfileModal';
import VideoEmbed from '@/components/VideoEmbed';

export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes'>('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [viewingUserId, setViewingUserId] = useState<number | null>(null);

  const loadNotifications = async () => {
    try {
      const data = await apiService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    // Lấy userId từ URL query params và update khi searchParams thay đổi
    const userIdParam = searchParams.get('userId');
    
    if (userIdParam) {
      const parsedId = parseInt(userIdParam);
      console.log('📍 URL userId param:', parsedId);
      setViewingUserId(parsedId);
    } else {
      console.log('📍 No userId param, viewing own profile');
      setViewingUserId(null);
    }
    
    // Reset tab về posts khi chuyển profile
    setActiveTab('posts');
  }, [searchParams]); // Re-run khi URL query thay đổi

  useEffect(() => {
    // Chờ auth loading xong trước
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }
    
    // Chỉ load data khi viewingUserId đã được xác định (hoặc null cho own profile)
    // Thêm check để đảm bảo viewingUserId đã được set từ useEffect trước
    const userIdParam = searchParams.get('userId');
    const expectedViewingId = userIdParam ? parseInt(userIdParam) : null;
    
    // Chỉ load khi viewingUserId khớp với URL param
    if (viewingUserId !== expectedViewingId) {
      console.log('⏳ Waiting for viewingUserId to sync...', { viewingUserId, expectedViewingId });
      return;
    }
    
    console.log('✅ Loading profile data for userId:', viewingUserId || user.id);
    loadProfileData();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [user, router, authLoading, viewingUserId, searchParams]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Xác định user ID cần load
      const targetUserId = viewingUserId || user?.id;
      
      console.log('🔍 Profile Debug:', {
        viewingUserId,
        currentUserId: user?.id,
        targetUserId,
        isOwnProfile: !viewingUserId || (user?.id && viewingUserId === user.id)
      });
      
      if (!targetUserId) return;
      
      // Nếu xem profile của người khác, load từ API
      if (viewingUserId && viewingUserId !== user?.id) {
        console.log('👤 Loading other user profile:', viewingUserId);
        const userProfile = await apiService.getUserById(viewingUserId);
        setProfileUser(userProfile);
      } else {
        // Xem profile của chính mình, dùng user từ context
        console.log('👤 Viewing own profile');
        setProfileUser(null);
      }
      
      // Load posts
      const postsResponse = await apiService.getUserPosts(targetUserId, 0, 20);
      setPosts(postsResponse.content || []);
      
      // Load liked posts
      const likedResponse = await apiService.getUserLikedPosts(targetUserId, 0, 20);
      setLikedPosts(likedResponse.content || []);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // displayUser: Nếu đang xem người khác thì dùng profileUser, không thì dùng user hiện tại
  const displayUser = profileUser || user;
  
  // isOwnProfile: TRUE nếu không có viewingUserId HOẶC viewingUserId === user.id
  const isOwnProfile = !viewingUserId || (user?.id && viewingUserId === user.id);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getUserInitial = (name: string) => {
    if (!name) return 'US';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-16 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-black/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center justify-between">
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
              className="px-6 py-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <FiMessageSquare className="w-6 h-6" />
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) loadNotifications();
              }}
              className="p-2 hover:bg-white/5 rounded-full transition-colors relative"
            >
              <FiBell className="w-5 h-5 md:w-6 md:h-6" />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center font-bold text-sm md:text-base"
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
      <div className="max-w-4xl mx-auto">
        {/* Cover & Avatar */}
        <div className="relative">
          {/* Cover Photo */}
          <div 
            className="h-48 md:h-64 bg-gradient-to-r from-primary-500 to-blue-600 relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => {
              if (user?.id) {
                window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/cover?size=full&t=${Date.now()}`, '_blank');
              }
            }}
          >
            {user?.id && (
              <img 
                src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${displayUser?.id}/cover?size=medium&t=${Date.now()}`}
                alt="Cover"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
          
          <div className="px-4">
            <div className="flex justify-between items-start -mt-16 md:-mt-20 mb-4">
              {/* Avatar */}
              <div className="relative">
                <div 
                  className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full border-4 border-black flex items-center justify-center font-bold text-3xl md:text-4xl overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    if (displayUser?.id) {
                      window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${displayUser.id}/avatar?size=full&t=${Date.now()}`, '_blank');
                    }
                  }}
                >
                  {displayUser?.id && (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${displayUser.id}/avatar?size=medium&t=${Date.now()}`}
                      alt="Avatar"
                      className="w-full h-full object-cover absolute inset-0 z-20"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="relative z-10">
                    {getUserInitial(displayUser?.displayName || '')}
                  </span>
                </div>
              </div>
              {isOwnProfile && (
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="mt-16 md:mt-20 px-4 py-2 border border-gray-700 rounded-full font-semibold hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                <FiEdit2 className="w-4 h-4" />
                Chỉnh sửa
              </button>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold">{displayUser?.displayName}</h1>
                {displayUser?.verified && <VerifiedIcon className="text-blue-400" size={20} />}
              </div>
              <p className="text-gray-400">@{displayUser?.email?.split('@')[0]}</p>
            </div>

            {displayUser?.bio && (
              <p className="text-sm md:text-base mb-3 text-gray-300">
                {user.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
              {displayUser?.location && (
                <div className="flex items-center gap-1">
                  <FiMapPin className="w-4 h-4" />
                  {user.location}
                </div>
              )}
              {displayUser?.website && (
                <div className="flex items-center gap-1">
                  <FiLink className="w-4 h-4" />
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {user.website}
                  </a>
                </div>
              )}
              {displayUser?.currentJob && (
                <div className="flex items-center gap-1">
                  <FiBriefcase className="w-4 h-4" />
                  {user.currentJob}
                </div>
              )}
              {displayUser?.company && (
                <div className="flex items-center gap-1">
                  <FiBuilding className="w-4 h-4" />
                  {user.company}
                </div>
              )}
              <div className="flex items-center gap-1">
                <FiCalendar className="w-4 h-4" />
                Tham gia {formatDate(displayUser?.createdAt || new Date().toISOString())}
              </div>
            </div>

            {/* Social Links */}
            {(displayUser?.facebookUrl || displayUser?.instagramUrl || displayUser?.twitterUrl || displayUser?.linkedinUrl) && (
              <div className="flex gap-3 mb-4">
                {displayUser?.facebookUrl && (
                  <a href={user.facebookUrl} target="_blank" rel="noopener noreferrer" 
                    className="text-blue-500 hover:text-blue-400 transition-colors">
                    <FiFacebook className="w-5 h-5" />
                  </a>
                )}
                {displayUser?.instagramUrl && (
                  <a href={user.instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="text-pink-500 hover:text-pink-400 transition-colors">
                    <FiInstagram className="w-5 h-5" />
                  </a>
                )}
                {displayUser?.twitterUrl && (
                  <a href={user.twitterUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sky-500 hover:text-sky-400 transition-colors">
                    <FiTwitter className="w-5 h-5" />
                  </a>
                )}
                {displayUser?.linkedinUrl && (
                  <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-600 transition-colors">
                    <FiLinkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}

            {/* Storage Info */}
            <div className="bg-white/5 rounded-lg p-3 mb-4">
              <div className="text-sm text-gray-400 mb-2">
                Dung lượng: {(displayUser?.storageUsed / 1024 / 1024 / 1024).toFixed(2)}GB / {(displayUser?.storageQuota / 1024 / 1024 / 1024).toFixed(2)}GB
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ width: `${(displayUser?.storageUsed / displayUser?.storageQuota) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800">
          <div className="flex">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-4 font-semibold hover:bg-white/5 transition-colors relative ${
                activeTab === 'posts' ? 'text-white' : 'text-gray-400'
              }`}
            >
              Bài viết
              {activeTab === 'posts' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`flex-1 py-4 font-semibold hover:bg-white/5 transition-colors relative ${
                activeTab === 'media' ? 'text-white' : 'text-gray-400'
              }`}
            >
              Ảnh & Video
              {activeTab === 'media' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`flex-1 py-4 font-semibold hover:bg-white/5 transition-colors relative ${
                activeTab === 'likes' ? 'text-white' : 'text-gray-400'
              }`}
            >
              Thích
              {activeTab === 'likes' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-full"></div>
              )}
            </button>
          </div>
        </div>

        {/* Posts */}
        <div>
          {activeTab === 'posts' && (
            <div>
              {posts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>Chưa có bài viết nào</p>
                </div>
              ) : (
                posts.map((post) => {
                  console.log('Post data:', post); // Debug
                  return (
                  <div key={post.id} className="border-b border-gray-800 p-4">
                    {/* Post Header */}
                    <div className="flex gap-3 mb-3">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${post.userId}/avatar?size=thumbnail`}
                        alt={post.userDisplayName}
                        className="w-10 h-10 rounded-full object-cover bg-gray-700"
                        onError={(e) => {
                          e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect fill='%236366f1' width='40' height='40'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='white' text-anchor='middle' dy='.3em'%3E${post.userDisplayName?.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`;
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{post.userDisplayName}</span>
                          {post.userVerified && <VerifiedIcon className="w-4 h-4" />}
                        </div>
                        <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="mb-3 whitespace-pre-wrap">{post.content}</p>

                    {/* Post Media - Full display */}
                    {post.fileUrl && post.fileType?.startsWith('image/') && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${post.fileUrl}`}
                        alt="Post"
                        className="w-full rounded-lg mb-3 max-h-[500px] object-contain bg-gray-900 cursor-pointer"
                        onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}${post.fileUrl}`, '_blank')}
                      />
                    )}
                    {post.fileUrl && post.fileType?.startsWith('video/') && (
                      <video
                        src={`${process.env.NEXT_PUBLIC_API_URL}${post.fileUrl}`}
                        controls
                        className="w-full rounded-lg mb-3 max-h-[500px] bg-gray-900"
                      />
                    )}

                    {/* Post Actions */}
                    <div className="flex gap-6 text-gray-400 text-sm pt-3 border-t border-gray-800">
                      <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                        <FiMessageCircle className="w-5 h-5" />
                        <span>{post.commentCount || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                        <FiThumbsUp className="w-5 h-5" />
                        <span>{post.likeCount || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                        <FiShare2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'media' && (
            <div>
              {posts.filter(p => p.fileUrl || p.videoUrl).length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>Chưa có ảnh hoặc video nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4">
                  {posts.filter(p => p.fileUrl || p.videoUrl).map((post) => (
                    <div 
                      key={post.id} 
                      className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-800 aspect-square"
                      onClick={() => setSelectedMedia(post)}
                    >
                      {post.fileUrl && post.fileType?.startsWith('image/') && (
                        <img 
                          src={`${process.env.NEXT_PUBLIC_API_URL}/api/files/${post.fileId}/thumbnail`}
                          alt="Post media"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `${process.env.NEXT_PUBLIC_API_URL}${post.fileUrl}`;
                          }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform brightness-110 contrast-110"
                          style={{ filter: 'brightness(1.1) contrast(1.1)', imageOrientation: 'auto' }}
                          loading="lazy"
                        />
                      )}
                      {post.fileUrl && post.fileType?.startsWith('video/') && (
                        <video 
                          src={`${process.env.NEXT_PUBLIC_API_URL}${post.fileUrl}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      )}
                      {post.videoUrl && !post.fileUrl && (
                        <div className="w-full h-full bg-black flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-2"><FiVideo className="w-8 h-8" /></div>
                            <p className="text-xs text-gray-400">{post.videoPlatform || 'Video'}</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-2xl"><FiThumbsUp className="w-4 h-4" /> {post.likeCount}</div>
                          <div className="text-sm"><FiMessageCircle className="w-4 h-4" /> {post.commentCount}</div>
                        </div>
                      </div>
                      {post.fileType?.startsWith('video/') && (
                        <div className="absolute top-2 right-2 bg-black/70 rounded-full p-2">
                          <div className="text-white text-lg"><FiPlay className="w-5 h-5" /></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'likes' && (
            <div>
              {likedPosts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>Chưa có bài viết nào được thích</p>
                </div>
              ) : (
                likedPosts.map((post) => (
                  <div key={post.id} className="border-b border-gray-800 p-4 hover:bg-white/5 transition-colors">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {post.userName?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold">{post.userDisplayName}</span>
                          <span className="text-gray-400 text-sm">@{post.userName}</span>
                          {post.userVerified && <VerifiedIcon className="text-blue-400" size={16} />}
                        </div>
                        <p className="text-sm md:text-base mb-2">{post.content}</p>
                        
                        {/* Image */}
                        {post.fileUrl && post.fileType?.startsWith('image/') && (
                          <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL}/api/files/${post.fileId}/thumbnail`}
                            alt="Post"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `${process.env.NEXT_PUBLIC_API_URL}${post.fileUrl}`;
                            }}
                            className="w-full max-h-96 object-cover rounded-lg mb-2 cursor-pointer hover:opacity-90 brightness-110 contrast-110"
                            style={{ filter: 'brightness(1.1) contrast(1.1)', imageOrientation: 'auto' }}
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}${post.fileUrl}`, '_blank')}
                            loading="lazy"
                          />
                        )}
                        
                        {/* Video file */}
                        {post.fileUrl && post.fileType?.startsWith('video/') && (
                          <video 
                            src={`${process.env.NEXT_PUBLIC_API_URL}${post.fileUrl}`}
                            controls
                            className="w-full max-h-96 rounded-lg mb-2"
                          />
                        )}
                        
                        {/* Video embed (YouTube, etc.) */}
                        {post.videoUrl && !post.fileUrl && (
                          <div className="mb-2">
                            <VideoEmbed 
                              url={post.videoUrl} 
                              platform={post.videoPlatform}
                              className="rounded-lg"
                            />
                          </div>
                        )}
                        
                        <div className="flex gap-6 text-gray-400 text-sm">
                          <button className="hover:text-primary-500 transition-colors">
                            <FiMessageCircle className="w-4 h-4" /> {post.commentCount}
                          </button>
                          <button className="hover:text-red-500 transition-colors">
                            <FiThumbsUp className="w-4 h-4" /> {post.likeCount}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
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
            className="p-3 hover:text-primary-500 transition-colors"
          >
            <FiMessageSquare className="w-6 h-6" />
          </button>
          <button className="p-3 hover:text-primary-500 transition-colors">
            <FiBell className="w-6 h-6" />
          </button>
          <button 
            onClick={() => router.push('/dashboard/profile')}
            className="p-3 text-primary-500"
          >
            <FiUser className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            loadUserPosts();
            window.location.reload();
          }}
        />
      )}

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div 
            className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center font-bold">
                  {selectedMedia.userDisplayName?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <div className="font-bold">{selectedMedia.userDisplayName}</div>
                  <div className="text-sm text-gray-400">@{selectedMedia.userName}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedMedia(null)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {selectedMedia.fileUrl && (
                <>
                  {selectedMedia.fileType?.startsWith('image/') ? (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL}${selectedMedia.fileUrl}`}
                      alt="Post"
                      className="w-full rounded-lg mb-4"
                    />
                  ) : selectedMedia.fileType?.startsWith('video/') ? (
                    <video 
                      src={`${process.env.NEXT_PUBLIC_API_URL}${selectedMedia.fileUrl}`}
                      controls
                      className="w-full rounded-lg mb-4"
                      style={{ maxHeight: '500px' }}
                    />
                  ) : null}
                </>
              )}
              {selectedMedia.videoUrl && !selectedMedia.fileUrl && (
                <div className="mb-4">
                  <VideoEmbed 
                    url={selectedMedia.videoUrl} 
                    platform={selectedMedia.videoPlatform}
                    className="rounded-lg"
                  />
                </div>
              )}
              
              {selectedMedia.content && (
                <p className="text-sm md:text-base mb-4">{selectedMedia.content}</p>
              )}

              <div className="flex gap-6 text-gray-400 text-sm">
                <button className="hover:text-primary-500 transition-colors flex items-center gap-1">
                  <FiMessageCircle className="w-4 h-4" />
                  {selectedMedia.commentCount}
                </button>
                <button className="hover:text-red-500 transition-colors flex items-center gap-1">
                  <FiThumbsUp className="w-4 h-4" />
                  {selectedMedia.likeCount}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Panel */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNotifications(false)}></div>
          <div className="relative bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Thông báo</h2>
              <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-white/5 rounded-full">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
              {notifications.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <FiBell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Chưa có thông báo nào</p>
                </div>
              ) : (
                notifications.map((notif: any) => (
                  <div key={notif.id} className={`p-4 hover:bg-white/5 cursor-pointer border-b border-gray-700 ${!notif.isRead ? 'bg-primary-500/10' : ''}`}>
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                        {notif.type === 'POST_LIKE' && <FiHeart className="w-5 h-5 text-red-500" />}
                        {(notif.type === 'POST_COMMENT' || notif.type === 'COMMENT_REPLY') && <FiMessageCircle className="w-5 h-5 text-blue-500" />}
                        {(notif.type === 'FRIEND_REQUEST' || notif.type === 'FRIEND_ACCEPT') && <FiUserPlus className="w-5 h-5 text-green-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm"><span className="font-semibold">{notif.actorName}</span> <span className="text-gray-400">{notif.content}</span></p>
                        <p className="text-xs text-primary-400 mt-1">{new Date(notif.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                      {!notif.isRead && <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
