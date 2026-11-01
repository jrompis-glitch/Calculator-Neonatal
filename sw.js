/*
 * JR Neonatal Clinical Calculator — Service Worker
 * Cache v1-17: memperbarui cache lama dan memastikan halaman HTML
 * mengambil versi terbaru dari server saat online.
 */

const CACHE = 'neonatal-clinical-calculator-letarte-20261102-1';

const ASSETS = [
  './',
  './index.html',
  './bpd.html',
  './eos.html',
  './letarte.html',
  './jr-perinatology-logo.png',
  './pain.html',
  './finnegan.html',
  './fenton.html',
  './fenton-data.js',
  './app.js',
  './styles.css',
  './scores.js',
  './manifest.webmanifest',
  './aap2022-thresholds.json',
  './aap-data.js',
  './icons/cover-reference.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/jr-perinatology-logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);

    // Cache setiap aset secara terpisah agar satu file yang tidak tersedia
    // tidak menggagalkan seluruh proses instalasi Service Worker.
    await Promise.all(ASSETS.map(async asset => {
      try {
        const response = await fetch(asset, { cache: 'reload' });
        if (response.ok) {
          await cache.put(asset, response);
        }
      } catch (error) {
        // Aset yang gagal diunduh akan diminta kembali saat diperlukan.
      }
    }));

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(keys
      .filter(key =>
        key.startsWith('neonatal-clinical-calculator-') &&
        key !== CACHE
      )
      .map(key => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isHtml =
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('/');

  if (isHtml) {
    // Network-first untuk halaman HTML agar pembaruan index.html dan
    // halaman kalkulator segera terlihat setelah deployment.
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        return (await caches.match(request)) ||
          (await caches.match('./index.html')) ||
          Response.error();
      }
    })());
    return;
  }

  // Cache-first untuk aset pendukung; aset versi baru dimasukkan saat
  // Service Worker versi baru dipasang.
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      return Response.error();
    }
  })());
});
