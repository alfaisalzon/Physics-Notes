const CACHE_NAME = "risen-paper-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./file_000000007574821088b2eb83486c4b24.png"
];
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(FILES_TO_CACHE))
    );

    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );

    self.clients.claim();
});

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        caches.match(event.request)
        .then(cached => {

            if (cached) {
                return cached;
            }

            return fetch(event.request)
            .then(response => {

                if (!response || response.status !== 200) {
                    return response;
                }

                const copy = response.clone();

                caches.open(CACHE_NAME)
                .then(cache => {
                    cache.put(event.request, copy);
                });

                return response;

            })
            .catch(() => {

                if (event.request.mode === "navigate") {
                    return caches.match("./index.html");
                }

            });

        })
    );
});
