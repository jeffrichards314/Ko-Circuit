// KO Circuit's service worker: the whole game is downloaded once and then played from the cache, online or not.
// tools/build.mjs fills in VERSION (a hash of every file) and ASSETS (every file the game needs). A new build has a new VERSION, so it gets a cache of its
// own; the old one is deleted when the new one takes over. Saves are in localStorage, which a service worker never touches.
const VERSION = '__VERSION__';
const ASSETS = ['__ASSETS__'];
const CACHE = `kocircuit-${VERSION}`;

self.addEventListener('install', (e) => {
  // (cache: 'reload' skips the browser's own HTTP cache, so a new version is never assembled from some old files and some new ones)
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(ASSETS.map((u) => c.add(new Request(u, { cache: 'reload' }))))));
});
self.addEventListener('message', (e) => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('kocircuit-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      // (?dev and the like are not part of the file)
      const hit = (await c.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' ? await c.match('index.html') : null);
      if (hit) return hit;
      try { return await fetch(req); } catch { return new Response('Offline', { status: 503 }); }
    }),
  );
});
