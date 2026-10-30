import {engineReady, observer, sunPosition, moonPosition, allPlanetPositions, riseSet, moonPhase, nextMoonQuarters, tropicalSign, ageDays} from "./astronomy.js";

const DATA = {};
const PATHS = {
  letters:"referentiel/lettres.json", elements:"referentiel/elements.json",
  modalities:"referentiel/modalites.json", zodiac:"referentiel/zodiaque.json",
  planets:"referentiel/planetes.json", correspondences:"referentiel/correspondances.json",
  traditionalCorrespondences:"referentiel/correspondances_traditionnelles.json", cosmology:"referentiel/spheres_cosmologiques.json",
  phases:"referentiel/phases_lunaires.json", lunarDays:"referentiel/jours_lunaires.json",
  sources:"referentiel/sources.json", manifest:"referentiel/reference-manifest.json"
};
const $ = s => document.querySelector(s);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arr = v => Array.isArray(v) ? v : [];
const undefinedText = "Correspondance non définie dans le référentiel actuel.";

async function loadData(){
  await Promise.all(Object.entries(PATHS).map(async ([k,p])=>{
    const r=await fetch(p,{cache:"no-cache"});
    if(!r.ok) throw new Error(`Chargement impossible : ${p} (${r.status})`);
    DATA[k]=await r.json();
  }));
}
function sourceMap(){ return new Map(arr(DATA.sources.sources).map(s=>[s.id,s])); }
function sourcesHtml(ids=[]){
  const map=sourceMap();
  const rows=ids.map(id=>map.get(id)).filter(Boolean);
  if(!rows.length) return `<span class="muted small">Aucune source associée.</span>`;
  return rows.map(s=>`<a class="source-link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.publisher||s.title)}</a>`).join(" · ");
}
function traditionalSourceHtml(){
  const rows=arr(DATA.traditionalCorrespondences?.sources);
  if(!rows.length) return `<span class="muted small">Aucune source traditionnelle associée.</span>`;
  return rows.map(s=>`<a class="source-link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>`).join(" · ");
}
function setActive(view){
  document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  $("#sidebar")?.classList.remove("open");
}
function render(view="home"){
  setActive(view);
  const f={home:viewHome,letters:viewLetters,abjad:viewAbjad,elements:viewElements,zodiac:viewZodiac,
    planets:viewPlanets,correspondences:viewCorrespondences,moon:viewMoon,astronomy:viewAstronomy,lunarDays:viewLunarDays,
    profile:viewProfile,sources:viewSources,method:viewMethod,reference:viewReference,cosmology:viewCosmology}[view];
  try{ $("#app").innerHTML=f(); bind(view); } catch(e){ $("#app").innerHTML=errorCard(e); }
}
function errorCard(e){ return `<div class="card"><h2>Erreur</h2><p>${esc(e.message)}</p></div>`; }

function viewHome(){
  const m=DATA.manifest;
  return `<h2>Bienvenue dans Zodiaque & 28 Lettres</h2>
  <p class="lead">Une application autonome qui sépare le référentiel Abjad, les données zodiacales, les données lunaires et les interprétations symboliques.</p>
  <div class="notice"><b>Socle verrouillé :</b> 28 lettres · Abjad Maghrébin · 7 Feu / 7 Terre / 7 Air / 7 Eau. Les correspondances non sourcées restent indéfinies.</div>
  <div class="grid">
    <div class="card"><div class="kpi">${DATA.letters.letters.length}</div><b>Lettres arabes</b><p class="muted">Valeur Abjad + élément</p></div>
    <div class="card"><div class="kpi">${DATA.zodiac.signs.length}</div><b>Signes</b><p class="muted">Élément + modalité + polarité</p></div>
    <div class="card"><div class="kpi">${DATA.planets.planets.length}</div><b>Planètes / luminaires</b><p class="muted">Référentiel astrologique</p></div>
    <div class="card"><div class="kpi">${DATA.lunarDays.lunar_cycle_days.length}</div><b>Jours lunaires</b><p class="muted">Structure symbolique de 28 jours</p></div>
  </div>
  <div class="grid wide" style="margin-top:16px">
    <div class="card"><h3>Calculer un texte</h3><p class="muted">Additionne les valeurs Abjad lettre par lettre et montre la répartition élémentaire.</p><button class="primary" data-go="abjad">Ouvrir le calculateur</button></div>
    <div class="card"><h3>Explorer les 28 lettres</h3><p class="muted">Recherche, valeur, élément et fiche détaillée.</p><button class="secondary" data-go="letters">Voir les lettres</button></div>
    <div class="card"><h3>Explorer le zodiaque</h3><p class="muted">12 fiches zodiacales avec leurs données de référence.</p><button class="secondary" data-go="zodiac">Voir les signes</button></div>
  </div>
  <div class="card" style="margin-top:16px"><h3>Version du référentiel</h3><p><span class="tag">${esc(m.package_version||m.version||"final")}</span> · fondation verrouillée : <b>${m.foundation_locked?"oui":"non"}</b></p></div>`;
}

