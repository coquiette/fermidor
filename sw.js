// Fermidor : service worker (lancement rapide, jeu jouable hors ligne après une première visite)
const V = 'fermidor-333f17cdee';
const CORE = ['./', 'index.html', 'fermidor.glb?v=f766a336', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.pathname.endsWith('version.json')) return; // toujours le réseau : sert à détecter les mises à jour
  const page = r.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('index.html');
  if (page) { // réseau d'abord : les mises à jour arrivent tout de suite
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(ca => ca.put('index.html', c)); return res; }).catch(() => caches.match('index.html')));
    return;
  }
  if (u.origin === location.origin || /cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(u.host)) {
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok || res.type === 'opaque') { const c = res.clone(); caches.open(V).then(ca => ca.put(r, c)); } return res; })));
  }
});
