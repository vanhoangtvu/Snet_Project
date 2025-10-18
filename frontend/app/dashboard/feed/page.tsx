'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { apiService } from '@/lib/api';
import { formatDate, getTimeAgo } from '@/lib/utils';
import { 
  FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal,
  FiImage, FiX, FiSend, FiGlobe, FiUsers, FiLock,
  FiEdit2, FiTrash2, FiUpload, FiSmile, FiVolume2, FiVolumeX,
  FiDownload
} from 'react-icons/fi';
import { VerifiedIcon } from '@/components/icons/Icons';
import { QRCodeSVG } from 'qrcode.react';
import EmbeddedVideo from '@/components/EmbeddedVideo';
import { parseVideoUrl, isValidVideoUrl } from '@/lib/videoUtils';

interface PostData {
  id: number;
  userId: number;
  userName: string;
  userDisplayName: string;
  userAvatarUrl: string;
  userVerified: boolean;
  content: string;
  fileId?: number;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileUrl?: string;
  videoUrl?: string;
  videoPlatform?: string;
  privacy: string;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
  createdAt: string;
  recentComments?: CommentData[];
}

interface CommentData {
  id: number;
  userId: number;
  userName: string;
  userDisplayName: string;
  userAvatarUrl: string;
  userVerified: boolean;
  content: string;
  createdAt: string;
}

// Skeleton Loading Component
const PostSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-24"></div>
      </div>
    </div>
    <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
    <div className="h-64 bg-gray-300 rounded"></div>
  </div>
);

