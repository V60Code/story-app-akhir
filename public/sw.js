const CACHE_NAME = 'story-app-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/images/app-icon.png',
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received');

  let body;
  if (event.data) {
    body = event.data.text();
  } else {
    body = 'Push message received but no data';
  }

  const options = {
    body: body,
    icon: '/images/app-icon.png',
    badge: '/images/app-icon.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };

  event.waitUntil(
    self.registration.showNotification('Story App', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
}); 