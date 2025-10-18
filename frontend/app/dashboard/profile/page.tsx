'use client';

import { useEffect, useState, useRef } from 'react';
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

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { success, error, warning } = useNotification();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);
  const [coverKey, setCoverKey] = useState(0);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaGB, setQuotaGB] = useState('5');
  
  // New profile fields
  const [bio, setBio] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  
  // Additional profile fields
  const [currentJob, setCurrentJob] = useState('');
  const [company, setCompany] = useState('');
  const [school, setSchool] = useState('');
  const [university, setUniversity] = useState('');
  const [hometown, setHometown] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState('');
  const [languages, setLanguages] = useState('');
  const [interests, setInterests] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setBio(user.bio || '');
      setPhoneNumber(user.phoneNumber || '');
      setDateOfBirth(user.dateOfBirth || '');
      setGender(user.gender || '');
      setLocation(user.location || '');
      setWebsite(user.website || '');
      setFacebookUrl(user.facebookUrl || '');
      setInstagramUrl(user.instagramUrl || '');
      setTwitterUrl(user.twitterUrl || '');
      setLinkedinUrl(user.linkedinUrl || '');
      setCurrentJob(user.currentJob || '');
      setCompany(user.company || '');
      setSchool(user.school || '');
      setUniversity(user.university || '');
      setHometown(user.hometown || '');
      setRelationshipStatus(user.relationshipStatus || '');
      setLanguages(user.languages || '');
      setInterests(user.interests || '');
    }
  }, [user]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverPhoto(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('displayName', displayName);
      if (avatar) {
        formData.append('avatar', avatar);
      }
      if (coverPhoto) {
        formData.append('coverPhoto', coverPhoto);
      }
      
      // Add new fields
      if (bio) formData.append('bio', bio);
      if (phoneNumber) formData.append('phoneNumber', phoneNumber);
      if (dateOfBirth) formData.append('dateOfBirth', dateOfBirth);
      if (gender) formData.append('gender', gender);
      if (location) formData.append('location', location);
      if (website) formData.append('website', website);
      if (facebookUrl) formData.append('facebookUrl', facebookUrl);
      if (instagramUrl) formData.append('instagramUrl', instagramUrl);
      if (twitterUrl) formData.append('twitterUrl', twitterUrl);
      if (linkedinUrl) formData.append('linkedinUrl', linkedinUrl);
      if (currentJob) formData.append('currentJob', currentJob);
      if (company) formData.append('company', company);
      if (school) formData.append('school', school);
      if (university) formData.append('university', university);
      if (hometown) formData.append('hometown', hometown);
      if (relationshipStatus) formData.append('relationshipStatus', relationshipStatus);
      if (languages) formData.append('languages', languages);
      if (interests) formData.append('interests', interests);

      console.log('📤 Sending profile update...');
      if (coverPhoto) {
        console.log('📸 Cover photo included:', coverPhoto.name, coverPhoto.size, 'bytes');
      }
      
      const updatedUser = await apiService.updateProfile(formData);
      console.log('✅ Profile updated:', updatedUser);
      
      setUser(updatedUser);
      setEditing(false);
      setAvatar(null);
      setCoverPhoto(null);
      setAvatarPreview('');
      setCoverPreview('');
      
      // Force reload images
      setAvatarKey(prev => prev + 1);
      setCoverKey(prev => prev + 1);
      
      // Small delay to ensure database is updated
      setTimeout(() => {
        setAvatarKey(prev => prev + 1);
        setCoverKey(prev => prev + 1);
      }, 500);
      
      success('Cập nhật thành công', 'Hồ sơ của bạn đã được cập nhật');
    } catch (error: any) {
      console.error('❌ Update failed:', error);
      error('Cập nhật thất bại', error.response?.data?.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (user) {
      setDisplayName(user.displayName);
      setBio(user.bio || '');
      setPhoneNumber(user.phoneNumber || '');
      setDateOfBirth(user.dateOfBirth || '');
      setGender(user.gender || '');
      setLocation(user.location || '');
      setWebsite(user.website || '');
      setFacebookUrl(user.facebookUrl || '');
      setInstagramUrl(user.instagramUrl || '');
      setTwitterUrl(user.twitterUrl || '');
      setLinkedinUrl(user.linkedinUrl || '');
    }
    setAvatar(null);
    setCoverPhoto(null);
    setAvatarPreview('');
    setCoverPreview('');
  };

  const handleUpdateQuota = () => {
    if (!user) return;
    const currentGB = (user.storageQuota / (1024 * 1024 * 1024)).toFixed(2);
    setQuotaGB(currentGB);
    setShowQuotaModal(true);
  };

  const handleSubmitQuota = async () => {
    if (!user) return;
    
    const gb = parseFloat(quotaGB);
    if (isNaN(gb) || gb <= 0) {
      warning('Dữ liệu không hợp lệ', 'Vui lòng nhập số GB hợp lệ (lớn hơn 0)');
      return;
    }

    if (gb > 10000) {
      warning('Vượt quá giới hạn', 'Dung lượng tối đa là 10000 GB (10 TB)');
      return;
    }

    try {
      const quotaBytes = Math.floor(gb * 1024 * 1024 * 1024);
      await apiService.updateUserQuota(user.id, quotaBytes);
      
      // Reload user data
      const updatedUser = await apiService.getCurrentUser();
      setUser(updatedUser);
      
      setShowQuotaModal(false);
      success('Cập nhật thành công', `Dung lượng đã được cập nhật thành ${gb} GB`);
    } catch (error: any) {
      error('Cập nhật thất bại', error.response?.data?.message || 'Không thể cập nhật dung lượng');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const storagePercent = Math.min((user.storageUsed / user.storageQuota) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Hồ sơ cá nhân 👤</h1>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header with cover */}
        <div className="relative h-80 bg-gradient-to-r from-primary-500 to-primary-700">
          {coverPreview ? (
            <img
              src={coverPreview}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              key={coverKey}
              src={`${apiService.getUserCoverPhoto(user.id)}?t=${coverKey}`}
              alt="Cover"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          )}
          
          {editing && (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-4 right-4 bg-white rounded-lg px-4 py-2 shadow-lg hover:bg-gray-100 font-semibold flex items-center gap-2"
              title="Thay đổi ảnh bìa"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 15.5c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5zM17 7h-3.18l-.9-.9C12.73 5.91 12.38 5.75 12 5.75H8.82c-.38 0-.73.16-.92.35L7 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-5 10c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
              </svg>
              Thay đổi ảnh bìa
            </button>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverSelect}
            className="hidden"
          />
        </div>

        {/* Profile Content */}
        <div className="px-8 pb-8">
          {/* Avatar Section */}
          <div className="flex items-end -mt-16 mb-6">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <img
                  key={avatarKey}
                  src={`${apiService.getUserAvatar(user.id)}?t=${avatarKey}`}
                  alt={user.displayName}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-primary-500"
                  onError={(e) => {
                    // If avatar fails to load, show default initial
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.avatar-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'avatar-fallback w-32 h-32 rounded-full border-4 border-white shadow-lg bg-primary-500 text-white flex items-center justify-center text-4xl font-bold';
                      fallback.textContent = user.displayName.charAt(0).toUpperCase();
                      parent.appendChild(fallback);
                    }
                  }}
                />
              )}
              
              {editing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                  title="Đổi ảnh đại diện"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 15.5c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5zM17 7h-3.18l-.9-.9C12.73 5.91 12.38 5.75 12 5.75H8.82c-.38 0-.73.16-.92.35L7 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-5 10c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                  </svg>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
              />
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="ml-auto mb-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                Chỉnh sửa
              </button>
            )}
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên hiển thị
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-lg text-gray-900">{user.displayName}</p>
                    {user.verified && (
                      <VerifiedIcon size={20} className="text-blue-500" />
                    )}
                  </div>
                )}
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <p className="text-lg text-gray-900">{user.email}</p>
              </div>

              {/* Bio */}
              {editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới thiệu bản thân
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder="Viết vài dòng về bản thân..."
                  />
                </div>
              )}

              {/* Personal Information */}
              {editing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới tính
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nơi ở hiện tại
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Thành phố, Quốc gia"
                    />
                  </div>
                </div>
              )}

              {/* Professional Information */}
              {editing && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin nghề nghiệp</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Công việc hiện tại
                      </label>
                      <input
                        type="text"
                        value={currentJob}
                        onChange={(e) => setCurrentJob(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Ví dụ: Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Công ty
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Tên công ty"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trường học
                      </label>
                      <input
                        type="text"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Trường phổ thông"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đại học
                      </label>
                      <input
                        type="text"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Trường đại học"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links */}
              {editing && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Liên kết mạng xã hội</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website cá nhân
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook
                      </label>
                      <input
                        type="url"
                        value={facebookUrl}
                        onChange={(e) => setFacebookUrl(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="https://facebook.com/username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram
                      </label>
                      <input
                        type="url"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="https://instagram.com/username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Twitter
                      </label>
                      <input
                        type="url"
                        value={twitterUrl}
                        onChange={(e) => setTwitterUrl(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {editing && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin khác</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quê quán
                      </label>
                      <input
                        type="text"
                        value={hometown}
                        onChange={(e) => setHometown(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Nơi sinh"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tình trạng hôn nhân
                      </label>
                      <select
                        value={relationshipStatus}
                        onChange={(e) => setRelationshipStatus(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Chọn tình trạng</option>
                        <option value="Độc thân">Độc thân</option>
                        <option value="Đang hẹn hò">Đang hẹn hò</option>
                        <option value="Đã kết hôn">Đã kết hôn</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngôn ngữ
                      </label>
                      <input
                        type="text"
                        value={languages}
                        onChange={(e) => setLanguages(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Tiếng Việt, English, 日本語"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sở thích
                      </label>
                      <input
                        type="text"
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Đọc sách, Du lịch, Âm nhạc"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vai trò
                </label>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                  user.role === 'ADMIN' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'ADMIN' ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 16L3 5l5.5-3 5.5 3 5.5-3L21 5l-2 11H5zm2.7-2h8.6l.9-5.4-3.1-1.7-3.1 1.7L7.7 14z"/>
                      </svg>
                      Quản trị viên
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      Người dùng
                    </>
                  )}
                </span>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái tài khoản
                </label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                  user.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.status === 'ACTIVE' ? '✅ Hoạt động' : '🔒 Bị khóa'}
                </span>
              </div>

              {/* Storage Info */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Dung lượng lưu trữ
                  </label>
                  {user.role === 'ADMIN' && (
                    <button
                      onClick={handleUpdateQuota}
                      className="text-xs px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                      ✏️ Chỉnh sửa
                    </button>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      {formatFileSize(user.storageUsed)} / {formatFileSize(user.storageQuota)}
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
                    Còn lại: {formatFileSize(user.storageQuota - user.storageUsed)}
                  </p>
                </div>
              </div>

              {/* Personal Information Display - Read Only */}
              {!editing && (
                <div className="space-y-4">
                  {/* Bio */}
                  {user.bio && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giới thiệu bản thân
                      </label>
                      <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{user.bio}</p>
                    </div>
                  )}

                  {/* Personal Info */}
                  {(user.phoneNumber || user.dateOfBirth || user.gender || user.location) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thông tin cá nhân
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        {user.phoneNumber && (
                          <div className="flex items-center gap-3">
                            <PhoneIcon className="text-gray-500" size={20} />
                            <span className="text-gray-900">{user.phoneNumber}</span>
                          </div>
                        )}
                        {user.dateOfBirth && (
                          <div className="flex items-center gap-3">
                            <CalendarIcon className="text-gray-500" size={20} />
                            <span className="text-gray-900">{new Date(user.dateOfBirth).toLocaleDateString('vi-VN')}</span>
                          </div>
                        )}
                        {user.gender && (
                          <div className="flex items-center gap-3">
                            {user.gender === 'Nam' ? (
                              <GenderMaleIcon className="text-blue-500" size={20} />
                            ) : user.gender === 'Nữ' ? (
                              <GenderFemaleIcon className="text-pink-500" size={20} />
                            ) : (
                              <GenderOtherIcon className="text-gray-500" size={20} />
                            )}
                            <span className="text-gray-900">{user.gender}</span>
                          </div>
                        )}
                        {user.location && (
                          <div className="flex items-center gap-3">
                            <LocationIcon className="text-gray-500" size={20} />
                            <span className="text-gray-900">{user.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Professional Info */}
                  {(user.currentJob || user.company || user.school || user.university) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thông tin nghề nghiệp
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        {user.currentJob && (
                          <div className="flex items-center gap-3">
                            <WorkIcon className="text-gray-500" size={20} />
                            <span className="text-gray-900">
                              {user.currentJob}
                              {user.company && ` tại ${user.company}`}
                            </span>
                          </div>
                        )}
                        {user.university && (
                          <div className="flex items-center gap-3">
                            <EducationIcon className="text-gray-500" size={20} />
                            <span className="text-gray-900">{user.university}</span>
                          </div>
                        )}
                        {user.school && (
                          <div className="flex items-center gap-3">
                            <EducationIcon className="text-gray-500" size={20} />
                            <span className="text-gray-900">{user.school}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  {(user.website || user.facebookUrl || user.instagramUrl || user.twitterUrl || user.linkedinUrl) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mạng xã hội
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        {user.website && (
                          <div className="flex items-center gap-3">
                            <WebsiteIcon className="text-gray-500" size={20} />
                            <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                              {user.website}
                            </a>
                          </div>
                        )}
                        {user.facebookUrl && (
                          <div className="flex items-center gap-3">
                            <FacebookIcon className="text-blue-600" size={20} />
                            <a href={user.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Facebook
                            </a>
                          </div>
                        )}
                        {user.instagramUrl && (
                          <div className="flex items-center gap-3">
                            <InstagramIcon className="text-pink-600" size={20} />
                            <a href={user.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">
                              Instagram
                            </a>
                          </div>
                        )}
                        {user.twitterUrl && (
                          <div className="flex items-center gap-3">
                            <TwitterIcon className="text-sky-600" size={20} />
                            <a href={user.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
                              Twitter
                            </a>
                          </div>
                        )}
                        {user.linkedinUrl && (
                          <div className="flex items-center gap-3">
                            <LinkedinIcon className="text-blue-700" size={20} />
                            <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                              LinkedIn
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  {(user.hometown || user.relationshipStatus || user.languages || user.interests) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thông tin khác
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        {user.hometown && (
                          <div className="flex items-center gap-3">
                            <HomeLocationIcon className="text-gray-500" size={20} />
                            <span className="text-gray-900">Quê quán: {user.hometown}</span>
                          </div>
                        )}
                        {user.relationshipStatus && (
                          <div className="flex items-center gap-3">
                            <HeartIcon className="text-red-500" size={20} />
                            <span className="text-gray-900">Tình trạng: {user.relationshipStatus}</span>
                          </div>
                        )}
                        {user.languages && (
                          <div className="flex items-center gap-3">
                            <LanguageIcon className="text-gray-500" size={20} />
                            <span className="text-gray-900">Ngôn ngữ: {user.languages}</span>
                          </div>
                        )}
                        {user.interests && (
                          <div className="flex items-start gap-3">
                            <InterestsIcon className="text-yellow-500 mt-0.5" size={20} />
                            <span className="text-gray-900">Sở thích: {user.interests}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {editing && (
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-semibold"
                  >
                    {loading ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-semibold"
                  >
                    ❌ Hủy
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin bảo mật</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                💡 <strong>Lưu ý:</strong> Để thay đổi mật khẩu hoặc email, vui lòng liên hệ quản trị viên.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quota Update Modal */}
      {showQuotaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Cập nhật dung lượng lưu trữ
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dung lượng (GB)
              </label>
              <input
                type="number"
                value={quotaGB}
                onChange={(e) => setQuotaGB(e.target.value)}
                min="0.1"
                max="10000"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ví dụ: 5 hoặc 10.5"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Nhập số GB (0.1 - 10000). Ví dụ: 5, 10.5, 100, 500
              </p>
              
              {/* Quick options */}
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Chọn nhanh:</p>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 5, 10, 50, 100, 500, 1000, 5000, 10000].map(gb => (
                    <button
                      key={gb}
                      onClick={() => setQuotaGB(gb.toString())}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-primary-50 hover:border-primary-500 transition-colors"
                    >
                      {gb >= 1000 ? `${gb/1000} TB` : `${gb} GB`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowQuotaModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitQuota}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
