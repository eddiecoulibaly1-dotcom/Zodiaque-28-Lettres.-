/* Analyse Abjad du nom / texte arabe dans le profil.
 * Référentiel unique : Abjad Maghrébin + classification élémentaire contrôlée.
 * Aucune correspondance lettre → signe → planète n'est déduite.
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
    const unknown = new Map();
    const details = [];
    let total = 0;
    let recognized = 0;
    for (const ch of [...(text || "").normalize("NFC")]) {
      const normalized = window.Z28AbjadNormalization?.normalizeLetter(ch) ?? ( /[\u064B-\u065F\u0670\u06D6-\u06ED]/u.test(ch) || /[\s\p{P}\p{S}]/u.test(ch) || ch === "ـ" ? null : ch);
      if (normalized === null) continue;
      const l = map.get(normalized);
      if (!l) { unknown.set(ch, (unknown.get(ch) || 0) + 1); continue; }
      total += Number(l.abjad_maghribi);
      recognized++;
      counts[l.element]++;
      values[l.element] += Number(l.abjad_maghribi);
      details.push({...l, inputLetter: ch});
    }
    const maxCount = Math.max(...Object.values(counts), 0);
    const maxValue = Math.max(...Object.values(values), 0);
    return {total, recognized, counts, values, unknown:[...unknown.entries()], details, maxCount, maxValue};
  }

  function render(r) {
    const max = Math.max(r.maxValue, 1);
    return `<div class="grid" style="margin-top:12px">
      <div class="card"><div class="kpi">${r.total}</div><b>Total Abjad Maghrébin</b><p class="muted">${r.recognized} lettre(s) reconnue(s)</p></div>
      <div class="card"><h3>Répartition élémentaire</h3>
        ${ELEMENTS.map(e => `<div style="margin:7px 0"><div style="display:flex;justify-content:space-between"><span>${e}</span><b>${r.counts[e]} lettre(s) · ${r.values[e]}</b></div><div class="progress"><span style="width:${Math.round(r.values[e]/max*100)}%"></span></div></div>`).join("")}
      </div>
    </div>
    <div class="card" style="margin-top:12px"><h3>Détail lettre par lettre</h3>
      ${r.details.length ? `<div class="table-wrap"><table><thead><tr><th>Saisie</th><th>Lettre référentiel</th><th>Nom</th><th>Abjad</th><th>Élément</th></tr></thead><tbody>${r.details.map(l => `<tr><td class="arabic">${esc(l.inputLetter)}</td><td class="arabic">${esc(l.letter)}</td><td>${esc(l.name_fr)}</td><td>${l.abjad_maghribi}</td><td>${esc(l.element)}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Aucune lettre reconnue.</p>`}
      ${r.unknown.length ? `<div class="warning"><b>Caractères non référencés :</b> ${r.unknown.map(x => `<span class="pill">${esc(x[0])} ×${x[1]}</span>`).join(" ")}</div>` : ""}
    </div>
    <p class="tiny muted">Cette analyse utilise exclusivement l'Abjad Maghrébin et la classification élémentaire du référentiel. Aucune correspondance lettre → signe → planète n'est déduite.</p>`;
  }

  async function mount() {
    const root = $("#app");
    if (!root || !$("#pCalc") || $("#pAbjadPanel")) return;
    const panel = document.createElement("div");
    panel.id = "pAbjadPanel";
    panel.className = "card";
    panel.style.marginTop = "14px";
    panel.innerHTML = `<h3>Analyse du nom / texte arabe</h3><div class="toolbar"><input id="pText" dir="rtl" placeholder="اكتب الاسم أو النص العربي"><button class="primary" id="pAbjad">Analyser</button></div><div id="pAbjadOut"></div>`;
    const theme = $("#pTheme");
    if (theme) theme.after(panel); else root.append(panel);
    const saved = localStorage.getItem(KEY) || "";
    $("#pText").value = saved;
    $("#pAbjad").onclick = async () => {
      const text = $("#pText").value;
      localStorage.setItem(KEY, text);
      const out = $("#pAbjadOut");
      out.innerHTML = "<p class=\"muted\">Analyse…</p>";
      try { await loadLetters(); out.innerHTML = render(analyse(text)); }
      catch (e) { out.innerHTML = `<div class="warning">${esc(e.message)}</div>`; }
    };
    if (saved) {
      try { await loadLetters(); $("#pAbjadOut").innerHTML = render(analyse(saved)); }
      catch (_) {}
    }
  }

  const observer = new MutationObserver(() => setTimeout(mount, 0));
  document.addEventListener("DOMContentLoaded", () => {
    const app = $("#app");
    if (app) observer.observe(app, {childList:true, subtree:true});
    setTimeout(mount, 0);
  });
})();
