/* Synthèse symbolique du thème natal.
 * Cette couche ne modifie aucun calcul astronomique et n'invente aucune correspondance de lettres.
 * Elle agrège uniquement les signes, éléments, modalités, maisons, aspects et longitudes déjà calculés par profil.js.
 * Toute interprétation est explicitement traditionnelle/symbolique et non scientifique.
 */
(() => {
  const esc=v=>String(v??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const ELEMENTS=["Feu","Terre","Air","Eau"], MODALITIES=["Cardinal","Fixe","Mutable"], POLARITIES=["Yang","Yin"];
  const SIGNS=[
    ["Bélier","♈","Feu","Cardinal","Yang"],["Taureau","♉","Terre","Fixe","Yin"],["Gémeaux","♊","Air","Mutable","Yang"],["Cancer","♋","Eau","Cardinal","Yin"],
    ["Lion","♌","Feu","Fixe","Yang"],["Vierge","♍","Terre","Mutable","Yin"],["Balance","♎","Air","Cardinal","Yang"],["Scorpion","♏","Eau","Fixe","Yin"],
    ["Sagittaire","♐","Feu","Mutable","Yang"],["Capricorne","♑","Terre","Cardinal","Yin"],["Verseau","♒","Air","Fixe","Yang"],["Poissons","♓","Eau","Mutable","Yin"]
  ];
  const SIGN_DATA=Object.fromEntries(SIGNS.map(x=>[x[0],{e:x[2],m:x[3],p:x[4],s:x[1]}]));
  const luminaries=new Set(["Soleil","Lune"]);
  const dominant=map=>{const max=Math.max(...Object.values(map),0);return max?Object.keys(map).filter(k=>map[k]===max):[];};
  const polar=(cx,cy,r,a)=>{const t=(a-90)*Math.PI/180;return [cx+r*Math.cos(t),cy+r*Math.sin(t)];};
  function wheel(bodies){
    const size=620,c=310,outer=270,ring=205,inner=145;
    const sectors=SIGNS.map((s,i)=>{const a0=i*30,a1=a0+30,p0=polar(c,c,ring,a0),p1=polar(c,c,ring,a1),o0=polar(c,c,outer,a0),o1=polar(c,c,outer,a1);return `<path d="M ${o0[0]} ${o0[1]} A ${outer} ${outer} 0 0 1 ${o1[0]} ${o1[1]} L ${p1[0]} ${p1[1]} A ${ring} ${ring} 0 0 0 ${p0[0]} ${p0[1]} Z" class="zodiac-sector"/><line x1="${p0[0]}" y1="${p0[1]}" x2="${o0[0]}" y2="${o0[1]}" class="zodiac-line"/>`;}).join("");
    const labels=SIGNS.map((s,i)=>{const [x,y]=polar(c,c,238,i*30+15);return `<text x="${x}" y="${y}" class="zodiac-label" text-anchor="middle" dominant-baseline="middle">${s[1]} ${s[0]}</text>`;}).join("");
    const markers=bodies.map((p,i)=>{const a=Number(p.lon),r=178-(i%3)*28,[x,y]=polar(c,c,r,a);return `<g class="planet-marker"><circle cx="${x}" cy="${y}" r="13"></circle><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${esc(p.glyph)}</text><title>${esc(p.body)} · ${p.lon.toFixed(2)}° · ${esc(p.sign)}</title></g>`;}).join("");
    return `<div class="natal-wheel-wrap"><svg class="natal-wheel" viewBox="0 0 ${size} ${size}" role="img" aria-label="Roue zodiacale du thème natal"><circle cx="${c}" cy="${c}" r="${outer}" class="zodiac-outer"/><circle cx="${c}" cy="${c}" r="${ring}" class="zodiac-inner"/>${sectors}${labels}<circle cx="${c}" cy="${c}" r="${inner}" class="zodiac-center"/>${markers}<text x="${c}" y="${c-12}" text-anchor="middle" class="wheel-title">Thème natal</text><text x="${c}" y="${c+14}" text-anchor="middle" class="wheel-subtitle">positions astronomiques</text></svg></div>`;
  }
  function readRows(){
    const table=document.querySelector("#pTheme table");
    if(!table)return [];
    return [...table.querySelectorAll("tbody tr")].map(row=>{const c=row.children;if(c.length<4)return null;const body=(c[0].textContent||"").trim(),lon=parseFloat((c[1].textContent||"").replace(",",".")),raw=(c[2].textContent||"").replace(/[♈♉♊♋♌♍♎♏♐♑♒♓]/g,"").trim(),sign=raw.split(/\s+/)[0],house=parseInt(c[3].textContent,10);return Number.isFinite(lon)&&SIGN_DATA[sign]?{body,lon,sign,house,data:SIGN_DATA[sign]}:null;}).filter(Boolean);
  }
  function build(){
    const host=document.querySelector("#pTheme");
    if(!host||host.querySelector("[data-synthesis]"))return;
    const rows=readRows();
    if(!rows.length)return;
    const elements=Object.fromEntries(ELEMENTS.map(e=>[e,0])), modalities=Object.fromEntries(MODALITIES.map(m=>[m,0])), polarities=Object.fromEntries(POLARITIES.map(p=>[p,0])), houses=Object.fromEntries(Array.from({length:12},(_,i)=>[i+1,0])), bodies=[];
    const glyphs={Soleil:"☉",Lune:"☾",Mercure:"☿",Vénus:"♀",Mars:"♂",Jupiter:"♃",Saturne:"♄",Uranus:"♅",Neptune:"♆",Pluton:"♇"};
    for(const r of rows){const weight=luminaries.has(r.body)?2:1;elements[r.data.e]+=weight;modalities[r.data.m]+=weight;polarities[r.data.p]+=weight;houses[r.house]++;bodies.push({body:r.body,sign:r.sign,lon:r.lon,house:r.house,glyph:glyphs[r.body]||"•"});}
    const houseRows=Array.from({length:12},(_,i)=>{const n=i+1,items=bodies.filter(p=>p.house===n);return `<tr><td>${n}</td><td>${items.length?items.map(p=>`${esc(p.glyph)} ${esc(p.body)}`).join(", "):"—"}</td></tr>`;}).join("");
    const positionRows=bodies.map(p=>`<tr><td>${esc(p.glyph)} ${esc(p.body)}</td><td>${esc(p.sign)} ${p.lon.toFixed(2)}°</td><td>${p.data.e}</td><td>${p.data.m}</td><td>${p.data.p}</td><td>${p.house}</td></tr>`).join("");
    const aspectCard=[...host.querySelectorAll(".card")].find(c=>(c.querySelector("h3")?.textContent||"").includes("Aspects majeurs"));
    const aspectText=aspectCard?.innerText||"";
    const aspectCount=(aspectText.match(/orbe/g)||[]).length;
    const cards=`<div class="grid" style="margin-top:14px" data-synthesis><div class="card"><h3>Dominante élémentaire</h3><div class="kpi">${esc(dominant(elements).join(" / ")||"—")}</div><p class="small muted">Soleil et Lune pondérés à 2 ; autres corps à 1.</p></div><div class="card"><h3>Dominante de modalité</h3><div class="kpi">${esc(dominant(modalities).join(" / ")||"—")}</div><p class="small muted">Cardinal · Fixe · Mutable.</p></div><div class="card"><h3>Polarité</h3><div class="kpi">${esc(dominant(polarities).join(" / ")||"—")}</div><p class="small muted">Répartition Yang / Yin, selon le référentiel zodiacal.</p></div><div class="card"><h3>Aspects détectés</h3><div class="kpi">${aspectCount}</div><p class="small muted">Aspects majeurs déjà calculés par le moteur du profil.</p></div></div><div class="card" style="margin-top:14px" data-synthesis><h3>Grille planète × signe × maison</h3><p class="small muted">Lecture structurée des positions calculées. Les maisons sont celles de la convention « signes entiers » utilisée par le profil.</p><div class="table-wrap"><table><thead><tr><th>Corps</th><th>Signe / longitude</th><th>Élément</th><th>Modalité</th><th>Polarité</th><th>Maison</th></tr></thead><tbody>${positionRows}</tbody></table></div></div><div class="grid wide" style="margin-top:14px" data-synthesis><div class="card"><h3>Occupation des maisons</h3><div class="table-wrap"><table><thead><tr><th>Maison</th><th>Corps présents</th></tr></thead><tbody>${houseRows}</tbody></table></div></div><div class="card"><h3>Équilibres</h3><h4>Éléments</h4>${ELEMENTS.map(e=>`<p style="display:flex;justify-content:space-between"><span>${e}</span><b>${elements[e]}</b></p>`).join("")}<h4>Modalités</h4>${MODALITIES.map(m=>`<p style="display:flex;justify-content:space-between"><span>${m}</span><b>${modalities[m]}</b></p>`).join("")}<h4>Polarités</h4>${POLARITIES.map(p=>`<p style="display:flex;justify-content:space-between"><span>${p}</span><b>${polarities[p]}</b></p>`).join("")}</div></div><div class="card" style="margin-top:14px" data-synthesis><h3>Roue zodiacale</h3><p class="small muted">Visualisation des longitudes calculées pour les dix corps du thème. La roue n'ajoute aucune correspondance aux 28 lettres.</p>${wheel(bodies)}<div class="wheel-legend">${bodies.map(p=>`<span class="pill"><b>${esc(p.glyph)}</b> ${esc(p.body)} · ${p.lon.toFixed(2)}° · M${p.house}</span>`).join(" ")}</div></div><div class="card" style="margin-top:14px" data-synthesis><h3>Lecture synthétique</h3><p>${esc(summary(elements,modalities,polarities,aspectCount))}</p><p class="small muted">Cette lecture est une synthèse astrologique traditionnelle/symbolique. Elle ne constitue pas une conclusion scientifique sur la personnalité ou le destin.</p></div>`;
    host.insertAdjacentHTML("beforeend",cards);
  }
  function summary(e,m,p,a){const de=dominant(e),dm=dominant(m),dp=dominant(p);if(!de.length)return "Aucune dominante ne peut être déterminée à partir des données actuellement affichées.";return `La dominante élémentaire affichée est ${de.join(" / ")}, avec une dominante de modalité ${dm.join(" / ")||"non déterminée"} et de polarité ${dp.join(" / ")||"non déterminée"}. ${a} aspect(s) majeur(s) sont affiché(s) dans le thème. Cette combinaison sert uniquement de grille de lecture symbolique du thème calculé.`;}
  const mo=new MutationObserver(build);mo.observe(document.body,{childList:true,subtree:true});document.addEventListener("DOMContentLoaded",build);
})();
