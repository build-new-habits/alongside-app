/* =============================================================
   BNH OS — Service Worker
   sw.js v1.0 | Build New Habits | March 2026

   Minimal service worker required for PWA install prompt.
   Caches the app shell for offline resilience.
   ============================================================= */

const CACHE_NAME = 'bnh-os-v1';

// Files to cache on install
const SHELL_FILES = [
  '/BNH-OS/',
  '/BNH-OS/index.html',
  '/BNH-OS/css/variables.css',
  '/BNH-OS/css/base.css',
  '/BNH-OS/css/components.css',
  '/BNH-OS/css/responsive.css',
  '/BNH-OS/css/animations.css',
  '/BNH-OS/js/app.js',
  '/BNH-OS/js/supabase.js',
  '/BNH-OS/views/home.html',
  '/BNH-OS/views/products.html',
  '/BNH-OS/views/operations.html',
  '/BNH-OS/views/meetings.html',
  '/BNH-OS/views/docs.html',
  '/BNH-OS/views/reports.html',
];

// Install: cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network first, fall back to cache
// Always go network-first so Supabase data stays fresh
self.addEventListener('fetch', event => {
  // Skip non-GET and cross-origin requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Skip Supabase API calls — always network
  if (event.request.url.includes('supabase.co')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses for app shell files
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Network failed — serve from cache if available
        return caches.match(event.request)
          .then(cached => cached || caches.match('/BNH-OS/index.html'));
      })
  );
});
