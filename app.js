const DATA = {};
const paths = {
  letters:"referentiel/lettres.json",
  zodiac:"referentiel/zodiaque.json",
  planets:"referentiel/planetes.json",
  correspondences:"referentiel/correspondances.json",
  phases:"referentiel/phases_lunaires.json",
  lunarDays:"referentiel/jours_lunaires.json",
  sources:"referentiel/sources.json",
  manifest:"referentiel/reference-manifest.json"
};

async function loadAll(){
  const entries = Object.entries(paths);
  await Promise.all(entries.map(async ([key,path])=>{
    const res = await fetch(path,{cache:"no-cache"});
    if(!res.ok) throw new Error(`Impossible de charger ${path} (${res.status})`);
    DATA[key]=await res.json();
  }));
}
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const undefinedText="Correspondance non définie dans le référentiel actuel.";

function render(view="home"){
  document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  const app=$("#app");
  try{
    const fn={home:home,zodiac:zodiac,letters:letters,abjad:abjad,elements:elements,
      correspondences:correspondences,moon:moon,lunarDays:lunarDays,method:method,reference:reference}[view];
    app.innerHTML=fn();
    bind(view);
  }catch(e){
    app.innerHTML=`<div class="card"><h2>Erreur d'affichage</h2><p>${esc(e.message)}</p></div>`;
  }
}
function home(){
 return `<h2>Bienvenue</h2>
 <div class="notice"><strong>Socle fondamental verrouillé :</strong> 28 lettres, valeurs Abjad Maghrébin et classification élémentaire 7/7/7/7.</div>
 <div class="grid">
  <div class="card"><h3>28 lettres</h3><div class="stat">${DATA.letters.letters.length}</div><p class="muted">Référentiel arabe et Abjad Maghrébin.</p></div>
  <div class="card"><h3>Signes</h3><div class="stat">${DATA.zodiac.signs.length}</div><p class="muted">12 signes et leurs catégories conventionnelles.</p></div>
  <div class="card"><h3>Éléments</h3><div class="stat">4 × 7</div><p class="muted">Feu, Terre, Air, Eau.</p></div>
  <div class="card"><h3>Jours lunaires</h3><div class="stat">${DATA.lunarDays.lunar_cycle_days.length}</div><p class="muted">Cycle symbolique de 28 jours, séparé du calendrier civil.</p></div>
 </div>
 <div class="card" style="margin-top:16px"><h3>Règle essentielle</h3><p>Aucune correspondance lettre ↔ signe ou lettre ↔ planète n'est inventée. Lorsqu'elle n'est pas sourcée et validée, elle reste explicitement indéfinie.</p></div>`;
}
function zodiac(){
 return `<h2>12 signes du zodiaque</h2><div class="grid">${DATA.zodiac.signs.map(s=>`<div class="card"><h3>${esc(s.name_fr)}</h3><p><b>${esc(s.element)}</b> · ${esc(s.modality)} · ${esc(s.polarity)}</p><p>Maître : ${esc(s.ruling_planet)}</p><p class="muted">${esc(s.notes||"")}</p></div>`).join("")}</div>`;
}
function letters(){
 return `<h2>Les 28 lettres</h2><div class="card"><input id="letterSearch" placeholder="Rechercher une lettre, un nom ou une translittération…"></div>
 <div class="table-wrap" style="margin-top:14px"><table><thead><tr><th>#</th><th>Lettre</th><th>Nom</th><th>Translittération</th><th>Abjad</th><th>Élément</th></tr></thead><tbody id="letterRows">${letterRows(DATA.letters.letters)}</tbody></table></div>`;
}
function letterRows(rows){return rows.map(l=>`<tr><td>${l.position}</td><td class="arabic">${esc(l.letter)}</td><td>${esc(l.name_fr)}</td><td>${esc(l.transliteration)}</td><td><b>${l.abjad_value}</b></td><td>${esc(l.element)}</td></tr>`).join("")}
function abjad(){
 return `<h2>Calcul Abjad Maghrébin</h2><div class="card"><label>Texte arabe</label><textarea id="abjadInput" rows="4" dir="rtl" placeholder="اكتب النص هنا"></textarea><button class="primary" id="calcBtn" style="margin-top:10px">Calculer</button><div id="abjadResult" style="margin-top:16px"></div></div>
 <div class="notice">Le calcul ignore les caractères qui ne font pas partie des 28 lettres du référentiel. Le détail lettre par lettre est conservé dans le résultat.</div>`;
}
function calcAbjad(text){
 const map=new Map(DATA.letters.letters.map(l=>[l.letter,l]));
 const details=[];let total=0;const counts={Feu:0,Terre:0,Air:0,Eau:0};
 for(const ch of [...text]){
   const l=map.get(ch);
   if(l){total+=l.abjad_value;counts[l.element]++;details.push(l);}
 }
 return {total,counts,details};
}
function elements(){
 const groups={Feu:[],Terre:[],Air:[],Eau:[]};
 DATA.letters.letters.forEach(l=>groups[l.element].push(l));
 return `<h2>Analyse élémentaire des lettres</h2><div class="grid">${Object.entries(groups).map(([e,arr])=>`<div class="card"><h3>${e}</h3><div class="stat">${arr.length}</div><p>${arr.map(l=>`<span class="pill">${esc(l.letter)} ${l.abjad_value}</span>`).join("")}</p></div>`).join("")}</div>`;
}
function correspondences(){
 return `<h2>Correspondances</h2><div class="warning">Les correspondances non définies ne sont pas remplacées par des suppositions. Toute donnée ajoutée doit être accompagnée d'une source dans <code>referentiel/sources.json</code>.</div>
 <div class="table-wrap"><table><thead><tr><th>Lettre</th><th>Valeur</th><th>Signe</th><th>Planète</th><th>Statut</th></tr></thead><tbody>${DATA.correspondences.records.map(c=>{const l=DATA.letters.letters.find(x=>x.id===c.letter_id);const z=DATA.zodiac.signs.find(x=>x.id===c.zodiac_sign_id);const p=DATA.planets.planets.find(x=>x.id===c.planet_id);return `<tr><td class="arabic">${esc(l?.letter)}</td><td>${l?.abjad_value??""}</td><td>${esc(z?.name_fr||undefinedText)}</td><td>${esc(p?.name_fr||undefinedText)}</td><td>${esc(c.status)}</td></tr>`}).join("")}</tbody></table></div>`;
}
function moon(){
 return `<h2>Soleil & Lune</h2><div class="warning"><b>Important :</b> cette version ne prétend pas calculer des éphémérides astronomiques précises. Les calculs ci-dessous sont indicatifs. Pour les positions planétaires, maisons, ascendant, aspects, lever/coucher lunaire précis, un moteur astronomique spécialisé devra être intégré et documenté.</div>
 <div class="grid"><div class="card"><h3>Phase lunaire</h3><label>Date</label><input type="date" id="moonDate"><div id="moonOut" style="margin-top:12px"></div></div>
 <div class="card"><h3>Lever / coucher solaire</h3><p class="muted">Non calculés précisément dans le référentiel final. Une future intégration pourra utiliser latitude, longitude, fuseau et moteur astronomique documenté.</p></div></div>`;
}
function lunarDays(){
 return `<h2>28 jours lunaires</h2><div class="grid">${DATA.lunarDays.lunar_cycle_days.map(d=>`<div class="card"><h3>${d.day} — ${esc(d.name_fr)}</h3><p>${esc(d.symbolic_meaning||undefinedText)}</p></div>`).join("")}</div>`;
}
function method(){
 return `<h2>Méthode, distinction et limites</h2>
 <div class="card"><h3>Abjad</h3><p>Le calcul numérique utilise exclusivement le référentiel Abjad Maghrébin fourni dans <code>referentiel/lettres.json</code>.</p></div>
 <div class="card"><h3>Astronomie ≠ astrologie</h3><p><b>Astronomie :</b> mesures et calculs physiques/techniques. <b>Astrologie :</b> interprétations symboliques ou traditionnelles. L'application ne présente pas les interprétations astrologiques comme des faits scientifiques.</p></div>
 <div class="card"><h3>Jour lunaire ≠ jour civil</h3><p>Le cycle lunaire symbolique de 28 jours est distinct de la date civile et de l'âge astronomique réel de la Lune.</p></div>
 <div class="card"><h3>Correspondances</h3><p>${undefinedText} Tant qu'aucune source validée n'est renseignée, l'interface conserve cette absence.</p></div>`;
}
function reference(){
 return `<h2>État du référentiel</h2><div class="grid">
 <div class="card"><h3>Version</h3><p>${esc(DATA.manifest.version)}</p></div>
 <div class="card"><h3>Socle verrouillé</h3><p>${DATA.manifest.foundation_locked?"Oui":"Non"}</p></div>
 <div class="card"><h3>Lettres</h3><p>28 · Abjad Maghrébin</p></div>
 <div class="card"><h3>Correspondances</h3><p>Nulles tant qu'elles ne sont pas explicitement sourcées.</p></div>
 </div>
 <div class="card" style="margin-top:16px"><h3>Fichiers de référence</h3><ul>${Object.keys(DATA.manifest.reference_files).map(k=>`<li><code>referentiel/${esc(k)}</code></li>`).join("")}</ul></div>`;
}
function bind(view){
 if(view==="letters") $("#letterSearch").addEventListener("input",e=>{
   const q=e.target.value.toLowerCase().trim();
   const rows=DATA.letters.letters.filter(l=>[l.letter,l.name_fr,l.name_ar,l.transliteration,l.element].some(v=>String(v).toLowerCase().includes(q)));
   $("#letterRows").innerHTML=letterRows(rows);
 });
 if(view==="abjad") $("#calcBtn").addEventListener("click",()=>{
   const r=calcAbjad($("#abjadInput").value);
   $("#abjadResult").innerHTML=`<div class="grid"><div><b>Total</b><div class="stat">${r.total}</div></div><div><b>Lettres reconnues</b><div class="stat">${r.details.length}</div></div></div>
   <h3>Détail</h3><div class="table-wrap"><table><thead><tr><th>Lettre</th><th>Valeur</th><th>Élément</th></tr></thead><tbody>${r.details.map(l=>`<tr><td class="arabic">${esc(l.letter)}</td><td>${l.abjad_value}</td><td>${esc(l.element)}</td></tr>`).join("")}</tbody></table></div>`;
 });
 if(view==="moon") $("#moonDate").value=new Date().toISOString().slice(0,10);
}
document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>render(b.dataset.view)));
(async()=>{try{await loadAll();render("home");}catch(e){$("#app").innerHTML=`<div class="card"><h2>Chargement impossible</h2><p>${esc(e.message)}</p><p>Utilisez l'application via HTTP(S), par exemple GitHub Pages ou un serveur local. L'ouverture directe en <code>file://</code> peut bloquer le chargement des fichiers JSON.</p></div>`;}})();

if ("serviceWorker" in navigator && (location.protocol==="https:" || location.hostname==="localhost")) navigator.serviceWorker.register("./sw.js").catch(()=>{});
