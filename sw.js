const CACHE = 'zunda-商会-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 動画（mp4・Range 要求）は素通しにする。部分応答（206）はキャッシュに入れられず、動画のシークも壊れるため
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || r.headers.has('range') || /\.mp4($|\?)/.test(r.url)) return;
  e.respondWith(
    fetch(r, { cache: 'no-cache' }).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(r, copy));
      return res;
    }).catch(() => caches.match(r).then(x => x || caches.match('./index.html')))
  );
});
