const CACHE_NAME = 'snet-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/login',
  '/register',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'SNet';
  const options = {
    body: data.body || 'Bạn có tin nhắn mới',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    tag: data.tag || 'message',
    data: data.data || {},
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/dashboard/chat')
  );
});