function traditionalForLetter(letter){
  const t=DATA.traditionalCorrespondences||{};
  const mansion=arr(t.letter_mansion_zodiac).find(x=>x.letter===letter);
  const planetary=arr(t.seven_planetary_letters).find(x=>x.letter===letter);
  const solar=arr(t.solar_letters).includes(letter);
  const lunar=arr(t.lunar_letters).includes(letter);
  return {mansion,planetary,solar,lunar};
}
function cosmologicalForLetter(letterId){
  const spheres=arr(DATA.cosmology?.spheres);
  return spheres.filter(s=>arr(s.letter_ids).includes(letterId));
}
function traditionalStatus(t){
  const labels=[];
  if(t.solar) labels.push("Solaire linguistique");
  if(t.lunar) labels.push("Lunaire linguistique");
  if(t.mansion) labels.push("Demeure lunaire");
  if(t.planetary) labels.push(`Planétaire : ${t.planetary.planet}`);
  return labels.length?labels.join(" · "):undefinedText;
}
function traditionalBadges(t){
  return `<div class="sign-meta">${t.solar?`<span class="tag">Solaire</span>`:""}${t.lunar?`<span class="tag">Lunaire</span>`:""}${t.mansion?`<span class="pill">Maison ${t.mansion.position}</span>`:""}${t.planetary?`<span class="pill">${esc(t.planetary.planet)}</span>`:""}</div>`;
}

