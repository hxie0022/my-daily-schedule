const CACHE_NAME = 'today-schedule-v2';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for the page itself, so updates show up right away.
// Cache-first for static assets (icons, manifest), which rarely change.
self.addEventListener('fetch', (e) => {
  const isPage = e.request.mode === 'navigate' || e.request.url.endsWith('index.html') || e.request.url.endsWith('/');
  if(isPage){
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          caches.open(CACHE_NAME).then((c) => c.put(e.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request))
    );
  }
});
