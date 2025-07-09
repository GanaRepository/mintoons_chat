// File 106: public/sw.js - Service Worker for PWA
const CACHE_NAME = 'mintoons-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/create-stories',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/images/logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
