// HORIZON-7 : jeu jouable hors ligne après une première visite
const V = 'h7-v1';
const CORE = ['./', './index.html', './models/z_hero.json', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  // page : réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
  if (r.mode === 'navigate' || u.pathname.endsWith('/index.html')) {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
    return;
  }
  // three.js (CDN), modèles, polices, icônes : cache d'abord
  if (u.origin === location.origin || /jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(u.host)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })));
  }
});
