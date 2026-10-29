/* Couche produit UI — enrichissement non destructif du shell applicatif. */
(() => {
  const navViews = [
    ["profile", "profile"],
    ["abjad", "calculateText"],
    ["letters", "exploreLetters"],
    ["zodiac", "exploreZodiac"],
    ["moon", "moon"],
    ["astronomy", "astronomyNav"]
  ];

  const localLabels = {
    fr: {
      quickTitle: "Parcours rapide",
      quickIntro: "Accédez directement aux fonctions principales de l’application.",
      safety: "Les calculs astronomiques sont techniques ; les lectures astrologiques restent symboliques et non scientifiques.",
      badge: "Astronomie technique · astrologie symbolique"
    },
    ar: {
      quickTitle: "مسار سريع",
      quickIntro: "الوصول مباشرةً إلى الوظائف الرئيسية للتطبيق.",
      safety: "الحسابات الفلكية تقنية؛ أما القراءات التنجيمية فتبقى رمزية وغير علمية.",
      badge: "فلك تقني · تنجيم رمزي"
    },
    en: {
      quickTitle: "Quick access",
      quickIntro: "Go directly to the main functions of the application.",
      safety: "Astronomical calculations are technical; astrological readings remain symbolic and non-scientific.",
      badge: "Technical astronomy · symbolic astrology"
    }
  };

  const lang = () => {
    const current = window.Z28I18n?.get?.() || document.documentElement.lang || "fr";
    return localLabels[current] ? current : "fr";
  };

  const label = (language, key) => window.Z28I18n?.text?.(language, key) || key;

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
          <h3 id="productQuickActionsTitle"></h3>
          <p class="muted" id="productQuickActionsIntro"></p>
        </div>
      </div>
      <div class="quick-action-grid">
        ${navViews.map(([view, key]) => `<button type="button" class="secondary quick-action" data-product-go="${view}" data-i18n="${key}"></button>`).join("")}
      </div>
      <p class="small muted product-safety-note" id="productSafetyNote"></p>
    `;
    section.querySelectorAll("[data-product-go]").forEach(button => {
      button.addEventListener("click", () => go(button.dataset.productGo));
    });
    app.appendChild(section);
    refreshHomeText();
  }

  function refreshHomeText() {
    const section = document.querySelector("#productQuickActions");
    if (!section) return;
    const language = lang();
    const l = localLabels[language];
    if (section.querySelector("#productQuickActionsTitle").textContent !== l.quickTitle) section.querySelector("#productQuickActionsTitle").textContent = l.quickTitle;
    if (section.querySelector("#productQuickActionsIntro").textContent !== l.quickIntro) section.querySelector("#productQuickActionsIntro").textContent = l.quickIntro;
    if (section.querySelector("#productSafetyNote").textContent !== l.safety) section.querySelector("#productSafetyNote").textContent = l.safety;
    section.querySelectorAll("[data-i18n]").forEach(button => {
      const nextText = label(language, button.dataset.i18n);
      if (button.textContent !== nextText) button.textContent = nextText;
    });
  }

  function enhanceProfile() {
    const app = document.querySelector("#app");
    if (!app || !/Profil personnalisé|الملف الشخصي|Profile/i.test(app.textContent || "")) return;
    const title = app.querySelector("h2");
    if (!title) return;
    let badge = app.querySelector("#profileMethodBadge");
    if (!badge) {
      badge = document.createElement("span");
      badge.id = "profileMethodBadge";
      badge.className = "tag";
      title.insertAdjacentElement("afterend", badge);
    }
    const nextBadge = localLabels[lang()].badge;
    if (badge.textContent !== nextBadge) badge.textContent = nextBadge;
  }

  function run() {
    enhanceHome();
    refreshHomeText();
    enhanceProfile();
  }

  window.addEventListener("load", run, {once: true});
  new MutationObserver(run).observe(document.documentElement, {subtree: true, childList: true});
})();
