'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiHeart, FiMessageCircle, FiShare2, FiArrowLeft, FiEye } from 'react-icons/fi';
import { VerifiedIcon } from '@/components/icons/Icons';
import EmbeddedVideo from '@/components/EmbeddedVideo';

interface PostData {
  id: number;
  userId: number;
  userName: string;
  userDisplayName: string;
  userVerified: boolean;
  content: string;
  fileId?: number;
  fileName?: string;
  fileType?: string;
  videoUrl?: string;
  videoPlatform?: string;
  privacy: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  recentComments?: any[];
}

export default function PublicPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPost();
  }, [params.id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api';
      const response = await fetch(`${API_URL}/public/posts/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Bài viết không tồn tại hoặc đã bị xóa');
      }
      
      const data = await response.json();
      setPost(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bài viết</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PixShare</h1>
              <p className="text-xs text-gray-500">Bài viết công khai</p>
            </div>
          </div>
          <a
            href="/login"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors text-sm"
          >
            Đăng nhập
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Post Header */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api'}/users/${post.userId}/avatar`}
                alt={post.userDisplayName}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%236366f1'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='20' font-weight='bold'%3E${post.userDisplayName.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`;
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-gray-900">{post.userDisplayName}</h2>
                  {post.userVerified && <VerifiedIcon size={16} />}
                </div>
                <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-6">
            <p className="text-gray-900 whitespace-pre-wrap text-lg">{post.content}</p>
          </div>

          {/* Post Media */}
          {post.fileId && post.fileType && (
            <div className="relative">
              {post.fileType.startsWith('image/') ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api'}/files/${post.fileId}/public-preview`}
                  alt={post.fileName || 'Post image'}
                  className="w-full"
                />
              ) : post.fileType.startsWith('video/') ? (
                <video
                  controls
                  className="w-full bg-black"
                  preload="metadata"
                >
                  <source 
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api'}/files/${post.fileId}/public-preview`}
                    type={post.fileType}
                  />
                </video>
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
          <div className="px-6 py-4 border-t border-b bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <FiHeart className="text-red-500" />
                  <span>{post.likeCount} lượt thích</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiMessageCircle />
                  <span>{post.commentCount} bình luận</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="p-6 bg-gradient-to-r from-primary-50 to-purple-50 border-t">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Thích bài viết này? 💜
              </h3>
              <p className="text-gray-600 mb-4">
                Đăng nhập để thích, bình luận và chia sẻ!
              </p>
              <a
                href="/login"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Đăng nhập ngay
              </a>
              <p className="text-sm text-gray-500 mt-3">
                Chưa có tài khoản? {' '}
                <a href="/register" className="text-primary-600 hover:underline font-medium">
                  Đăng ký miễn phí
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center py-8 text-sm text-gray-500">
          <p>Được chia sẻ từ PixShare - Nền tảng chia sẻ file & mạng xã hội</p>
        </div>
      </div>
    </div>
  );
}

