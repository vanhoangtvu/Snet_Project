'use client';

import { useState, useEffect } from 'react';
import { FiX, FiCopy, FiCheck, FiDownload } from 'react-icons/fi';

interface SharePostModalProps {
  postId: number;
  onClose: () => void;
}

export default function SharePostModal({ postId, onClose }: SharePostModalProps) {
  const [shareData, setShareData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    generateShare();
    loadFriends();
  }, [postId]);

  const loadFriends = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friends`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setFriends(data);
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const sendToFriends = async () => {
    if (selectedFriends.length === 0) {
      alert('Vui lòng chọn bạn bè để chia sẻ');
      return;
    }

    setSending(true);
    try {
      for (const friendId of selectedFriends) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            receiverId: friendId,
            content: JSON.stringify({ postId, shareUrl: shareData.shareUrl }),
            type: 'POST_SHARE'
          })
        });
      }
      alert(`Đã gửi cho ${selectedFriends.length} bạn bè!`);
      onClose();
    } catch (error) {
      console.error('Failed to send:', error);
      alert('Có lỗi khi gửi. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  };

  const generateShare = async () => {
    setLoading(true);
    try {
      console.log('Generating share for post:', postId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Share response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Share error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Share data:', data);
      setShareData(data);
      
      const qrUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/posts/share/${data.shareToken}/qrcode`;
      console.log('QR code URL:', qrUrl);
      
    } catch (error) {
      console.error('Failed to generate share:', error);
      alert(`Không thể tạo link chia sẻ: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (shareData?.shareUrl) {
      navigator.clipboard.writeText(shareData.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQR = () => {
    if (shareData?.shareToken) {
      const link = document.createElement('a');
      link.href = `${process.env.NEXT_PUBLIC_API_URL}/api/posts/share/${shareData.shareToken}/qrcode`;
      link.download = `post-${postId}-qr.png`;
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full border border-gray-700 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-base md:text-lg font-bold">Chia sẻ bài viết</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 md:p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : shareData ? (
            <div className="space-y-4 md:space-y-6">
              {/* QR Code */}
              <div className="flex flex-col items-center">
                {qrError ? (
                  <div className="bg-white p-4 rounded-xl w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <p className="text-xs md:text-sm mb-2">⚠️ QR code không khả dụng</p>
                      <button
                        onClick={() => {
                          setQrError(false);
                          generateShare();
                        }}
                        className="text-xs text-primary-500 hover:underline"
                      >
                        Thử lại
                      </button>
                    </div>
                  </div>
                ) : shareData.shareToken ? (
                  <div className="bg-white p-3 md:p-4 rounded-xl">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/api/posts/share/${shareData.shareToken}/qrcode?t=${Date.now()}`}
                      alt="QR Code"
                      className="w-48 h-48 md:w-64 md:h-64 object-contain"
                      onError={(e) => {
                        console.error('QR code failed to load from:', e.currentTarget.src);
                        setQrError(true);
                      }}
                      onLoad={() => {
                        console.log('✅ QR code loaded successfully');
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-xl w-48 h-48 md:w-64 md:h-64 flex items-center justify-center text-gray-500">
                    Đang tạo QR code...
                  </div>
                )}
                <p className="text-xs md:text-sm text-gray-400 mt-2 md:mt-3 text-center">
                  Quét mã QR để xem bài viết
                </p>
              </div>

              {/* Share Link */}
              <div>
                <label className="text-xs md:text-sm text-gray-400 mb-2 block">Link chia sẻ</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareData.shareUrl}
                    readOnly
                    className="flex-1 bg-white/5 border border-gray-700 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:border-primary-500"
                  />
                  <button
                    onClick={copyLink}
                    className="px-3 md:px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
                  >
                    {copied ? (
                      <>
                        <FiCheck className="w-4 h-4" />
                        <span className="text-xs md:text-sm hidden md:inline">Đã copy</span>
                      </>
                    ) : (
                      <>
                        <FiCopy className="w-4 h-4" />
                        <span className="text-xs md:text-sm hidden md:inline">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Download QR */}
              <button
                onClick={downloadQR}
                className="w-full py-2.5 md:py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <FiDownload className="w-4 h-4 md:w-5 md:h-5" />
                <span>Tải xuống mã QR</span>
              </button>

              {/* Share with Friends */}
              <div className="border-t border-gray-700 pt-3 md:pt-4">
                <label className="text-xs md:text-sm text-gray-400 mb-2 block">Gửi cho bạn bè</label>
                <div className="max-h-32 md:max-h-40 overflow-y-auto space-y-2 mb-3">
                  {friends.length === 0 ? (
                    <p className="text-xs md:text-sm text-gray-500 text-center py-4">Chưa có bạn bè</p>
                  ) : (
                    friends.map((friend: any) => (
                      <label key={friend.id} className="flex items-center gap-2 md:gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFriends.includes(friend.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFriends([...selectedFriends, friend.id]);
                            } else {
                              setSelectedFriends(selectedFriends.filter(id => id !== friend.id));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-xs md:text-sm">{friend.displayName}</span>
                      </label>
                    ))
                  )}
                </div>
                {selectedFriends.length > 0 && (
                  <button
                    onClick={sendToFriends}
                    disabled={sending}
                    className="w-full py-2.5 md:py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 rounded-lg transition-colors text-sm md:text-base"
                  >
                    {sending ? 'Đang gửi...' : `Gửi cho ${selectedFriends.length} bạn bè`}
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs md:text-sm text-gray-400 pt-3 md:pt-4 border-t border-gray-700">
                <span>Lượt xem: {shareData.accessCount}</span>
                <span className="hidden md:inline">Tạo lúc: {new Date(shareData.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              Không thể tạo link chia sẻ
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
