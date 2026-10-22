/* Diagnostics astronomiques — Zodiaque & 28 Lettres.
 * Vérifie le moteur calculatoire sans mélanger astronomie et interprétation astrologique.
 */
(() => {
  const esc = v => String(v ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const deg = v => Number.isFinite(v) ? `${v.toFixed(3)}°` : "—";
  const card = (title, body, ok=true) => `<div class="card"><h3>${ok ? "✓" : "⚠"} ${esc(title)}</h3>${body}</div>`;

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
      const obs = new A.Observer(5.2, -3.7, 0);
      const bodies = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
      const rows = bodies.map(name => {
        const B = A.Body[name];
        const lon = ((A.EclipticLongitude(B, now) % 360) + 360) % 360;
        const eq = A.Equator(B, now, obs, true, true);
        const hor = A.Horizon(now, obs, eq.ra, eq.dec, "normal");
        return `<tr><td>${esc(name)}</td><td>${deg(lon)}</td><td>${deg(hor.azimuth)}</td><td>${deg(hor.altitude)}</td></tr>`;
      }).join("");
      const phase = A.MoonPhase(now);
      const illum = A.Illumination(A.Body.Moon, now);
      const quarter = A.SearchMoonQuarter(now);
      root.insertAdjacentHTML("beforeend", `
        <div class="card" style="margin-top:14px">
          <h3>Validation astronomique technique</h3>
          <p class="small muted">Instant de contrôle : ${esc(now.toISOString())}. Les résultats ci-dessous sont des calculs astronomiques et ne constituent pas une interprétation astrologique.</p>
          <div class="grid wide">
            ${card("Moteur", "Astronomy Engine chargé et opérationnel.")}
            ${card("Lune", `Longitude écliptique : <b>${deg( ((A.EclipticLongitude(A.Body.Moon, now)%360)+360)%360 )}</b><br>Angle de phase : <b>${deg(phase)}</b><br>Fraction éclairée : <b>${Number(illum.phase_fraction).toFixed(4)}</b>`) }
            ${card("Prochain quartier", quarter ? `${esc(quarter.time.date.toISOString())} · quartier ${quarter.quarter}` : "Aucun résultat retourné.", !!quarter)}
          </div>
          <div class="table-wrap" style="margin-top:12px"><table><thead><tr><th>Corps</th><th>Longitude écliptique</th><th>Azimut</th><th>Altitude</th></tr></thead><tbody>${rows}</tbody></table></div>
        </div>`);
    }catch(e){
      root.insertAdjacentHTML("beforeend", card("Validation astronomique", esc(e.message || e), false));
    }
  }

  const observe = () => run();
  document.addEventListener("click", e => {
    const nav = e.target.closest?.('.nav[data-view="astronomy"]');
    if(nav) setTimeout(observe, 0);
  });
  new MutationObserver(observe).observe(document.body, {childList:true, subtree:true});
})();
