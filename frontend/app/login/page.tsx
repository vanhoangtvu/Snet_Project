'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { SnetLogo } from '@/components/icons/SnetIcon';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Hiển thị loading khi đang check auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Đang tải...</div>
      </div>
    );
  }

  // Nếu đã có user, không hiển thị form (đang redirect)
  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left - Hero */}
        <div className="hidden lg:flex items-center justify-center bg-black relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent"></div>
          <div className="text-center space-y-6 z-10 px-8">
            <SnetLogo size="lg" className="text-primary-500 mx-auto" />
            <h2 className="text-5xl font-bold">Chào mừng trở lại</h2>
            <p className="text-xl text-gray-400">Đăng nhập để tiếp tục</p>
          </div>
        </div>

        {/* Right - Form */}
        <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md space-y-6 sm:space-y-8">
            <div className="flex items-center justify-center lg:justify-between lg:hidden mb-6">
              <SnetLogo size="lg" className="text-primary-500" />
              <button
                onClick={() => router.push('/')}
                className="hidden lg:block text-white hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold">Đăng nhập</h1>
              <p className="text-gray-400">Nhập thông tin của bạn để tiếp tục</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3.5 text-base text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  required
                  className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3.5 pr-12 text-base text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 px-6 rounded-full transition-colors disabled:opacity-50 text-base"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-500">hoặc</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-base text-gray-500">
                Chưa có tài khoản?{' '}
                <button
                  onClick={() => router.push('/register')}
                  className="text-primary-500 hover:underline font-semibold"
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>

            <button
              onClick={() => router.push('/')}
              className="hidden lg:block w-full bg-transparent hover:bg-white/5 text-gray-400 font-bold py-3 px-6 rounded-full border border-gray-700 transition-colors text-sm"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
