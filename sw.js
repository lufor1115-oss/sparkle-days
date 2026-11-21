/* 오프라인 실행용 캐시 — 앱 파일만 저장합니다 (사진은 IndexedDB) */
const CACHE = 'sparkle-v1.2.1';
const FILES = [
  "./",
  "assets/bg/ch1.jpg",
  "assets/bg/ch2.jpg",
  "assets/bg/ch3.jpg",
  "assets/bg/night.jpg",
  "assets/bg/xmas.jpg",
  "assets/elf/bye.webp",
  "assets/elf/fly.webp",
  "assets/elf/point.webp",
  "assets/elf/surprise.webp",
  "assets/elf/think.webp",
  "assets/elf/wave.webp",
  "assets/trip/andong.webp",
  "assets/trip/busan.webp",
  "assets/trip/gyeongju.webp",
  "assets/trip/jeonju.webp",
  "assets/trip/nhatrang.webp",
  "css/app.css",
  "fonts/jua-korean-400-normal.woff2",
  "fonts/jua-latin-400-normal.woff2",
  "fonts/jua.css",
  "geo/korea-region.json",
  "geo/world-110m.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "index.html",
  "js/app.js",
  "manifest.webmanifest",
  "vendor/d3-array.min.js",
  "vendor/d3-geo.min.js",
  "vendor/gsap.min.js",
  "vendor/jszip.min.js",
  "vendor/topojson-client.min.js",
];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// 인터넷이 되면 항상 최신 파일, 안 되면 저장해 둔 파일
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(fetch(e.request).then(r => {
    if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
