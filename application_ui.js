/* Couche produit UI — enrichissement non destructif du shell applicatif. */
(() => {
  const navViews = [
    ["profile", "Créer / actualiser mon profil"],
    ["abjad", "Calculer un texte en Abjad"],
    ["letters", "Explorer les 28 lettres"],
    ["zodiac", "Explorer les 12 signes"],
    ["moon", "Voir la situation lunaire"],
    ["astronomy", "Ouvrir les données astronomiques"]
  ];

  const go = view => {
    const button = document.querySelector(`.nav[data-view="${CSS.escape(view)}"]`);
    if (button) button.click();
  };

  function enhanceHome() {
    const app = document.querySelector("#app");
    if (!app || document.querySelector("#productQuickActions")) return;
    const heading = app.querySelector("h2");
    if (!heading || !/Zodiaque & 28 Lettres/i.test(heading.textContent || "")) return;

    const section = document.createElement("section");
    section.id = "productQuickActions";
    section.className = "card product-quick-actions";
    section.setAttribute("aria-labelledby", "productQuickActionsTitle");
    section.innerHTML = `
      <div class="detail-head">
        <div>
          <h3 id="productQuickActionsTitle">Parcours rapide</h3>
          <p class="muted">Accédez directement aux fonctions principales de l’application.</p>
        </div>
      </div>
      <div class="quick-action-grid">
        ${navViews.map(([view, label]) => `<button type="button" class="secondary quick-action" data-product-go="${view}">${label}</button>`).join("")}
      </div>
      <p class="small muted product-safety-note">Les calculs astronomiques sont techniques ; les lectures astrologiques restent symboliques et non scientifiques.</p>
    `;
    section.querySelectorAll("[data-product-go]").forEach(button => {
      button.addEventListener("click", () => go(button.dataset.productGo));
    });
    app.appendChild(section);
  }

  function enhanceProfile() {
    const app = document.querySelector("#app");
    if (!app || !/Profil personnalisé/i.test(app.textContent || "")) return;
    const title = app.querySelector("h2");
    if (!title || app.querySelector("#profileMethodBadge")) return;
    const badge = document.createElement("span");
    badge.id = "profileMethodBadge";
    badge.className = "tag";
    badge.textContent = "Astronomie technique · astrologie symbolique";
    title.insertAdjacentElement("afterend", badge);
  }

  function run() {
    enhanceHome();
    enhanceProfile();
  }

  window.addEventListener("load", run, {once: true});
  new MutationObserver(run).observe(document.documentElement, {subtree: true, childList: true});
})();
