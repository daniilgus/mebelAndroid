// service-worker.js
const CACHE_NAME = 'my-app-cache-v1';
const urlsToCache = [
    'authorization.html',
    'registration.html',
    'Administrator.html',
    'manifest.json',
    'img/icon.png'
    // Добавьте другие файлы, которые хотите кэшировать
];

// Установка service worker и кэширование файлов
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Возвращаем кэшированный файл, если он есть
                return response || fetch(event.request);
            })
    );
});

// Удаление устаревших кэшей
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
