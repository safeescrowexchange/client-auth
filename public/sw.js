/* N26 PWA service worker — safe shell cache (v3).
   - touches ONLY same-origin GET requests (never Supabase, Pusher, EmailJS, the Worker API or any CDN),
     so it cannot cause or hide CORS errors;
   - everything is NETWORK-FIRST: when online you always get the newest index.html, PNGs (cards, logo) and scripts;
     the cached copy is used only when the network fails (offline).
   - v3 fixes: static files used to be "stale-while-revalidate", which served the OLD file first
     (old card PNGs / logo showed until a second reload). Bumping VERSION also wipes the old caches. */
const VERSION = 'n26-pwa-v3';
const SHELL = ['./', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((c) => Promise.all(SHELL.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // CDN / API / Worker: browser handles it
  if (url.pathname.endsWith('/sw.js')) return;

  const isPage = req.mode === 'navigate';
  // 'no-cache' = always revalidate with the server, so iOS/Safari HTTP cache cannot hand back an old file
  const netReq = isPage ? req : new Request(req, { cache: 'no-cache' });

  event.respondWith(
    fetch(netReq).then((res) => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(isPage ? './' : req, copy)).catch(() => {});
      }
      return res;
    }).catch(() =>
      caches.open(VERSION).then((c) => c.match(isPage ? './' : req)).then((r) => r || Response.error())
    )
  );
});
