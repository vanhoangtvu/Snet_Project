import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiService {
  private api: AxiosInstance;
  private isBackendHealthy: boolean = true;
  private healthCheckInProgress: boolean = false;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      (config) => {
        // Bỏ qua kiểm tra token cho các endpoint không cần auth
        const publicEndpoints = ['/auth/login', '/auth/register'];
        const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

        if (!isPublicEndpoint) {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Request with token to:', config.url);
          } else {
            console.warn('No token found for request:', config.url);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log('Response from:', response.config.url, '| Status:', response.status);
        return response;
      },
      (error) => {
        console.error('Error response:', error.config?.url, '| Status:', error.response?.status);

        // Xử lý lỗi mạng (backend chưa sẵn sàng) - KHÔNG xóa token
        if (!error.response) {
          console.error('Network error - Backend may not be ready');
          return Promise.reject(error);
        }

        // Xử lý lỗi 401 - LET AuthContext HANDLE IT
        if (error.response?.status === 401) {
          console.warn('⚠️ 401 Unauthorized - Let AuthContext handle it');
          // Không xóa token ở đây, để AuthContext xử lý
          // Chỉ redirect nếu user đang ở trang protected
          if (typeof window !== 'undefined') {
            const isAuthPage = window.location.pathname.includes('/login') || 
                              window.location.pathname.includes('/register');
            if (!isAuthPage && !window.location.pathname.includes('/dashboard')) {
              // Chỉ redirect nếu không phải auth page
              console.log('Redirecting to login...');
              window.location.href = '/login';
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(data: { email: string; password: string; displayName: string }) {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.api.post('/auth/login', data);
    return response.data;
  }

  // Users
  async getCurrentUser() {
    const response = await this.api.get('/users/me');
    return response.data;
  }

  async getUserById(userId: number) {
    const response = await this.api.get(`/users/${userId}`);
    return response.data;
  }

  async getUserProfile(userId: number) {
    const response = await this.api.get(`/users/${userId}`);
    return response.data;
  }

  async searchUsers(keyword: string) {
    const response = await this.api.get(`/users/search?keyword=${keyword}`);
    return response.data;
  }

  async getOnlineUsers() {
    const response = await this.api.get('/users/online');
    return response.data;
  }

  async updateProfile(data: FormData) {
    const response = await this.api.put('/users/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  getUserAvatar(userId: number, size: 'thumbnail' | 'medium' | 'full' = 'medium'): string {
    return `${API_BASE_URL}/users/${userId}/avatar?size=${size}`;
  }

  getUserCoverPhoto(userId: number): string {
    return `${API_BASE_URL}/users/${userId}/cover`;
  }

  // Friends
  async sendFriendRequest(friendId: number) {
    const response = await this.api.post(`/friends/request/${friendId}`);
    return response.data;
  }

  async acceptFriendRequest(requestId: number) {
    const response = await this.api.post(`/friends/accept/${requestId}`);
    return response.data;
  }

  async rejectFriendRequest(requestId: number) {
    const response = await this.api.post(`/friends/reject/${requestId}`);
    return response.data;
  }

  async getFriendsList() {
    const response = await this.api.get('/friends');
    return response.data;
  }

  async getPendingRequests() {
    const response = await this.api.get('/friends/requests/pending');
    return response.data;
  }

  async areFriends(userId: number) {
    try {
      const friends = await this.getFriendsList();
      return friends.some((friend: any) => friend.id === userId);
    } catch (error) {
      console.error('Failed to check friendship:', error);
      return false;
    }
  }

  // Messages
  async getChatHistory(userId: number, page = 0, size = 50) {
    const response = await this.api.get(`/messages/chat/${userId}?page=${page}&size=${size}`);
    return response.data;
  }

  async markAsRead(messageId: number) {
    const response = await this.api.post(`/messages/${messageId}/read`);
    return response.data;
  }

  async deleteMessage(messageId: number) {
    const response = await this.api.delete(`/messages/${messageId}`);
    return response.data;
  }

  async recallMessage(messageId: number) {
    const response = await this.api.post(`/messages/${messageId}/recall`);
    return response.data;
  }

  // Files
  async uploadFile(file: File, description?: string, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);

    const response = await this.api.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // No compression header needed - let browser handle it
      },
      timeout: 1800000, // 30 minutes timeout for large files (60-100MB)
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (onProgress) {
            onProgress(percentCompleted);
          }
        }
      },
      // Optimize for large files
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
    return response.data;
  }

  async getFileInfo(fileId: number) {
    const response = await this.api.get(`/files/${fileId}`);
    return response.data;
  }

  downloadFile(fileId: number): string {
    const token = localStorage.getItem('token');
    return `${API_BASE_URL}/files/${fileId}/download?token=${token}`;
  }

  previewFile(fileId: number, size: string = 'full'): string {
    const token = localStorage.getItem('token');
    return `${API_BASE_URL}/files/${fileId}/preview?token=${token}&size=${size}`;
  }

  async getThumbnail(fileId: number) {
    return `${API_BASE_URL}/files/${fileId}/thumbnail`;
  }

  async getMyFiles() {
    const response = await this.api.get('/files/my-files');
    return response.data;
  }

  async deleteFile(fileId: number) {
    const response = await this.api.delete(`/files/${fileId}`);
    return response.data;
  }

  // Public Share
  async createPublicShare(fileId: number, expiresAt?: string, maxAccessCount?: number) {
    const params = new URLSearchParams();
    if (expiresAt) params.append('expiresAt', expiresAt);
    if (maxAccessCount) params.append('maxAccessCount', maxAccessCount.toString());

    const response = await this.api.post(`/public/share/${fileId}?${params.toString()}`);
    return response.data;
  }

  async getShareInfo(shareToken: string) {
    const response = await this.api.get(`/public/share/${shareToken}/info`);
    return response.data;
  }

  async getQRCode(shareToken: string) {
    return `${API_BASE_URL}/public/share/${shareToken}/qrcode`;
  }

  // Admin
  async getDashboardStats() {
    const response = await this.api.get('/admin/dashboard/stats');
    return response.data;
  }

  async getAllUsers() {
    const response = await this.api.get('/admin/users');
    return response.data;
  }

  async lockUser(userId: number) {
    const response = await this.api.post(`/admin/users/${userId}/lock`);
    return response.data;
  }

  async unlockUser(userId: number) {
    const response = await this.api.post(`/admin/users/${userId}/unlock`);
    return response.data;
  }

  async updateUserQuota(userId: number, quota: number) {
    const response = await this.api.put(`/admin/users/${userId}/quota?quota=${quota}`);
    return response.data;
  }

  async verifyUser(userId: number) {
    const response = await this.api.post(`/admin/users/${userId}/verify`);
    return response.data;
  }

  async unverifyUser(userId: number) {
    const response = await this.api.post(`/admin/users/${userId}/unverify`);
    return response.data;
  }

  async getAllFiles(category?: string) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);

    const url = `/admin/files${params.toString() ? '?' + params.toString() : ''}`;
    const response = await this.api.get(url);
    return response.data;
  }

  async adminDeleteFile(fileId: number) {
    const response = await this.api.delete(`/admin/files/${fileId}`);
    return response.data;
  }

  async getTopUsersByStorage() {
    const response = await this.api.get('/admin/files/top-users');
    return response.data;
  }

  async getFileStatsByCategory() {
    const response = await this.api.get('/admin/files/stats-by-category');
    return response.data;
  }

  async deleteUser(userId: number) {
    const response = await this.api.delete(`/admin/users/${userId}`);
    return response.data;
  }

  async searchMessages(keyword: string) {
    const response = await this.api.get(`/admin/messages/search?keyword=${keyword}`);
    return response.data;
  }

  async adminDeleteMessage(messageId: number) {
    const response = await this.api.delete(`/admin/messages/${messageId}`);
    return response.data;
  }

  async getAdminLogs(page = 0, size = 50) {
    const response = await this.api.get(`/admin/logs?page=${page}&size=${size}`);
    return response.data;
  }

  // Groups
  async createGroup(name: string, description: string, memberIds: number[]) {
    const response = await this.api.post('/groups', {
      name,
      description,
      memberIds
    });
    return response.data;
  }

  async getUserGroups() {
    const response = await this.api.get('/groups');
    return response.data;
  }

  async getGroup(groupId: number) {
    const response = await this.api.get(`/groups/${groupId}`);
    return response.data;
  }

  async updateGroupAvatar(groupId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.api.post(`/groups/${groupId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  getGroupAvatar(groupId: number): string {
    return `${API_BASE_URL}/groups/${groupId}/avatar`;
  }

  async addGroupMember(groupId: number, userId: number) {
    const response = await this.api.post(`/groups/${groupId}/members/${userId}`);
    return response.data;
  }

  async removeGroupMember(groupId: number, userId: number) {
    const response = await this.api.delete(`/groups/${groupId}/members/${userId}`);
    return response.data;
  }

  async leaveGroup(groupId: number) {
    const response = await this.api.post(`/groups/${groupId}/leave`);
    return response.data;
  }

  async getGroupMessages(groupId: number, page = 0, size = 50) {
    const response = await this.api.get(`/messages/group/${groupId}?page=${page}&size=${size}`);
    return response.data;
  }

  // Posts
  async getPosts(page = 0, size = 10) {
    const response = await this.api.get(`/posts?page=${page}&size=${size}`);
    return response.data;
  }

  async getUserPosts(userId: number, page = 0, size = 10) {
    const response = await this.api.get(`/posts/user/${userId}?page=${page}&size=${size}`);
    return response.data;
  }

  async getPost(postId: number) {
    const response = await this.api.get(`/posts/${postId}`);
    return response.data;
  }

  async createPost(data: any) {
    const isFormData = data instanceof FormData;
    const response = await this.api.post('/posts', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return response.data;
  }

  async updatePost(postId: number, data: any) {
    const response = await this.api.put(`/posts/${postId}`, data);
    return response.data;
  }

  async deletePost(postId: number) {
    const response = await this.api.delete(`/posts/${postId}`);
    return response.data;
  }

  async toggleLike(postId: number) {
    const response = await this.api.post(`/posts/${postId}/like`);
    return response.data;
  }

  async addComment(postId: number, content: string, parentCommentId?: number) {
    const response = await this.api.post(`/posts/${postId}/comments`, { 
      content,
      parentCommentId 
    });
    return response.data;
  }

  async getPostComments(postId: number, page = 0, size = 20) {
    const response = await this.api.get(`/posts/${postId}/comments?page=${page}&size=${size}`);
    return response.data;
  }

  async deleteComment(commentId: number) {
    const response = await this.api.delete(`/posts/comments/${commentId}`);
    return response.data;
  }

  async toggleCommentLike(commentId: number) {
    const response = await this.api.post(`/posts/comments/${commentId}/like`);
    return response.data;
  }

  async getPostLikes(postId: number, page = 0, size = 20) {
    const response = await this.api.get(`/posts/${postId}/likes?page=${page}&size=${size}`);
    return response.data;
  }

  getPostImage(filename: string): string {
    return `${API_BASE_URL}/posts/images/${filename}`;
  }
}

export const apiService = new ApiService();
