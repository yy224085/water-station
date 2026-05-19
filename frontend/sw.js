const CACHE = 'water-station-v1';
const FILES = [
  '/',
  '/css/style.css',
  '/js/app.js',
  '/js/alerts.js',
  '/js/charts.js',
  '/js/export.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() =>
      caches.match(e.request)
    )
  );
});