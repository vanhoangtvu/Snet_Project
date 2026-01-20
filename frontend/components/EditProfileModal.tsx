'use client';

import { useState } from 'react';
import { FiX, FiCamera } from 'react-icons/fi';
import { apiService } from '@/lib/api';

interface EditProfileModalProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProfileModal({ user, onClose, onSuccess }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    phoneNumber: user?.phoneNumber || '',
    currentJob: user?.currentJob || '',
    company: user?.company || '',
    school: user?.school || '',
    university: user?.university || '',
    facebookUrl: user?.facebookUrl || '',
    instagramUrl: user?.instagramUrl || '',
    twitterUrl: user?.twitterUrl || '',
    linkedinUrl: user?.linkedinUrl || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      if (formData.displayName) data.append('displayName', formData.displayName);
      if (formData.bio) data.append('bio', formData.bio);
      if (formData.location) data.append('location', formData.location);
      if (formData.website) data.append('website', formData.website);
      if (formData.phoneNumber) data.append('phoneNumber', formData.phoneNumber);
      if (formData.currentJob) data.append('currentJob', formData.currentJob);
      if (formData.company) data.append('company', formData.company);
      if (formData.school) data.append('school', formData.school);
      if (formData.university) data.append('university', formData.university);
      if (formData.facebookUrl) data.append('facebookUrl', formData.facebookUrl);
      if (formData.instagramUrl) data.append('instagramUrl', formData.instagramUrl);
      if (formData.twitterUrl) data.append('twitterUrl', formData.twitterUrl);
      if (formData.linkedinUrl) data.append('linkedinUrl', formData.linkedinUrl);
      if (avatarFile) data.append('avatar', avatarFile);
      if (coverFile) data.append('coverPhoto', coverFile);

      await apiService.updateProfile(data);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('❌ Lỗi: Không thể cập nhật profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Chỉnh sửa trang cá nhân</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Cover Photo */}
          <div>
            <label className="block text-sm font-semibold mb-2">Ảnh bìa</label>
            <div className="relative h-32 bg-primary-500 rounded-xl overflow-hidden">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
              ) : null}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
                id="cover-upload"
              />
              <label
                htmlFor="cover-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/70 cursor-pointer transition-colors"
              >
                <FiCamera className="w-8 h-8" />
              </label>
            </div>
            {coverFile && (
              <p className="text-sm text-green-400 mt-1">✓ Đã chọn: {coverFile.name}</p>
            )}
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm font-semibold mb-2">Ảnh đại diện</label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-2xl overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  user?.displayName?.charAt(0).toUpperCase()
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/70 cursor-pointer transition-colors rounded-full"
                >
                  <FiCamera className="w-6 h-6" />
                </label>
              </div>
              {avatarFile && (
                <p className="text-sm text-green-400">✓ Đã chọn: {avatarFile.name}</p>
              )}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">Tên hiển thị</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-all"
              placeholder="Nhập tên hiển thị"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold mb-2">Tiểu sử</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-all resize-none"
              rows={3}
              placeholder="Giới thiệu về bạn"
              maxLength={160}
            />
            <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/160</p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold mb-2">Vị trí</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-all"
              placeholder="Thành phố, Quốc gia"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-semibold mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-all"
              placeholder="https://example.com"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold mb-2">Số điện thoại</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-all"
              placeholder="+84 123 456 789"
            />
          </div>

          {/* Current Job */}
          <div>
            <label className="block text-sm font-semibold mb-2">Công việc hiện tại</label>
            <input
              type="text"
              value={formData.currentJob}
              onChange={(e) => setFormData({ ...formData, currentJob: e.target.value })}
              className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-all"
              placeholder="Ví dụ: Software Engineer"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-semibold mb-2">Công ty</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-all"
              placeholder="Tên công ty"
            />
          </div>

          {/* School */}
          <div>
            <label className="block text-sm font-semibold mb-2">Trường học</label>
            <input
              type="text"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-all"
              placeholder="Tên trường"
            />
          </div>

          {/* University */}
          <div>
            <label className="block text-sm font-semibold mb-2">Đại học</label>
            <input
              type="text"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-all"
              placeholder="Tên đại học"
            />
          </div>

          {/* Social Links */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="font-semibold mb-3">Liên kết xã hội</h3>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Facebook</label>
              <input
                type="url"
                value={formData.facebookUrl}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-all"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 mt-3">Instagram</label>
              <input
                type="url"
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-all"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 mt-3">Twitter</label>
              <input
                type="url"
                value={formData.twitterUrl}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-all"
                placeholder="https://twitter.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 mt-3">LinkedIn</label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-all"
                placeholder="https://linkedin.com/..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-700 rounded-lg font-semibold hover:bg-white/5 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
