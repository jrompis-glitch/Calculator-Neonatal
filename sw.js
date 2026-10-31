
const CACHE = 'neonatal-clinical-calculator-v1-16';

const ASSETS = [
  './',
  './index.html',
  './bpd.html',
  './pain.html',
  './finnegan.html',
  './app.js',
  './styles.css',
  './fenton.html',
  './fenton-data.js',
  './scores.js',
  './manifest.webmanifest',
  './aap2022-thresholds.json',
  './aap-data.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(async cache => {
      for (const asset of ASSETS) {
        try {
          const response = await fetch(asset, { cache: 'reload' });
          if (response.ok) await cache.put(asset, response);
        } catch (error) {
          console.warn('Cache skipped:', asset);
        }
      }
      await self.skipWaiting();
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(async keys => {
      await Promise.all(
        keys
          .filter(key =>
            key.startsWith('neonatal-clinical-calculator-') &&
            key !== CACHE
          )
          .map(key => caches.delete(key))
      );
      await self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isPage =
    request.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('/');

  if (isPage) {
    event.respondWith(
      fetch(request).then(async response => {
        if (response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(request, response.clone());
        }
        return response;
      }).catch(async () =>
        (await caches.match(request)) ||
        (await caches.match('./index.html')) ||
        Response.error()
      )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(async cached => {
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    })
  );
});

