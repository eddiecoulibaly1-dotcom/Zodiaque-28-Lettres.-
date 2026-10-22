/* Synthèse symbolique du thème natal.
 * Cette couche ne modifie aucun calcul astronomique et n'invente aucune correspondance de lettres.
 * Elle agrège uniquement les signes, éléments, modalités et aspects déjà calculés par profil.js.
 * Toute interprétation est explicitement traditionnelle/symbolique et non scientifique.
 */
(() => {
  const esc=v=>String(v??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const ELEMENTS=["Feu","Terre","Air","Eau"];
  const MODALITIES=["Cardinal","Fixe","Mutable"];
  const SIGN_DATA={
    "Bélier":{e:"Feu",m:"Cardinal"},"Taureau":{e:"Terre",m:"Fixe"},"Gémeaux":{e:"Air",m:"Mutable"},
    "Cancer":{e:"Eau",m:"Cardinal"},"Lion":{e:"Feu",m:"Fixe"},"Vierge":{e:"Terre",m:"Mutable"},
    "Balance":{e:"Air",m:"Cardinal"},"Scorpion":{e:"Eau",m:"Fixe"},"Sagittaire":{e:"Feu",m:"Mutable"},
    "Capricorne":{e:"Terre",m:"Cardinal"},"Verseau":{e:"Air",m:"Fixe"},"Poissons":{e:"Eau",m:"Mutable"}
  };
  const luminaries=new Set(["Soleil","Lune"]);
  function dominant(map){const max=Math.max(...Object.values(map),0);return max?Object.keys(map).filter(k=>map[k]===max):[];}
  function build(){
    const table=document.querySelector("#pTheme table");
    const host=document.querySelector("#pTheme");
    if(!table||!host||host.querySelector("[data-synthesis]")) return;
    const rows=[...table.querySelectorAll("tbody tr")];
    const elements=Object.fromEntries(ELEMENTS.map(e=>[e,0]));
    const modalities=Object.fromEntries(MODALITIES.map(m=>[m,0]));
    const bodies=[];
    for(const row of rows){
      const c=row.children;if(c.length<3)continue;
      const body=(c[0].textContent||"").trim();
      const sign=(c[2].textContent||"").replace(/[♈♉♊♋♌♍♎♏♐♑♒♓]/g,"").trim().split(/\s+/)[0];
      const d=SIGN_DATA[sign]; if(!d)continue;
      const weight=luminaries.has(body)?2:1;
      elements[d.e]+=weight; modalities[d.m]+=weight; bodies.push({body,sign,element:d.e,modality:d.m,weight});
    }
    const cards=`<div class="grid" style="margin-top:14px" data-synthesis>
      <div class="card"><h3>Dominante élémentaire</h3><div class="kpi">${esc(dominant(elements).join(" / ")||"—")}</div><p class="small muted">Soleil et Lune pondérés à 2 ; autres corps à 1. Agrégation symbolique.</p></div>
      <div class="card"><h3>Dominante de modalité</h3><div class="kpi">${esc(dominant(modalities).join(" / ")||"—")}</div><p class="small muted">Cardinal · Fixe · Mutable, selon les signes occupés.</p></div>
      <div class="card"><h3>Équilibre élémentaire</h3>${ELEMENTS.map(e=>`<p style="display:flex;justify-content:space-between"><span>${e}</span><b>${elements[e]}</b></p>`).join("")}</div>
      <div class="card"><h3>Équilibre des modalités</h3>${MODALITIES.map(m=>`<p style="display:flex;justify-content:space-between"><span>${m}</span><b>${modalities[m]}</b></p>`).join("")}</div>
    </div>
    <div class="card" style="margin-top:14px" data-synthesis><h3>Lecture synthétique</h3><p>${esc(summary(elements,modalities))}</p><p class="small muted">Cette lecture est une synthèse astrologique traditionnelle/symbolique. Elle ne constitue pas une conclusion scientifique sur la personnalité ou le destin.</p></div>`;
    host.insertAdjacentHTML("beforeend",cards);
  }
  function summary(e,m){
    const de=dominant(e),dm=dominant(m);
    if(!de.length)return "Aucune dominante ne peut être déterminée à partir des données actuellement affichées.";
    return `La dominante élémentaire affichée est ${de.join(" / ")}, avec une dominante de modalité ${dm.join(" / ")||"non déterminée"}. Cette combinaison sert uniquement de grille de lecture symbolique du thème calculé.`;
  }
  const mo=new MutationObserver(()=>build());
  mo.observe(document.body,{childList:true,subtree:true});
  document.addEventListener("DOMContentLoaded",()=>build());
})();
