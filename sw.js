var VERSION = "aufgaben-v5";
var DATEIEN = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-512.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(DATEIEN); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (n) { return n !== VERSION; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});
// Erst aus dem Zwischenspeicher (offline-fest), im Hintergrund aktualisieren.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (treffer) {
    var netz = fetch(e.request).then(function (r) {
      if (r && r.ok) { var kopie = r.clone(); caches.open(VERSION).then(function (c) { c.put(e.request, kopie); }); }
      return r;
    }).catch(function () { return treffer; });
    return treffer || netz;
  }));
});
