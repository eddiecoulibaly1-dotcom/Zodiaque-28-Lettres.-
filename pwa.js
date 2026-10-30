/* Diagnostic PWA : installation Android et contrôle exhaustif du cache hors connexion. */
(() => {
  const REQUIRED = [
    "./index.html", "./styles.css", "./app.js", "./astronomy.js",
    "./profil.js", "./profil_astronomique.js", "./abjad_normalisation.js", "./profil_abjad.js", "./profil_lunaire.js",
    "./localisation.js", "./localisation_i18n.js", "./localisation_lieux.js", "./timezone.js",
    "./i18n.js", "./theme_synthese.js", "./astronomie_diagnostics.js", "./module_lunaire_unifie.js",
    "./application_ui.js", "./profil_synthese.js", "./manifest.webmanifest", "./icon.svg", "./pwa.js",
    "./icons/icon-192.svg", "./icons/icon-512.svg",
    "./vendor/astronomy/astronomy.browser.min.js",
    "./referentiel/lettres.json", "./referentiel/zodiaque.json", "./referentiel/planetes.json",
    "./referentiel/correspondances.json", "./referentiel/correspondances_traditionnelles.json", "./referentiel/spheres_cosmologiques.json",
    "./referentiel/elements.json", "./referentiel/modalites.json", "./referentiel/phases_lunaires.json",
    "./referentiel/jours_lunaires.json", "./referentiel/lieux.json", "./referentiel/sources.json",
    "./referentiel/reference-manifest.json"
  ];
  let installPrompt = null;
  const $ = selector => document.querySelector(selector);
  const localUrl = path => new URL(path, document.baseURI).href;

  function addCard() {
    const app = $("#app");
    if (!app || $("#pwaReadinessCard")) return;
    const heading = app.querySelector("h2");
    if (!heading || !/Zodiaque\s*&\s*28\s*Lettres/i.test(heading.textContent || "")) return;
    const card = document.createElement("section");
    card.id = "pwaReadinessCard";
    card.className = "card";
    card.setAttribute("aria-labelledby", "pwaReadinessTitle");
    card.style.marginTop = "14px";
    card.innerHTML = `
      <div class="detail-head"><div>
        <h3 id="pwaReadinessTitle">Installation Android et mode hors connexion</h3>
        <p class="muted">Contrôle du service worker et des ressources essentielles réellement mises en cache.</p>
      </div><span class="tag" id="pwaNetworkState">Vérification…</span></div>
      <div class="toolbar">
        <button type="button" class="primary" id="pwaInstallButton">Installer l’application</button>
        <button type="button" class="secondary" id="pwaCheckButton">Vérifier le cache hors connexion</button>
      </div>
      <p id="pwaReadinessStatus" class="small muted" role="status" aria-live="polite">Vérification du service worker et du cache local…</p>
      <details id="pwaMissingDetails" hidden><summary>Ressources manquantes</summary><ul id="pwaMissingList"></ul></details>
      <p class="small muted">Si Android ne propose pas l’installation automatique, ouvrez le menu ⋮ de Chrome puis choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ».</p>
    `;
    app.append(card);
    $("#pwaInstallButton").addEventListener("click", install);
    $("#pwaCheckButton").addEventListener("click", checkOffline);
    renderNetwork();
    checkOffline();
  }

  function renderNetwork() {
    const badge = $("#pwaNetworkState");
    if (badge) badge.textContent = navigator.onLine ? "En ligne" : "Hors ligne";
  }

  async function checkOffline() {
    const status = $("#pwaReadinessStatus");
    if (!status) return;
    renderNetwork();
    if (!("serviceWorker" in navigator) || !("caches" in window)) {
      status.textContent = "Échec : ce navigateur ne prend pas en charge le service worker ou le cache PWA requis.";
      return;
    }
    try {
      const registration = await navigator.serviceWorker.getRegistration(new URL("./", document.baseURI).href);
      if (!registration) {
        status.textContent = "Service worker non enregistré. Ouvrez le site en HTTPS, avec une connexion Internet, puis rechargez la page.";
        return;
      }
      const cacheNames = (await caches.keys()).filter(name => /^zodiaque-28-lettres-/.test(name)).sort();
      const cacheName = cacheNames.at(-1);
      if (!cacheName) {
        status.textContent = "Le cache local n’a pas encore été créé. Gardez la page ouverte en ligne, attendez quelques secondes puis relancez la vérification.";
        return;
      }
      const cache = await caches.open(cacheName);
      const results = await Promise.all(REQUIRED.map(async path => ({
        path,
        ok: Boolean(await cache.match(localUrl(path)))
      })));
      const missing = results.filter(item => !item.ok).map(item => item.path);
      const details = $("#pwaMissingDetails");
      const list = $("#pwaMissingList");
      if (list) list.innerHTML = missing.map(path => `<li><code>${path.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}</code></li>`).join("");
      if (details) details.hidden = missing.length === 0;

      let report = null;
      const reportResponse = await cache.match(localUrl("./__z28_cache_report__.json"));
      if (reportResponse) {
        try { report = await reportResponse.json(); } catch {}
      }
      if (missing.length) {
        status.textContent = `Cache incomplet : ${results.length - missing.length}/${results.length} ressources essentielles présentes (cache ${cacheName}). Les éléments manquants sont listés ci-dessous.`;
      } else if (report?.failed?.length) {
        status.textContent = `Les ${results.length} ressources essentielles sont présentes, mais le rapport du service worker signale ${report.failed.length} autre(s) ressource(s) non mises en cache.`;
      } else {
        status.textContent = `Cache vérifié : ${results.length}/${results.length} ressources essentielles présentes (cache ${cacheName}). Pour confirmer le fonctionnement réel, activez le mode avion puis fermez et rouvrez l’application.`;
      }
    } catch (error) {
      status.textContent = "Impossible de vérifier le cache local : " + (error?.message || "erreur inconnue") + ".";
    }
  }

  async function install() {
    const status = $("#pwaReadinessStatus");
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      installPrompt = null;
      if (status) status.textContent = choice?.outcome === "accepted"
        ? "Demande d’installation acceptée par le navigateur."
        : "Installation non confirmée. Vous pouvez la lancer depuis le menu de Chrome.";
      return;
    }
    if (status) status.textContent = "Aucune invite d’installation automatique n’est disponible. Dans Chrome sur Android, ouvrez ⋮ puis « Installer l’application » ou « Ajouter à l’écran d’accueil ». Cette possibilité dépend du navigateur et de ses critères d’installation.";
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    const button = $("#pwaInstallButton");
    if (button) button.textContent = "Installer sur cet appareil";
  });
  window.addEventListener("appinstalled", () => {
    const status = $("#pwaReadinessStatus");
    if (status) status.textContent = "Événement d’installation reçu par le navigateur.";
  });
  window.addEventListener("online", renderNetwork);
  window.addEventListener("offline", renderNetwork);

  function mount() { addCard(); }
  document.addEventListener("DOMContentLoaded", mount, { once: true });
  if (document.readyState !== "loading") mount();
  if ("MutationObserver" in window) new MutationObserver(mount).observe(document.documentElement, {childList: true, subtree: true});
})();
