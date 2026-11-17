/* Alamat ini sudah pindah ke https://geosr-lab.github.io/.
 * Service worker lama dicabut dan cache-nya dihapus, lalu tab yang terbuka dimuat ulang
 * supaya langsung dialihkan ke alamat baru. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys()
    .then(function (kunci) { return Promise.all(kunci.map(function (k) { return caches.delete(k); })); })
    .then(function () { return self.registration.unregister(); })
    .then(function () { return self.clients.matchAll({ type: 'window' }); })
    .then(function (tab) { tab.forEach(function (t) { t.navigate(t.url); }); }));
});
