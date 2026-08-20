/*
  Service Worker – "Hamster dein Wissen"

  Strategie bewusst NETWORK-FIRST (nicht cache-first):
  - Ist Internet da: immer die aktuellste Version von GitHub Pages laden
    und den Cache im Hintergrund aktualisieren.
  - Ist kein Internet da: aus dem Cache bedienen, damit die App trotzdem öffnet.

  CACHE_VERSION bei jeder inhaltlichen Änderung hochzählen.
  Alte Caches werden beim Aktivieren automatisch gelöscht, damit sich
  nichts dauerhaft "festsetzt" (das Icon-Cache-Problem soll sich hier
  nicht wiederholen).
*/

const CACHE_VERSION = 'hamster-v1';

const APP_SHELL = [
  './vorbereitungswand.html',
  './manifest.json',
  './icon-120.png',
  './icon-152.png',
  './icon-180.png',
  './icon-512.png',
  './nav_home_tempel.png',
  './nav_audio_welle.png',
  './nav_gehirn_gruen.png',
  './nav_fortschritt_chart.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      // Einzeln statt addAll, damit eine fehlende Datei nicht die ganze Installation blockiert
      return Promise.all(
        APP_SHELL.map((url) => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((namen) =>
      Promise.all(
        namen
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    fetch(req)
      .then((netzResponse) => {
        const kopie = netzResponse.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, kopie));
        return netzResponse;
      })
      .catch(() => caches.match(req))
  );
});
