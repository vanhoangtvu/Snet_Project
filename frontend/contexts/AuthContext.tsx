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
      if (authService.isAuthenticated()) {
        const userData = await apiService.getCurrentUser();
        setUser(userData);
      }
    } catch (error: any) {
      console.error('Auth check failed:', error.message);
      // Xóa tất cả dữ liệu nếu xác thực thất bại
      authService.clearAllData();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiService.login({ email, password });
    console.log('Login response:', response);
    authService.setToken(response.token);
    
    // Load full user info after login
    try {
      const fullUser = await apiService.getCurrentUser();
      console.log('Full user from API:', fullUser);
      
      // Ensure role and verified are preserved from login if missing from getCurrentUser
      const mergedUser = {
        ...fullUser,
        role: fullUser.role || response.role,
        verified: fullUser.verified !== undefined ? fullUser.verified : (response.verified || false)
      };
      
      console.log('Merged user object:', mergedUser);
      setUser(mergedUser);
      authService.setUser(mergedUser);
    } catch (error) {
      console.error('Failed to load full user info:', error);
    }
    
    router.push('/dashboard');
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
