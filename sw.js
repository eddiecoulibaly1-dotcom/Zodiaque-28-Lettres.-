const CACHE="zodiaque-28-lettres-1.5.13";
const ASSETS=[
  "./","./index.html","./styles.css","./app.js","./astronomy.js",
  "./profil.js","./profil_astronomique.js","./profil_abjad.js","./profil_lunaire.js",
  "./localisation.js","./localisation_i18n.js","./localisation_lieux.js","./timezone.js",
  "./i18n.js","./theme_synthese.js","./astronomie_diagnostics.js","./module_lunaire_unifie.js",
  "./manifest.webmanifest","./icon.svg",
  "./vendor/astronomy/astronomy.browser.min.js",
  "./referentiel/lettres.json","./referentiel/zodiaque.json","./referentiel/planetes.json",
  "./referentiel/correspondances.json","./referentiel/correspondances_traditionnelles.json",
  "./referentiel/elements.json","./referentiel/modalites.json","./referentiel/phases_lunaires.json",
  "./referentiel/jours_lunaires.json","./referentiel/lieux.json","./referentiel/sources.json",
  "./referentiel/reference-manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && new URL(event.request.url).origin === location.origin) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => new Response("Hors connexion : ressource non mise en cache.", {
        status: 503,
        statusText: "Service Unavailable",
        headers: {"Content-Type": "text/plain; charset=utf-8"}
      }));
    })
  );
});
