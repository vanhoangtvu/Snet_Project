'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SnetIconLarge, SnetLogo } from '@/components/icons/SnetIcon';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Nếu đã đăng nhập, redirect ngay
    if (!loading && user) {
      setIsRedirecting(true);
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Hiển thị loading khi: đang check auth HOẶC đang redirect
  if (loading || isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-3">
        <SnetIconLarge size={60} className="text-primary-500 animate-pulse" />
        <div className="w-40 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" 
               style={{ width: '40%' }}></div>
        </div>
        <p className="text-gray-400 text-xs animate-pulse">
          {isRedirecting ? 'Đang chuyển hướng...' : 'Đang tải...'}
        </p>
      </div>
    );
  }

  // Chỉ hiển thị landing page khi: không loading VÀ không có user
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left - Hero */}
        <div className="hidden lg:flex items-center justify-center bg-black relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent"></div>
          <SnetIconLarge size={400} className="text-white opacity-10" />
        </div>

        {/* Right - Auth */}
        <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <SnetLogo size="lg" className="text-primary-500" />
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">Trợ lý AI của bạn</h1>
              <p className="text-2xl sm:text-2xl lg:text-3xl font-bold mt-6 sm:mt-8 lg:mt-12">Tham gia ngay hôm nay.</p>
            </div>

            <div className="space-y-4 mt-8 sm:mt-10 lg:mt-12">
              <button
                onClick={() => router.push('/register')}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 px-6 rounded-full transition-colors text-base sm:text-lg"
              >
                Tạo tài khoản
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm sm:text-base">
                  <span className="px-2 bg-black text-gray-500">hoặc</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/login')}
                className="w-full bg-transparent hover:bg-primary-500/10 text-primary-500 font-bold py-3.5 px-6 rounded-full border border-gray-700 transition-colors text-base sm:text-lg"
              >
                Đăng nhập
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6 sm:mt-8">
              Bằng cách đăng ký, bạn đồng ý với{' '}
              <a href="#" className="text-primary-500 hover:underline">Điều khoản dịch vụ</a>
              {' '}và{' '}
              <a href="#" className="text-primary-500 hover:underline">Chính sách quyền riêng tư</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
