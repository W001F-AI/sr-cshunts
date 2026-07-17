const CACHE_NAME = 'orange-sr-pwa-v8';
const STATIC_ASSETS = [
    './',
    './index.html',
    './style.css',
    './bento.css',
    './assistant.css',
    './app.js',
    './data.js',
    './hunts.js',
    './emails.js',
    './plans.js',
    './docs.js',
    './freemax.js',
    './assistant.js',
    './calculators.js',
    './tracker.js',
    './news.js',
    './manifest.json',
    'https://unpkg.com/lucide@latest',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&family=Outfit:wght@300;400;600;800&family=Dancing+Script:wght@700&display=swap'
];

// Install Event
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching Static Assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Clearing Old Cache');
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event (Stale-While-Revalidate pattern)
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests, like Clarity tracking
    if (!event.request.url.startsWith(self.location.origin) && !event.request.url.includes('unpkg') && !event.request.url.includes('fonts.')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Cache the new response for future
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                }
                return networkResponse;
            }).catch(() => {
                // If fetch fails, just return the cached response
                return cachedResponse;
            });

            // Return cached response immediately if available, otherwise wait for network
            return cachedResponse || fetchPromise;
        })
    );
});
