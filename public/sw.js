// Service Worker – Civic Collaboration Platform PWA
// PWA SAFE CACHING: cache only GET; never cache POST/PUT/DELETE or authenticated responses
const CACHE_NAME = 'civic-pwa-v2';
const OFFLINE_URL = '/offline';
const isLocalhost = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

const urlsToCache = ['/', '/offline', '/manifest.json', '/login', '/register'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache.map((u) => new Request(u, { cache: 'reload' }))).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (isLocalhost) {
    event.respondWith(fetch(event.request));
    return;
  }

  const url = new URL(event.request.url);
  const isGet = event.request.method === 'GET';
  const isNav = event.request.mode === 'navigate';
  const isApi = url.pathname.startsWith('/api/');

  // Never cache non-GET
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Never cache API (may include auth)
  if (isApi) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Never cache requests with Authorization header
  if (event.request.headers.get('Authorization')) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (isNav) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached || fetch(event.request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      });
    })
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data = { title: 'Civic Platform', body: '', url: '/dashboard' };
  try {
    data = { ...data, ...event.data.json() };
  } catch {
    data.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'civic-notification',
      data: { url: data.url || '/dashboard' },
      requireInteraction: false,
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length) {
        clientList[0].focus();
        clientList[0].navigate(url);
      } else if (self.clients.openWindow) {
        self.clients.openWindow(url);
      }
    })
  );
});
