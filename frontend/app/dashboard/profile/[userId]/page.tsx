'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { apiService } from '@/lib/api';
import { formatFileSize } from '@/lib/utils';
import { 
  VerifiedIcon,
  PhoneIcon,
  CalendarIcon,
  LocationIcon,
  WorkIcon,
  EducationIcon,
  WebsiteIcon,
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  LinkedinIcon,
  HomeLocationIcon,
  HeartIcon,
  LanguageIcon,
  InterestsIcon,
  GenderMaleIcon,
  GenderFemaleIcon,
  GenderOtherIcon
} from '@/components/icons/Icons';

interface UserProfile {
  id: number;
  email: string;
  displayName: string;
  role: string;
  status: string;
  storageQuota: number;
  storageUsed: number;
  online: boolean;
  verified: boolean;
  lastSeen: string | null;
  createdAt: string;
  bio?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  location?: string;
  website?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  currentJob?: string;
  company?: string;
  school?: string;
  university?: string;
  hometown?: string;
  relationshipStatus?: string;
  languages?: string;
  interests?: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { success, error: showError, warning, info } = useNotification();
  const userId = params?.userId ? parseInt(params.userId as string) : null;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);
  const [coverKey, setCoverKey] = useState(0);
  const [hasAvatar, setHasAvatar] = useState(true);
  const [hasCoverPhoto, setHasCoverPhoto] = useState(true);

  useEffect(() => {
    if (userId) {
      // Nếu là chính mình, redirect về /dashboard/profile
      if (currentUser && userId === currentUser.id) {
        router.push('/dashboard/profile');
        return;
      }
      loadProfile();
      checkFriendship();
    }
  }, [userId, currentUser]);

  const loadProfile = async () => {
    if (!userId) return;
    
    try {
      const data = await apiService.getUserProfile(userId);
      setProfile(data);
      setHasAvatar(true);
      setHasCoverPhoto(true);
    } catch (error) {
      console.error('Failed to load profile:', error);
      showError('Không thể tải dữ liệu', 'Không thể tải hồ sơ người dùng');
      router.push('/dashboard/friends');
    } finally {
      setLoading(false);
    }
  };

  const checkFriendship = async () => {
    if (!userId) return;
    
    try {
      const friends = await apiService.getFriendsList();
      const isFriendUser = friends.some((f: any) => f.id === userId);
      setIsFriend(isFriendUser);
    } catch (error) {
      console.error('Failed to check friendship:', error);
    }
  };

  const handleSendMessage = () => {
    router.push(`/dashboard/chat?user=${userId}`);
  };

  const handleAddFriend = async () => {
    if (!userId) return;
    
    try {
      await apiService.sendFriendRequest(userId);
      success('Gửi lời mời thành công', 'Lời mời kết bạn đã được gửi!');
    } catch (error: any) {
      showError('Gửi lời mời thất bại', error.response?.data?.message || 'Không thể gửi lời mời kết bạn');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy người dùng</h1>
        <button
          onClick={() => router.push('/dashboard/friends')}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Quay lại danh sách bạn bè
        </button>
      </div>
    );
  }

  const storagePercent = Math.min((profile.storageUsed / profile.storageQuota) * 100, 100);
  const coverUrl = `${apiService.getUserCoverPhoto(profile.id)}?t=${coverKey}&cache=${Date.now()}`;
  const avatarUrl = `${apiService.getUserAvatar(profile.id)}?t=${avatarKey}&cache=${Date.now()}`;

  return (
    <div className="max-w-5xl mx-auto pb-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
      >
        ← Quay lại
      </button>

      {/* Cover Photo Section */}
      <div className="bg-white rounded-t-lg shadow-lg overflow-hidden">
        <div className="relative">
          {/* Cover Photo */}
          <div className="relative h-72 bg-gradient-to-r from-primary-500 to-primary-700 overflow-hidden">
            {hasCoverPhoto ? (
              <img
                key={`cover-${coverKey}-${profile.id}`}
                src={coverUrl}
                alt="Cover"
                className="w-full h-full object-cover absolute inset-0 z-10"
                onError={() => {
                  console.log('❌ Cover photo load failed');
                  setHasCoverPhoto(false);
                }}
                onLoad={() => {
                  console.log('✅ Cover photo loaded');
                  setHasCoverPhoto(true);
                }}
              />
            ) : null}
          </div>

          {/* Avatar & Name Section */}
          <div className="px-4 sm:px-8 pb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
              {/* Avatar */}
              <div className="relative z-20">
                {hasAvatar ? (
                  <img
                    key={`avatar-${avatarKey}-${profile.id}`}
                    src={avatarUrl}
                    alt={profile.displayName}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-xl object-cover bg-white"
                    onError={() => {
                      console.log('❌ Avatar load failed');
                      setHasAvatar(false);
                    }}
                    onLoad={() => {
                      console.log('✅ Avatar loaded');
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-xl bg-primary-500 text-white flex items-center justify-center text-4xl sm:text-5xl font-bold">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mb-0 sm:mb-4 flex gap-2 flex-shrink-0">
                {isFriend && (
                  <button
                    onClick={handleSendMessage}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold shadow-md transition-colors flex items-center gap-2 text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                    Nhắn tin
                  </button>
                )}
                {!isFriend && (
                  <button
                    onClick={handleAddFriend}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-colors flex items-center gap-2 text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    Kết bạn
                  </button>
                )}
              </div>
            </div>

            {/* Name and Bio */}
            <div className="mt-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 mb-2 justify-center sm:justify-start">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{profile.displayName}</h1>
                {profile.verified && (
                  <VerifiedIcon size={24} className="text-blue-500 sm:w-7 sm:h-7" />
                )}
                {profile.online && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                    Đang online
                  </span>
                )}
              </div>
              {profile.bio && (
                <p className="text-gray-600 text-base sm:text-lg mb-2">{profile.bio}</p>
              )}
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 justify-center sm:justify-start">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <LocationIcon className="text-gray-500" size={16} />
                    {profile.location}
                  </span>
                )}
                {profile.createdAt && (
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="text-gray-500" size={16} />
                    Tham gia {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs/Navigation */}
        <div className="border-t border-gray-200">
          <div className="px-4 sm:px-8 flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide">
            <button className="px-3 sm:px-4 py-3 sm:py-4 border-b-2 border-primary-600 text-primary-600 font-semibold text-sm sm:text-base whitespace-nowrap">
              Thông tin
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 sm:px-0">
        {/* Left Column - Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Personal Info Card */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Thông tin cá nhân</h3>
            <div className="space-y-3">
              {profile.phoneNumber && (
                <div className="flex items-center gap-3 text-gray-700">
                  <PhoneIcon className="text-gray-500" size={20} />
                  <span>{profile.phoneNumber}</span>
                </div>
              )}
              {profile.dateOfBirth && (
                <div className="flex items-center gap-3 text-gray-700">
                  <CalendarIcon className="text-gray-500" size={20} />
                  <span>{new Date(profile.dateOfBirth).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
              {profile.gender && (
                <div className="flex items-center gap-3 text-gray-700">
                  {profile.gender === 'Male' ? (
                    <GenderMaleIcon className="text-blue-500" size={20} />
                  ) : profile.gender === 'Female' ? (
                    <GenderFemaleIcon className="text-pink-500" size={20} />
                  ) : (
                    <GenderOtherIcon className="text-gray-500" size={20} />
                  )}
                  <span>{profile.gender === 'Male' ? 'Nam' : profile.gender === 'Female' ? 'Nữ' : 'Khác'}</span>
                </div>
              )}
              {profile.email && (
                <div className="flex items-center gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <span className="break-all">{profile.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Work & Education Card */}
          {((profile as any).currentJob || (profile as any).company || (profile as any).school || (profile as any).university) && (
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <WorkIcon className="text-gray-600" size={20} />
                Công việc & Học vấn
              </h3>
              <div className="space-y-3">
                {(profile as any).currentJob && (
                  <div className="flex items-start gap-3 text-gray-700">
                    <WorkIcon className="text-gray-500 mt-0.5" size={20} />
                    <div>
                      <div className="font-semibold">{(profile as any).currentJob}</div>
                      {(profile as any).company && (
                        <div className="text-sm text-gray-500">tại {(profile as any).company}</div>
                      )}
                    </div>
                  </div>
                )}
                {(profile as any).university && (
                  <div className="flex items-start gap-3 text-gray-700">
                    <span className="text-lg">🎓</span>
                    <div>
                      <div className="font-semibold">Đại học</div>
                      <div className="text-sm text-gray-600">{(profile as any).university}</div>
                    </div>
                  </div>
                )}
                {(profile as any).school && (
                  <div className="flex items-start gap-3 text-gray-700">
                    <span className="text-lg">�</span>
                    <div>
                      <div className="font-semibold">Trung học</div>
                      <div className="text-sm text-gray-600">{(profile as any).school}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Personal Info Card */}
          {((profile as any).hometown || (profile as any).relationshipStatus || (profile as any).languages) && (
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">� Thông tin khác</h3>
              <div className="space-y-3">
                {(profile as any).hometown && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <span className="text-lg">🏠</span>
                    <div>
                      <div className="text-sm text-gray-500">Quê quán</div>
                      <div className="font-medium">{(profile as any).hometown}</div>
                    </div>
                  </div>
                )}
                {(profile as any).relationshipStatus && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <span className="text-lg">💑</span>
                    <div>
                      <div className="text-sm text-gray-500">Tình trạng</div>
                      <div className="font-medium">{
                        (profile as any).relationshipStatus === 'Single' ? 'Độc thân' :
                        (profile as any).relationshipStatus === 'In a relationship' ? 'Đang hẹn hò' :
                        (profile as any).relationshipStatus === 'Engaged' ? 'Đã đính hôn' :
                        (profile as any).relationshipStatus === 'Married' ? 'Đã kết hôn' :
                        (profile as any).relationshipStatus === 'Complicated' ? 'Phức tạp' :
                        (profile as any).relationshipStatus === 'Open relationship' ? 'Quan hệ mở' :
                        (profile as any).relationshipStatus
                      }</div>
                    </div>
                  </div>
                )}
                {(profile as any).languages && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <span className="text-lg">🗣️</span>
                    <div>
                      <div className="text-sm text-gray-500">Ngôn ngữ</div>
                      <div className="font-medium">{(profile as any).languages}</div>
                    </div>
                  </div>
                )}
                {(profile as any).interests && (
                  <div className="flex items-start gap-3 text-gray-700">
                    <span className="text-lg">🎯</span>
                    <div>
                      <div className="text-sm text-gray-500">Sở thích</div>
                      <div className="font-medium">{(profile as any).interests}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Links Card */}
          {(profile.website || profile.facebookUrl || profile.instagramUrl || profile.twitterUrl || profile.linkedinUrl) && (
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">🔗 Mạng xã hội</h3>
              <div className="space-y-3">
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-3 text-primary-600 hover:text-primary-700">
                    <span className="text-lg">🌐</span>
                    <span className="hover:underline truncate">{profile.website}</span>
                  </a>
                )}
                {profile.facebookUrl && (
                  <a href={profile.facebookUrl} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-3 text-blue-600 hover:text-blue-700">
                    <span className="text-lg">📘</span>
                    <span className="hover:underline truncate">Facebook</span>
                  </a>
                )}
                {profile.instagramUrl && (
                  <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-3 text-pink-600 hover:text-pink-700">
                    <span className="text-lg">📷</span>
                    <span className="hover:underline truncate">Instagram</span>
                  </a>
                )}
                {profile.twitterUrl && (
                  <a href={profile.twitterUrl} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-3 text-sky-600 hover:text-sky-700">
                    <span className="text-lg">🐦</span>
                    <span className="hover:underline truncate">Twitter</span>
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-3 text-blue-700 hover:text-blue-800">
                    <span className="text-lg">💼</span>
                    <span className="hover:underline truncate">LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Account Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Account Info */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Thông tin tài khoản</h3>
            
            <div className="space-y-4">
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vai trò
                </label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                  profile.role === 'ADMIN' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {profile.role === 'ADMIN' ? '👑 Quản trị viên' : '👤 Người dùng'}
                </span>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                  profile.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {profile.status === 'ACTIVE' ? '✅ Hoạt động' : '🔒 Bị khóa'}
                </span>
              </div>

              {/* Last Seen */}
              {!profile.online && profile.lastSeen && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lần truy cập cuối
                  </label>
                  <p className="text-gray-600">
                    {new Date(profile.lastSeen).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}

              {/* Storage (Only for friends or admin) */}
              {(isFriend || currentUser?.role === 'ADMIN') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dung lượng lưu trữ
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        {formatFileSize(profile.storageUsed)} / {formatFileSize(profile.storageQuota)}
                      </span>
                      <span className="text-sm font-semibold text-primary-600">
                        {storagePercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          storagePercent > 90 
                            ? 'bg-red-500' 
                            : storagePercent > 70 
                            ? 'bg-yellow-500' 
                            : 'bg-primary-600'
                        }`}
                        style={{ width: `${storagePercent}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Còn lại: {formatFileSize(profile.storageQuota - profile.storageUsed)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              <span>
                <strong>Thông tin công khai:</strong> Tất cả thông tin trên trang này đều được người dùng thiết lập là công khai và có thể xem bởi mọi người.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
