self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated.');
  event.waitUntil(clients.claim());
});

// Добавьте пустой обработчик fetch, чтобы не было ошибок, 
// если браузер его ожидает (хотя это не строго обязательно для регистрации)
/*self.addEventListener('fetch', (event) => {
  // console.log('Service Worker: Fetching', event.request.url);
});*/