/* N26 PWA service worker — safe shell cache.
   - touches ONLY same-origin GET requests (never Supabase, Pusher, EmailJS, the Worker API or any CDN),
     so it cannot cause or hide CORS errors;
   - pages: network-first, cached copy only when offline;
   - static files (png/css/js/json): stale-while-revalidate. */
const VERSION = 'n26-pwa-v3';
const SHELL = ['./', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // CDN / API / Worker: browser handles it
  if (url.pathname.endsWith('/sw.js')) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put('./', copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('./').then((r) => r || Response.error()))
    );
    return;
  }

  event.respondWith(
    caches.open(VERSION).then((c) =>
      c.match(req).then((hit) => {
        const net = fetch(req).then((res) => { if (res && res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
        return hit || net;
      })
    )
  );
});
