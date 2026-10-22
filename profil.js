/*
 * Thème natal — Zodiaque & 28 Lettres.
 *
 * Astronomie Engine fournit les positions célestes. Cette couche ajoute :
 * - Soleil/Lune/planètes
 * - Ascendant + Milieu du Ciel
 * - maisons en signes entiers (choix explicite, non présenté comme universel)
 * - aspects majeurs avec orbes configurables et documentés
 *
 * Aucune correspondance lettre → signe → planète n'est inventée ici.
 * L'interprétation astrologique reste traditionnelle/symbolique.
 */

(() => {
  const PROFILE_KEY = "z28_profile_v3";
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

  // Configuration initiale explicite des aspects majeurs.
  // Elle ne constitue pas une correspondance ésotérique : ce sont des paramètres de lecture astrologique.
  const ASPECTS = [
    {key:"conjonction", name:"Conjonction", symbol:"☌", angle:0, orb:8},
    {key:"sextile", name:"Sextile", symbol:"⚹", angle:60, orb:6},
    {key:"carre", name:"Carré", symbol:"□", angle:90, orb:7},
    {key:"trigone", name:"Trigone", symbol:"△", angle:120, orb:8},
    {key:"opposition", name:"Opposition", symbol:"☍", angle:180, orb:8}
  ];

  function ready() { return typeof globalThis.Astronomy !== "undefined"; }

  function localDateValue(d = new Date()) {
    const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return x.toISOString().slice(0, 16);
  }

  function sign(lon) {
    const l = norm(lon);
    const i = Math.floor(l / 30);
    return { index:i, name:signs[i][0], symbol:signs[i][1], degree:l-i*30 };
  }

  function fmtDeg(x) { return Number.isFinite(x) ? `${x.toFixed(2)}°` : "—"; }
  function fmtDate(d) { return new Intl.DateTimeFormat("fr-FR", {dateStyle:"medium", timeStyle:"short"}).format(new Date(d)); }

  // datetime-local représente une heure civile. Le décalage UTC est demandé séparément
  // afin de ne pas dépendre du fuseau de l'appareil qui exécute l'application.
  function parseBirth(localValue, offsetMinutes) {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(localValue || "");
    if (!m) return new Date(NaN);
    const [y,mo,d,h,mi] = m.slice(1).map(Number);
    return new Date(Date.UTC(y, mo-1, d, h, mi) - Number(offsetMinutes)*60000);
  }

  function position(bodyName, date, observer) {
    const A = globalThis.Astronomy;
    const B = A.Body[bodyName];
    const lon = norm(A.EclipticLongitude(B, date));
    const eq = A.Equator(B, date, observer, true, true);
    const hor = A.Horizon(date, observer, eq.ra, eq.dec, "normal");
    return {body:bodyName, longitude:lon, sign:sign(lon), ra:eq.ra, dec:eq.dec, az:hor.azimuth, alt:hor.altitude};
  }

  function ascendantAndMc(date, observer) {
    const A = globalThis.Astronomy;
    const gastDeg = norm(A.SiderealTime(date) * 15 + observer.longitude);
    const tilt = A.e_tilt(A.MakeTime(date));
    const eps = tilt.tobl * Math.PI / 180;
    const theta = gastDeg * Math.PI / 180;
    const phi = Number(observer.latitude) * Math.PI / 180;

    // Formules standard de transformation entre temps sidéral/local et écliptique.
    const mc = norm(Math.atan2(Math.sin(theta) * Math.cos(eps), Math.cos(theta)) * 180 / Math.PI);
    const asc = norm(Math.atan2(
      -Math.cos(theta),
      Math.sin(theta) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)
    ) * 180 / Math.PI);
    return {ascendant:asc, mc};
  }

  function wholeSignHouses(ascLongitude) {
    const ascSign = sign(ascLongitude).index;
    return signs.map((s, i) => {
      const signIndex = (ascSign + i) % 12;
      return {house:i+1, signIndex, name:signs[signIndex][0], symbol:signs[signIndex][1], cusp:signIndex*30};
    });
  }

  function houseForLongitude(longitude, ascLongitude) {
    const ascIndex = sign(ascLongitude).index;
    const bodyIndex = sign(longitude).index;
    return ((bodyIndex - ascIndex + 12) % 12) + 1;
  }

  function angularDistance(a,b) {
    const d = Math.abs(norm(a)-norm(b));
    return Math.min(d, 360-d);
  }

  function calculateAspects(positions, angles) {
    const points = positions.map(p => ({id:p.body, label:labels[p.body], longitude:p.longitude}));
    points.push({id:"Ascendant", label:"Ascendant", longitude:angles.ascendant});
    points.push({id:"MC", label:"Milieu du Ciel", longitude:angles.mc});
    const out=[];
    for(let i=0;i<points.length;i++) {
      for(let j=i+1;j<points.length;j++) {
        const a=points[i], b=points[j];
        const separation=angularDistance(a.longitude,b.longitude);
        for(const asp of ASPECTS) {
          const orb=Math.abs(separation-asp.angle);
          if(orb <= asp.orb) {
            out.push({...asp, point1:a, point2:b, separation, orb});
            break;
          }
        }
      }
    }
    return out.sort((a,b)=>a.orb-b.orb);
  }

  function readInput() {
    const local = $("#pBirth")?.value;
    const offset = Number($("#pOffset")?.value);
    const birth = parseBirth(local, offset);
    const lat = Number($("#pLat")?.value);
    const lon = Number($("#pLon")?.value);
    const elev = Number($("#pElev")?.value || 0);
    if (!ready()) throw new Error("Le moteur astronomique n'est pas chargé.");
    if (!Number.isFinite(birth.getTime())) throw new Error("Date et heure de naissance invalides.");
    if (!Number.isFinite(offset) || offset < -840 || offset > 840) throw new Error("Décalage UTC invalide.");
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error("Latitude invalide.");
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) throw new Error("Longitude invalide.");
    if (!Number.isFinite(elev) || elev < 0) throw new Error("Altitude invalide.");
    return {birth, local, offset, lat, lon, elev};
  }

  function renderProfile() {
    const root=$("#app"); if(!root) return;
    let saved={}; try { saved=JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}"); } catch (_) {}
    const defaultOffset = Number.isFinite(saved.offset) ? saved.offset : -new Date().getTimezoneOffset();
    root.innerHTML=`
      <h2>Thème natal astronomique</h2>
      <p class="lead">Positions célestes + angles + maisons en signes entiers + aspects majeurs. L'heure civile et son décalage UTC sont séparés pour éviter les erreurs de fuseau.</p>
      <div class="grid wide">
        <div class="card">
          <h3>Données de naissance</h3>
          <div class="toolbar">
            <input id="pName" placeholder="Nom / prénom" value="${esc(saved.name||"")}">
            <input id="pBirth" type="datetime-local" value="${esc(saved.local||saved.birth||"")}">
            <input id="pOffset" type="number" step="30" min="-840" max="840" placeholder="Décalage UTC (min)" value="${esc(defaultOffset)}">
            <input id="pLat" type="number" step="any" min="-90" max="90" placeholder="Latitude (°)" value="${esc(saved.lat??"")}">
            <input id="pLon" type="number" step="any" min="-180" max="180" placeholder="Longitude (°)" value="${esc(saved.lon??"")}">
            <input id="pElev" type="number" step="1" min="0" placeholder="Altitude (m)" value="${esc(saved.elev??0)}">
          </div>
          <div class="toolbar">
            <button class="primary" id="pCalculate">Calculer le thème</button>
            <button class="secondary" id="pNow">Maintenant</button>
            <button class="secondary" id="pSave">Enregistrer</button>
          </div>
          <p class="small muted">Exemple Côte d'Ivoire : UTC+00:00 → <b>0</b> minute.</p>
          <p id="pStatus" class="small muted"></p>
        </div>
      </div>
      <div id="pOutput"></div>
      <div class="notice"><b>Distinction :</b> les positions et angles sont calculés astronomiquement. Les maisons et aspects sont des conventions de lecture astrologique explicitement configurées ; leur interprétation reste traditionnelle/symbolique.</div>`;

    $("#pNow").addEventListener("click",()=>{ $("#pBirth").value=localDateValue(); });
    $("#pSave").addEventListener("click",saveProfile);
    $("#pCalculate").addEventListener("click",calculate);
    if(saved.local || saved.birth) calculate();
  }

  function saveProfile() {
    try {
      const v=readInput();
      localStorage.setItem(PROFILE_KEY,JSON.stringify({name:$("#pName").value.trim(),local:v.local,offset:v.offset,lat:v.lat,lon:v.lon,elev:v.elev}));
      $("#pStatus").textContent="Profil enregistré sur cet appareil.";
    } catch(e) { $("#pStatus").textContent=e.message; }
  }

  function calculate() {
    const output=$("#pOutput");
    try {
      const {birth,local,offset,lat,lon,elev}=readInput();
      const A=globalThis.Astronomy;
      const obs=new A.Observer(lat,lon,elev);
      const positions=bodies.map(b=>position(b,birth,obs));
      const angles=ascendantAndMc(birth,obs);
      const houses=wholeSignHouses(angles.ascendant);
      const aspects=calculateAspects(positions,angles);
      const sun=positions.find(x=>x.body==="Sun"), moon=positions.find(x=>x.body==="Moon");
      const asc=sign(angles.ascendant), mc=sign(angles.mc), name=$("#pName").value.trim();

      output.innerHTML=`
        <div class="grid">
          <article class="card"><h3>☀️ Soleil</h3><div class="kpi">${sun.sign.symbol} ${esc(sun.sign.name)}</div><p>Longitude : <b>${fmtDeg(sun.longitude)}</b></p></article>
          <article class="card"><h3>🌙 Lune</h3><div class="kpi">${moon.sign.symbol} ${esc(moon.sign.name)}</div><p>Longitude : <b>${fmtDeg(moon.longitude)}</b></p></article>
          <article class="card"><h3>Ascendant</h3><div class="kpi">${asc.symbol} ${esc(asc.name)}</div><p>Longitude : <b>${fmtDeg(angles.ascendant)}</b></p></article>
          <article class="card"><h3>Milieu du Ciel</h3><div class="kpi">${mc.symbol} ${esc(mc.name)}</div><p>Longitude : <b>${fmtDeg(angles.mc)}</b></p></article>
        </div>

        <div class="card" style="margin-top:15px">
          <h3>${name?esc(name)+" · ":""}Positions planétaires</h3>
          <p class="small muted">Heure civile : ${esc(local)} · UTC${offset>=0?"+":""}${(offset/60).toFixed(1)} · ${fmtDate(birth)} · latitude ${lat.toFixed(4)}° · longitude ${lon.toFixed(4)}° · altitude ${elev} m.</p>
          <div class="table-wrap"><table><thead><tr><th>Corps</th><th>Longitude</th><th>Signe</th><th>Maison</th><th>RA</th><th>Déclinaison</th><th>Azimut</th><th>Altitude</th></tr></thead><tbody>
          ${positions.map(p=>`<tr><td><b>${esc(labels[p.body])}</b></td><td>${fmtDeg(p.longitude)}</td><td>${p.sign.symbol} ${esc(p.sign.name)} ${fmtDeg(p.sign.degree)}</td><td>${houseForLongitude(p.longitude,angles.ascendant)}</td><td>${p.ra.toFixed(3)} h</td><td>${fmtDeg(p.dec)}</td><td>${fmtDeg(p.az)}</td><td>${fmtDeg(p.alt)}</td></tr>`).join("")}
          </tbody></table></div>
        </div>

        <div class="grid wide" style="margin-top:15px">
          <div class="card"><h3>Maisons — signes entiers</h3><p class="small muted">Méthode explicitement choisie pour cette version. La maison 1 commence au signe de l'Ascendant ; chaque maison couvre un signe entier de 30°.</p>
            <div class="table-wrap"><table><thead><tr><th>Maison</th><th>Signe</th><th>Début</th></tr></thead><tbody>${houses.map(h=>`<tr><td>${h.house}</td><td>${h.symbol} ${esc(h.name)}</td><td>${fmtDeg(h.cusp)}</td></tr>`).join("")}</tbody></table></div>
          </div>
          <div class="card"><h3>Aspects majeurs</h3><p class="small muted">Orbes de cette version : conjonction 8°, sextile 6°, carré 7°, trigone 8°, opposition 8°. Ils sont affichés comme paramètres configurables.</p>
            ${aspects.length?`<div class="table-wrap"><table><thead><tr><th>Aspect</th><th>Points</th><th>Écart</th><th>Orbe</th></tr></thead><tbody>${aspects.map(a=>`<tr><td>${a.symbol} ${esc(a.name)}</td><td>${esc(a.point1.label)} — ${esc(a.point2.label)}</td><td>${fmtDeg(a.separation)}</td><td>${fmtDeg(a.orb)}</td></tr>`).join("")}</tbody></table></div>`:`<p class="empty">Aucun aspect majeur dans les orbes configurées.</p>`}
          </div>
        </div>

        <div class="card" style="margin-top:15px"><h3>Base d'interprétation disponible</h3><ul class="list">
          <li>Soleil : ${sun.sign.symbol} ${esc(sun.sign.name)}</li><li>Lune : ${moon.sign.symbol} ${esc(moon.sign.name)}</li>
          <li>Ascendant : ${asc.symbol} ${esc(asc.name)}</li><li>Milieu du Ciel : ${mc.symbol} ${esc(mc.name)}</li>
          <li>Maisons : signes entiers</li><li>Aspects : 5 aspects majeurs, orbes configurées</li>
        </ul><p class="small muted">Aucune signification lettre → signe → planète n'est déduite à partir de ces résultats.</p></div>`;
    } catch(e) { output.innerHTML=`<div class="card"><h3>Calcul impossible</h3><p>${esc(e.message)}</p></div>`; }
  }

  function hook() {
    document.querySelectorAll('.nav[data-view="profile"]').forEach(btn=>{
      if(btn.dataset.profileHooked)return;
      btn.dataset.profileHooked="1";
      btn.addEventListener("click",()=>setTimeout(renderProfile,0));
    });
    document.querySelectorAll('[data-go="profile"]').forEach(btn=>{
      if(btn.dataset.profileHooked)return;
      btn.dataset.profileHooked="1";
      btn.addEventListener("click",()=>setTimeout(renderProfile,0));
    });
  }

  hook();
  new MutationObserver(hook).observe(document.documentElement,{childList:true,subtree:true});
})();
