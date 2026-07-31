/* 满分恋人 PWA · 简易 Service Worker */
const CACHE = 'lovers-v3';
const ASSETS = [
  './',
  './lovers-test.html',
  './index.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    // 不等旧缓存，直接全部清掉
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    // 预缓存新文件
    const c = await caches.open(CACHE);
    await c.addAll(ASSETS).catch(() => {});
  })());
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return resp;
    }).catch(() => caches.match('./lovers-test.html')))
  );
});