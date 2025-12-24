// Service Worker for Homepage Dashboard
// Only caches static assets (JS, CSS) - does not intercept navigation or API requests
const STATIC_CACHE_NAME = 'homepage-static-v3';

// Assets to cache immediately on install (excluding main page - it uses network-first)
const STATIC_ASSETS = [
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
          if (cacheName !== STATIC_CACHE_NAME) {
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

// Fetch event - only cache in background, never intercept requests
// This ensures the service worker never interferes with normal operation
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // For navigation requests, try network first, fallback to cache if offline
  if (request.mode === 'navigate' || url.pathname === '/') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful HTML responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed - try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // No cache - let the request fail naturally
            throw new Error('No cached page available');
          });
        })
    );
    return;
  }

  // Don't intercept API requests - let them go through normally
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Only cache static assets (JS, CSS files in /static/)
  if (!url.pathname.startsWith('/static/')) {
    return;
  }

  // Just cache successful responses in background
  // Never intercept - let all requests pass through normally
  // This way the service worker never interferes, even when server is down
  event.waitUntil(
    fetch(request.clone())
      .then((response) => {
        // Only cache successful responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          return caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
      })
      .catch(() => {
        // Ignore errors - we're just caching in background
        // The original request will handle its own errors
      })
  );
  
  // Don't call event.respondWith() - let the request pass through normally
  // This ensures the browser handles the request naturally
});

