'use client';

import { useEffect, useState } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show prompt if not dismissed or dismissed more than 7 days ago
    if (!standalone && (!dismissed || daysSinceDismissed > 7)) {
      if (ios) {
        // Show iOS install instructions after 3 seconds
        setTimeout(() => setShowInstallPrompt(true), 3000);
      } else {
        // Listen for beforeinstallprompt event (Android)
        const handler = (e: Event) => {
          e.preventDefault();
          setDeferredPrompt(e as BeforeInstallPromptEvent);
          setShowInstallPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
          window.removeEventListener('beforeinstallprompt', handler);
        };
      }
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed
  if (isStandalone || !showInstallPrompt) {
    return null;
  }

  return (
    <>
      {/* Android/Chrome Install Prompt */}
      {!isIOS && deferredPrompt && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[9999] animate-slide-up">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 sm:p-5">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX size={20} />
            </button>

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
                  <g transform="translate(16, 18)">
                    <rect x="2" y="6" width="28" height="20" rx="4" fill="white" opacity="0.95" />
                    <circle cx="16" cy="16" r="8" fill="#6366f1" />
                    <circle cx="16" cy="16" r="6" fill="#a855f7" />
                    <circle cx="16" cy="16" r="3" fill="white" opacity="0.5" />
                  </g>
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1">
                  Cài đặt PixShare
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Thêm vào màn hình chính để truy cập nhanh hơn
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <FiDownload size={18} />
                    Cài đặt
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    Để sau
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iOS Install Instructions */}
      {isIOS && (
        <div className="fixed bottom-4 left-4 right-4 z-[9999] animate-slide-up">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX size={20} />
            </button>

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
                  <g transform="translate(16, 18)">
                    <rect x="2" y="6" width="28" height="20" rx="4" fill="white" opacity="0.95" />
                    <circle cx="16" cy="16" r="8" fill="#6366f1" />
                    <circle cx="16" cy="16" r="6" fill="#a855f7" />
                    <circle cx="16" cy="16" r="3" fill="white" opacity="0.5" />
                  </g>
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  Cài đặt PixShare
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Thêm vào màn hình chính của bạn:
                </p>

                <ol className="text-sm text-gray-700 space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>Nhấn nút <strong>Chia sẻ</strong> <span className="inline-block">📤</span> ở thanh công cụ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>Chọn <strong>"Thêm vào Màn hình chính"</strong> <span className="inline-block">➕</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>Nhấn <strong>"Thêm"</strong> để hoàn tất</span>
                  </li>
                </ol>

                <button
                  onClick={handleDismiss}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </>
  );
}

