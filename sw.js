const CACHE = 'neonatal-clinical-calculator-pwa-v1-2-12';
const CORE_ASSETS = [
  './',
  './index.html',
  './pain.html',
  './finnegan.html',
  './app.js',
  './styles.css',
  './fenton.html',
  './fenton-data.js',
  './scores.js',
  './manifest.webmanifest',
  './aap2022-thresholds.json',
  './aap-data.js',
  './cover-reference.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './jr-perinatology-logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Cache each available core file independently so one optional file cannot
    // prevent the PWA service worker from installing.
    await Promise.all(CORE_ASSETS.map(async path => {
      try {
        const response = await fetch(path, { cache: 'reload' });
        if (response.ok) await cache.put(path, response);
      } catch (_) {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE);
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (error) {
      if (request.mode === 'navigate') {
        return (await caches.match('./index.html')) || Response.error();
      }
      return Response.error();
    }
  })());
});
