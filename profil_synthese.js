/* Parcours V2 : Profil → Abjad → thème → synthèse.
 * Les calculs astronomiques existants restent inchangés.
 * Les lectures issues de l'Abjad et du zodiaque sont explicitement symboliques.
 */
(() => {
  const KEY = "z28_profile_text";
  const ELEMENTS = ["Feu", "Terre", "Air", "Eau"];
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  let letters = null;
  let loading = null;

  async function loadLetters() {
    if (letters) return letters;
    if (!loading) loading = fetch("referentiel/lettres.json", {cache:"no-cache"}).then(r => {
      if (!r.ok) throw new Error("Impossible de charger le référentiel des 28 lettres.");
      return r.json();
    }).then(d => {
      letters = Array.isArray(d.letters) ? d.letters : [];
      if (letters.length !== 28) throw new Error("Le référentiel des lettres doit contenir exactement 28 entrées.");
      return letters;
    });
    return loading;
  }

  function analyse(text) {
    const map = new Map(letters.map(l => [l.letter, l]));
    const counts = Object.fromEntries(ELEMENTS.map(e => [e, 0]));
    const values = Object.fromEntries(ELEMENTS.map(e => [e, 0]));
    let total = 0, recognized = 0;
    for (const ch of [...(text || "").normalize("NFC")]) {
      const normalized = window.Z28AbjadNormalization?.normalizeLetter(ch) ?? ( /[\u064B-\u065F\u0670\u06D6-\u06ED]/u.test(ch) || /[\s\p{P}\p{S}]/u.test(ch) || ch === "ـ" ? null : ch);
      if (normalized === null) continue;
      const l = map.get(normalized);
      if (!l) continue;
      total += Number(l.abjad_maghribi);
      recognized++;
      counts[l.element]++;
      values[l.element] += Number(l.abjad_maghribi);
    }
    const ranked = ELEMENTS.map(e => ({element:e, count:counts[e], value:values[e]})).sort((a,b) => b.value-a.value || b.count-a.count);
    return {total, recognized, counts, values, dominant: ranked[0]};
  }

  function render(r, name) {
    const hasLetters = r.recognized > 0;
    const dominant = hasLetters ? `${r.dominant.element} · ${r.dominant.value} points Abjad` : "Non déterminé";
    return `<section id="profileSynthesis" class="card" aria-labelledby="profileSynthesisTitle" style="margin-top:14px">
      <div class="detail-head"><div><h3 id="profileSynthesisTitle">Synthèse personnelle</h3><p class="muted">${name ? `Profil de ${esc(name)}` : "Reliez votre nom à l’analyse du profil."}</p></div><span class="tag">V2 · symbolique</span></div>
      ${hasLetters ? `<div class="grid">
        <div class="card"><div class="kpi">${r.total}</div><b>Valeur Abjad</b><p class="small muted">${r.recognized} lettre(s) arabe(s) reconnue(s)</p></div>
        <div class="card"><div class="kpi">${esc(r.dominant.element)}</div><b>Élément dominant</b><p class="small muted">${dominant}</p></div>
        <div class="card"><h4>Répartition</h4>${ELEMENTS.map(e => `<p class="small"><b>${e}</b> · ${r.counts[e]} lettre(s) · ${r.values[e]}</p>`).join("")}</div>
      </div>` : `<div class="notice">Aucune lettre arabe du référentiel n’a encore été reconnue. Saisissez un nom en arabe puis relancez l’analyse.</div>`}
      <div class="notice" style="margin-top:12px"><b>Lecture méthodologique :</b> l’Abjad et la synthèse élémentaire relèvent ici d’un cadre traditionnel/symbolique. Ils ne constituent pas une méthode scientifique et aucune correspondance lettre → signe → planète non définie dans le référentiel n’est inventée.</div>
    </section>`;
  }

  async function mount() {
    const root = $("#app"), calc = $("#pCalc");
    if (!root || !calc || $("#profileSynthesis")) return;
    const panel = document.createElement("section");
    panel.id = "profileFlowCard";
    panel.className = "card";
    panel.style.marginTop = "14px";
    panel.innerHTML = `<div class="detail-head"><div><h3>Parcours Profil → Abjad → thème</h3><p class="muted">Utilisez le nom du profil comme point d’entrée de l’analyse Abjad.</p></div></div><div class="toolbar"><button type="button" class="secondary" id="profileUseName">Utiliser mon nom</button><button type="button" class="primary" id="profileAnalyzeName">Analyser mon nom</button></div><p id="profileFlowStatus" class="small muted"></p>`;
    const theme = $("#pTheme");
    if (theme) theme.after(panel); else root.append(panel);

    const syncName = () => {
      const text = $("#pText"), name = $("#pName");
      if (!text || !name) return;
      text.value = name.value.trim();
      localStorage.setItem(KEY, text.value);
    };
    $("#profileUseName").onclick = () => {
      syncName();
      $("#profileFlowStatus").textContent = "Nom transféré vers l’analyse Abjad.";
      $("#pText")?.focus();
    };
    $("#profileAnalyzeName").onclick = async () => {
      syncName();
      const value = $("#pText")?.value || "";
      const status = $("#profileFlowStatus");
      status.textContent = "Analyse en cours…";
      try {
        await loadLetters();
        const result = analyse(value);
        const host = $("#profileSynthesis") || document.createElement("div");
        if (!host.id) { host.id = "profileSynthesisHost"; panel.after(host); }
        host.innerHTML = render(result, name?.value.trim() || value);
        status.textContent = "Analyse Abjad et synthèse mises à jour.";
        document.querySelector("#profileSynthesis")?.scrollIntoView({behavior:"smooth", block:"nearest"});
      } catch (e) {
        status.textContent = e.message;
      }
    };
  }

  const observer = new MutationObserver(() => setTimeout(mount, 0));
  document.addEventListener("DOMContentLoaded", () => {
    const app = $("#app");
    if (app) observer.observe(app, {childList:true, subtree:true});
    setTimeout(mount, 0);
  });
})();
