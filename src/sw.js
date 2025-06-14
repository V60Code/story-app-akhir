importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

self.skipWaiting();
self.clients.claim();

const CACHE_NAME = 'story-app-v1';
const API_CACHE = 'api-cache-v1';
const STATIC_CACHE = 'static-cache-v1';
const MAP_CACHE = 'map-cache-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/app-icon.png',
  '/assets/app-icon.png',
  '/assets/favicon.ico',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
];

const getCacheName = (url, type) => {
  if (url.includes('story-api.dicoding.dev')) return API_CACHE;
  if (url.includes('tile.openstreetmap.org')) return MAP_CACHE;
  if (url.includes('unpkg.com/leaflet')) return MAP_CACHE;
  if (type === 'style' || url.includes('style-') || url.includes('.css')) return 'css-cache';
  if (type === 'script' || url.includes('index-') || url.includes('.js')) return 'js-cache';
  if (type === 'image' || url.includes('/images/') || url.includes('/assets/')) return 'images';
  return STATIC_CACHE;
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell and core assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .catch((error) => {
        console.error('Precaching failed:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName.startsWith('story-app-') ||
              cacheName.startsWith('api-cache-') ||
              cacheName.startsWith('static-cache-') ||
              cacheName.startsWith('map-cache-') ||
              cacheName === 'js-cache' ||
              cacheName === 'css-cache' ||
              cacheName === 'images'
          )
          .filter(
            (cacheName) =>
              cacheName !== CACHE_NAME &&
              cacheName !== API_CACHE &&
              cacheName !== STATIC_CACHE &&
              cacheName !== MAP_CACHE
          )
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
});

if (workbox) {
  console.log('Workbox is loaded');
  workbox.setConfig({ debug: true });

  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  workbox.routing.registerRoute(
    ({ url }) =>
      url.origin === 'https://story-api.dicoding.dev' && url.pathname.includes('/images/'),
    new workbox.strategies.CacheFirst({
      cacheName: 'story-images',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
        {
          cacheWillUpdate: async ({ response }) => {
            return response.status === 200 ? response : null;
          },
          handlerDidError: async () => {
            return new Response(
              `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#ddd"/>
                <text x="50%" y="50%" font-family="Arial" font-size="16" fill="#666" text-anchor="middle">Image Not Available</text>
              </svg>`,
              {
                headers: {
                  'Content-Type': 'image/svg+xml',
                  'Cache-Control': 'no-store',
                },
              }
            );
          },
        },
      ],
    })
  );

  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === 'image' ||
      request.url.includes('/images/') ||
      request.url.includes('/assets/'),
    new workbox.strategies.CacheFirst({
      cacheName: 'images',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    })
  );

  workbox.routing.registerRoute(
    ({ url }) =>
      url.origin === 'https://tile.openstreetmap.org' || url.origin === 'https://unpkg.com',
    new workbox.strategies.CacheFirst({
      cacheName: MAP_CACHE,
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 1000,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    })
  );

  workbox.routing.registerRoute(
    new RegExp('https://story-api\\.dicoding\\.dev/v1/stories'),
    new workbox.strategies.NetworkFirst({
      cacheName: API_CACHE,
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 60,
        }),
        {
          fetchDidSucceed: async ({ response }) => {
            try {
              const clonedResponse = response.clone();
              const data = await clonedResponse.json();

              self.clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                  client.postMessage({
                    type: 'STORIES_UPDATED',
                    stories: data.listStory || [],
                  });
                });
              });

              return response;
            } catch (error) {
              console.error('Error processing API response:', error);
              return response;
            }
          },
        },
      ],
    })
  );

  workbox.routing.registerRoute(
    ({ request, url }) =>
      request.destination === 'script' ||
      url.pathname.includes('index-') ||
      url.pathname.endsWith('.js'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'js-cache',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  workbox.routing.registerRoute(
    ({ request, url }) =>
      request.destination === 'style' ||
      url.pathname.includes('style-') ||
      url.pathname.endsWith('.css'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'css-cache',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  workbox.routing.registerRoute(
    /^https:\/\/fonts\.googleapis\.com/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets',
    })
  );

  workbox.routing.registerRoute(
    /^https:\/\/fonts\.gstatic\.com/,
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 365,
          maxEntries: 30,
        }),
      ],
    })
  );

  workbox.routing.registerRoute(
    ({request}) => request.destination === 'script' || request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources',
    })
  );

  workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  workbox.routing.registerRoute(
    ({url}) => url.origin === 'https://story-api.dicoding.dev',
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        }),
      ],
    })
  );
  
  // Navigation routing handled by manual fetch event listener
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.origin === 'https://story-api.dicoding.dev' && url.pathname.includes('/images/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request, {
          mode: 'cors',
          credentials: 'omit',
        })
          .then((response) => {
            if (!response || response.status !== 200) {
              throw new Error('Failed to fetch image');
            }

            const responseToCache = response.clone();
            caches.open('story-images').then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch(() => {
            return new Response(
              `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#ddd"/>
                <text x="50%" y="50%" font-family="Arial" font-size="16" fill="#666" text-anchor="middle">Image Not Available</text>
              </svg>`,
              {
                headers: {
                  'Content-Type': 'image/svg+xml',
                  'Cache-Control': 'no-store',
                },
              }
            );
          });
      })
    );
    return;
  }

  if (event.request.url.includes('story-api.dicoding.dev')) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(async () => {
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
              return cachedResponse;
            }

            try {
              const clients = await self.clients.matchAll();
              clients.forEach((client) => {
                client.postMessage({
                  type: 'GET_INDEXED_DB_STORIES',
                });
              });

              return new Response(
                JSON.stringify({
                  error: false,
                  message: 'Offline mode - checking IndexedDB',
                  listStory: [],
                }),
                {
                  headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                  },
                }
              );
            } catch (error) {
              console.error('Error accessing IndexedDB:', error);
              return new Response(
                JSON.stringify({
                  error: false,
                  message: 'Offline mode - no cached stories available',
                  listStory: [],
                }),
                {
                  headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                  },
                }
              );
            }
          });
      })
    );
    return;
  }

  if (
    event.request.url.includes('tile.openstreetmap.org') ||
    event.request.url.includes('unpkg.com/leaflet')
  ) {
    event.respondWith(
      caches.open(MAP_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) return response;

          return fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  const destination = event.request.destination;
  const cacheName = getCacheName(url.toString(), destination);

  if (cacheName) {
    event.respondWith(
      caches.open(cacheName).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Check cache first for navigation requests
          const cache = await caches.open(CACHE_NAME);
          
          // Try to get cached version first
          let cachedResponse = await cache.match(event.request);
          if (!cachedResponse && event.request.url.endsWith('/')) {
            cachedResponse = await cache.match('/index.html');
          }
          if (!cachedResponse) {
            cachedResponse = await cache.match('/');
          }
          
          // Try network if online
          try {
            const preloadResponse = await event.preloadResponse;
            if (preloadResponse) {
              // Cache the preload response
              cache.put(event.request, preloadResponse.clone());
              return preloadResponse;
            }

            const networkResponse = await fetch(event.request);
            // Cache successful network response
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          } catch (networkError) {
            // Network failed, return cached version if available
            if (cachedResponse) {
              return cachedResponse;
            }
            throw networkError;
          }
        } catch (error) {
          console.log('Navigation fetch failed; returning cached or offline page.', error);

          const cache = await caches.open(CACHE_NAME);
          
          // Try different cache keys
          let fallbackResponse = await cache.match('/index.html');
          if (!fallbackResponse) {
            fallbackResponse = await cache.match('/');
          }
          
          if (fallbackResponse) {
            return fallbackResponse;
          }

          return new Response(
            `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Offline - Story App</title>
                <style>
                  body { 
                    font-family: system-ui, -apple-system, sans-serif;
                    padding: 2rem;
                    max-width: 600px;
                    margin: 0 auto;
                    text-align: center;
                  }
                  h1 { color: #333; }
                  .offline-message {
                    background: #f8f9fa;
                    padding: 1rem;
                    border-radius: 8px;
                    margin: 2rem 0;
                  }
                </style>
              </head>
              <body>
                <h1>Story App</h1>
                <div class="offline-message">
                  <h2>You're currently offline</h2>
                  <p>Please check your internet connection and try again.</p>
                </div>
              </body>
            </html>
            `,
            {
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store',
              },
            }
          );
        }
      })()
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INDEXED_DB_STORIES') {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'STORIES_FROM_INDEXED_DB',
          stories: event.data.stories || [],
        });
      });
    });
  }
});

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received');
  
  let notificationData = {
    title: 'Story App',
    options: {
      body: 'New content is available!',
      icon: '/images/app-icon.png',
      badge: '/images/app-icon.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    }
  };

  if (event.data) {
    try {
      notificationData = JSON.parse(event.data.text());
    } catch (e) {
      notificationData.options.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData.options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received');
  event.notification.close();

  let urlToOpen = '/';
  if (event.notification.data && event.notification.data.url) {
    urlToOpen = event.notification.data.url;
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
