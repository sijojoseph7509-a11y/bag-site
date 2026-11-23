// Offline cache for the bag site: slides, models and fonts are kept after the first visit, so decks open instantly.
const C = 'bag-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET' || r.headers.has('range')) return;
  const u = new URL(r.url);
  const media = /\.(webp|jpe?g|png|glb|woff2?|svg)$/i.test(u.pathname) || /fonts\.(gstatic|googleapis)\.com|unpkg\.com|gstatic\.com/.test(u.host);
  if (media) {   // cache first: files are versioned with ?v=…, so a stored copy is always right
    e.respondWith(caches.open(C).then(async (c) => { const hit = await c.match(r); if (hit) return hit; const res = await fetch(r); if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }));
  } else if (u.origin === location.origin) {   // pages, css, js: network first, cache as fallback
    e.respondWith(fetch(r).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(C).then((c) => c.put(r, copy)); } return res; }).catch(() => caches.match(r)));
  }
});
