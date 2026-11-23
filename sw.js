const CACHE_NAME = 'studyos-github-v2-responsive-20261123';
const BASE_URL = new URL('./', self.registration.scope);
const toURL = path => new URL(path, BASE_URL).href;
const APP_SHELL = [
  '', 'index.html', 'manifest.webmanifest', 'install.js',
  'favicon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'
].map(toURL);
const INDEX_URL = toURL('index.html');

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith('studyos-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  const scopeURL = new URL(self.registration.scope);
  if (req.method !== 'GET' || url.origin !== scopeURL.origin || !url.pathname.startsWith(scopeURL.pathname)) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(INDEX_URL, clone));
        }
        return res;
      }).catch(() => caches.match(INDEX_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res && res.ok) caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
      return res;
    }))
  );
});
