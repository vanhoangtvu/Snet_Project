'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

export default function SharePageClient({ token }: { token: string }) {
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [token]);

  const loadPost = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/share/${token}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
        
        // Update meta tags dynamically
        if (data) {
          const title = `${data.author?.displayName || 'Người dùng'} trên SNet`;
          const description = data.content?.substring(0, 200) || 'Xem bài viết trên SNet';
          const image = data.fileUrl || 'https://snet.io.vn/logo.png';
          
          document.title = title;
          updateMetaTag('description', description);
          updateMetaTag('og:title', title, 'property');
          updateMetaTag('og:description', description, 'property');
          updateMetaTag('og:image', image, 'property');
          updateMetaTag('og:url', window.location.href, 'property');
          updateMetaTag('twitter:title', title);
          updateMetaTag('twitter:description', description);
          updateMetaTag('twitter:image', image);
        }
      }
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMetaTag = (name: string, content: string, attr: string = 'name') => {
    let element = document.querySelector(`meta[${attr}="${name}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attr, name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-4">Bài viết không tồn tại</p>
          <button onClick={() => router.push('/')} className="text-primary-500 hover:underline">
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold">
              {post.author?.displayName?.[0] || 'U'}
            </div>
            <div>
              <p className="font-semibold">{post.author?.displayName}</p>
              <p className="text-sm text-gray-400">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
          
          <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
          
          {post.fileUrl && (
            <div className="rounded-lg overflow-hidden">
              {post.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={post.fileUrl} alt="Post" className="w-full" />
              ) : post.fileUrl.match(/\.(mp4|webm)$/i) ? (
                <video src={post.fileUrl} controls className="w-full" />
              ) : null}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-800 text-center">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              Mở SNet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
