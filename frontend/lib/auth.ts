import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  email: string;
  displayName: string;
  role: string;
  status: string;
  storageQuota: number;
  storageUsed: number;
  verified: boolean;
  online: boolean;
  lastSeen?: string;
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
}

export const authService = {
  setToken(token: string) {
    localStorage.setItem('token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  clearAllData() {
    // Xóa tất cả localStorage
    localStorage.clear();
    // Xóa tất cả sessionStorage
    sessionStorage.clear();
  },

  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const isValid = decoded.exp * 1000 > Date.now();
      
      // Nếu token hết hạn, xóa ngay
      if (!isValid) {
        console.warn('Token expired, clearing auth data');
        this.clearAllData();
      }
      
      return isValid;
    } catch (error) {
      console.error('Invalid token format, clearing auth data');
      this.clearAllData();
      return false;
    }
  },

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'ADMIN';
  },

  logout() {
    // Xóa tất cả dữ liệu khi đăng xuất
    this.clearAllData();
    // Chuyển hướng đến trang chủ
    window.location.href = '/';
  },
};
