'use client';

import { useAuth } from '@/contexts/AuthContext';
import { FiTool, FiMail, FiAlertCircle, FiPhone } from 'react-icons/fi';
import { HiOutlineUserGroup } from 'react-icons/hi';

export default function GroupChatPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Animated Header */}
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 p-8 sm:p-12 text-white overflow-hidden">
            {/* Animated background shapes */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-200 rounded-full blur-3xl animate-float-delayed"></div>
            </div>

            {/* Icon với animation */}
            <div className="relative flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white bg-opacity-20 backdrop-blur-md rounded-3xl flex items-center justify-center animate-bounce-slow shadow-2xl">
                  <HiOutlineUserGroup className="w-12 h-12 sm:w-16 sm:h-16" />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-white opacity-20 rounded-3xl blur-xl animate-pulse"></div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-3">
              Nhóm Chat
            </h1>
            <p className="text-center text-purple-100 text-base sm:text-lg">
              Tính năng đang được phát triển
            </p>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 lg:p-10 space-y-6">
            {/* Under Development Notice */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <FiTool className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <FiAlertCircle className="w-5 h-5 text-yellow-600" />
                    Đang phát triển
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Chúng tôi đang nỗ lực hoàn thiện tính năng <strong>Nhóm Chat</strong> để mang đến trải nghiệm tốt nhất cho bạn. 
                    Tính năng sẽ sớm được ra mắt với nhiều cải tiến và tính năng mới.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Admin Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiMail className="w-5 h-5 text-primary-600" />
                Liên hệ Admin
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Nếu bạn cần hỗ trợ hoặc có thắc mắc, vui lòng liên hệ với chúng tôi:
              </p>

              {/* Contact Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Email Card */}
                <a
                  href="mailto:nguyenhohoang4556z@gmail.com"
                  className="group bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:border-blue-400 rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <FiMail className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-800">Email</span>
                  </div>
                  <p className="text-sm text-gray-600 break-all">
                    nguyenhoang4556z@gmail.com
                  </p>
                </a>

                {/* Phone Card */}
                <a
                  href="tel:0889559357"
                  className="group bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-400 rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <FiPhone className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-800">Điện thoại</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    0889559357
                  </p>
                </a>
              </div>
            </div>

            {/* Alternative Features */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                💡 Trong thời gian chờ đợi
              </h3>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                Bạn có thể sử dụng các tính năng khác của PixShare:
              </p>
              <div className="space-y-2">
                <a
                  href="/dashboard/chat"
                  className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-purple-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    💬
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                      Trò chuyện 1-1
                    </p>
                    <p className="text-xs text-gray-500">Chat trực tiếp với bạn bè</p>
                  </div>
                </a>
                <a
                  href="/dashboard/feed"
                  className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-purple-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    📰
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                      Bảng tin
                    </p>
                    <p className="text-xs text-gray-500">Chia sẻ và xem bài viết</p>
                  </div>
                </a>
                <a
                  href="/dashboard/files"
                  className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-purple-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    📁
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                      Quản lý File
                    </p>
                    <p className="text-xs text-gray-500">Tải lên và chia sẻ file</p>
                  </div>
                </a>
              </div>
            </div>

            {/* User Info (if admin) */}
            {user?.role === 'ADMIN' && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white text-lg">👑</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Admin Mode</p>
                    <p className="text-xs text-gray-600">Bạn đang xem trang này với quyền Admin</p>
                  </div>
                </div>
              </div>
            )}

            {/* Back Button */}
            <div className="pt-4">
              <a
                href="/dashboard"
                className="block w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl text-center hover:shadow-xl hover:scale-105 transition-all"
              >
                ← Quay lại Dashboard
              </a>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Cảm ơn bạn đã sử dụng PixShare! 💜
        </p>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