export default function FeedPage() {
  const { user } = useAuth();
  const { success, error, warning, info } = useNotification();
  const observerTarget = useRef<HTMLDivElement>(null);
  
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Create Post State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createContent, setCreateContent] = useState('');
  const [createPrivacy, setCreatePrivacy] = useState('PUBLIC');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Edit Post State
  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // Comment State
  const [commenting, setCommenting] = useState<{[key: number]: string}>({});
  const [showAllComments, setShowAllComments] = useState<{[key: number]: boolean}>({});
  const [loadingComments, setLoadingComments] = useState<{[key: number]: boolean}>({});
  
  // Reactions State
  const [showReactionsFor, setShowReactionsFor] = useState<number | null>(null);
  
  // Image Lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // Likes Modal
  const [likesModal, setLikesModal] = useState<{show: boolean, postId: number | null, likes: any[]}>({
    show: false,
    postId: null,
    likes: []
  });

  // Video autoplay state
  const [mutedVideos, setMutedVideos] = useState<{[key: number]: boolean}>({});
  const videoRefs = useRef<{[key: number]: HTMLVideoElement | null}>({});
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState<number | null>(null);

  // File Picker Modal
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Share Modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Load initial posts
  useEffect(() => {
    loadPosts();
  }, []);

  // Setup video autoplay observers
  useEffect(() => {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Video is visible, autoplay it
            // Note: onPlay event will handle pausing other videos
            video.play().catch(err => {
              console.log('Autoplay failed:', err);
            });
          } else {
            // Video is not visible, pause it
            video.pause();
          }
        });
      },
      {
        threshold: [0, 0.5, 1],
        rootMargin: '0px'
      }
    );

    // Observe all videos
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        videoObserver.observe(video);
      }
    });

    return () => {
      videoObserver.disconnect();
    };
  }, [posts]);

  const toggleVideoMute = (postId: number) => {
    const video = videoRefs.current[postId];
    if (video) {
      video.muted = !video.muted;
      setMutedVideos(prev => ({ ...prev, [postId]: video.muted }));
    }
  };

  // Pause all other videos when one plays
  const pauseOtherVideos = (currentPostId: number) => {
    Object.entries(videoRefs.current).forEach(([postId, video]) => {
      if (video && parseInt(postId) !== currentPostId && !video.paused) {
        console.log(`⏸️ Pausing video ${postId}, playing video ${currentPostId}`);
        video.pause();
      }
    });
    setCurrentPlayingVideo(currentPostId);
  };

  // Load user files for picker
  const loadUserFiles = async () => {
    try {
      setLoadingFiles(true);
      const files = await apiService.getMyFiles();
      // Filter only images and videos, sort by newest first
      const mediaFiles = files
        .filter((file: any) => 
          file.fileType?.startsWith('image/') || file.fileType?.startsWith('video/')
        )
        .sort((a: any, b: any) => 
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
      setUserFiles(mediaFiles);
    } catch (err) {
      error('Không thể tải danh sách file');
      console.error('Error loading files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Open file picker
  const openFilePicker = () => {
    setShowFilePicker(true);
    loadUserFiles();
  };

  // Select file from picker
  const selectFileFromPicker = (file: any) => {
    setSelectedFile(file);
    setShowFilePicker(false);
  };

  // Focus comment input
  const focusCommentInput = (postId: number) => {
    const commentInput = document.querySelector(`input[data-post-id="${postId}"]`) as HTMLInputElement;
    if (commentInput) {
      commentInput.focus();
      commentInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Share post
  const handleSharePost = async (postId: number) => {
    // Use public post URL so people can view without login
    const url = `${window.location.origin}/post/${postId}`;
    setShareUrl(url);
    
    // Always show modal first (to display QR code)
    setShowShareModal(true);
  };

  // Copy from share modal
  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      success('Đã sao chép!', 'Link đã được sao chép vào clipboard');
    } catch (err) {
      // Fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      input.setSelectionRange(0, 99999);
      
      try {
        document.execCommand('copy');
        success('Đã sao chép!', 'Link đã được sao chép vào clipboard');
      } catch (err) {
        error('Lỗi', 'Không thể sao chép. Vui lòng copy thủ công');
      } finally {
        document.body.removeChild(input);
      }
    }
  };

  // Download QR code
  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `pixshare-qr-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
          success('Đã tải xuống!', 'Mã QR đã được lưu');
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Native share from modal
  const nativeShare = async () => {
    try {
      await navigator.share({
        title: 'Chia sẻ bài viết - PixShare',
        text: 'Xem bài viết này trên PixShare',
        url: shareUrl,
      });
      success('Đã chia sẻ!');
      setShowShareModal(false);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        error('Lỗi', 'Không thể chia sẻ');
      }
    }
  };

  // Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadPosts(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, page]);

  const loadPosts = async (pageNum = 0) => {
    try {
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);
      
      const response = await apiService.getPosts(pageNum, 10);
      
      if (pageNum === 0) {
        setPosts(response.content);
      } else {
        setPosts(prev => [...prev, ...response.content]);
      }
      
      setHasMore(!response.last);
      setPage(pageNum);
    } catch (err) {
      error('Lỗi tải dữ liệu', 'Không thể tải bài đăng');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setUploadingFile(true);
    setUploadProgress(0);
    
    try {
      const uploadedFile = await apiService.uploadFile(
        file,
        'Post attachment',
        (progress) => setUploadProgress(progress)
      );
      setSelectedFile(uploadedFile);
      success('Upload thành công', 'File đã được tải lên');
    } catch (err: any) {
      error('Upload thất bại', err.response?.data?.message || 'Không thể tải file');
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };

  const handleCreatePost = async () => {
    if (!createContent.trim() && !selectedFile && !videoUrl.trim()) {
      warning('Vui lòng thêm nội dung, file hoặc video!');
      return;
    }

    try {
      const postData = {
        content: createContent,
        privacy: createPrivacy,
        fileId: selectedFile?.id,
        videoUrl: videoUrl.trim() || undefined
      };

      const response = await apiService.createPost(postData);
      setPosts(prev => [response, ...prev]);
      
      // Reset form
      setShowCreateModal(false);
      setCreateContent('');
      setCreatePrivacy('PUBLIC');
      setSelectedFile(null);
      setVideoUrl('');
      
      success('Đăng bài thành công', 'Bài viết đã được chia sẻ!');
    } catch (err: any) {
      error('Đăng bài thất bại', err.response?.data?.message || 'Không thể đăng bài');
    }
  };

  const handleUpdatePost = async (postId: number) => {
    if (!editContent.trim()) {
      warning('Nội dung không được để trống!');
      return;
    }

    try {
      await apiService.updatePost(postId, { content: editContent });
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, content: editContent } : post
      ));
      setEditingPost(null);
      setEditContent('');
      success('Cập nhật thành công', 'Bài viết đã được cập nhật');
    } catch (err: any) {
      error('Cập nhật thất bại', err.response?.data?.message || 'Không thể cập nhật bài viết');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) return;

    try {
      await apiService.deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      success('Đã xóa bài viết', 'Bài viết đã được xóa thành công');
    } catch (err: any) {
      error('Xóa bài viết thất bại', err.response?.data?.message || 'Không thể xóa bài viết');
    }
  };

  const handleToggleLike = async (postId: number) => {
    try {
      const response = await apiService.toggleLike(postId);
      
      setPosts(prev => prev.map(post => 
        post.id === postId
          ? {
              ...post,
              likedByCurrentUser: response.liked,
              likeCount: post.likeCount + (response.liked ? 1 : -1)
            }
          : post
      ));
    } catch (err) {
      error('Lỗi thao tác', 'Không thể thực hiện like');
    }
  };

  const handleAddComment = async (postId: number) => {
    const content = commenting[postId]?.trim();
    if (!content) return;

    try {
      const response = await apiService.addComment(postId, content);
      
      setPosts(prev => prev.map(post => 
        post.id === postId
          ? {
              ...post,
              commentCount: post.commentCount + 1,
              recentComments: [...(post.recentComments || []), response]
            }
          : post
      ));
      
      setCommenting(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      error('Lỗi bình luận', 'Không thể thêm bình luận');
    }
  };

  const handleLoadAllComments = async (postId: number) => {
    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    try {
      const response = await apiService.getPostComments(postId);
      setPosts(prev => prev.map(post => 
        post.id === postId
          ? { ...post, recentComments: response.content }
          : post
      ));
      setShowAllComments(prev => ({ ...prev, [postId]: true }));
    } catch (err) {
      error('Lỗi tải dữ liệu', 'Không thể tải bình luận');
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    if (!confirm('Xóa bình luận này?')) return;

    try {
      await apiService.deleteComment(commentId);
      setPosts(prev => prev.map(post => 
        post.id === postId
          ? {
              ...post,
              commentCount: post.commentCount - 1,
              recentComments: post.recentComments?.filter(c => c.id !== commentId)
            }
          : post
      ));
      success('Đã xóa bình luận');
    } catch (err: any) {
      error('Xóa thất bại', err.response?.data?.message || 'Không thể xóa bình luận');
    }
  };

  const handleShowLikes = async (postId: number) => {
    try {
      const response = await apiService.getPostLikes(postId);
      setLikesModal({
        show: true,
        postId: postId,
        likes: response.content || []
      });
    } catch (err: any) {
      error('Lỗi tải dữ liệu', 'Không thể tải danh sách lượt thích');
    }
  };

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'PUBLIC': return <FiGlobe className="w-3 h-3" />;
      case 'FRIENDS_ONLY': return <FiUsers className="w-3 h-3" />;
      case 'PRIVATE': return <FiLock className="w-3 h-3" />;
      default: return <FiGlobe className="w-3 h-3" />;
    }
  };

  if (loading && page === 0) {
    return (
      <div className="max-w-2xl mx-auto px-2 sm:px-4 py-3 sm:py-6 space-y-3 sm:space-y-6">
        {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-0 sm:px-4 py-0 sm:py-6">
      {/* Create Post Card */}
      <div className="bg-white rounded-none sm:rounded-lg shadow-sm sm:shadow-md p-3 sm:p-4 mb-3 sm:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api'}/users/${user?.id}/avatar`}
            alt="Your avatar"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
            onError={(e) => {
              const img = e.currentTarget;
              img.style.display = 'none';
              const parent = img.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold';
                fallback.textContent = user?.displayName?.charAt(0).toUpperCase() || 'U';
                parent.appendChild(fallback);
              }
            }}
          />
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
          >
            {user?.displayName}, bạn đang nghĩ gì?
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-3 sm:space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-none sm:rounded-lg shadow-sm sm:shadow-md overflow-hidden">
            {/* Post Header */}
            <div className="p-3 sm:p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <img
                    src={apiService.getUserAvatar(post.userId)}
                    alt={post.userDisplayName}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.style.display = 'none';
                      const parent = img.parentElement;
                      if (parent && !parent.querySelector('.avatar-fallback')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'avatar-fallback w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold';
                        fallback.textContent = post.userDisplayName.charAt(0).toUpperCase();
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-sm sm:text-base text-gray-900 hover:underline cursor-pointer truncate">
                        {post.userDisplayName}
                      </span>
                      {post.userVerified && <VerifiedIcon size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500">
                      <span>{getTimeAgo(new Date(post.createdAt))}</span>
                      <span>•</span>
                      {getPrivacyIcon(post.privacy)}
                    </div>
                  </div>
                </div>

                {/* Post Options */}
                {user?.id === post.userId && (
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingPost(post.id);
                        setEditContent(post.content);
                      }}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full text-gray-500 hover:text-primary-600 touch-manipulation"
                      title="Chỉnh sửa"
                    >
                      <FiEdit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full text-gray-500 hover:text-red-600 touch-manipulation"
                      title="Xóa"
                    >
                      <FiTrash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>
                )}
              </div>

              {/* Post Content */}
              <div className="mt-2 sm:mt-3">
                {editingPost === post.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 sm:p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdatePost(post.id)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 touch-manipulation"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => {
                          setEditingPost(null);
                          setEditContent('');
                        }}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 touch-manipulation"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm sm:text-base text-gray-900 whitespace-pre-wrap">{post.content}</p>
                )}
              </div>
            </div>

            {/* Post Media */}
            {post.fileId && post.fileType && (
              <div className="relative">
                {post.fileType.startsWith('image/') ? (
                  <div className="relative group cursor-pointer" onClick={() => setLightboxImage(`http://113.170.159.180:8086/api/files/${post.fileId}/public-preview`)}>
                    <img
                      src={`http://113.170.159.180:8086/api/files/${post.fileId}/public-preview`}
                      alt={post.fileName || 'Post image'}
                      className="w-full transition-opacity group-hover:opacity-95"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src.includes('public-preview')) {
                          target.src = `http://113.170.159.180:8086/api/files/${post.fileId}/preview?token=${localStorage.getItem('token')}`;
                        }
                      }}
                    />
                    {/* Zoom Indicator - Hidden by default, show on hover */}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                      Phóng to
                    </div>
                  </div>
                ) : post.fileType.startsWith('video/') ? (
                  <div className="relative group">
                    <video
                      ref={(el) => {
                        if (el) videoRefs.current[post.id] = el;
                      }}
                      className="w-full max-h-96 bg-black cursor-pointer"
                      loop
                      playsInline
                      preload="metadata"
                      onClick={(e) => {
                        const video = e.currentTarget;
                        if (video.paused) {
                          video.play();
                        } else {
                          video.pause();
                        }
                      }}
                      onPlay={() => {
                        // When video starts playing, pause all others
                        pauseOtherVideos(post.id);
                      }}
                      onLoadedMetadata={(e) => {
                        // Enable audio by default (unmuted)
                        const video = e.currentTarget;
                        video.muted = mutedVideos[post.id] === true;
                      }}
                    >
                      <source 
                        src={`http://113.170.159.180:8086/api/video/${post.fileId}/stream?token=${localStorage.getItem('token')}`}
                        type={post.fileType}
                      />
                    </video>
                    
                    {/* Video Controls Overlay - Hidden by default, show on hover */}
                    <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {/* Mute/Unmute Button */}
                      <button
                        onClick={() => toggleVideoMute(post.id)}
                        className="p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 active:bg-black/80 rounded-full text-white backdrop-blur-sm transition-all touch-manipulation"
                        title={mutedVideos[post.id] === true ? "Bật âm thanh" : "Tắt âm thanh"}
                      >
                        {mutedVideos[post.id] === true ? (
                          <FiVolumeX size={18} className="sm:w-5 sm:h-5" />
                        ) : (
                          <FiVolume2 size={18} className="sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>

                    {/* Video Info Badge - Hidden by default, show on hover */}
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      🎥 Video
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Embedded Video (YouTube/TikTok) */}
            {post.videoUrl && (
              <div className="px-0">
                <EmbeddedVideo url={post.videoUrl} platform={post.videoPlatform} />
              </div>
            )}

            {/* Post Stats */}
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 border-t border-b border-gray-100">
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                <button 
                  onClick={() => handleShowLikes(post.id)}
                  className="hover:underline flex items-center space-x-1"
                >
                  <span className="text-red-500">❤️</span>
                  <span>{post.likeCount}</span>
                </button>
                <div className="flex items-center space-x-4">
                  <span>{post.commentCount} bình luận</span>
                  <span>0 chia sẻ</span>
                </div>
              </div>
            </div>

            {/* Post Actions */}
            <div className="px-1 sm:px-2 py-1">
              <div className="flex items-center justify-around">
                <button
                  onClick={() => handleToggleLike(post.id)}
                  className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2 rounded-lg transition-colors ${
                    post.likedByCurrentUser
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiHeart size={18} className="sm:w-5 sm:h-5" fill={post.likedByCurrentUser ? 'currentColor' : 'none'} />
                  <span className="text-sm sm:text-base font-semibold">Thích</span>
                </button>
                
                <button 
                  onClick={() => focusCommentInput(post.id)}
                  className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <FiMessageCircle size={18} className="sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base font-semibold">Bình luận</span>
                </button>
                
                <button 
                  onClick={() => handleSharePost(post.id)}
                  className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <FiShare2 size={18} className="sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base font-semibold">Chia sẻ</span>
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-100">
              {/* Show all comments button */}
              {!showAllComments[post.id] && post.commentCount > (post.recentComments?.length || 0) && (
                <button
                  onClick={() => handleLoadAllComments(post.id)}
                  disabled={loadingComments[post.id]}
                  className="text-sm text-gray-500 hover:text-gray-700 my-2"
                >
                  {loadingComments[post.id] ? 'Đang tải...' : `Xem tất cả ${post.commentCount} bình luận`}
                </button>
              )}

              {/* Comments List */}
              {post.recentComments && post.recentComments.length > 0 && (
                <div className="space-y-3 my-3">
                  {post.recentComments.map(comment => (
                    <div key={comment.id} className="flex items-start space-x-2 group">
                      <img
                        src={apiService.getUserAvatar(comment.userId)}
                        alt={comment.userDisplayName}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block">
                          <div className="flex items-center space-x-1">
                            <span className="font-semibold text-sm">{comment.userDisplayName}</span>
                            {comment.userVerified && <VerifiedIcon size={12} />}
                          </div>
                          <p className="text-sm text-gray-900">{comment.content}</p>
                        </div>
                        <div className="flex items-center space-x-3 mt-1 ml-3 text-xs text-gray-500">
                          <span>{getTimeAgo(new Date(comment.createdAt))}</span>
                          <button className="hover:underline font-semibold">Thích</button>
                          <button className="hover:underline font-semibold">Trả lời</button>
                          {user?.id === comment.userId && (
                            <button
                              onClick={() => handleDeleteComment(post.id, comment.id)}
                              className="hover:underline font-semibold text-red-600"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="flex items-center space-x-2 mt-2 sm:mt-3">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api'}/users/${user?.id}/avatar`}
                  alt="Your avatar"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.style.display = 'none';
                    const parent = img.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs';
                      fallback.textContent = user?.displayName?.charAt(0).toUpperCase() || 'U';
                      parent.appendChild(fallback);
                    }
                  }}
                />
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Viết bình luận..."
                    data-post-id={post.id}
                    className="flex-1 bg-gray-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500"
                    value={commenting[post.id] || ''}
                    onChange={(e) => setCommenting(prev => ({ 
                      ...prev, 
                      [post.id]: e.target.value 
                    }))}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddComment(post.id);
                      }
                    }}
                  />
                  {commenting[post.id]?.trim() && (
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="text-primary-600 hover:text-primary-700 active:text-primary-800 flex-shrink-0 p-1 touch-manipulation"
                    >
                      <FiSend size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading More */}
        {loadingMore && (
          <div className="py-4">
            <PostSkeleton />
          </div>
        )}

        {/* Infinite Scroll Observer */}
        <div ref={observerTarget} className="h-4" />

        {/* No More Posts */}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Bạn đã xem hết tất cả bài viết</p>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold">Tạo bài viết</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateContent('');
                  setSelectedFile(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiX size={24} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api'}/users/${user?.id}/avatar`}
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold">{user?.displayName}</p>
                  <select
                    value={createPrivacy}
                    onChange={(e) => setCreatePrivacy(e.target.value)}
                    className="text-sm bg-gray-100 border-0 rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="PUBLIC">🌍 Công khai</option>
                    <option value="FRIENDS_ONLY">👥 Bạn bè</option>
                    <option value="PRIVATE">🔒 Riêng tư</option>
                  </select>
                </div>
              </div>

              {/* Content */}
              <textarea
                placeholder={`${user?.displayName}, bạn đang nghĩ gì?`}
                className="w-full h-32 p-3 text-lg border-0 resize-none focus:outline-none"
                value={createContent}
                onChange={(e) => setCreateContent(e.target.value)}
              />

              {/* File Preview */}
              {selectedFile && (
                <div className="mt-4 relative border border-gray-200 rounded-lg overflow-hidden">
                  {selectedFile.fileType?.startsWith('image/') ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api'}/files/${selectedFile.id}/preview`}
                      alt="Selected file"
                      className="w-full max-h-96 object-contain"
                    />
                  ) : selectedFile.fileType?.startsWith('video/') ? (
                    <video
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api'}/video/${selectedFile.id}/stream?token=${localStorage.getItem('token')}`}
                      className="w-full max-h-96"
                      controls
                      preload="metadata"
                    />
                  ) : null}
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              )}

              {/* Upload Progress */}
              {uploadingFile && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Đang tải lên...</span>
                    <span className="text-sm font-semibold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Video URL Input */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎥 Paste link YouTube/TikTok (tùy chọn)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... hoặc https://tiktok.com/@user/video/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
                {videoUrl && isValidVideoUrl(videoUrl) && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    ✓ Video hợp lệ - Sẽ tự động phát trong bài viết
                  </p>
                )}
                {videoUrl && !isValidVideoUrl(videoUrl) && (
                  <p className="mt-1 text-xs text-orange-600 flex items-center gap-1">
                    ⚠ Link chưa đúng định dạng (YouTube, TikTok, Vimeo, Dailymotion)
                  </p>
                )}
              </div>

              {/* Add to Post */}
              <div className="mt-4 p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Hoặc thêm file từ máy</span>
                  <div className="flex items-center space-x-2">
                    {/* Upload New File */}
                    <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full" title="Tải ảnh/video mới">
                      <FiUpload size={22} className="text-green-600" />
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                    </label>
                    {/* Choose From Uploaded Files */}
                    <button 
                      onClick={openFilePicker}
                      className="p-2 hover:bg-gray-100 rounded-full"
                      title="Chọn từ file đã tải lên"
                    >
                      <FiImage size={22} className="text-blue-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full" title="Thêm emoji">
                      <FiSmile size={22} className="text-yellow-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleCreatePost}
                disabled={(!createContent.trim() && !selectedFile) || uploadingFile}
                className="w-full mt-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploadingFile ? 'Đang tải lên...' : 'Đăng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Picker Modal */}
      {showFilePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold">Chọn ảnh/video đã tải lên</h3>
              <button
                onClick={() => setShowFilePicker(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingFiles ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : userFiles.length === 0 ? (
                <div className="text-center py-12">
                  <FiImage className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">Chưa có file nào được tải lên</p>
                  <p className="text-sm text-gray-400 mt-2">Hãy tải lên ảnh hoặc video để sử dụng</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {userFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => selectFileFromPicker(file)}
                      className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-500 transition-all"
                    >
                      {file.fileType.startsWith('image/') ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api'}/files/${file.id}/preview?token=${localStorage.getItem('token')}`}
                          alt={file.fileName}
                          className="w-full h-40 object-cover"
                        />
                      ) : file.fileType.startsWith('video/') ? (
                        <div className="relative w-full h-40 bg-black flex items-center justify-center">
                          <video
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api'}/video/${file.id}/stream?token=${localStorage.getItem('token')}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                            <div className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                              <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-gray-800 border-b-8 border-b-transparent ml-1"></div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-sm font-semibold truncate px-2">{file.fileName}</p>
                        </div>
                      </div>

                      {/* Selected Indicator */}
                      {selectedFile?.id === file.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {userFiles.length} file có sẵn
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowFilePicker(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={() => setShowFilePicker(false)}
                  disabled={!selectedFile}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white"
            onClick={() => setLightboxImage(null)}
          >
            <FiX size={32} />
          </button>
          <img
            src={lightboxImage}
            alt="Lightbox"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-900">Chia sẻ bài viết</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX size={22} />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-6">
              {/* QR Code Section */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-lg">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={shareUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: "/logo.png",
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-3 text-center">
                  Quét mã QR để xem bài viết
                </p>
                <button
                  onClick={downloadQRCode}
                  className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FiDownload size={18} />
                  Tải mã QR
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">hoặc chia sẻ link</span>
                </div>
              </div>

              {/* URL Section */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Link bài viết:</p>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ✨ Người khác có thể xem bài viết này mà không cần đăng nhập
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={copyShareUrl}
                  className="px-4 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 active:bg-primary-800 transition-colors flex items-center justify-center gap-2"
                >
                  <FiUpload size={18} />
                  Sao chép link
                </button>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={nativeShare}
                    className="px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 active:bg-green-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiShare2 size={18} />
                    Chia sẻ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Likes Modal */}
      {likesModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Người đã thích</h3>
              <button
                onClick={() => setLikesModal({ show: false, postId: null, likes: [] })}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="p-4 max-h-80 overflow-y-auto">
              {likesModal.likes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Chưa có ai thích bài viết này</p>
              ) : (
                <div className="space-y-3">
                  {likesModal.likes.map(like => (
                    <div key={like.id} className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg">
                      <img
                        src={apiService.getUserAvatar(like.id)}
                        alt={like.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{like.displayName}</span>
                          {like.verified && <VerifiedIcon size={14} />}
                        </div>
                        <span className="text-sm text-gray-500">{like.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
