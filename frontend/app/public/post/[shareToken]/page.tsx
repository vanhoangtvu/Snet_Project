'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SnetLogo } from '@/components/icons/SnetIcon';
import { FiThumbsUp, FiMessageCircle, FiClock } from 'react-icons/fi';
import VideoEmbed from '@/components/VideoEmbed';

export default function PublicPostPage() {
  const params = useParams();
  const router = useRouter();
  const shareToken = params.shareToken as string;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPost();
  }, [shareToken]);

  const loadPost = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/share/${shareToken}`);
      if (!response.ok) throw new Error('Post not found');
      const data = await response.json();
      setPost(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Không tìm thấy bài viết</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <SnetLogo size="md" className="text-primary-500" />
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </header>

      {/* Post Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          {/* Post Header */}
          <div className="p-4 flex items-center gap-3">
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${post.userId}/avatar?size=medium`}
              alt={post.userDisplayName}
              className="w-12 h-12 rounded-full object-cover bg-gray-700"
              onError={(e) => {
                e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect fill='%236366f1' width='48' height='48'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='white' text-anchor='middle' dy='.3em' font-family='Arial'%3E${post.userDisplayName?.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`;
              }}
            />
            <div className="flex-1">
              <h3 className="font-bold">{post.userDisplayName}</h3>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <FiClock className="w-3 h-3" />
                {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Post Content */}
          <div className="px-4 pb-4">
            <p className="whitespace-pre-wrap break-words">{post.content}</p>
          </div>

          {/* Media */}
          {post.fileUrl && (
            <div className="relative">
              {post.fileType?.startsWith('image/') ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${post.fileUrl}`}
                  alt="Post media"
                  className="w-full max-h-[600px] object-contain bg-black"
                />
              ) : post.fileType?.startsWith('video/') ? (
                <video
                  src={`${process.env.NEXT_PUBLIC_API_URL}${post.fileUrl}`}
                  controls
                  className="w-full max-h-[600px] bg-black"
                />
              ) : null}
            </div>
          )}

          {post.videoUrl && post.videoPlatform && (
            <div className="px-4 pb-4">
              <VideoEmbed url={post.videoUrl} platform={post.videoPlatform} />
            </div>
          )}

          {/* Stats */}
          <div className="px-4 py-3 border-t border-gray-800 flex items-center gap-6 text-gray-400">
            <div className="flex items-center gap-2">
              <FiThumbsUp className="w-5 h-5" />
              <span>{post.likeCount} lượt thích</span>
            </div>
            <div className="flex items-center gap-2">
              <FiMessageCircle className="w-5 h-5" />
              <span>{post.commentCount} bình luận</span>
            </div>
          </div>

          {/* CTA */}
          <div className="px-4 py-4 border-t border-gray-800 bg-gray-800/30">
            <p className="text-center text-sm text-gray-400 mb-3">
              Đăng nhập để thích và bình luận
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors font-semibold"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
