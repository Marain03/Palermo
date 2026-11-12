// Palermo service worker: η εφαρμογή ανοίγει γρήγορα και παίρνει πάντα την τελευταία έκδοση.
const CACHE = "palermo-v11";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  const url = new URL(req.url);
  // Μόνο τα αρχεία του ίδιου του site. Η βάση (Firebase) και οι γραμματοσειρές πάνε κατευθείαν στο δίκτυο.
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  // Πρώτα δίκτυο (για να έρχονται αμέσως οι αλλαγές), αλλιώς ό,τι υπάρχει αποθηκευμένο.
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      if (res.ok) caches.open(CACHE).then(c => c.put(req.mode === "navigate" ? "./" : req, copy));
      return res;
    }).catch(() => caches.match(req.mode === "navigate" ? "./" : req).then(r => r || caches.match("./")))
  );
});
