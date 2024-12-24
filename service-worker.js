const CACHE_NAME = 'my-app-cache-v2'; // Обновите имя кэша
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
                return response || fetch(event.request).then((networkResponse) => {
                    // Кэшируем ответ, если это не HTML-страница (например, API запросы)
                    if (event.request.url.includes('/api/')) { // Замените на ваш API URL
                        return caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        });
                    }
                    return networkResponse;
                });
            })
            .catch((error) => {
                console.error('Ошибка при обработке запроса:', error);
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