function viewLetters(){
  return `<h2>Les 28 lettres</h2><p class="lead">Référentiel Abjad Maghrébin, classification élémentaire et correspondances traditionnelles documentées.</p>
  <div class="toolbar"><input id="letterSearch" placeholder="Rechercher : ا, Alif, a, Feu…"><select id="elementFilter"><option value="">Tous les éléments</option>${DATA.elements.elements.map(e=>`<option>${esc(e.name_fr)}</option>`).join("")}</select></div>
  <div id="letterGrid" class="grid wide">${letterCards(DATA.letters.letters)}</div>`;
}
function letterCards(rows){
 return rows.map(l=>{
   const t=traditionalForLetter(l.letter);
   return `<article class="card letter-card">
   <div class="glyph arabic-lg">${esc(l.letter)}</div>
   <div><h3>${esc(l.name_fr)}</h3><div class="muted">${esc(l.name_ar)} · ${esc(l.transliteration)}</div>
   <div class="sign-meta"><span class="tag">Abjad ${l.abjad_maghribi}</span><span class="pill">${esc(l.element)}</span></div>
   ${traditionalBadges(t)}
   <p class="small">${esc(l.symbolic_meaning||undefinedText)}</p>
   <details><summary>Correspondances documentées</summary>
     <p><b>Demeure lunaire :</b> ${esc(t.mansion?.mansion||undefinedText)}${t.mansion?.mansion_ar?` · ${esc(t.mansion.mansion_ar)}`:""}</p>
     <p><b>Secteur zodiacal traditionnel :</b> ${t.mansion?.zodiac_segments?.length?arr(t.mansion.zodiac_segments).map(esc).join(" · "):undefinedText}</p>
     <p><b>Planète classique :</b> ${t.planetary?`${esc(t.planetary.planet)} · ${esc(t.planetary.day)}`:undefinedText}</p>
     <p><b>Statut linguistique :</b> ${t.solar?"lettre solaire":t.lunar?"lettre lunaire":undefinedText}</p>
     <p class="small muted">Source de la couche traditionnelle : ${traditionalSourceHtml()}</p>
   </details></div>
 </article>`;
 }).join("");
}
function viewAbjad(){
 return `<h2>Calculateur Abjad Maghrébin</h2><p class="lead">Le calcul utilise uniquement les 28 lettres du référentiel. Les signes diacritiques, espaces et ponctuations sont ignorés ; les caractères hors référentiel sont signalés.</p>
 <div class="card"><label for="abjadInput"><b>Texte</b></label><textarea id="abjadInput" dir="rtl" rows="5" placeholder="اكتب النص العربي هنا"></textarea>
 <div class="toolbar"><button class="primary" id="calcAbjad">Calculer</button><button class="secondary" id="clearAbjad">Effacer</button></div></div>
 <div id="abjadOutput" style="margin-top:16px"></div>`;
}
function calcAbjad(text){
 const map=new Map(DATA.letters.letters.map(l=>[l.letter,l]));
 const details=[], unknown=new Map(); let total=0;
 const counts={Feu:0,Terre:0,Air:0,Eau:0}, values={Feu:0,Terre:0,Air:0,Eau:0};
 for(const ch of [...text]){
   if(/[\u064B-\u065F\u0670\u06D6-\u06ED]/u.test(ch)||/[\s\p{P}\p{S}]/u.test(ch)) continue;
   const l=map.get(ch);
   if(l){ total+=l.abjad_maghribi; counts[l.element]++; values[l.element]+=l.abjad_maghribi; details.push(l); }
   else unknown.set(ch,(unknown.get(ch)||0)+1);
 }
 return {total,details,unknown:[...unknown.entries()],counts,values};
}
function abjadOutput(r){
 const max=Math.max(...Object.values(r.values),1);
 return `<div class="grid">
   <div class="card"><div class="kpi">${r.total}</div><b>Total Abjad</b><p class="muted">${r.details.length} lettre(s) reconnue(s)</p></div>
   <div class="card"><h3>Répartition élémentaire</h3>${Object.entries(r.values).map(([e,v])=>`<div style="margin:8px 0"><div style="display:flex;justify-content:space-between"><span>${e}</span><b>${v}</b></div><div class="progress"><span style="width:${Math.round(v/max*100)}%"></span></div></div>`).join("")}</div>
 </div>
 <div class="card" style="margin-top:15px"><h3>Détail lettre par lettre</h3>${r.details.length?`<div class="table-wrap"><table><thead><tr><th>Lettre</th><th>Nom</th><th>Valeur</th><th>Élément</th></tr></thead><tbody>${r.details.map(l=>`<tr><td class="arabic">${esc(l.letter)}</td><td>${esc(l.name_fr)}</td><td>${l.abjad_maghribi}</td><td>${esc(l.element)}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">Aucune lettre reconnue.</div>`}
 ${r.unknown.length?`<div class="warning"><b>Caractères non référencés :</b> ${r.unknown.map(([c,n])=>`<span class="pill">${esc(c)} ×${n}</span>`).join("")}</div>`:""}
 </div>`;
}

function viewElements(){
 return `<h2>Les 4 éléments</h2><p class="lead">La classification des lettres est fondamentale et verrouillée : exactement 7 lettres par élément.</p>
 <div class="grid">${DATA.elements.elements.map(e=>{
   const letters=DATA.letters.letters.filter(l=>l.element===e.name_fr);
   return `<article class="card element-${esc(e.id)}"><h3>${esc(e.name_fr)} <span class="arabic" style="float:right;font-size:1.2rem">${esc(e.name_ar)}</span></h3>
   <p>${esc(e.symbolic_profile?.description||"")}</p><div>${letters.map(l=>`<span class="pill arabic">${esc(l.letter)}</span>`).join("")}</div>
   <p class="small muted">Mots-clés : ${arr(e.symbolic_profile?.keywords).map(esc).join(" · ")}</p></article>`;
 }).join("")}</div>`;
}

function viewZodiac(){
 return `<h2>Les 12 signes du zodiaque</h2><p class="lead">Données issues du référentiel astrologique conventionnel du projet. Les interprétations sont traditionnelles/symboliques.</p>
 <div class="grid wide">${DATA.zodiac.signs.map(s=>`<article class="card sign-card">
   <div class="detail-head"><div class="symbol-box"><div class="sign-symbol">${esc(s.symbol)}</div></div><div><h3>${esc(s.name_fr)}</h3><div class="sign-ar">${esc(s.name_ar)}</div></div></div>
   <div class="sign-meta"><span class="tag">${esc(s.element)}</span><span class="pill">${esc(s.modality)}</span><span class="pill">${esc(s.polarity)}</span></div>
   <p>${esc(s.description_traditional)}</p>
   <p><b>Maître traditionnel :</b> ${esc(s.ruler_traditional)}<br><b>Maître moderne :</b> ${esc(s.ruler_modern)}</p>
   <p class="small"><b>Mots-clés :</b> ${arr(s.keywords).map(esc).join(" · ")}</p>
   <details><summary>Forces, défis et sources</summary><p><b>Forces :</b> ${arr(s.strengths).map(esc).join(", ")}</p><p><b>Défis :</b> ${arr(s.challenges).map(esc).join(", ")}</p><p class="small">${sourcesHtml(s.source_ids)}</p></details>
 </article>`).join("")}</div>`;
}

function viewPlanets(){
 return `<h2>Planètes et luminaires</h2><p class="lead">Référentiel des thèmes astrologiques traditionnels ou modernes, explicitement non scientifiques.</p>
 <div class="grid">${DATA.planets.planets.map(p=>`<article class="card"><div class="detail-head"><div class="symbol-box"><div class="sign-symbol">${esc(p.symbol)}</div></div><div><h3>${esc(p.name_fr)}</h3><div class="sign-ar">${esc(p.name_ar)}</div></div></div>
 <p><span class="tag">${esc(p.classification)}</span></p><p><b>Thème :</b> ${esc(p.astrological_theme)}</p><p><b>Mots-clés :</b> ${arr(p.keywords).map(esc).join(" · ")}</p><p class="small">${sourcesHtml(p.source_ids)}</p></article>`).join("")}</div>`;
}

function viewCorrespondences(){
 const t=DATA.traditionalCorrespondences||{};
 const zmap=new Map(DATA.zodiac.signs.map(x=>[x.id,x])); const pmap=new Map(DATA.planets.planets.map(x=>[x.id,x]));
 const rows=DATA.letters.letters.map(l=>{
   const c=DATA.correspondences.records.find(x=>x.letter_id===l.id);
   const tr=traditionalForLetter(l.letter);
   const z=c?.zodiac_sign_id?zmap.get(c.zodiac_sign_id):null;
   const p=c?.planet_id?pmap.get(c.planet_id):null;
   return `<tr><td class="arabic">${esc(l.letter)}</td><td>${l.abjad_maghribi}</td><td>${esc(l.element)}</td><td>${tr.mansion?`${esc(tr.mansion.mansion)}<br><span class="small">${esc(tr.mansion.mansion_ar)}</span>`:undefinedText}</td><td>${tr.mansion?.zodiac_segments?.length?arr(tr.mansion.zodiac_segments).map(esc).join("<br>"):undefinedText}</td><td>${tr.planetary?`${esc(tr.planetary.planet)}<br><span class="small">${esc(tr.planetary.day)}</span>`:undefinedText}</td><td>${tr.solar?"Solaire linguistique":tr.lunar?"Lunaire linguistique":undefinedText}</td><td>${esc(z?.name_fr||undefinedText)}</td><td>${esc(p?.name_fr||undefinedText)}</td></tr>`;
 });
 return `<h2>Correspondances traditionnelles</h2>
 <div class="card" style="margin-bottom:15px"><h3>Diagramme des sphères cosmologiques</h3><p class="muted">Consulter séparément les associations des lettres aux sphères supérieures, planétaires, élémentaires et principes spéciaux.</p><button class="secondary" data-go="cosmology">Ouvrir les sphères cosmologiques</button></div>\n <div class="warning"><b>Couche distincte :</b> les données ci-dessous proviennent du référentiel traditionnel documenté. Elles ne sont ni des calculs astronomiques ni des correspondances déduites. Une donnée absente reste : <i>${undefinedText}</i></div>
 <div class="card"><h3>28 lettres · 28 demeures · secteurs zodiacaux · 7 lettres planétaires</h3>
 <p class="small muted">La distinction solaire/lunaire est linguistique (assimilation ou non du lām de l'article al-), et ne constitue pas une attribution astronomique au Soleil ou à la Lune.</p>
 <p class="small">${esc(t.planetary_assignment_rule||"")}</p></div>
 <div class="table-wrap"><table><thead><tr><th>Lettre</th><th>Abjad</th><th>Élément</th><th>Demeure lunaire</th><th>Secteur zodiacal traditionnel</th><th>Planète classique</th><th>Statut solaire/lunaire</th><th>Signe configuré</th><th>Planète configurée</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>
 <div class="card" style="margin-top:15px"><h3>Sources de cette couche</h3><p class="small">${traditionalSourceHtml()}</p><p class="tiny muted">Statut : tradition symbolique/ésotérique, non scientifique. Les positions astronomiques calculées par l'application restent séparées.</p></div>`;
}


function cosmologyRows(query="", category=""){
  const q=query.toLocaleLowerCase("fr").trim();
  const letterMap=new Map(DATA.letters.letters.map(l=>[l.id,l]));
  return arr(DATA.cosmology?.spheres).filter(s=>{
    if(category && s.category!==category) return false;
    const letters=arr(s.letter_ids).map(id=>letterMap.get(id)).filter(Boolean);
    const haystack=[s.name_fr,s.category,...letters.flatMap(l=>[l.letter,l.name_fr,l.transliteration,String(l.abjad_maghribi)])].join(" ").toLocaleLowerCase("fr");
    return !q || haystack.includes(q);
  }).map(s=>{
    const letters=arr(s.letter_ids).map(id=>letterMap.get(id)).filter(Boolean);
    return `<tr><td><b>${esc(s.name_fr)}</b></td><td><span class="pill">${esc(s.category.replaceAll("_"," "))}</span></td><td>${letters.map(l=>`<span class="pill" title="${esc(l.name_fr)} · Abjad ${l.abjad_maghribi}"><span class="arabic" style="font-size:1.35rem">${esc(l.letter)}</span> ${esc(l.name_fr)} <span class="muted small">(${l.abjad_maghribi})</span></span>`).join(" ")}</td></tr>`;
  }).join("");
}
function viewCosmology(){
  const c=DATA.cosmology||{};
  const categories=[["sphere_superieure","Sphères supérieures"],["sphere_planetaire","Sphères planétaires"],["sphere_elementaire","Sphères élémentaires"],["principe_special","Principes spéciaux"]];
  const letterMap=new Map(DATA.letters.letters.map(l=>[l.id,l]));
  const unassigned=arr(c.not_assigned_in_this_diagram).map(id=>letterMap.get(id)).filter(Boolean);
  const counts=categories.map(([id,label])=>({id,label,count:arr(c.spheres).filter(s=>s.category===id).length}));
  return `<h2>Sphères cosmologiques</h2>
  <p class="lead">Consultez les associations entre les 28 lettres et les sphères du diagramme cosmographique étudié par Noah Gardiner.</p>
  <div class="warning"><b>À distinguer :</b> ces associations décrivent un diagramme cosmologique précis. Elles ne représentent ni les maîtres planétaires des jours de la semaine, ni les positions calculées par le moteur astronomique. Les répétitions présentes dans la source sont conservées.</div>
  <div class="grid">
    ${counts.map(x=>`<div class="card"><div class="kpi">${x.count}</div><b>${esc(x.label)}</b></div>`).join("")}
    <div class="card"><div class="kpi">${arr(c.spheres).length}</div><b>Sphères et principes</b></div>
  </div>
  <div class="toolbar">
    <input id="cosmologySearch" type="search" placeholder="Rechercher une lettre, un nom ou une sphère…" aria-label="Rechercher dans les sphères cosmologiques">
    <select id="cosmologyCategory" aria-label="Filtrer par catégorie">
      <option value="">Toutes les catégories</option>
      ${categories.map(([id,label])=>`<option value="${id}">${esc(label)}</option>`).join("")}
    </select>
  </div>
  <div class="table-wrap" id="cosmologyTableWrap">
    <table><thead><tr><th>Sphère / principe</th><th>Catégorie</th><th>Lettres associées</th></tr></thead>
    <tbody id="cosmologyRows">${cosmologyRows()}</tbody></table>
  </div>
  <div class="card" style="margin-top:15px">
    <h3>Lettres non attribuées dans ce diagramme</h3>
    ${unassigned.length?unassigned.map(l=>`<span class="pill"><span class="arabic" style="font-size:1.35rem">${esc(l.letter)}</span> ${esc(l.name_fr)}</span>`).join(" "):"<p class=\"muted\">Aucune.</p>"}
    <p class="small muted">${esc(c.rules?.unassigned_means||"Une absence dans ce diagramme ne prouve pas une absence dans les autres traditions.")}</p>
  </div>
  <div class="card" style="margin-top:15px">
    <h3>Source et méthode</h3>
    <p class="small">${sourcesHtml(c.source_ids)}</p>
    <p class="small muted">Les lettres répétées dans plusieurs sphères sont conservées telles qu'elles apparaissent dans le diagramme étudié. Cette table est documentaire et symbolique, non un calcul astronomique.</p>
  </div>`;
}

function viewMoon(){
 return `<h2>Phases lunaires</h2><p class="lead">Cette page décrit les phases astronomiques de façon factuelle. Elle ne transforme pas ces phases en prédictions scientifiques.</p>
 <div class="grid wide">${DATA.phases.phases.map(p=>`<article class="card"><h3>${esc(p.name_fr)}</h3><p><span class="tag">${esc(p.elongation)}</span></p><p>${esc(p.astronomical_description)}</p><p class="small">${sourcesHtml(p.source_ids)}</p></article>`).join("")}</div>
 <div class="warning"><b>À retenir :</b> une phase lunaire n'est pas la même chose que l'âge lunaire, le jour civil ou un « jour lunaire » symbolique.</div>`;
}

function viewAstronomy(){
 return `<h2>Calculs astronomiques</h2>
 <p class="lead">Calculs effectués dans le navigateur par Astronomy Engine. Ils sont distincts des interprétations astrologiques.</p>
 ${!engineReady()?`<div class="warning"><b>Moteur indisponible.</b> Vérifiez la connexion nécessaire au premier chargement.</div>`:""}
 <div class="card">
  <div class="toolbar">
   <input id="astroDate" type="datetime-local">
   <input id="astroLat" type="number" step="any" min="-90" max="90" placeholder="Latitude (°)">
   <input id="astroLon" type="number" step="any" min="-180" max="180" placeholder="Longitude (°)">
   <input id="astroElev" type="number" step="1" min="0" placeholder="Altitude (m)">
  </div>
  <div class="toolbar"><button class="primary" id="astroCalculate">Calculer</button><button class="secondary" id="astroNow">Maintenant</button></div>
  <p class="small muted">Les coordonnées sont demandées explicitement. Aucune géolocalisation n'est activée automatiquement.</p>
 </div>
 <div id="astroOutput" style="margin-top:16px"></div>`;
}
function fmtAngle(x){return Number.isFinite(x)?`${x.toFixed(3)}°`:"—";}
function fmtTime(d){return d?new Intl.DateTimeFormat("fr-FR",{dateStyle:"medium",timeStyle:"medium"}).format(new Date(d)):"Non disponible";}
function astroOutput(date,lat,lon,elev){
 const obs=observer(lat,lon,elev);
 const bodies=allPlanetPositions(date,obs);
 const sun=sunPosition(date,obs), moon=moonPosition(date,obs);
 const rsSun=riseSet("Sun",date,obs), rsMoon=riseSet("Moon",date,obs);
 const quarters=nextMoonQuarters(date,4);
 return `<div class="grid">
  <div class="card"><h3>☀️ Soleil</h3><p><b>Longitude écliptique :</b> ${fmtAngle(sun.eclipticLongitude)}</p><p><b>Signe tropical :</b> ${tropicalSign(sun.eclipticLongitude).symbol} ${tropicalSign(sun.eclipticLongitude).name} ${fmtAngle(tropicalSign(sun.eclipticLongitude).degree)}</p><p><b>Azimut :</b> ${fmtAngle(sun.azimuth)}</p><p><b>Altitude :</b> ${fmtAngle(sun.altitude)}</p><p><b>Lever :</b> ${fmtTime(rsSun.rise)}</p><p><b>Coucher :</b> ${fmtTime(rsSun.set)}</p></div>
  <div class="card"><h3>🌙 Lune</h3><p><b>Longitude écliptique :</b> ${fmtAngle(moon.eclipticLongitude)}</p><p><b>Phase :</b> ${fmtAngle(moon.phaseAngle)}</p><p><b>Illumination :</b> ${Number(moon.illuminationFraction*100).toFixed(1)}%</p><p><b>Âge astronomique estimé :</b> ${ageDays(date).toFixed(2)} jours</p><p><b>Azimut :</b> ${fmtAngle(moon.azimuth)}</p><p><b>Altitude :</b> ${fmtAngle(moon.altitude)}</p><p><b>Lever :</b> ${fmtTime(rsMoon.rise)}</p><p><b>Coucher :</b> ${fmtTime(rsMoon.set)}</p></div>
 </div>
 <div class="card" style="margin-top:15px"><h3>Positions des corps</h3><div class="table-wrap"><table><thead><tr><th>Corps</th><th>Longitude</th><th>Signe tropical</th><th>Azimut</th><th>Altitude</th><th>Distance (UA)</th></tr></thead><tbody>
 ${bodies.map(p=>{const s=tropicalSign(p.eclipticLongitude);return `<tr><td><b>${esc(p.body)}</b></td><td>${fmtAngle(p.eclipticLongitude)}</td><td>${s.symbol} ${esc(s.name)} ${fmtAngle(s.degree)}</td><td>${fmtAngle(p.azimuth)}</td><td>${fmtAngle(p.altitude)}</td><td>${Number(p.distanceAU).toFixed(6)}</td></tr>`}).join("")}
 </tbody></table></div></div>
 <div class="card" style="margin-top:15px"><h3>Prochains quartiers lunaires</h3><div class="grid">${quarters.map(q=>`<div class="card soft"><b>${["Nouvelle Lune","Premier quartier","Pleine Lune","Dernier quartier"][q.quarter]}</b><p>${fmtTime(q.date)}</p></div>`).join("")}</div></div>
 <div class="notice"><b>Précision et portée :</b> Astronomy Engine documente ses calculs comme étant conçus pour rester à environ ±1 minute d'arc, avec validation contre NOVAS, JPL Horizons et d'autres références. Cela concerne le calcul astronomique, pas l'interprétation astrologique.</div>`;
}

function viewLunarDays(){
 return `<h2>Les 28 jours lunaires</h2><div class="warning">${esc(DATA.lunarDays.warning)}</div>
 <div class="grid">${DATA.lunarDays.lunar_cycle_days.map(d=>`<article class="card"><h3>Jour ${d.day}</h3><p><b>${esc(d.name_fr)}</b></p><p class="small">${esc(d.definition)}</p><p>${esc(d.symbolic_meaning||"Aucune signification universelle attribuée.")}</p></article>`).join("")}</div>`;
}

function viewProfile(){
 return `<h2>Profil</h2><p class="lead">Cette version fournit un espace de profil sans prétendre calculer un thème astronomique précis tant qu'un moteur d'éphémérides n'est pas intégré.</p>
 <div class="grid wide">
   <div class="card"><h3>Informations</h3><div class="toolbar"><input id="profileName" placeholder="Nom / prénom"><input id="profileBirth" type="date"></div><button class="primary" id="saveProfile">Enregistrer localement</button><p id="profileStatus" class="small muted"></p></div>
   <div class="card"><h3>Calculs actuellement disponibles</h3><ul class="list"><li>Analyse Abjad d'un nom ou texte arabe</li><li>Répartition élémentaire des lettres</li><li>Consultation du référentiel zodiacal</li><li>Consultation des phases lunaires</li></ul></div>
 </div>
 <div class="warning"><b>Non calculé ici :</b> ascendant, maisons, positions planétaires exactes, aspects et heure précise de lever/coucher. Ces fonctions nécessitent un moteur astronomique spécialisé.</div>`;
}

function viewSources(){
 return `<h2>Sources</h2><p class="lead">Les sources sont conservées dans le référentiel pour assurer la traçabilité des données.</p>
 <div class="grid wide">${DATA.sources.sources.map(s=>`<article class="card"><h3>${esc(s.title)}</h3><p><b>${esc(s.publisher)}</b></p><p>${esc(s.scope)}</p><a class="source-link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Ouvrir la source ↗</a><p class="tiny muted">Consultée : ${esc(s.accessed||"")}</p></article>`).join("")}</div>
 <div class="card" style="margin-top:15px"><h3>Sources de la couche des correspondances traditionnelles</h3>${traditionalSourceHtml()}</div>`;
}
function viewMethod(){
 return `<h2>Méthode et limites</h2>
 <div class="grid wide">
  <div class="card"><h3>Abjad Maghrébin</h3><p>Le calcul utilise exclusivement les valeurs du fichier <code>referentiel/lettres.json</code>. Aucune autre table Abjad n'est substituée.</p></div>
  <div class="card"><h3>Astronomie / astrologie</h3><p><b>Astronomie</b> : phénomènes mesurables et calculs physiques. <b>Astrologie</b> : système interprétatif traditionnel/symbolique. Les deux domaines sont séparés dans l'interface.</p></div>
  <div class="card"><h3>Correspondances traditionnelles</h3><p>Les demeures lunaires, la distinction linguistique solaire/lunaire et les sept lettres planétaires sont stockées dans une couche séparée avec leurs sources. ${undefinedText} Une absence de donnée n'est jamais transformée en hypothèse.</p></div>
  <div class="card"><h3>28 jours lunaires</h3><p>Le cycle de 28 jours est présenté comme une structure symbolique du référentiel. Il ne remplace pas le mois synodique astronomique.</p></div>
 </div>`;
}

function viewReference(){
 const m=DATA.manifest;
 return `<h2>État du référentiel</h2><div class="grid">
 <div class="card"><div class="kpi">${esc(m.package_version||"")}</div><b>Version du pack</b></div>
 <div class="card"><div class="kpi">${m.foundation_locked?"✓":"!"}</div><b>Fondation verrouillée</b></div>
 <div class="card"><div class="kpi">${Object.keys(m.files_sha256||{}).length}</div><b>Fichiers de référence suivis</b></div>
 <div class="card"><div class="kpi">${arr(DATA.traditionalCorrespondences?.letter_mansion_zodiac).length}</div><b>Demeures traditionnelles</b></div>
 </div>
 <div class="card" style="margin-top:15px"><h3>Fichiers</h3><ul class="list">${Object.keys(m.files_sha256||{}).map(k=>`<li><code>referentiel/${esc(k)}</code></li>`).join("")}</ul></div>`;
}

function bind(view){
 if(view==="letters"){
   const filter=()=>{const q=$("#letterSearch").value.toLowerCase().trim(),e=$("#elementFilter").value;
     const rows=DATA.letters.letters.filter(l=>(!e||l.element===e)&&[l.letter,l.name_fr,l.name_ar,l.transliteration,l.element].some(v=>String(v).toLowerCase().includes(q)));
     $("#letterGrid").innerHTML=letterCards(rows)||`<div class="empty">Aucun résultat.</div>`;
   };
   $("#letterSearch").addEventListener("input",filter);$("#elementFilter").addEventListener("change",filter);
 }
 if(view==="abjad"){
   $("#calcAbjad").addEventListener("click",()=>$("#abjadOutput").innerHTML=abjadOutput(calcAbjad($("#abjadInput").value)));
   $("#clearAbjad").addEventListener("click",()=>{ $("#abjadInput").value="";$("#abjadOutput").innerHTML="";});
 }
 if(view==="cosmology"){
   const filter=()=>{
     const q=$("#cosmologySearch").value;
     const category=$("#cosmologyCategory").value;
     $("#cosmologyRows").innerHTML=cosmologyRows(q,category)||'<tr><td colspan="3" class="empty">Aucune correspondance.</td></tr>';
   };
   $("#cosmologySearch").addEventListener("input",filter);
   $("#cosmologyCategory").addEventListener("change",filter);
 }
 if(view==="astronomy"){
  const now=new Date();
  $("#astroDate").value=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,16);
  $("#astroLat").value=""; $("#astroLon").value=""; $("#astroElev").value=0;
  $("#astroNow").addEventListener("click",()=>{const n=new Date();$("#astroDate").value=new Date(n.getTime()-n.getTimezoneOffset()*60000).toISOString().slice(0,16);});
  $("#astroCalculate").addEventListener("click",()=>{
    try{
      const d=new Date($("#astroDate").value); const lat=Number($("#astroLat").value), lon=Number($("#astroLon").value), elev=Number($("#astroElev").value||0);
      if(!Number.isFinite(d.getTime())||lat<-90||lat>90||lon<-180||lon>180) throw new Error("Date ou coordonnées invalides.");
      $("#astroOutput").innerHTML=astroOutput(d,lat,lon,elev);
    }catch(e){$("#astroOutput").innerHTML=errorCard(e);}
  });
 }
 if(view==="profile"){
   const n=localStorage.getItem("z28_profile_name")||"",d=localStorage.getItem("z28_profile_birth")||"";
   $("#profileName").value=n;$("#profileBirth").value=d;
   $("#saveProfile").addEventListener("click",()=>{localStorage.setItem("z28_profile_name",$("#profileName").value);localStorage.setItem("z28_profile_birth",$("#profileBirth").value);$("#profileStatus").textContent="Profil enregistré sur cet appareil.";});
 }
 document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>render(b.dataset.go)));
}
document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>render(b.dataset.view)));
$("#mobileMenu")?.addEventListener("click",()=>$("#sidebar").classList.toggle("open"));

(async()=>{
 try{await loadData();render("home");}
 catch(e){$("#app").innerHTML=errorCard(e);}
})();
if("serviceWorker" in navigator && (location.protocol==="https:"||location.hostname==="localhost")) navigator.serviceWorker.register("./sw.js").catch(()=>{});
