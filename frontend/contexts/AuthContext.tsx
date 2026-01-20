'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { authService } from '@/lib/auth';

interface User {
  id: number;
  email: string;
  displayName: string;
  role: string;
  status?: string;
  avatar?: string;
  avatarUrl?: string;
  storageUsed: number;
  storageQuota: number;
  verified: boolean;
  online?: boolean;
  lastSeen?: string;
  createdAt?: string;
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

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = authService.getToken();
      console.log('🔍 checkAuth - Token:', token ? '✓ Found' : '✗ Not found');
      
      if (!token) {
        console.log('❌ No token');
        setLoading(false);
        return;
      }

      // Kiểm tra token còn hạn không
      if (!authService.isAuthenticated()) {
        console.log('❌ Token expired');
        authService.clearAllData();
        setUser(null);
        setLoading(false);
        return;
      }

      // Lấy user từ localStorage ngay
      const cachedUser = authService.getUser();
      console.log('💾 Cached user:', cachedUser?.email || 'None');
      
      if (cachedUser) {
        console.log('✅ Setting cached user immediately');
        setUser(cachedUser);
        setLoading(false);
        
        // Fetch API ở background để cập nhật (không block)
        apiService.getCurrentUser()
          .then(userData => {
            console.log('✅ Updated user from API:', userData.email);
            setUser(userData);
            authService.setUser(userData);
          })
          .catch(apiError => {
            console.error('⚠️ API error:', apiError.response?.status, apiError.message);
            // Chỉ clear auth nếu 401 và không có cached user
            if (apiError.response?.status === 401) {
              console.log('🔐 401 - Token invalid, clearing auth');
              authService.clearAllData();
              setUser(null);
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
            }
            // Nếu lỗi khác, giữ cached user
          });
      } else {
        // Không có cached user, fetch từ API
        console.log('🔄 No cached user, fetching from API...');
        try {
          const userData = await apiService.getCurrentUser();
          console.log('✅ Got user from API:', userData.email);
          setUser(userData);
          authService.setUser(userData);
          setLoading(false);
        } catch (apiError: any) {
          console.error('❌ API Error:', apiError.response?.status);
          if (apiError.response?.status === 401) {
            console.log('🔐 401 - No token or invalid token');
            authService.clearAllData();
            setUser(null);
          }
          setLoading(false);
        }
      }
    } catch (error: any) {
      console.error('❌ Auth check failed:', error);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiService.login({ email, password });
    console.log('✅ Login response:', response);
    
    // Lưu token TRƯỚC khi redirect
    authService.setToken(response.token);
    console.log('💾 Token saved to localStorage');
    
    // Load full user info after login
    try {
      const fullUser = await apiService.getCurrentUser();
      console.log('✅ Full user from API:', fullUser);
      
      const mergedUser = {
        ...fullUser,
        role: fullUser.role || response.role,
        verified: fullUser.verified !== undefined ? fullUser.verified : (response.verified || false)
      };
      
      console.log('✅ Merged user object:', mergedUser);
      setUser(mergedUser);
      authService.setUser(mergedUser);
      
      // Redirect AFTER token and user are saved
      router.push('/dashboard');
    } catch (error) {
      console.error('❌ Failed to load full user info:', error);
      // Vẫn redirect ngay cả khi lỗi, vì token đã được lưu
      router.push('/dashboard');
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    const response = await apiService.register({ email, password, displayName });
    authService.setToken(response.token);
    
    // Load full user info after register
    try {
      const fullUser = await apiService.getCurrentUser();
      setUser(fullUser);
      authService.setUser(fullUser);
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
    
    router.push('/dashboard');
  };

  const logout = () => {
    // Gọi logout từ authService (sẽ xóa tất cả dữ liệu)
    authService.logout();
    // Reset user state trong context
    setUser(null);
    // authService.logout() đã redirect, nhưng để chắc chắn
    // router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
