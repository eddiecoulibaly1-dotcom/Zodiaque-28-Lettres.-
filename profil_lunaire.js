/* Profil lunaire complémentaire — données astronomiques calculées.
 * Ne mélange pas âge lunaire, jour civil et interprétation astrologique.
 * Dépend du moteur Astronomy Engine chargé par index.html et du profil local v4.
 */
(() => {
  const KEY = "z28_profile_v4";
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const norm = x => ((Number(x) % 360) + 360) % 360;
  const ready = () => typeof globalThis.Astronomy !== "undefined";
  const fmtDate = d => d ? new Date(d).toLocaleString("fr-FR", { dateStyle:"medium", timeStyle:"short" }) : "—";
  const phaseName = phase => {
    const p = norm(phase);
    if (p < 22.5) return "Nouvelle Lune";
    if (p < 67.5) return "Premier croissant";
    if (p < 112.5) return "Premier quartier";
    if (p < 157.5) return "Gibbeuse croissante";
    if (p < 202.5) return "Pleine Lune";
    if (p < 247.5) return "Gibbeuse décroissante";
    if (p < 292.5) return "Dernier quartier";
    if (p < 337.5) return "Dernier croissant";
    return "Nouvelle Lune";
  };
  const quarterName = q => ({0:"Nouvelle Lune",1:"Premier quartier",2:"Pleine Lune",3:"Dernier quartier"}[q] || "Phase lunaire");
  const lunarAge = (A, date) => {
    const start = new Date(date.getTime() - 40 * 86400000);
    let q = A.SearchMoonQuarter(start), lastNew = null;
    for (let i = 0; i < 8 && q; i++) {
      if (q.time.date > date) break;
      if (q.quarter === 0) lastNew = q.time.date;
      q = A.NextMoonQuarter(q);
    }
    return lastNew ? Math.max(0, (date - lastNew) / 86400000) : null;
  };
  const nextQuarters = (A, date) => {
    const out = [];
    let q = A.SearchMoonQuarter(date);
    for (let i = 0; i < 4 && q; i++) {
      out.push({ quarter:q.quarter, date:q.time.date });
      q = A.NextMoonQuarter(q);
    }
    return out;
  };
  function render() {
    const root = document.querySelector("#pTheme");
    if (!root || document.querySelector("#pLunarData")) return;
    if (!ready()) return;
    let profile = {};
    try { profile = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (_) { return; }
    if (!profile.birth || profile.lat === undefined || profile.lon === undefined) return;
    const date = new Date(profile.birth);
    if (!Number.isFinite(date.getTime())) return;
    try {
      const A = globalThis.Astronomy;
      const obs = new A.Observer(Number(profile.lat), Number(profile.lon), Number(profile.elev || 0));
      const illum = A.Illumination(A.Body.Moon, date);
      const phase = norm(A.MoonPhase(date));
      const age = lunarAge(A, date);
      const rise = A.SearchRiseSet(A.Body.Moon, obs, +1, date, 2, 0);
      const set = A.SearchRiseSet(A.Body.Moon, obs, -1, date, 2, 0);
      const quarters = nextQuarters(A, date);
      const card = document.createElement("div");
      card.id = "pLunarData";
      card.className = "card";
      card.style.marginTop = "14px";
      card.innerHTML = `<h3>🌙 Données lunaires astronomiques</h3>
        <div class="grid">
          <div><div class="kpi">${phase.toFixed(2)}°</div><p>Longitude de phase (0° = nouvelle lune)</p></div>
          <div><div class="kpi">${age === null ? "—" : age.toFixed(2) + " j"}</div><p>Âge lunaire depuis la dernière Nouvelle Lune</p></div>
          <div><div class="kpi">${(Number(illum.phase_fraction) * 100).toFixed(1)}%</div><p>Fraction éclairée</p></div>
          <div><div class="kpi">${esc(phaseName(phase))}</div><p>Phase lunaire astronomique</p></div>
        </div>
        <div class="table-wrap" style="margin-top:12px"><table><thead><tr><th>Événement</th><th>Date/heure locale de l'appareil</th></tr></thead><tbody>
          <tr><td>Lever de Lune</td><td>${esc(fmtDate(rise?.date))}</td></tr>
          <tr><td>Coucher de Lune</td><td>${esc(fmtDate(set?.date))}</td></tr>
          ${quarters.map(q => `<tr><td>${quarterName(q.quarter)}</td><td>${esc(fmtDate(q.date))}</td></tr>`).join("")}
        </tbody></table></div>
        <p class="small muted">Ces valeurs sont des calculs astronomiques. L'âge lunaire est une durée depuis une Nouvelle Lune réelle calculée ; il ne désigne pas le jour civil ni un « jour lunaire » symbolique.</p>`;
      root.appendChild(card);
    } catch (e) {
      const card = document.createElement("div");
      card.id = "pLunarData";
      card.className = "notice";
      card.style.marginTop = "14px";
      card.innerHTML = `<b>Données lunaires :</b> ${esc(e.message)}`;
      root.appendChild(card);
    }
  }
  const observer = new MutationObserver(() => render());
  document.addEventListener("DOMContentLoaded", () => {
    const app = document.querySelector("#app");
    if (app) observer.observe(app, { childList:true, subtree:true });
    setTimeout(render, 0);
  });
})();
