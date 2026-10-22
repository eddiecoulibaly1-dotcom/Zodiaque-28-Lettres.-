/* Synthèse symbolique du thème natal.
 * Cette couche ne modifie aucun calcul astronomique et n'invente aucune correspondance de lettres.
 * Elle agrège uniquement les signes, éléments, modalités et longitudes déjà calculés par profil.js.
 * Toute interprétation est explicitement traditionnelle/symbolique et non scientifique.
 */
(() => {
  const esc=v=>String(v??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const ELEMENTS=["Feu","Terre","Air","Eau"], MODALITIES=["Cardinal","Fixe","Mutable"];
  const SIGNS=[
    ["Bélier","♈","Feu","Cardinal"],["Taureau","♉","Terre","Fixe"],["Gémeaux","♊","Air","Mutable"],["Cancer","♋","Eau","Cardinal"],
    ["Lion","♌","Feu","Fixe"],["Vierge","♍","Terre","Mutable"],["Balance","♎","Air","Cardinal"],["Scorpion","♏","Eau","Fixe"],
    ["Sagittaire","♐","Feu","Mutable"],["Capricorne","♑","Terre","Cardinal"],["Verseau","♒","Air","Fixe"],["Poissons","♓","Eau","Mutable"]
  ];
  const SIGN_DATA=Object.fromEntries(SIGNS.map(x=>[x[0],{e:x[2],m:x[3]}]));
  const luminaries=new Set(["Soleil","Lune"]);
  const dominant=map=>{const max=Math.max(...Object.values(map),0);return max?Object.keys(map).filter(k=>map[k]===max):[];};
  const polar=(cx,cy,r,a)=>{const t=(a-90)*Math.PI/180;return [cx+r*Math.cos(t),cy+r*Math.sin(t)];};
  function wheel(bodies){
    const size=620,c=310,outer=270,ring=205,inner=145;
    const sectors=SIGNS.map((s,i)=>{const a0=i*30,a1=a0+30,p0=polar(c,c,ring,a0),p1=polar(c,c,ring,a1),o0=polar(c,c,outer,a0),o1=polar(c,c,outer,a1);const large=0;return `<path d="M ${o0[0]} ${o0[1]} A ${outer} ${outer} 0 ${large} 1 ${o1[0]} ${o1[1]} L ${p1[0]} ${p1[1]} A ${ring} ${ring} 0 ${large} 0 ${p0[0]} ${p0[1]} Z" class="zodiac-sector"/><line x1="${p0[0]}" y1="${p0[1]}" x2="${o0[0]}" y2="${o0[1]}" class="zodiac-line"/>`;}).join("");
    const labels=SIGNS.map((s,i)=>{const [x,y]=polar(c,c,238,i*30+15);return `<text x="${x}" y="${y}" class="zodiac-label" text-anchor="middle" dominant-baseline="middle">${s[1]} ${s[0]}</text>`;}).join("");
    const markers=bodies.map((p,i)=>{const a=Number(p.lon),r=178-(i%3)*28,[x,y]=polar(c,c,r,a);return `<g class="planet-marker"><circle cx="${x}" cy="${y}" r="13"></circle><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${esc(p.glyph)}</text><title>${esc(p.body)} · ${p.lon.toFixed(2)}° · ${esc(p.sign)}</title></g>`;}).join("");
    return `<div class="natal-wheel-wrap"><svg class="natal-wheel" viewBox="0 0 ${size} ${size}" role="img" aria-label="Roue zodiacale du thème natal"><circle cx="${c}" cy="${c}" r="${outer}" class="zodiac-outer"/><circle cx="${c}" cy="${c}" r="${ring}" class="zodiac-inner"/>${sectors}${labels}<circle cx="${c}" cy="${c}" r="${inner}" class="zodiac-center"/>${markers}<text x="${c}" y="${c-12}" text-anchor="middle" class="wheel-title">Thème natal</text><text x="${c}" y="${c+14}" text-anchor="middle" class="wheel-subtitle">positions astronomiques</text></svg></div>`;
  }
  function build(){
    const table=document.querySelector("#pTheme table"),host=document.querySelector("#pTheme");
    if(!table||!host||host.querySelector("[data-synthesis]")) return;
    const rows=[...table.querySelectorAll("tbody tr")], elements=Object.fromEntries(ELEMENTS.map(e=>[e,0])), modalities=Object.fromEntries(MODALITIES.map(m=>[m,0])), bodies=[];
    const glyphs={Soleil:"☉",Lune:"☾",Mercure:"☿",Vénus:"♀",Mars:"♂",Jupiter:"♃",Saturne:"♄",Uranus:"♅",Neptune:"♆",Pluton:"♇"};
    for(const row of rows){const c=row.children;if(c.length<3)continue;const body=(c[0].textContent||"").trim(), raw=(c[2].textContent||"").replace(/[♈♉♊♋♌♍♎♏♐♑♒♓]/g,"").trim(), sign=raw.split(/\s+/)[0],lon=parseFloat((c[1].textContent||"").replace(",","."));const d=SIGN_DATA[sign];if(!d||!Number.isFinite(lon))continue;const weight=luminaries.has(body)?2:1;elements[d.e]+=weight;modalities[d.m]+=weight;bodies.push({body,sign,lon,glyph:glyphs[body]||"•"});}
    const cards=`<div class="grid" style="margin-top:14px" data-synthesis><div class="card"><h3>Dominante élémentaire</h3><div class="kpi">${esc(dominant(elements).join(" / ")||"—")}</div><p class="small muted">Soleil et Lune pondérés à 2 ; autres corps à 1.</p></div><div class="card"><h3>Dominante de modalité</h3><div class="kpi">${esc(dominant(modalities).join(" / ")||"—")}</div><p class="small muted">Cardinal · Fixe · Mutable.</p></div><div class="card"><h3>Équilibre élémentaire</h3>${ELEMENTS.map(e=>`<p style="display:flex;justify-content:space-between"><span>${e}</span><b>${elements[e]}</b></p>`).join("")}</div><div class="card"><h3>Équilibre des modalités</h3>${MODALITIES.map(m=>`<p style="display:flex;justify-content:space-between"><span>${m}</span><b>${modalities[m]}</b></p>`).join("")}</div></div><div class="card" style="margin-top:14px" data-synthesis><h3>Roue zodiacale</h3><p class="small muted">Visualisation des longitudes calculées pour les dix corps du thème. La roue n'ajoute aucune correspondance aux 28 lettres.</p>${wheel(bodies)}<div class="wheel-legend">${bodies.map(p=>`<span class="pill"><b>${esc(p.glyph)}</b> ${esc(p.body)} · ${p.lon.toFixed(2)}°</span>`).join(" ")}</div></div><div class="card" style="margin-top:14px" data-synthesis><h3>Lecture synthétique</h3><p>${esc(summary(elements,modalities))}</p><p class="small muted">Cette lecture est une synthèse astrologique traditionnelle/symbolique. Elle ne constitue pas une conclusion scientifique sur la personnalité ou le destin.</p></div>`;
    host.insertAdjacentHTML("beforeend",cards);
  }
  function summary(e,m){const de=dominant(e),dm=dominant(m);if(!de.length)return "Aucune dominante ne peut être déterminée à partir des données actuellement affichées.";return `La dominante élémentaire affichée est ${de.join(" / ")}, avec une dominante de modalité ${dm.join(" / ")||"non déterminée"}. Cette combinaison sert uniquement de grille de lecture symbolique du thème calculé.`;}
  const mo=new MutationObserver(build);mo.observe(document.body,{childList:true,subtree:true});document.addEventListener("DOMContentLoaded",build);
})();
