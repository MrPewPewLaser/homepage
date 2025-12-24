// Service Worker for Homepage Dashboard
const CACHE_NAME = 'homepage-v1';
const STATIC_CACHE_NAME = 'homepage-static-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/static/js/core.js',
  '/static/js/graphs.js',
  '/static/js/app.js',
  '/static/js/layout.js',
  '/static/js/preferences.js',
  '/static/js/modules/system.js',
  '/static/js/modules/weather.js',
  '/static/js/modules/network.js',
  '/static/js/modules/search.js',
  '/static/js/modules/github.js',
  '/static/js/modules/rss.js',
  '/static/js/modules/quicklinks.js',
  '/static/js/modules/monitoring.js',
  '/static/js/modules/snmp.js',
  '/static/js/modules/calendar.js',
  '/static/js/modules/todo.js',
  '/static/js/modules/config.js',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Failed to cache some assets:', err);
        // Don't fail installation if some assets fail to cache
        return Promise.resolve();
      });
    })
  );
  // Force activation of new service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API requests that need fresh data (we can cache them separately if needed)
  if (url.pathname.startsWith('/api/')) {
    // For API requests, try network first, fallback to cache
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET requests
          if (request.method === 'GET' && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline response if no cache
            return new Response(
              JSON.stringify({ error: 'Offline - no cached data available' }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          });
        })
    );
    return;
  }

  // For static assets, try cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If it's a navigation request and we're offline, return cached index
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
    })
  );
});

