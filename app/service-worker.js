// Service Worker for Charter Legacy PWA
// Version 1.0.0

const CACHE_NAME = 'charter-legacy-v2';
const urlsToCache = [
  '/app/',
  '/app/auth.html',
  '/app/dashboard-llc.html',
  '/app/obsidian-zenith.html',
  '/app/dashboard-will.html',
  '/app/styles/app.css',
  '/app/scripts/auth.js',
  '/app/scripts/dashboard.js',
  '/app/scripts/dashboard-zenith.js',
  '/assets/logo-obsidian-shield.svg',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - network first, fall back to cache
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });
        }
        
        return response;
      })
      .catch(function() {
        // Network failed, try cache
        return caches.match(event.request)
          .then(function(response) {
            if (response) {
              return response;
            }
            
            // Show offline page if available
            if (event.request.mode === 'navigate') {
              return caches.match('/app/offline.html');
            }
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
