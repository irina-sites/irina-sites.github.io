/* ============================================================
   SERVICE WORKER — офлайн-кэш.
   Кэширует файлы приложения, чтобы оно открывалось без интернета.
   При обновлении файлов поднимите номер версии в CACHE.
   ============================================================ */

var CACHE = 'skincare40-v3';

var ASSETS = [
  './',
  './index.html',
  './privacy.html',
  './how-to-use.html',
  './css/styles.css',
  './data/routines.js',
  './data/articles.js',
  './data/exercises.js',
  './js/storage.js',
  './js/quiz.js',
  './js/routine.js',
  './js/facegym.js',
  './js/progress.js',
  './js/content.js',
  './js/app.js',
  './manifest.webmanifest',
  './assets/icons/icon.svg'
];

// Установка — кладём файлы в кэш
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); })
  );
  self.skipWaiting();
});

// Активация — чистим старые версии кэша
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    })
  );
  self.clients.claim();
});

// Запросы — сначала СЕТЬ, кэш как запас (network-first).
// Плюс: свежие правки контента видны сразу при обновлении страницы.
// Плюс: без сети приложение открывается из кэша (офлайн-режим).
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (resp) {
      // Обновляем кэш свежей версией
      var copy = resp.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); }).catch(function () {});
      return resp;
    }).catch(function () {
      // Нет сети — берём из кэша
      return caches.match(e.request).then(function (cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});
