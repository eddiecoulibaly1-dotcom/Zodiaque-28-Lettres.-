const DATA = {};
const PATHS = {
  letters:"referentiel/lettres.json", elements:"referentiel/elements.json",
  modalities:"referentiel/modalites.json", zodiac:"referentiel/zodiaque.json",
  planets:"referentiel/planetes.json", correspondences:"referentiel/correspondances.json",
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
function setActive(view){
  document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  $("#sidebar")?.classList.remove("open");
}
function render(view="home"){
  setActive(view);
  const f={home:viewHome,letters:viewLetters,abjad:viewAbjad,elements:viewElements,zodiac:viewZodiac,
    planets:viewPlanets,correspondences:viewCorrespondences,moon:viewMoon,lunarDays:viewLunarDays,
    profile:viewProfile,sources:viewSources,method:viewMethod,reference:viewReference}[view];
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

function viewLetters(){
  return `<h2>Les 28 lettres</h2><p class="lead">Référentiel Abjad Maghrébin et classification élémentaire.</p>
  <div class="toolbar"><input id="letterSearch" placeholder="Rechercher : ا, Alif, a, Feu…"><select id="elementFilter"><option value="">Tous les éléments</option>${DATA.elements.elements.map(e=>`<option>${esc(e.name_fr)}</option>`).join("")}</select></div>
  <div id="letterGrid" class="grid wide">${letterCards(DATA.letters.letters)}</div>`;
}
function letterCards(rows){
 return rows.map(l=>`<article class="card letter-card">
   <div class="glyph arabic-lg">${esc(l.letter)}</div>
   <div><h3>${esc(l.name_fr)}</h3><div class="muted">${esc(l.name_ar)} · ${esc(l.transliteration)}</div>
   <div class="sign-meta"><span class="tag">Abjad ${l.abjad_maghribi}</span><span class="pill">${esc(l.element)}</span></div>
   <p class="small">${esc(l.symbolic_meaning||"Aucune signification symbolique définie dans le référentiel.")}</p></div>
 </article>`).join("");
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
 const zmap=new Map(DATA.zodiac.signs.map(x=>[x.id,x])); const pmap=new Map(DATA.planets.planets.map(x=>[x.id,x]));
 return `<h2>Correspondances</h2><div class="warning"><b>Règle du projet :</b> aucune correspondance lettre → signe → planète n'est inventée. Les entrées non sourcées restent explicitement indéfinies.</div>
 <div class="table-wrap"><table><thead><tr><th>Lettre</th><th>Abjad</th><th>Élément</th><th>Signe</th><th>Planète</th><th>Statut</th></tr></thead><tbody>
 ${DATA.correspondences.records.map(c=>{const l=DATA.letters.letters.find(x=>x.id===c.letter_id),z=zmap.get(c.zodiac_sign_id),p=pmap.get(c.planet_id);return `<tr><td class="arabic">${esc(l?.letter)}</td><td>${l?.abjad_maghribi??""}</td><td>${esc(l?.element||"")}</td><td>${esc(z?.name_fr||undefinedText)}</td><td>${esc(p?.name_fr||undefinedText)}</td><td><span class="tag">${esc(c.status)}</span></td></tr>`}).join("")}
 </tbody></table></div>`;
}

function viewMoon(){
 return `<h2>Phases lunaires</h2><p class="lead">Cette page décrit les phases astronomiques de façon factuelle. Elle ne transforme pas ces phases en prédictions scientifiques.</p>
 <div class="grid wide">${DATA.phases.phases.map(p=>`<article class="card"><h3>${esc(p.name_fr)}</h3><p><span class="tag">${esc(p.elongation)}</span></p><p>${esc(p.astronomical_description)}</p><p class="small">${sourcesHtml(p.source_ids)}</p></article>`).join("")}</div>
 <div class="warning"><b>À retenir :</b> une phase lunaire n'est pas la même chose que l'âge lunaire, le jour civil ou un « jour lunaire » symbolique.</div>`;
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
 <div class="grid wide">${DATA.sources.sources.map(s=>`<article class="card"><h3>${esc(s.title)}</h3><p><b>${esc(s.publisher)}</b></p><p>${esc(s.scope)}</p><a class="source-link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Ouvrir la source ↗</a><p class="tiny muted">Consultée : ${esc(s.accessed||"")}</p></article>`).join("")}</div>`;
}

function viewMethod(){
 return `<h2>Méthode et limites</h2>
 <div class="grid wide">
  <div class="card"><h3>Abjad Maghrébin</h3><p>Le calcul utilise exclusivement les valeurs du fichier <code>referentiel/lettres.json</code>. Aucune autre table Abjad n'est substituée.</p></div>
  <div class="card"><h3>Astronomie / astrologie</h3><p><b>Astronomie</b> : phénomènes mesurables et calculs physiques. <b>Astrologie</b> : système interprétatif traditionnel/symbolique. Les deux domaines sont séparés dans l'interface.</p></div>
  <div class="card"><h3>Correspondances</h3><p>${undefinedText} Une absence de donnée n'est jamais transformée en hypothèse.</p></div>
  <div class="card"><h3>28 jours lunaires</h3><p>Le cycle de 28 jours est présenté comme une structure symbolique du référentiel. Il ne remplace pas le mois synodique astronomique.</p></div>
 </div>`;
}

function viewReference(){
 const m=DATA.manifest;
 return `<h2>État du référentiel</h2><div class="grid">
 <div class="card"><div class="kpi">${esc(m.package_version||"")}</div><b>Version du pack</b></div>
 <div class="card"><div class="kpi">${m.foundation_locked?"✓":"!"}</div><b>Fondation verrouillée</b></div>
 <div class="card"><div class="kpi">${Object.keys(m.files_sha256||{}).length}</div><b>Fichiers de référence suivis</b></div>
 </div>
 <div class="card" style="margin-top:15px"><h3>Fichiers</h3><ul class="list">${Object.keys(m.files_sha256||{}).map(k=>`<li><code>referentiel/${esc(k)}</code></li>`).join("")}</ul></div>`;
}

function bind(view){
 if(view==="letters"){
   const filter=()=>{const q=$("#letterSearch").value.toLowerCase().trim(),e=$("#elementFilter").value;
     const rows=DATA.letters.letters.filter(l=(!e||l.element===e)&&[l.letter,l.name_fr,l.name_ar,l.transliteration,l.element].some(v=>String(v).toLowerCase().includes(q)));
     $("#letterGrid").innerHTML=letterCards(rows)||`<div class="empty">Aucun résultat.</div>`;
   };
   $("#letterSearch").addEventListener("input",filter);$("#elementFilter").addEventListener("change",filter);
 }
 if(view==="abjad"){
   $("#calcAbjad").addEventListener("click",()=>$("#abjadOutput").innerHTML=abjadOutput(calcAbjad($("#abjadInput").value)));
   $("#clearAbjad").addEventListener("click",()=>{ $("#abjadInput").value="";$("#abjadOutput").innerHTML="";});
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
