// Service Worker for PWA functionality
const CACHE_NAME = 'elevado-quizz-v1';
const STATIC_CACHE = 'elevado-static-v1';
const DYNAMIC_CACHE = 'elevado-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/app',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .catch((error) => {
        console.log('[SW] Failed to cache static files:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Ensure the service worker takes control immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip external requests (except fonts)
  if (!request.url.startsWith(self.location.origin) && 
      !request.url.includes('fonts.googleapis.com') &&
      !request.url.includes('fonts.gstatic.com')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Don't cache if not successful
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone the response because it can only be consumed once
            const responseToCache = networkResponse.clone();
            
            // Cache dynamic content
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch(() => {
            // Return offline fallback for navigations
            if (request.mode === 'navigate') {
              return caches.match('/offline.html') || new Response(
                `
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Offline - Elevado Quizz</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { 
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      display: flex; 
                      align-items: center; 
                      justify-content: center; 
                      min-height: 100vh; 
                      margin: 0;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      text-align: center;
                      padding: 20px;
                    }
                    .container { max-width: 400px; }
                    h1 { margin-bottom: 1rem; }
                    button {
                      background: white;
                      color: #667eea;
                      border: none;
                      padding: 12px 24px;
                      border-radius: 6px;
                      cursor: pointer;
                      font-weight: 600;
                      margin-top: 1rem;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>📱 Você está offline</h1>
                    <p>Parece que você perdeu a conexão com a internet. Verifique sua conexão e tente novamente.</p>
                    <button onclick="window.location.reload()">Tentar novamente</button>
                  </div>
                </body>
                </html>
                `,
                {
                  headers: {
                    'Content-Type': 'text/html'
                  }
                }
              );
            }
          });
      })
  );
});

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'quiz-submission') {
    console.log('[SW] Background sync: quiz-submission');
    event.waitUntil(syncQuizSubmissions());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do Elevado Quizz',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore', title: 'Ver no app',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close', title: 'Fechar',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Elevado Quizz', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/app')
    );
  }
});

// Helper function for background sync
async function syncQuizSubmissions() {
  // This would handle offline quiz submissions
  // For now, it's a placeholder for future implementation
  console.log('[SW] Syncing quiz submissions...');
}
