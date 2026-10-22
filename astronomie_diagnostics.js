/* Diagnostics astronomiques — Zodiaque & 28 Lettres.
 * Vérifie le moteur calculatoire sans mélanger astronomie et interprétation astrologique.
 * Aucun lieu n'est déduit : les coordonnées horizontales ne sont calculées que
 * si l'utilisateur a explicitement enregistré latitude/longitude dans son profil.
 */
(() => {
  const esc = v => String(v ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const deg = v => Number.isFinite(v) ? `${v.toFixed(3)}°` : "—";
  const card = (title, body, ok=true) => `<div class="card"><h3>${ok ? "✓" : "⚠"} ${esc(title)}</h3>${body}</div>`;
  const profileObserver = () => {
    try {
      const p = JSON.parse(localStorage.getItem("z28_profile_v4") || "{}");
      const lat=Number(p.lat), lon=Number(p.lon), elev=Number(p.elev||0);
      if(!Number.isFinite(lat)||!Number.isFinite(lon)) return null;
      return { observer:new globalThis.Astronomy.Observer(lat,lon,elev), label:`${lat.toFixed(4)}°, ${lon.toFixed(4)}° · altitude ${elev} m` };
    } catch (_) { return null; }
  };
  function run(){
    const root = document.querySelector("#app");
    if(!root || !document.querySelector('.nav[data-view="astronomy"]')?.classList.contains("active")) return;
    if(root.dataset.astronomyDiagnostics === "1") return;
    root.dataset.astronomyDiagnostics = "1";
    const now = new Date();
    if(typeof globalThis.Astronomy === "undefined"){
      root.insertAdjacentHTML("beforeend", card("Moteur astronomique", "Astronomy Engine n'est pas chargé. Cette validation reste volontairement bloquante : aucune donnée astronomique ne doit être simulée.", false));
      return;
    }
    try{
      const A = globalThis.Astronomy;
      const location = profileObserver();
      const bodies = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
      const rows = bodies.map(name => {
        const B = A.Body[name];
        const lon = ((A.EclipticLongitude(B, now) % 360) + 360) % 360;
        let az="—", alt="—";
        if(location){ const eq=A.Equator(B,now,location.observer,true,true); const hor=A.Horizon(now,location.observer,eq.ra,eq.dec,"normal"); az=deg(hor.azimuth); alt=deg(hor.altitude); }
        return `<tr><td>${esc(name)}</td><td>${deg(lon)}</td><td>${az}</td><td>${alt}</td></tr>`;
      }).join("");
      const phase = A.MoonPhase(now);
      const illum = A.Illumination(A.Body.Moon, now);
      const quarter = A.SearchMoonQuarter(now);
      root.insertAdjacentHTML("beforeend", `
        <div class="card" style="margin-top:14px">
          <h3>Validation astronomique technique</h3>
          <p class="small muted">Instant de contrôle : ${esc(now.toISOString())}. Les résultats sont astronomiques et ne constituent pas une interprétation astrologique.</p>
          ${location ? `<p class="small"><b>Observateur explicite :</b> ${esc(location.label)}</p>` : `<div class="notice"><b>Observateur non défini.</b> Les longitudes géocentriques restent disponibles ; azimut et altitude nécessitent une latitude/longitude explicitement enregistrée dans le profil.</div>`}
          <div class="grid wide">
            ${card("Moteur", "Astronomy Engine chargé et opérationnel.")}
            ${card("Lune", `Longitude écliptique : <b>${deg(((A.EclipticLongitude(A.Body.Moon,now)%360)+360)%360)}</b><br>Angle de phase : <b>${deg(phase)}</b><br>Fraction éclairée : <b>${Number(illum.phase_fraction).toFixed(4)}</b>`) }
            ${card("Prochain quartier", quarter ? `${esc(quarter.time.date.toISOString())} · quartier ${quarter.quarter}` : "Aucun résultat retourné.", !!quarter)}
          </div>
          <div class="table-wrap" style="margin-top:12px"><table><thead><tr><th>Corps</th><th>Longitude écliptique</th><th>Azimut</th><th>Altitude</th></tr></thead><tbody>${rows}</tbody></table></div>
        </div>`);
    }catch(e){
      root.insertAdjacentHTML("beforeend", card("Validation astronomique", esc(e.message || e), false));
    }
  }
  document.addEventListener("click", e => { if(e.target.closest?.('.nav[data-view="astronomy"]')) setTimeout(run,0); });
  new MutationObserver(run).observe(document.body, {childList:true, subtree:true});
})();
