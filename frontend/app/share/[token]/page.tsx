'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useNotification } from '@/contexts/NotificationContext';
import { formatFileSize, formatDate } from '@/lib/utils';

interface ShareInfo {
  id: number;
  shareToken: string;
  shareUrl: string;
  expiresAt?: string;
  maxAccessCount?: number;
  accessCount: number;
  file: {
    id: number;
    fileName: string;
    fileType: string;
    fileSize: number;
    category: string;
    uploadedAt: string;
    uploaderName: string;
  };
}

export default function PublicSharePage() {
  const params = useParams();
  const token = params?.token as string;
  const { success, error: showError, warning, info } = useNotification();
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (token) {
      loadShareInfo();
    }
  }, [token]);

  const loadShareInfo = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api';
      const response = await fetch(`${apiUrl}/public/share/${token}/info`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Link chia sẻ không tồn tại hoặc đã hết hạn');
        } else if (response.status === 403) {
          setError('Link chia sẻ đã đạt giới hạn truy cập');
        } else {
          setError('Không thể tải thông tin file');
        }
        return;
      }

      const data = await response.json();
      setShareInfo(data);

      // Load preview if it's image, video or audio
      if (data.file.category === 'IMAGE' || data.file.category === 'VIDEO' || data.file.category === 'AUDIO') {
        loadPreview(data.file.id);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  const loadPreview = async (fileId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api';
      const response = await fetch(`${apiUrl}/public/share/${token}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error('Failed to load preview:', error);
    }
  };

  const handleDownload = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api';
      const response = await fetch(`${apiUrl}/public/share/${token}`);
      
      if (!response.ok) {
        showError('Tải file thất bại', 'Không thể tải file về máy');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = shareInfo?.file.fileName || 'download';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      showError('Lỗi hệ thống', 'Đã xảy ra lỗi khi tải file');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không thể truy cập</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            🏠 Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  if (!shareInfo) {
    return null;
  }

  const isExpired = shareInfo.expiresAt && new Date(shareInfo.expiresAt) < new Date();
  const isMaxAccess = shareInfo.maxAccessCount ? shareInfo.accessCount >= shareInfo.maxAccessCount : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header with Logo */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl sm:text-2xl">📤</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  PixShare
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">Chia sẻ file an toàn</p>
              </div>
            </div>
            <a
              href="/"
              className="px-4 sm:px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm sm:text-base"
            >
              🏠 Trang chủ
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Preview Section with Enhanced Design */}
          {previewUrl && (
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800">
              {shareInfo.file.category === 'IMAGE' && (
                <div className="p-4 sm:p-8">
                  <img
                    src={previewUrl}
                    alt={shareInfo.file.fileName}
                    className="max-w-full max-h-[400px] sm:max-h-[600px] mx-auto rounded-lg shadow-2xl"
                  />
                </div>
              )}
              {shareInfo.file.category === 'VIDEO' && (
                <div className="relative">
                  <video
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    crossOrigin="anonymous"
                    className="w-full"
                    style={{ maxHeight: '400px' }}
                    onCanPlay={(e) => {
                      const video = e.target as HTMLVideoElement;
                      // Muted autoplay works on Safari iOS
                      video.play().catch(err => console.log('Autoplay prevented:', err));
                    }}
                  >
                    <source src={previewUrl} type={shareInfo.file.fileType || 'video/mp4'} />
                    Trình duyệt không hỗ trợ video.
                  </video>
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black bg-opacity-70 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium">
                    🎬 Video Preview
                  </div>
                </div>
              )}
              {shareInfo.file.category === 'AUDIO' && (
                <div className="p-6 sm:p-12 flex flex-col items-center justify-center">
                  <div className="mb-4 sm:mb-6 text-4xl sm:text-6xl">🎵</div>
                  <audio
                    controls
                    autoPlay
                    src={previewUrl}
                    className="w-full max-w-xl"
                    style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))' }}
                  >
                    Trình duyệt không hỗ trợ audio.
                  </audio>
                </div>
              )}
            </div>
          )}

          {/* File Info Section */}
          <div className="p-4 sm:p-8 lg:p-10">
            {/* File Name */}
            <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3 break-all">
                <span className="text-2xl sm:text-3xl lg:text-4xl flex-shrink-0">
                  {shareInfo.file.category === 'IMAGE' ? '🖼️' : 
                   shareInfo.file.category === 'VIDEO' ? '🎬' :
                   shareInfo.file.category === 'AUDIO' ? '🎵' :
                   shareInfo.file.category === 'DOCUMENT' ? '📄' : '📦'}
                </span>
                <span className="break-words">{shareInfo.file.fileName}</span>
              </h2>
              <p className="text-gray-500 text-sm sm:text-base lg:text-lg">Được chia sẻ bởi <span className="font-semibold text-primary-600">{shareInfo.file.uploaderName}</span></p>
            </div>

            {/* File Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border border-blue-200">
                <p className="text-xs sm:text-sm text-blue-700 font-medium mb-1">Loại file</p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-blue-900 break-all">{shareInfo.file.fileType}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border border-green-200">
                <p className="text-xs sm:text-sm text-green-700 font-medium mb-1">Kích thước</p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-green-900">
                  {formatFileSize(shareInfo.file.fileSize)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border border-purple-200">
                <p className="text-xs sm:text-sm text-purple-700 font-medium mb-1">Ngày upload</p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-purple-900">
                  {formatDate(shareInfo.file.uploadedAt)}
                </p>
              </div>

              {shareInfo.expiresAt && (
                <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border ${isExpired ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'}`}>
                  <p className={`text-xs sm:text-sm font-medium mb-1 ${isExpired ? 'text-red-700' : 'text-yellow-700'}`}>Hết hạn</p>
                  <p className={`text-sm sm:text-base lg:text-lg font-bold ${isExpired ? 'text-red-900' : 'text-yellow-900'}`}>
                    {formatDate(shareInfo.expiresAt)}
                    {isExpired && ' ⚠️'}
                  </p>
                </div>
              )}

              {shareInfo.maxAccessCount && (
                <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border ${isMaxAccess ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' : 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200'}`}>
                  <p className={`text-xs sm:text-sm font-medium mb-1 ${isMaxAccess ? 'text-red-700' : 'text-indigo-700'}`}>Lượt truy cập</p>
                  <p className={`text-sm sm:text-base lg:text-lg font-bold ${isMaxAccess ? 'text-red-900' : 'text-indigo-900'}`}>
                    {shareInfo.accessCount} / {shareInfo.maxAccessCount}
                    {isMaxAccess && ' ⚠️'}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {previewUrl && !isExpired && !isMaxAccess && (
                <button
                  onClick={() => window.open(previewUrl, '_blank')}
                  className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span className="text-xl sm:text-2xl">👁️</span>
                  Xem trước
                </button>
              )}
              <button
                onClick={handleDownload}
                disabled={isExpired || isMaxAccess}
                className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg sm:rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <span className="text-xl sm:text-2xl">⬇️</span>
                Tải xuống
              </button>
            </div>

            {(isExpired || isMaxAccess) && (
              <div className="mt-4 sm:mt-6 bg-red-50 border-2 border-red-300 rounded-lg sm:rounded-xl p-4 sm:p-5">
                <p className="text-red-800 text-center font-semibold text-sm sm:text-base lg:text-lg flex items-center justify-center gap-2">
                  <span className="text-xl sm:text-2xl">⚠️</span>
                  Link chia sẻ này {isExpired ? 'đã hết hạn' : 'đã đạt giới hạn truy cập'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Copyright */}
        <div className="mt-6 sm:mt-8 text-center">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-sm sm:text-lg">📤</span>
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                PixShare
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-1">
              Nền tảng chia sẻ file an toàn và nhanh chóng
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              © 2025 PixShare. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
