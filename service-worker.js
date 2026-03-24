// Prayer Tracker PWA — Service Worker v48 (modular refactor)
const CACHE_NAME = 'salah-tracker-v48';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    // CSS
    './css/main.css',
    './css/themes.css',
    './css/dashboard.css',
    // JS modules (dependency order)
    './js/config.js',
    './js/storage.js',
    './js/hijri-calendar.js',
    './js/ui-utils.js',
    './js/i18n.js',
    './js/themes.js',
    './js/profiles.js',
    './js/female-features.js',
    './js/fard-tracker.js',
    './js/sunnah-tracker.js',
    './js/jamaah-tracker.js',
    './js/weekly-view.js',
    './js/fasting-tracker.js',
    './js/prayer-times.js',
    './js/notifications.js',
    './js/qada-report.js',
    './js/dashboard.js',
    './js/year-overview.js',
    './js/data-io.js',
    './js/app.js',
    // Icons
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-152x152.png',
    './icons/icon-192x192.png',
    './icons/icon-384x384.png',
    './icons/icon-512x512.png',
    './icons/maskable-192x192.png',
    './icons/maskable-512x512.png',
    // CDN (cached on first fetch)
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
    'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700&display=swap'
];

// ==================== INSTALL ====================
self.addEventListener('install', event => {
    console.log('[SW] Installing v48...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// ==================== ACTIVATE ====================
self.addEventListener('activate', event => {
    console.log('[SW] Activating v48...');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => {
                        console.log('[SW] Deleting old cache:', key);
                        return caches.delete(key);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// ==================== FETCH (Network-first) ====================
self.addEventListener('fetch', event => {
    // Skip non-GET and cross-origin requests
    if (event.request.method !== 'GET') return;
    
    const url = new URL(event.request.url);
    
    // API calls — network only, no cache
    if (url.hostname === 'api.aladhan.com' || 
        url.hostname === 'nominatim.openstreetmap.org') {
        event.respondWith(fetch(event.request));
        return;
    }
    
    // CDN resources (Chart.js, fonts) — cache first
    if (url.hostname === 'cdn.jsdelivr.net' || 
        url.hostname === 'fonts.googleapis.com' || 
        url.hostname === 'fonts.gstatic.com') {
        event.respondWith(
            caches.match(event.request).then(cached => {
                if (cached) return cached;
                return fetch(event.request).then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                });
            })
        );
        return;
    }
    
    // App resources — network first, fallback to cache
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

// ==================== NOTIFICATION CLICK ====================
self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification clicked:', event.notification.tag);
    event.notification.close();
    
    // Focus existing window or open new one
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                // Try to focus an existing window
                for (let client of windowClients) {
                    if (client.url.includes('prayer-tracker') || client.url.endsWith('/')) {
                        client.focus();
                        client.postMessage({ 
                            type: 'notification-click', 
                            tag: event.notification.tag 
                        });
                        return;
                    }
                }
                // No existing window — open new one
                return clients.openWindow(event.notification.data?.url || './');
            })
    );
});

// ==================== NOTIFICATION CLOSE ====================
self.addEventListener('notificationclose', event => {
    console.log('[SW] Notification dismissed:', event.notification.tag);
});

// ==================== BACKGROUND PERIODIC SYNC ====================
// For browsers that support it (Chrome Android)
self.addEventListener('periodicsync', event => {
    if (event.tag === 'prayer-check') {
        event.waitUntil(checkAndNotify());
    }
});

// ==================== MESSAGE FROM MAIN APP ====================
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    // Schedule notification from main thread
    if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
        const { title, body, tag, delay } = event.data;
        if (delay && delay > 0) {
            setTimeout(() => {
                self.registration.showNotification(title, {
                    body: body,
                    icon: 'icons/icon-192x192.png',
                    badge: 'icons/icon-72x72.png',
                    tag: tag,
                    renotify: true,
                    vibrate: [200, 100, 200],
                    data: { url: './' }
                });
            }, delay);
        }
    }
});

// Helper: check prayer times and send notifications (for background sync)
async function checkAndNotify() {
    try {
        const allClients = await clients.matchAll({ type: 'window' });
        // Only notify if no active window (app is in background)
        if (allClients.length === 0 || allClients.every(c => c.visibilityState === 'hidden')) {
            // Read cached prayer times from the app
            // (The main app stores this in localStorage which SW can't access directly,
            //  but the main app sends scheduled notifications via message)
            console.log('[SW] Background check — app is hidden, relying on scheduled notifications');
        }
    } catch(e) {
        console.log('[SW] Background check error:', e);
    }
}
