// Web Push Notification Service
export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Request permission for notifications
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Check if notifications are supported and permission is granted
   */
  isSupported(): boolean {
    return 'Notification' in window && this.permission === 'granted';
  }

  /**
   * Show a notification for a new message
   */
  async showMessageNotification(
    senderName: string,
    messageContent: string,
    senderId: number,
    options?: {
      avatar?: string;
      verified?: boolean;
    }
  ): Promise<void> {
    console.log('🔔 showMessageNotification called:', {
      senderName,
      messageContent: messageContent.substring(0, 50),
      isSupported: this.isSupported(),
      permission: this.permission,
      hasFocus: document.hasFocus()
    });

    if (!this.isSupported()) {
      console.warn('⚠️ Notifications not supported or permission not granted');
      return;
    }

    try {
      // Don't show notification if user is already on the page and it's focused
      if (document.hasFocus()) {
        console.log('👀 Page is focused, skipping notification');
        return;
      }

      const title = `${senderName}${options?.verified ? ' ✓' : ''}`;
      const body = messageContent.length > 100 
        ? messageContent.substring(0, 100) + '...' 
        : messageContent;

      console.log('✨ Creating notification:', { title, body });

      const notification = new Notification(title, {
        body,
        icon: options?.avatar || '/logo.png',
        badge: '/logo.png',
        tag: `message-${senderId}`, // Group notifications from same sender
        requireInteraction: false,
        silent: false,
        data: {
          senderId,
          url: `/dashboard/chat?user=${senderId}`
        }
      });

      console.log('✅ Notification created successfully');

      // Click handler - open chat with sender
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        const data = (event.target as Notification).data;
        if (data?.url) {
          window.location.href = data.url;
        }
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Show a notification for file received
   */
  async showFileNotification(
    senderName: string,
    fileName: string,
    senderId: number,
    options?: {
      avatar?: string;
    }
  ): Promise<void> {
    if (!this.isSupported()) {
      return;
    }

    if (document.hasFocus()) {
      return;
    }

    try {
      const notification = new Notification(`${senderName} đã gửi file`, {
        body: `📎 ${fileName}`,
        icon: options?.avatar || '/logo.png',
        badge: '/logo.png',
        tag: `file-${senderId}`,
        requireInteraction: false,
        data: {
          senderId,
          url: `/dashboard/chat?user=${senderId}`
        }
      });

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        const data = (event.target as Notification).data;
        if (data?.url) {
          window.location.href = data.url;
        }
        notification.close();
      };

      setTimeout(() => {
        notification.close();
      }, 5000);

    } catch (error) {
      console.error('Error showing file notification:', error);
    }
  }

  /**
   * Play notification sound
   */
  playNotificationSound(): void {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => {
        console.warn('Could not play notification sound:', err);
      });
    } catch (error) {
      console.warn('Notification sound not available');
    }
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    return this.permission;
  }
}

export const notificationService = NotificationService.getInstance();
