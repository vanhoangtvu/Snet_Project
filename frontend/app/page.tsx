'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LogoIcon, LogoWithText } from '@/components/icons/Icons';
import { 
  FiImage, FiUsers, FiShield, FiZap, FiCloud, FiMessageCircle,
  FiArrowRight, FiCheck, FiStar, FiTrendingUp
} from 'react-icons/fi';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <LogoIcon size={96} className="relative mb-6" />
        </div>
        <LogoWithText size="lg" className="mb-4" />
        <div className="flex gap-2 mt-4">
          <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <LogoWithText size="md" className="cursor-pointer hover:opacity-80 transition-opacity" />
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => router.push('/login')}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 hover:text-primary-600 transition-colors font-medium"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-3 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-medium"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <FiStar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Nền tảng chia sẻ file hàng đầu</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Chia sẻ file
                </span>
                <br />
                <span className="text-gray-900">
                  Nhanh chóng & Bảo mật
                </span>
              </h1>
              
              <p className="text-base sm:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-10 max-w-3xl mx-auto px-4">
                Upload, quản lý và chia sẻ file với bạn bè một cách dễ dàng. 
                Hỗ trợ nhiều định dạng, tốc độ cao, bảo mật tối đa.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
                <button
                  onClick={() => router.push('/register')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  Bắt đầu miễn phí
                  <FiArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold border-2 border-gray-200 hover:border-primary-600 hover:text-primary-600 transition-all"
                >
                  Tìm hiểu thêm
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto">
                {[
                  { icon: FiUsers, label: 'Người dùng', value: '10,000+' },
                  { icon: FiImage, label: 'File đã chia sẻ', value: '1M+' },
                  { icon: FiCloud, label: 'Dung lượng', value: '100TB+' },
                  { icon: FiTrendingUp, label: 'Tăng trưởng', value: '300%' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 mb-2 mx-auto" />
                    <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-base sm:text-xl text-gray-600">
              Mọi thứ bạn cần cho việc chia sẻ file hiệu quả
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: FiImage,
                title: 'Upload đa dạng',
                description: 'Hỗ trợ mọi định dạng file: hình ảnh, video, tài liệu, audio và nhiều hơn nữa',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: FiUsers,
                title: 'Chia sẻ nhóm',
                description: 'Tạo nhóm, chia sẻ file với nhiều người cùng lúc, quản lý quyền truy cập dễ dàng',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: FiShield,
                title: 'Bảo mật cao',
                description: 'Mã hóa dữ liệu end-to-end, xác thực 2 lớp, bảo vệ file của bạn tuyệt đối',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: FiZap,
                title: 'Tốc độ cao',
                description: 'CDN toàn cầu, upload/download siêu nhanh, streaming video mượt mà',
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: FiCloud,
                title: 'Lưu trữ đám mây',
                description: 'Dung lượng lớn, sao lưu tự động, truy cập mọi lúc mọi nơi từ mọi thiết bị',
                color: 'from-indigo-500 to-blue-500'
              },
              {
                icon: FiMessageCircle,
                title: 'Chat realtime',
                description: 'Nhắn tin trực tiếp, thảo luận về file, collaborate hiệu quả với đồng đội',
                color: 'from-red-500 to-pink-500'
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2"
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Gói dịch vụ linh hoạt
            </h2>
            <p className="text-base sm:text-xl text-gray-600">
              Chọn gói phù hợp với nhu cầu của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: 'Free',
                price: '0đ',
                features: [
                  '5GB dung lượng',
                  'Upload file tối đa 100MB',
                  'Chia sẻ cơ bản',
                  'Hỗ trợ email'
                ],
                cta: 'Dùng thử miễn phí',
                popular: false
              },
              {
                name: 'Pro',
                price: '99,000đ',
                period: '/tháng',
                features: [
                  '100GB dung lượng',
                  'Upload file tối đa 5GB',
                  'Chia sẻ không giới hạn',
                  'Chat realtime',
                  'Hỗ trợ ưu tiên',
                  'Không quảng cáo'
                ],
                cta: 'Nâng cấp Pro',
                popular: true
              },
              {
                name: 'Business',
                price: '299,000đ',
                period: '/tháng',
                features: [
                  '1TB dung lượng',
                  'Upload không giới hạn',
                  'Quản lý nhóm nâng cao',
                  'API access',
                  'Báo cáo chi tiết',
                  'Hỗ trợ 24/7'
                ],
                cta: 'Liên hệ sales',
                popular: false
              }
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
                  plan.popular 
                    ? 'border-primary-600 transform scale-105' 
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                      Phổ biến nhất
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                    {plan.name}
                  </h3>
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-3xl sm:text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-base sm:text-lg text-gray-600 mb-1 sm:mb-2">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => router.push('/register')}
                  className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-base sm:text-xl text-purple-100 mb-6 sm:mb-10">
            Tham gia hàng nghìn người dùng đang tin dùng PixShare mỗi ngày
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => router.push('/register')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Đăng ký miễn phí
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-transparent text-white rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold border-2 border-white hover:bg-white hover:text-primary-600 transition-all"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <LogoIcon size={28} className="sm:w-8 sm:h-8" />
                <span className="text-lg sm:text-xl font-bold text-white">PixShare</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400">
                Nền tảng chia sẻ file hàng đầu Việt Nam
              </p>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Sản phẩm</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm sm:text-base hover:text-primary-400 transition-colors">Tính năng</a></li>
                <li><a href="#" className="text-sm sm:text-base hover:text-primary-400 transition-colors">Giá cả</a></li>
                <li><a href="#" className="text-sm sm:text-base hover:text-primary-400 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Công ty</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm sm:text-base hover:text-primary-400 transition-colors">Về chúng tôi</a></li>
                <li><a href="#" className="text-sm sm:text-base hover:text-primary-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm sm:text-base hover:text-primary-400 transition-colors">Liên hệ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Pháp lý</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm sm:text-base hover:text-primary-400 transition-colors">Điều khoản</a></li>
                <li><a href="#" className="text-sm sm:text-base hover:text-primary-400 transition-colors">Bảo mật</a></li>
                <li><a href="#" className="text-sm sm:text-base hover:text-primary-400 transition-colors">Cookie</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-400">
              © 2025 PixShare. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
