const CACHE = "zodiaque-28-lettres-1.5.18-firebase";
const ASSETS = [
  "./", "./index.html", "./styles.css", "./app.js", "./astronomy.js",
  "./profil.js", "./profil_astronomique.js", "./abjad_normalisation.js", "./profil_abjad.js", "./profil_lunaire.js",
  "./localisation.js", "./localisation_i18n.js", "./localisation_lieux.js", "./timezone.js",
  "./i18n.js", "./theme_synthese.js", "./astronomie_diagnostics.js", "./module_lunaire_unifie.js",
  "./application_ui.js", "./profil_synthese.js", "./firebase-client.js", "./firebase-ui.js", "./manifest.webmanifest", "./icon.svg",
  "./icons/icon-192.svg", "./icons/icon-512.svg", "./pwa.js",
  "./vendor/astronomy/astronomy.browser.min.js",
  "./referentiel/lettres.json", "./referentiel/zodiaque.json", "./referentiel/planetes.json",
  "./referentiel/correspondances.json", "./referentiel/correspondances_traditionnelles.json",
  "./referentiel/elements.json", "./referentiel/modalites.json", "./referentiel/phases_lunaires.json",
  "./referentiel/jours_lunaires.json", "./referentiel/lieux.json", "./referentiel/sources.json",
  "./referentiel/reference-manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Une ressource manquante ne doit pas faire échouer toute l'installation Android.
    // Le diagnostic PWA signale ensuite précisément les ressources absentes du cache.
    const results = await Promise.all(ASSETS.map(async path => {
      try {
        await cache.add(path);
        return { path, ok: true };
      } catch (error) {
        console.warn("[Zodiaque PWA] Ressource non mise en cache :", path, error);
        return { path, ok: false };
      }
    }));
    const failed = results.filter(result => !result.ok).map(result => result.path);
    await cache.put(
      new URL("./__z28_cache_report__.json", self.registration.scope),
      new Response(JSON.stringify({ version: CACHE, total: ASSETS.length, cached: ASSETS.length - failed.length, failed }), {
        headers: { "Content-Type": "application/json; charset=utf-8" }
      })
    );
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith("zodiaque-28-lettres-") && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
      }
      return response;
    } catch {
      if (event.request.mode === "navigate") {
        const shell = await caches.match(new URL("./index.html", self.registration.scope).href);
        if (shell) return shell;
      }
      return new Response("Hors connexion : cette ressource n'est pas disponible dans le cache local.", {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  })());
});
