/* Diagnostic PWA : installation Android et préparation hors connexion. */
(() => {
  const REQUIRED = [
    "./index.html", "./styles.css", "./app.js", "./astronomy.js",
    "./vendor/astronomy/astronomy.browser.min.js",
    "./referentiel/lettres.json", "./referentiel/zodiaque.json",
    "./referentiel/planetes.json", "./manifest.webmanifest",
    "./icons/icon-192.svg", "./icons/icon-512.svg"
  ];
  let installPrompt = null;
  const $ = (selector) => document.querySelector(selector);

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
        <p class="muted">Vérifiez que les ressources essentielles sont enregistrées sur cet appareil.</p>
      </div><span class="tag" id="pwaNetworkState">Vérification…</span></div>
      <div class="toolbar">
        <button type="button" class="primary" id="pwaInstallButton">Installer l’application</button>
        <button type="button" class="secondary" id="pwaCheckButton">Vérifier le mode hors connexion</button>
      </div>
      <p id="pwaReadinessStatus" class="small muted" role="status" aria-live="polite">Vérification du service worker et du cache local…</p>
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
      status.textContent = "Ce navigateur ne prend pas en charge le service worker ou le cache PWA requis.";
      return;
    }
    try {
      const registration = await navigator.serviceWorker.getRegistration("./");
      if (!registration) {
        status.textContent = "Le service worker n’est pas encore enregistré. Rechargez la page avec une connexion Internet.";
        return;
      }
      const cacheNames = await caches.keys();
      const cacheName = cacheNames.find(name => /^zodiaque-28-lettres-/.test(name));
      if (!cacheName) {
        status.textContent = "Le cache local n’a pas encore été créé. Gardez la page ouverte en ligne puis relancez la vérification.";
        return;
      }
      const cache = await caches.open(cacheName);
      const results = await Promise.all(REQUIRED.map(async path => ({
        path,
        ok: Boolean(await cache.match(new URL(path, document.baseURI).href))
      })));
      const missing = results.filter(item => !item.ok).map(item => item.path);
      if (missing.length) {
        status.textContent = `Cache partiel : ${results.length - missing.length}/${results.length} ressources essentielles présentes. Ouvrez l’application en ligne, puis réessayez.`;
      } else {
        status.textContent = `Prêt pour un test hors connexion : ${results.length}/${results.length} ressources essentielles sont en cache. Le fonctionnement complet doit être confirmé en activant le mode avion puis en rouvrant l’application.`;
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
        ? "Installation acceptée par le navigateur."
        : "Installation non confirmée. Vous pouvez la lancer depuis le menu de Chrome.";
      return;
    }
    if (status) status.textContent = "Aucune invite d’installation automatique n’est disponible pour le moment. Dans Chrome sur Android, ouvrez ⋮ puis « Installer l’application » ou « Ajouter à l’écran d’accueil ».";
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    const button = $("#pwaInstallButton");
    if (button) button.textContent = "Installer sur cet appareil";
  });
  window.addEventListener("appinstalled", () => {
    const status = $("#pwaReadinessStatus");
    if (status) status.textContent = "L’application a été installée sur cet appareil.";
  });
  window.addEventListener("online", renderNetwork);
  window.addEventListener("offline", renderNetwork);

  function mount() {
    addCard();
  }
  document.addEventListener("DOMContentLoaded", mount, { once: true });
  if (document.readyState !== "loading") mount();
  if ("MutationObserver" in window) {
    new MutationObserver(mount).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
