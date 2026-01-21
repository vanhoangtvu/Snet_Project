'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { SnetLogo } from '@/components/icons/SnetIcon';
import { VerifiedIcon } from '@/components/icons/Icons';
import { 
  FiHome, FiUsers, FiMessageSquare, FiBell, FiSearch, 
  FiMenu, FiLogOut, FiSettings, FiUser, FiImage, FiVideo,
  FiSmile, FiMoreHorizontal, FiThumbsUp, FiMessageCircle, FiShare2,
  FiEdit2, FiTrash2, FiEyeOff, FiBookmark, FiFlag, FiX, FiCheck,
  FiGlobe, FiLock, FiUserCheck, FiHeart, FiUserPlus
} from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';
import { apiService } from '@/lib/api';
import MentionInput from '@/components/MentionInput';

interface Post {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  userName: string;
  userDisplayName: string;
  userAvatarUrl: string;
  userVerified: boolean;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
  fileId?: number;
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
  videoUrl?: string;
  videoPlatform?: string;
}

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const isLoadingRef = useRef(false); // Prevent duplicate requests
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postPrivacy, setPostPrivacy] = useState('PUBLIC');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [friends, setFriends] = useState<any[]>([]);
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [showLikes, setShowLikes] = useState<{ [key: number]: boolean }>({});
  const [likes, setLikes] = useState<{ [key: number]: any[] }>({});
  const [commentContent, setCommentContent] = useState<{ [key: number]: string }>({});
  const [comments, setComments] = useState<{ [key: number]: any[] }>({});
  const [showPostMenu, setShowPostMenu] = useState<{ [key: number]: boolean }>({});
  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [editPrivacy, setEditPrivacy] = useState<string>('PUBLIC');
  const [replyingTo, setReplyingTo] = useState<{ [key: number]: number | null }>({});
  const [replyContent, setReplyContent] = useState<{ [key: number]: string }>({});
  const [likedComments, setLikedComments] = useState<Set<number>>(() => {
    // Load from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('likedComments');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [posting, setPosting] = useState(false);
  const avatarTimestamp = useRef(Math.floor(Date.now() / 60000) * 60000); // Cache for 1 minute

  useEffect(() => {
    // Chờ auth loading xong
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    loadPosts();
    loadFriends();
  }, [authLoading, user, router]); // Run when auth is ready

  const loadFriends = async () => {
    try {
      const data = await apiService.getFriendsList();
      setFriendsList(data);
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await apiService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    // Simple scroll listener for lazy loading (like Facebook)
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;

      // Load more when user scrolls to 80% of page
      if (scrollTop + windowHeight > docHeight * 0.8) {
        console.log('Triggering load more...', { page, hasMore, loadingMore });
        loadPosts(false, true, page, posts);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, page, posts]);

  useEffect(() => {
    // Click outside to close menus
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.post-menu-container')) {
        setShowPostMenu({});
      }
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    // Auto play/pause videos when scrolling
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            // Video vào viewport - phát có âm thanh
            video.muted = false;
            video.volume = 1.0;
            video.play();
          } else {
            // Video ra khỏi viewport - dừng
            video.pause();
          }
        });
      },
      { threshold: 0.5 } // Phát khi 50% video hiển thị
    );

    // Observe tất cả video tags
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => observer.observe(video));

    return () => observer.disconnect();
  }, [posts]); // Re-run khi posts thay đổi

  const loadPosts = async (preserveScroll = false, isLoadMore = false, currentPage?: number, existingPosts?: Post[]) => {
    try {
      const scrollPosition = preserveScroll ? window.scrollY : 0;
      if (!isLoadMore) setLoading(true);
      else setLoadingMore(true);

      const pageNum = isLoadMore ? (currentPage ?? page) + 1 : 0;
      const response = await apiService.getPosts(pageNum, 5); // Load 5 posts at a time
      const newPosts = response.content || [];

      if (isLoadMore) {
        setPosts([...(existingPosts ?? posts), ...newPosts]);
        setPage(pageNum);
      } else {
        setPosts(newPosts);
        setPage(0);
      }

      setHasMore(newPosts.length === 5); // If got 5 posts, there might be more

      if (preserveScroll) {
        setTimeout(() => window.scrollTo(0, scrollPosition), 0);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && !selectedFile) return;
    
    setPosting(true);
    try {
      const formData = new FormData();
      formData.append('content', postContent);
      formData.append('privacy', postPrivacy);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      await apiService.createPost(formData);
      setPostContent('');
      setPostPrivacy('PUBLIC');
      setSelectedFile(null);
      setPreviewUrl(null);
      // Add new post to top without reloading
      const response = await apiService.getPosts(0, 1);
      const newPost = response.content?.[0];
      if (newPost) {
        setPosts([newPost, ...posts]);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Đăng bài thất bại. Vui lòng thử lại!');
    } finally {
      setPosting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleLikePost = async (postId: number) => {
    try {
      // Optimistic update - update UI immediately
      const updatedPosts = posts.map(p => 
        p.id === postId 
          ? {
              ...p,
              likedByCurrentUser: !p.likedByCurrentUser,
              likeCount: p.likedByCurrentUser ? p.likeCount - 1 : p.likeCount + 1
            }
          : p
      );
      setPosts(updatedPosts);

      // Call API in background
      await apiService.toggleLike(postId);
    } catch (error) {
      console.error('Failed to like post:', error);
      // Reload on error to sync state
      loadPosts(true);
    }
  };

  const toggleComments = async (postId: number) => {
    const isShowing = showComments[postId];
    setShowComments({ ...showComments, [postId]: !isShowing });
    
    if (!isShowing && !comments[postId]) {
      // Load comments if not loaded yet
      try {
        const response = await apiService.getPostComments(postId, 0, 20);
        const commentsList = response.content || [];
        setComments({ ...comments, [postId]: commentsList });
        
        // Initialize liked state from backend
        const newLikedComments = new Set(likedComments);
        commentsList.forEach((comment: any) => {
          if (comment.likedByCurrentUser) {
            newLikedComments.add(comment.id);
          }
        });
        setLikedComments(newLikedComments);
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
    }
  };

  const toggleLikes = async (postId: number) => {
    const isShowing = showLikes[postId];
    setShowLikes({ ...showLikes, [postId]: !isShowing });
    
    if (!isShowing && !likes[postId]) {
      try {
        const response = await apiService.getPostLikes(postId, 0, 50);
        setLikes({ ...likes, [postId]: response.content || [] });
      } catch (error) {
        console.error('Failed to load likes:', error);
      }
    }
  };

  const handleAddComment = async (postId: number) => {
    const content = commentContent[postId]?.trim();
    if (!content) return;

    try {
      await apiService.addComment(postId, content);
      setCommentContent({ ...commentContent, [postId]: '' });
      
      // Reload comments
      const response = await apiService.getPostComments(postId, 0, 20);
      const commentsList = response.content || [];
      setComments({ ...comments, [postId]: commentsList });
      
      // Update liked state from backend
      const newLikedComments = new Set(likedComments);
      commentsList.forEach((comment: any) => {
        if (comment.likedByCurrentUser) {
          newLikedComments.add(comment.id);
        }
      });
      setLikedComments(newLikedComments);
      
      // Update comment count in posts state without reloading
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p
      ));
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post.id);
    setEditContent(post.content);
    setEditPrivacy(post.privacy || 'PUBLIC');
    setShowPostMenu({});
  };

  const handleSaveEdit = async (postId: number) => {
    if (!editContent.trim()) return;

    try {
      await apiService.updatePost(postId, { content: editContent, privacy: editPrivacy });
      // Update post locally
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, content: editContent, privacy: editPrivacy } : p
      ));
      setEditingPost(null);
      setEditContent('');
      setEditPrivacy('PUBLIC');
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditContent('');
    setEditPrivacy('PUBLIC');
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;

    try {
      await apiService.deletePost(postId);
      // Remove post locally
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const togglePostMenu = (postId: number) => {
    setShowPostMenu({ [postId]: !showPostMenu[postId] });
  };

  const isMyPost = (post: Post) => {
    return post.userId === user?.id;
  };

  const handleReplyComment = (postId: number, commentId: number) => {
    // Toggle: nếu đang reply comment này thì đóng, nếu không thì mở
    if (replyingTo[postId] === commentId) {
      setReplyingTo({ ...replyingTo, [postId]: null });
      setReplyContent({ ...replyContent, [postId]: '' });
    } else {
      setReplyingTo({ ...replyingTo, [postId]: commentId });
      setReplyContent({ ...replyContent, [postId]: '' }); // Clear content khi chuyển sang comment khác
    }
  };

  const handleCancelReply = (postId: number) => {
    setReplyingTo({ ...replyingTo, [postId]: null });
    setReplyContent({ ...replyContent, [postId]: '' });
  };

  const handleSendReply = async (postId: number, parentCommentId: number) => {
    const content = replyContent[postId]?.trim();
    if (!content) return;

    try {
      await apiService.addComment(postId, content, parentCommentId);
      setReplyContent({ ...replyContent, [postId]: '' });
      setReplyingTo({ ...replyingTo, [postId]: null });
      
      // Reload comments
      const response = await apiService.getPostComments(postId, 0, 20);
      const commentsList = response.content || [];
      setComments({ ...comments, [postId]: commentsList });
      
      // Update liked state from backend
      const newLikedComments = new Set(likedComments);
      commentsList.forEach((comment: any) => {
        if (comment.likedByCurrentUser) {
          newLikedComments.add(comment.id);
        }
      });
      setLikedComments(newLikedComments);
      
      // Update comment count in posts state without reloading
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p
      ));
    } catch (error) {
      console.error('Failed to reply:', error);
    }
  };

  const handleLikeComment = async (postId: number, commentId: number) => {
    try {
      // Optimistic update - toggle like state immediately
      const newLikedComments = new Set(likedComments);
      const isCurrentlyLiked = newLikedComments.has(commentId);
      
      if (isCurrentlyLiked) {
        newLikedComments.delete(commentId);
      } else {
        newLikedComments.add(commentId);
      }
      setLikedComments(newLikedComments);
      localStorage.setItem('likedComments', JSON.stringify(Array.from(newLikedComments)));

      // Update comment like count in UI
      const updatedComments = comments[postId]?.map((c: any) =>
        c.id === commentId
          ? {
              ...c,
              likedByCurrentUser: !isCurrentlyLiked,
              likeCount: isCurrentlyLiked ? c.likeCount - 1 : c.likeCount + 1
            }
          : c
      );
      if (updatedComments) {
        setComments({ ...comments, [postId]: updatedComments });
      }

      // Call API in background
      await apiService.toggleCommentLike(commentId);
    } catch (error) {
      console.error('Failed to like comment:', error);
      // Reload comments on error to sync state
      const response = await apiService.getPostComments(postId, 0, 20);
      const commentsList = response.content || [];
      setComments({ ...comments, [postId]: commentsList });
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  const getUserInitial = (name?: string) => {
    if (!name) return 'US';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getUserName = (name?: string) => {
    return name || 'User';
  };

  const handleAvatarError = (e: any, displayName?: string) => {
    e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect fill='%236366f1' width='40' height='40'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='white' text-anchor='middle' dy='.3em' font-family='Arial'%3E${displayName?.charAt(0).toUpperCase() || '?'}%3C/text%3E%3C/svg%3E`;
  };

  return (
    <div className="min-h-screen bg-black text-white pb-16 md:pb-0">
      {/* Header */}
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
              className="px-6 py-2 hover:bg-white/5 rounded-lg transition-colors border-b-2 border-primary-500"
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

          {/* Right */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) loadNotifications();
              }}
              className="p-2 hover:bg-white/5 rounded-full transition-colors relative"
            >
              <FiBell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="relative user-menu-container">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden"
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
                <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}/avatar?size=medium&t=${avatarTimestamp.current}`}
                        alt={user?.displayName}
                        className="w-12 h-12 rounded-full object-cover bg-gray-700" onError={(e) => handleAvatarError(e, post?.userDisplayName || user?.displayName || comment?.userDisplayName || reply?.userDisplayName)}
                      />
                      <div>
                        <p className="font-semibold">{getUserName(user?.displayName)}</p>
                        <p className="text-sm text-gray-400">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push('/dashboard/profile')}
                    className="w-full px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 text-left"
                  >
                    <FiUser className="w-5 h-5" />
                    <span>Trang cá nhân</span>
                  </button>
                  <button 
                    onClick={() => router.push('/dashboard/settings')}
                    className="w-full px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 text-left"
                  >
                    <FiSettings className="w-5 h-5" />
                    <span>Cài đặt</span>
                  </button>
                  <div className="border-t border-gray-700"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-3 hover:bg-red-500/10 transition-colors flex items-center gap-3 text-left text-red-500"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Popup */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-left">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}/avatar?size=medium&t=${avatarTimestamp.current}`}
                  alt={user?.displayName}
                  className="w-10 h-10 rounded-full object-cover bg-gray-700"
                  onError={(e) => handleAvatarError(e, user?.displayName)}
                />
                <span className="font-semibold">{getUserName(user?.displayName)}</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-left">
                <FiUsers className="w-6 h-6 text-blue-500" />
                <span>Bạn bè</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-left">
                <FiMessageSquare className="w-6 h-6 text-green-500" />
                <span>Tin nhắn</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-left">
                <FiUsers className="w-6 h-6 text-blue-500" />
                <span>Nhóm</span>
              </button>
            </div>
          </aside>

          {/* Center Feed */}
          <main className="lg:col-span-6 space-y-4 pb-20 md:pb-4">
            {/* Create Post */}
            <div className="bg-white/5 border border-gray-700 rounded-xl p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}/avatar?size=medium&t=${avatarTimestamp.current}`}
                  alt={user?.displayName}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 object-cover bg-gray-700"
                  onError={(e) => handleAvatarError(e, user?.displayName)}
                />
                <MentionInput
                  value={postContent}
                  onChange={(val) => setPostContent(val)}
                  onKeyPress={(e) => e.key === 'Enter' && !selectedFile && handleCreatePost()}
                  placeholder={`${getUserName(user?.displayName)} ơi, bạn đang nghĩ gì?`}
                  friends={friendsList}
                  className="flex-1 bg-white/5 border border-gray-700 rounded-full px-3 md:px-4 py-2 outline-none focus:border-primary-500 transition-colors text-sm md:text-base"
                />
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="mb-3 md:mb-4 relative">
                  <button
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black rounded-full p-1.5 md:p-2 z-10"
                  >
                    <FiX className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  {selectedFile?.type.startsWith('image/') ? (
                    <img src={previewUrl} alt="Preview" className="w-full rounded-lg max-h-64 md:max-h-96 object-cover" />
                  ) : selectedFile?.type.startsWith('video/') ? (
                    <video src={previewUrl} controls className="w-full rounded-lg max-h-64 md:max-h-96" />
                  ) : null}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-gray-700">
                <div className="flex gap-1 md:gap-2">
                  <label className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                    <FiImage className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                    <span className="text-xs md:text-sm hidden sm:inline">Ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <label className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                    <FiVideo className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                    <span className="text-xs md:text-sm hidden sm:inline">Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/5 border border-gray-700 rounded-lg hover:bg-white/10 transition-colors text-xs md:text-sm">
                      {postPrivacy === 'PUBLIC' && <><FiGlobe className="w-4 h-4" /> Công khai</>}
                      {postPrivacy === 'FRIENDS_ONLY' && <><FiUserCheck className="w-4 h-4" /> Bạn bè</>}
                      {postPrivacy === 'PRIVATE' && <><FiLock className="w-4 h-4" /> Riêng tư</>}
                    </button>
                    <div className="absolute left-0 mt-1 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <button
                        onClick={() => setPostPrivacy('PUBLIC')}
                        className={`w-full flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition-colors text-left text-sm ${postPrivacy === 'PUBLIC' ? 'text-primary-500 bg-white/5' : ''}`}
                      >
                        <FiGlobe className="w-4 h-4" />
                        <div>
                          <div className="font-semibold">Công khai</div>
                          <div className="text-xs text-gray-400">Mọi người có thể xem</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setPostPrivacy('FRIENDS_ONLY')}
                        className={`w-full flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition-colors text-left text-sm border-t border-gray-700 ${postPrivacy === 'FRIENDS_ONLY' ? 'text-primary-500 bg-white/5' : ''}`}
                      >
                        <FiUserCheck className="w-4 h-4" />
                        <div>
                          <div className="font-semibold">Bạn bè</div>
                          <div className="text-xs text-gray-400">Chỉ bạn bè xem</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setPostPrivacy('PRIVATE')}
                        className={`w-full flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition-colors text-left text-sm border-t border-gray-700 ${postPrivacy === 'PRIVATE' ? 'text-primary-500 bg-white/5' : ''}`}
                      >
                        <FiLock className="w-4 h-4" />
                        <div>
                          <div className="font-semibold">Riêng tư</div>
                          <div className="text-xs text-gray-400">Chỉ bạn xem</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleCreatePost}
                  disabled={(!postContent.trim() && !selectedFile) || posting}
                  className="px-3 md:px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold text-xs md:text-base flex items-center gap-2 whitespace-nowrap"
                >
                  {posting ? (
                    <>
                      <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Đang đăng...</span>
                    </>
                  ) : (
                    'Đăng'
                  )}
                </button>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Posts */}
            {!loading && posts.map((post, index) => (
              <article 
                key={post.id} 
                className="bg-white/5 border border-gray-700 rounded-xl relative"
                style={{ zIndex: showPostMenu[post.id] ? 100 : posts.length - index }}
              >
                {/* Post Header */}
                <div className="p-3 md:p-4 flex items-center justify-between overflow-visible">
                  <div className="flex items-center gap-2 md:gap-3">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${post.userId}/avatar?size=medium&t=${avatarTimestamp.current}`}
                      alt={post.userDisplayName}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 object-cover bg-gray-700"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect fill='%236366f1' width='40' height='40'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='white' text-anchor='middle' dy='.3em' font-family='Arial'%3E${post.userDisplayName?.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-sm md:text-base">{getUserName(post.userDisplayName)}</p>
                        {post.userVerified && <VerifiedIcon className="text-blue-400" size={16} />}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>{formatTime(post.createdAt)}</span>
                        <span>•</span>
                        {post.privacy === 'PUBLIC' && <FiGlobe className="w-3 h-3" title="Công khai" />}
                        {post.privacy === 'FRIENDS_ONLY' && <FiUserCheck className="w-3 h-3" title="Bạn bè" />}
                        {post.privacy === 'PRIVATE' && <FiLock className="w-3 h-3" title="Riêng tư" />}
                      </div>
                    </div>
                  </div>
                  <div className="relative post-menu-container">
                    <button 
                      onClick={() => togglePostMenu(post.id)}
                      className="p-1.5 md:p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                      <FiMoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    
                    {showPostMenu[post.id] && (
                      <div className="absolute right-0 mt-2 w-48 md:w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                        {isMyPost(post) ? (
                          <>
                            <button
                              onClick={() => { handleEditPost(post); setShowPostMenu({}); }}
                              className="w-full px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 text-left"
                            >
                              <FiEdit2 className="w-5 h-5" />
                              <span>Chỉnh sửa bài viết</span>
                            </button>
                            <button
                              onClick={() => { handleDeletePost(post.id); setShowPostMenu({}); }}
                              className="w-full px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 text-left text-red-500"
                            >
                              <FiTrash2 className="w-5 h-5" />
                              <span>Xóa bài viết</span>
                            </button>
                            <div className="border-t border-gray-700"></div>
                            <button className="w-full px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 text-left">
                              <FiEyeOff className="w-5 h-5" />
                              <span>Ẩn khỏi dòng thời gian</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="w-full px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 text-left">
                              <FiBookmark className="w-5 h-5" />
                              <span>Lưu bài viết</span>
                            </button>
                            <button className="w-full px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 text-left">
                              <FiEyeOff className="w-5 h-5" />
                              <span>Ẩn bài viết</span>
                            </button>
                            <div className="border-t border-gray-700"></div>
                            <button className="w-full px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 text-left text-red-500">
                              <FiFlag className="w-5 h-5" />
                              <span>Báo cáo bài viết</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                {editingPost === post.id ? (
                  <div className="px-4 pb-3 space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-3 text-base outline-none focus:border-primary-500 transition-colors resize-none"
                      rows={4}
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <FiLock className="w-4 h-4 text-gray-400" />
                      <select
                        value={editPrivacy}
                        onChange={(e) => setEditPrivacy(e.target.value)}
                        className="bg-white/5 border border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary-500 transition-colors"
                      >
                        <option value="PUBLIC">Công khai</option>
                        <option value="FRIENDS">Bạn bè</option>
                        <option value="PRIVATE">Riêng tư</option>
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FiX className="w-4 h-4" />
                        Hủy
                      </button>
                      <button
                        onClick={() => handleSaveEdit(post.id)}
                        disabled={!editContent.trim()}
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FiCheck className="w-4 h-4" />
                        Lưu
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="px-4 pb-3">
                      <p className="text-base whitespace-pre-wrap">{post.content}</p>
                    </div>

                    {/* Media */}
                    {post.fileUrl && (
                      <div className="mb-3 max-h-[70vh] overflow-hidden bg-black">
                        {post.fileType?.startsWith('image/') ? (
                          <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL}/api/files/${post.fileId}/thumbnail`}
                            alt="Post image"
                            className="w-full max-h-[70vh] object-contain cursor-pointer hover:opacity-100 transition-opacity brightness-110 contrast-110"
                            style={{ filter: 'brightness(1.1) contrast(1.1)', imageOrientation: 'auto' }}
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}${post.fileUrl}`, '_blank')}
                            loading="lazy"
                          />
                        ) : post.fileType?.startsWith('video/') ? (
                          <video 
                            key={post.id}
                            autoPlay
                            loop
                            playsInline
                            controls
                            controlsList="nodownload"
                            preload="metadata"
                            className="w-full max-h-[70vh] object-contain"
                            style={{ outline: 'none' }}
                          >
                            <source 
                              src={`${process.env.NEXT_PUBLIC_API_URL}${post.fileUrl}`} 
                              type={post.fileType || 'video/mp4'} 
                            />
                            Trình duyệt không hỗ trợ video.
                          </video>
                        ) : null}
                      </div>
                    )}
                  </>
                )}

                {/* Post Stats */}
                <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-400 border-t border-gray-700">
                  <button onClick={() => toggleLikes(post.id)} className="hover:text-primary-500 cursor-pointer">
                    {post.likeCount || 0} lượt thích
                  </button>
                  <div className="flex gap-3">
                    <span>{post.commentCount || 0} bình luận</span>
                  </div>
                </div>

                {/* Likes Modal */}
                {showLikes[post.id] && (
                  <div className="px-4 py-3 bg-white/5 border-t border-gray-700 max-h-64 overflow-y-auto">
                    {likes[post.id]?.length > 0 ? (
                      likes[post.id].map((user: any) => (
                        <div key={user.id} className="flex items-center gap-2 py-2 hover:bg-white/5 rounded px-2">
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/avatar?size=medium&t=${avatarTimestamp.current}`}
                            alt={user.displayName}
                            className="w-8 h-8 rounded-full object-cover bg-gray-700"
                            onError={(e) => handleAvatarError(e, user.displayName)}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{user.displayName}</p>
                            <p className="text-xs text-gray-500">@{user.email?.split('@')[0]}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">Chưa có lượt thích</p>
                    )}
                  </div>
                )}

                {/* Post Actions */}
                <div className="px-2 md:px-4 py-2 flex items-center justify-around border-t border-gray-700">
                  <button 
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 hover:bg-white/5 rounded-lg transition-colors flex-1 justify-center ${post.likedByCurrentUser ? 'text-primary-500' : ''}`}
                  >
                    <FiThumbsUp className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-xs md:text-sm hidden sm:inline">{post.likedByCurrentUser ? 'Đã thích' : 'Thích'}</span>
                  </button>
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 hover:bg-white/5 rounded-lg transition-colors flex-1 justify-center"
                  >
                    <FiMessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-xs md:text-sm hidden sm:inline">Bình luận</span>
                  </button>
                  <button className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 hover:bg-white/5 rounded-lg transition-colors flex-1 justify-center">
                    <FiShare2 className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-xs md:text-sm hidden sm:inline">Chia sẻ</span>
                  </button>
                </div>

                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="border-t border-gray-700">
                    {/* Comment Input */}
                    <div className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}/avatar?size=medium&t=${avatarTimestamp.current}`}
                        alt={user?.displayName}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full flex-shrink-0 object-cover bg-gray-700"
                        onError={(e) => {
                          e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect fill='%236366f1' width='32' height='32'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='white' text-anchor='middle' dy='.3em' font-family='Arial'%3E${user?.displayName?.charAt(0).toUpperCase() || '?'}%3C/text%3E%3C/svg%3E`;
                        }}
                      />
                      <MentionInput
                        value={commentContent[post.id] || ''}
                        onChange={(val) => setCommentContent({ ...commentContent, [post.id]: val })}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        placeholder="Viết bình luận..."
                        friends={friendsList}
                        className="flex-1 bg-white/5 border border-gray-700 rounded-full px-3 md:px-4 py-1.5 md:py-2 text-sm outline-none focus:border-primary-500 transition-colors min-w-0"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentContent[post.id]?.trim()}
                        className="text-primary-500 hover:text-primary-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                      >
                        <FiMessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                    </div>

                    {/* Comments List */}
                    <div className="px-4 pb-4 space-y-3 max-h-96 overflow-y-auto">
                      {comments[post.id]?.map((comment: any) => {
                        try {
                          return (
                        <div key={comment.id}>
                          {/* Main Comment */}
                          <div className="flex gap-3">
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${comment.userId}/avatar?size=medium&t=${avatarTimestamp.current}`}
                              alt={comment.userDisplayName}
                              className="w-8 h-8 rounded-full flex-shrink-0 object-cover bg-gray-700"
                              onError={(e) => {
                                e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect fill='%236366f1' width='32' height='32'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='white' text-anchor='middle' dy='.3em' font-family='Arial'%3E${comment.userDisplayName?.charAt(0).toUpperCase() || '?'}%3C/text%3E%3C/svg%3E`;
                              }}
                            />
                            <div className="flex-1">
                              <div className="bg-white/5 rounded-2xl px-4 py-2">
                                <p className="font-semibold text-sm">{getUserName(comment.userDisplayName)}</p>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                              <div className="flex items-center gap-3 mt-1 px-2 text-xs text-gray-400">
                                <span>{formatTime(comment.createdAt)}</span>
                                {comment.likeCount > 0 && (
                                  <span className="text-primary-500">{comment.likeCount} thích</span>
                                )}
                                <button 
                                  onClick={() => handleLikeComment(post.id, comment.id)}
                                  className={`hover:text-primary-500 transition-colors font-semibold flex items-center gap-1 ${likedComments.has(comment.id) ? 'text-primary-500' : ''}`}
                                >
                                  <FiThumbsUp className="w-4 h-4" />
                                  {likedComments.has(comment.id) ? 'Đã thích' : 'Thích'}
                                </button>
                                <button 
                                  onClick={() => handleReplyComment(post.id, comment.id)}
                                  className="hover:text-primary-500 transition-colors font-semibold"
                                >
                                  Trả lời
                                </button>
                                {comment.userId === user?.id && (
                                  <button 
                                    onClick={async () => {
                                      if (confirm('Bạn có chắc muốn xóa bình luận này?')) {
                                        try {
                                          const replyCount = comment.replies?.length || 0;
                                          await apiService.deleteComment(comment.id);
                                          const response = await apiService.getPostComments(post.id, 0, 20);
                                          setComments({ ...comments, [post.id]: response.content || [] });
                                          // Update comment count locally (parent + replies)
                                          setPosts(posts.map(p => 
                                            p.id === post.id ? { ...p, commentCount: Math.max(0, (p.commentCount || 0) - replyCount - 1) } : p
                                          ));
                                        } catch (error: any) {
                                          console.error('Failed to delete comment:', error);
                                          alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
                                        }
                                      }
                                    }}
                                    className="hover:text-red-500 transition-colors font-semibold"
                                  >
                                    Xóa
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Reply Input */}
                          {replyingTo[post.id] === comment.id && (
                            <div className="ml-8 md:ml-11 mt-2 flex items-center gap-1.5 bg-white/5 rounded-lg p-1.5">
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}/avatar?size=medium&t=${avatarTimestamp.current}`}
                                alt={user?.displayName}
                                className="w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0 object-cover bg-gray-700"
                                onError={(e) => {
                                  e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect fill='%236366f1' width='24' height='24'/%3E%3Ctext x='50%25' y='50%25' font-size='12' fill='white' text-anchor='middle' dy='.3em' font-family='Arial'%3E${user?.displayName?.charAt(0).toUpperCase() || '?'}%3C/text%3E%3C/svg%3E`;
                                }}
                              />
                              <MentionInput
                                value={replyContent[post.id] || ''}
                                onChange={(val) => setReplyContent({ ...replyContent, [post.id]: val })}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendReply(post.id, comment.id)}
                                placeholder="Trả lời..."
                                friends={friendsList}
                                className="flex-1 bg-white/5 border border-gray-700 rounded-full px-2 md:px-3 py-1 text-xs outline-none focus:border-primary-500 transition-colors min-w-0"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSendReply(post.id, comment.id)}
                                disabled={!replyContent[post.id]?.trim()}
                                className="text-primary-500 hover:text-primary-400 disabled:opacity-30 text-[10px] md:text-xs font-semibold flex-shrink-0"
                              >
                                Gửi
                              </button>
                              <button
                                onClick={() => handleCancelReply(post.id)}
                                className="text-gray-400 hover:text-white text-[10px] md:text-xs font-semibold flex-shrink-0 hidden md:inline"
                              >
                                Hủy
                              </button>
                            </div>
                          )}

                          {/* Nested Replies */}
                          {comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 && (
                            <div className="ml-11 mt-2 space-y-2 border-l-2 border-gray-700 pl-3">
                              {comment.replies.map((reply: any) => {
                                if (!reply || !reply.id) return null;
                                return (
                                <div key={reply.id} className="flex gap-2">
                                  <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${reply.userId}/avatar?size=medium&t=${avatarTimestamp.current}`}
                                    alt={reply.userDisplayName}
                                    className="w-6 h-6 rounded-full flex-shrink-0 object-cover bg-gray-700"
                                    onError={(e) => {
                                      e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect fill='%236366f1' width='24' height='24'/%3E%3Ctext x='50%25' y='50%25' font-size='12' fill='white' text-anchor='middle' dy='.3em' font-family='Arial'%3E${reply.userDisplayName?.charAt(0).toUpperCase() || '?'}%3C/text%3E%3C/svg%3E`;
                                    }}
                                  />
                                  <div className="flex-1">
                                    <div className="bg-white/5 rounded-xl px-3 py-1.5">
                                      <p className="font-semibold text-xs">{getUserName(reply.userDisplayName)}</p>
                                      <p className="text-xs">{reply.content}</p>
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5 px-1 text-xs text-gray-400">
                                      <span className="text-[10px]">{formatTime(reply.createdAt)}</span>
                                      {reply.likeCount > 0 && (
                                        <span className="text-primary-500 text-[10px]">{reply.likeCount}</span>
                                      )}
                                      <button 
                                        onClick={() => handleLikeComment(post.id, reply.id)}
                                        className={`hover:text-primary-500 transition-colors p-0.5 ${likedComments.has(reply.id) ? 'text-primary-500' : ''}`}
                                        title="Thích"
                                      >
                                        <FiThumbsUp className="w-2.5 h-2.5" />
                                      </button>
                                      <button 
                                        onClick={() => handleReplyComment(post.id, comment.id)}
                                        className="hover:text-primary-500 transition-colors font-semibold text-[9px]"
                                      >
                                        Trả lời
                                      </button>
                                      {reply.userId === user?.id && (
                                        <button 
                                          onClick={async () => {
                                            if (confirm('Bạn có chắc muốn xóa bình luận này?')) {
                                              try {
                                                await apiService.deleteComment(reply.id);
                                                const response = await apiService.getPostComments(post.id, 0, 20);
                                                setComments({ ...comments, [post.id]: response.content || [] });
                                                // Update comment count locally (only -1 for reply)
                                                setPosts(posts.map(p => 
                                                  p.id === post.id ? { ...p, commentCount: Math.max(0, (p.commentCount || 0) - 1) } : p
                                                ));
                                              } catch (error: any) {
                                                alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
                                              }
                                            }
                                          }}
                                          className="hover:text-red-500 transition-colors font-semibold text-[10px]"
                                        >
                                          Xóa
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                          );
                        } catch (error) {
                          console.error('Error rendering comment:', comment.id, error);
                          return null;
                        }
                      })}
                      {(!comments[post.id] || comments[post.id].length === 0) && (
                        <p className="text-center text-gray-400 text-sm py-4">Chưa có bình luận nào</p>
                      )}
                    </div>
                  </div>
                )}
              </article>
            ))}

            {/* Loading indicator */}
            {loadingMore && (
              <div className="py-8 text-center">
                <div className="inline-block w-6 h-6 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="hidden xl:block lg:col-span-3">
            <div className="sticky top-20">
              <h3 className="font-semibold mb-3 px-2">Được tài trợ</h3>
              <div className="space-y-3 mb-6">
                <div className="p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                  <div className="w-full h-32 bg-gradient-to-br from-primary-500 to-blue-600 rounded-lg mb-2"></div>
                  <p className="text-sm font-semibold">Quảng cáo mẫu</p>
                  <p className="text-xs text-gray-400">example.com</p>
                </div>
              </div>

              <h3 className="font-semibold mb-3 px-2">Người liên hệ</h3>
              <div className="space-y-2">
                {friends.length === 0 ? (
                  <p className="text-sm text-gray-400 px-2">Chưa có bạn bè</p>
                ) : (
                  friends.map((friend) => (
                    <button key={friend.id} className="w-full flex items-center gap-3 px-2 py-2 hover:bg-white/5 rounded-lg transition-colors text-left">
                      <div className="relative">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {getUserInitial(friend.displayName || "User")}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
                      </div>
                      <span className="text-sm">{friend.displayName || "User"}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800 px-4 py-2 z-[100]">
        <div className="flex items-center justify-around">
          <button 
            onClick={() => router.push('/dashboard')}
            className="p-3 text-primary-500"
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
          <button className="p-3 hover:text-primary-500 transition-colors">
            <FiMenu className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </div>
  );
}
