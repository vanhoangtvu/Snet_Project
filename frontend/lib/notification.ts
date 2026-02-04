// Service Worker registration utility
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission === 'granted';
  }
  return false;
};

// Simulate push notification (for testing without backend push)
export const showNotification = async (title: string, body: string, data?: any) => {
  if ('serviceWorker' in navigator && 'Notification' in window) {
    const registration = await navigator.serviceWorker.ready;
    
    if (Notification.permission === 'granted') {
      await registration.showNotification(title, {
        body,
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        tag: 'message',
        data: data || {},
        requireInteraction: true,
        vibrate: [200, 100, 200]
      });
    }
  }
};
