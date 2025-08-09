const CACHE_NAME = 'miniboleta-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(res => 
      res || fetch(event.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          // Cache GET requests for offline
          if (event.request.method === 'GET' && new URL(event.request.url).origin === location.origin) {
            cache.put(event.request, fetchRes.clone());
          }
          return fetchRes;
        });
      }).catch(() => caches.match('./index.html'))
    )
  );
});