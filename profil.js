/*
 * Profil astronomique — Zodiaque & 28 Lettres.
 * Complément UI chargé après app.js.
 * Les calculs utilisent Astronomy Engine déjà chargé par index.html.
 * Astronomie = calcul technique ; astrologie = interprétation symbolique séparée.
 */

(() => {
  const PROFILE_KEY = "z28_profile_v2";
  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const norm = (x) => ((Number(x) % 360) + 360) % 360;
  const signs = [
    ["Bélier","♈"],["Taureau","♉"],["Gémeaux","♊"],["Cancer","♋"],
    ["Lion","♌"],["Vierge","♍"],["Balance","♎"],["Scorpion","♏"],
    ["Sagittaire","♐"],["Capricorne","♑"],["Verseau","♒"],["Poissons","♓"]
  ];
  const bodies = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
  const labels = {Sun:"Soleil",Moon:"Lune",Mercury:"Mercure",Venus:"Vénus",Mars:"Mars",Jupiter:"Jupiter",Saturn:"Saturne",Uranus:"Uranus",Neptune:"Neptune",Pluto:"Pluton"};

  function ready() {
    return typeof globalThis.Astronomy !== "undefined";
  }

  function localDateValue(d = new Date()) {
    const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return x.toISOString().slice(0, 16);
  }

  function sign(lon) {
    const l = norm(lon);
    const i = Math.floor(l / 30);
    return { name: signs[i][0], symbol: signs[i][1], degree: l - i * 30 };
  }

  function fmtDeg(x) {
    return Number.isFinite(x) ? `${x.toFixed(2)}°` : "—";
  }

  function fmtDate(d) {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d));
  }

  function position(bodyName, date, observer) {
    const A = globalThis.Astronomy;
    const B = A.Body[bodyName];
    const lon = norm(A.EclipticLongitude(B, date));
    const eq = A.Equator(B, date, observer, true, true);
    const hor = A.Horizon(date, observer, eq.ra, eq.dec, "normal");
    return { body: bodyName, longitude: lon, sign: sign(lon), ra: eq.ra, dec: eq.dec, az: hor.azimuth, alt: hor.altitude };
  }

  function ascendantAndMc(date, observer) {
    const A = globalThis.Astronomy;
    // Astronomy Engine exposes the exact horizon-to-equatorial rotation.
    // In its horizontal coordinate system: x=north, y=west, z=up.
    // Therefore (0,-1,0) is due east (Ascendant), and (0,0,1) is zenith/MC direction.
    const rotation = A.Rotation_HOR_EQJ(date, observer);
    const east = A.RotateVector(rotation, new A.Vector(0, -1, 0, new A.AstroTime(date)));
    const zenith = A.RotateVector(rotation, new A.Vector(0, 0, 1, new A.AstroTime(date)));
    const asc = A.Ecliptic(east).elon;
    const mc = A.Ecliptic(zenith).elon;
    return { ascendant: norm(asc), mc: norm(mc) };
  }

  function renderProfile() {
    const root = $("#app");
    if (!root) return;
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); } catch (_) {}
    root.innerHTML = `
      <h2>Profil astronomique</h2>
      <p class="lead">Date, heure et lieu de naissance → Soleil, Lune, planètes, Ascendant et Milieu du Ciel. Les résultats astronomiques sont calculés séparément de toute interprétation astrologique.</p>
      <div class="grid wide">
        <div class="card">
          <h3>Données de naissance</h3>
          <div class="toolbar">
            <input id="pName" placeholder="Nom / prénom" value="${esc(saved.name || "")}">
            <input id="pBirth" type="datetime-local" value="${esc(saved.birth || "")}">
            <input id="pLat" type="number" step="any" min="-90" max="90" placeholder="Latitude (°)" value="${esc(saved.lat ?? "")}">
            <input id="pLon" type="number" step="any" min="-180" max="180" placeholder="Longitude (°)" value="${esc(saved.lon ?? "")}">
            <input id="pElev" type="number" step="1" min="0" placeholder="Altitude (m)" value="${esc(saved.elev ?? 0)}">
          </div>
          <div class="toolbar">
            <button class="primary" id="pCalculate">Calculer le profil</button>
            <button class="secondary" id="pNow">Maintenant</button>
            <button class="secondary" id="pSave">Enregistrer</button>
          </div>
          <p id="pStatus" class="small muted"></p>
        </div>
      </div>
      <div id="pOutput"></div>
      <div class="notice"><b>Important :</b> l'Ascendant et le Milieu du Ciel sont des coordonnées astronomiques utilisées ici comme bases d'un calcul astrologique. L'interprétation qui en découle reste traditionnelle/symbolique.</div>`;

    $("#pNow").addEventListener("click", () => { $("#pBirth").value = localDateValue(); });
    $("#pSave").addEventListener("click", saveProfile);
    $("#pCalculate").addEventListener("click", calculate);
    if (saved.birth && saved.lat !== undefined && saved.lon !== undefined) calculate();
  }

  function readInput() {
    const birth = new Date($("#pBirth").value);
    const lat = Number($("#pLat").value);
    const lon = Number($("#pLon").value);
    const elev = Number($("#pElev").value || 0);
    if (!ready()) throw new Error("Le moteur astronomique n'est pas chargé. Vérifiez le chargement d'Astronomy Engine.");
    if (!Number.isFinite(birth.getTime())) throw new Error("Date et heure de naissance invalides.");
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error("Latitude invalide.");
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) throw new Error("Longitude invalide.");
    if (!Number.isFinite(elev) || elev < 0) throw new Error("Altitude invalide.");
    return { birth, lat, lon, elev };
  }

  function saveProfile() {
    try {
      const v = readInput();
      localStorage.setItem(PROFILE_KEY, JSON.stringify({
        name: $("#pName").value.trim(), birth: $("#pBirth").value,
        lat: v.lat, lon: v.lon, elev: v.elev
      }));
      $("#pStatus").textContent = "Profil enregistré sur cet appareil.";
    } catch (e) { $("#pStatus").textContent = e.message; }
  }

  function calculate() {
    const output = $("#pOutput");
    try {
      const { birth, lat, lon, elev } = readInput();
      const A = globalThis.Astronomy;
      const observer = new A.Observer(lat, lon, elev);
      const positions = bodies.map(b => position(b, birth, observer));
      const angles = ascendantAndMc(birth, observer);
      const sun = positions.find(x => x.body === "Sun");
      const moon = positions.find(x => x.body === "Moon");
      const asc = sign(angles.ascendant);
      const mc = sign(angles.mc);
      const name = $("#pName").value.trim();

      output.innerHTML = `
        <div class="grid">
          <article class="card"><h3>☀️ Soleil</h3><div class="kpi">${sun.sign.symbol} ${esc(sun.sign.name)}</div><p>Longitude : <b>${fmtDeg(sun.longitude)}</b></p></article>
          <article class="card"><h3>🌙 Lune</h3><div class="kpi">${moon.sign.symbol} ${esc(moon.sign.name)}</div><p>Longitude : <b>${fmtDeg(moon.longitude)}</b></p></article>
          <article class="card"><h3>Ascendant</h3><div class="kpi">${asc.symbol} ${esc(asc.name)}</div><p>Longitude : <b>${fmtDeg(angles.ascendant)}</b></p></article>
          <article class="card"><h3>Milieu du Ciel</h3><div class="kpi">${mc.symbol} ${esc(mc.name)}</div><p>Longitude : <b>${fmtDeg(angles.mc)}</b></p></article>
        </div>
        <div class="card" style="margin-top:15px">
          <h3>${name ? esc(name) + " · " : ""}Positions planétaires</h3>
          <p class="small muted">Calcul pour ${fmtDate(birth)} · latitude ${lat.toFixed(4)}° · longitude ${lon.toFixed(4)}° · altitude ${elev} m.</p>
          <div class="table-wrap"><table><thead><tr><th>Corps</th><th>Longitude</th><th>Signe</th><th>RA</th><th>Déclinaison</th><th>Azimut</th><th>Altitude</th></tr></thead><tbody>
          ${positions.map(p => `<tr><td><b>${esc(labels[p.body])}</b></td><td>${fmtDeg(p.longitude)}</td><td>${p.sign.symbol} ${esc(p.sign.name)} ${fmtDeg(p.sign.degree)}</td><td>${p.ra.toFixed(3)} h</td><td>${fmtDeg(p.dec)}</td><td>${fmtDeg(p.az)}</td><td>${fmtDeg(p.alt)}</td></tr>`).join("")}
          </tbody></table></div>
        </div>
        <div class="grid wide" style="margin-top:15px">
          <div class="card"><h3>Base astrologique disponible</h3><ul class="list"><li>Soleil : ${sun.sign.symbol} ${esc(sun.sign.name)}</li><li>Lune : ${moon.sign.symbol} ${esc(moon.sign.name)}</li><li>Ascendant : ${asc.symbol} ${esc(asc.name)}</li><li>Milieu du Ciel : ${mc.symbol} ${esc(mc.name)}</li></ul></div>
          <div class="card"><h3>Limites actuelles</h3><p>Les positions astronomiques sont calculées. Les maisons détaillées, aspects et interprétations personnalisées ne sont pas inventés lorsqu'aucune méthode de calcul n'est encore définie dans le référentiel du projet.</p></div>
        </div>`;
    } catch (e) {
      output.innerHTML = `<div class="card"><h3>Calcul impossible</h3><p>${esc(e.message)}</p></div>`;
    }
  }

  function hook() {
    document.querySelectorAll('.nav[data-view="profile"]').forEach(btn => {
      if (btn.dataset.profileHooked) return;
      btn.dataset.profileHooked = "1";
      btn.addEventListener("click", () => setTimeout(renderProfile, 0));
    });
    document.querySelectorAll('[data-go="profile"]').forEach(btn => {
      if (btn.dataset.profileHooked) return;
      btn.dataset.profileHooked = "1";
      btn.addEventListener("click", () => setTimeout(renderProfile, 0));
    });
  }

  hook();
  new MutationObserver(hook).observe(document.documentElement, { childList: true, subtree: true });
})();
