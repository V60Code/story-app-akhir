importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

self.__WB_MANIFEST;

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);

  workbox.routing.registerRoute(
    ({ url }) =>
      url.origin === 'https://story-api.dicoding.dev' &&
      url.pathname.startsWith('/images/stories/'),
    new workbox.strategies.CacheFirst({
      cacheName: 'dicoding-images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    })
  );
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received:', event);

  let notificationData = {};
  const defaultTitle = 'Story App Notification';

  try {
    if (event.data) {
      const dataText = event.data.text();
      console.log('[Service Worker] Push data text:', dataText);

      try {
        notificationData = JSON.parse(dataText);
        console.log('[Service Worker] Push data parsed as JSON:', notificationData);
      } catch (jsonError) {
        console.warn(
          '[Service Worker] Push data is not valid JSON. Falling back to plain text. Error:',
          jsonError.message
        );
        notificationData = {
          title: defaultTitle,
          options: {
            body: dataText,
          },
        };
      }
    } else {
      console.log('[Service Worker] Push event did not contain data.');
      notificationData = {
        title: 'New Story',
        options: {
          body: 'Someone has posted a new story!',
        },
      };
    }
  } catch (error) {
    console.error('[Service Worker] Error processing push data:', error);
    notificationData = {
      title: 'Notification Error',
      options: {
        body: 'Could not process incoming notification.',
      },
    };
  }

  const notificationTitle = notificationData.title || 'Story berhasil dibuat';

  const notificationOptions = {
    body:
      notificationData.options && notificationData.options.body
        ? notificationData.options.body
        : 'Anda telah membuat story baru.',
    icon: '/images/app-icon.png',
    badge: '/images/app-icon.png',
    data: notificationData.data || { url: '/' },
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Story',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(notificationTitle, notificationOptions));
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received', event);
  event.notification.close();

  let urlToOpen = '/';

  if (event.action === 'view' && event.notification.data && event.notification.data.url) {
    urlToOpen = event.notification.data.url;
  } else if (event.notification.data && event.notification.data.url) {
    urlToOpen = event.notification.data.url;
  }

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((windowClients) => {
        const matchingClient = windowClients.find(
          (client) => client.url === self.registration.scope + urlToOpen.substring(1)
        );

        if (matchingClient) {
          return matchingClient.focus();
        }
        return clients.openWindow(urlToOpen);
      })
  );
});

console.log('[Service Worker] File sw-base.js loaded and event listeners attached.');
