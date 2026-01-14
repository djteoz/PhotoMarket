const CACHE_NAME = "photomarket-v1";
const STATIC_CACHE = "photomarket-static-v1";
const DYNAMIC_CACHE = "photomarket-dynamic-v1";

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/catalog",
  "/search",
  "/offline",
  "/manifest.json",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("Caching static assets");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API requests (except for caching search results)
  if (
    url.pathname.startsWith("/api/") &&
    !url.pathname.includes("/api/studios")
  ) {
    return;
  }

  // Skip Clerk auth requests
  if (url.hostname.includes("clerk")) return;

  // For images - cache first strategy
  if (request.destination === "image") {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // For pages - network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok && request.destination === "document") {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Try cache
        return caches.match(request).then((cached) => {
          if (cached) return cached;

          // Return offline page for navigation requests
          if (request.destination === "document") {
            return caches.match("/offline");
          }
        });
      })
  );
});

// Background sync for bookings
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-bookings") {
    event.waitUntil(syncBookings());
  }
});

async function syncBookings() {
  // Get pending bookings from IndexedDB and sync
  console.log("Syncing pending bookings...");
}

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
    actions: [
      { action: "open", title: "Открыть" },
      { action: "close", title: "Закрыть" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "open" || !event.action) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
