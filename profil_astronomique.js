/* Profil astronomique de référence.
 * Longitudes géocentriques ECT calculées séparément de l'astrologie symbolique.
 * L'heure civile est convertie en UTC via le fuseau IANA lorsque disponible.
 */
(() => {
  const KEY="z28_profile_v4";
  const $=s=>document.querySelector(s);
  const norm=x=>((Number(x)%360)+360)%360;
  const signs=[["Bélier","♈"],["Taureau","♉"],["Gémeaux","♊"],["Cancer","♋"],["Lion","♌"],["Vierge","♍"],["Balance","♎"],["Scorpion","♏"],["Sagittaire","♐"],["Capricorne","♑"],["Verseau","♒"],["Poissons","♓"]];
  const bodies=["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
  const labels={Sun:"Soleil",Moon:"Lune",Mercury:"Mercure",Venus:"Vénus",Mars:"Mars",Jupiter:"Jupiter",Saturn:"Saturne",Uranus:"Uranus",Neptune:"Neptune",Pluto:"Pluton"};
  const glyphs={Sun:"☉",Moon:"☾",Mercury:"☿",Venus:"♀",Mars:"♂",Jupiter:"♃",Saturn:"♄",Uranus:"♅",Neptune:"♆",Pluto:"♇"};
  const aspectsDef=[{n:"Conjonction",s:"☌",a:0,o:8},{n:"Sextile",s:"⚹",a:60,o:6},{n:"Carré",s:"□",a:90,o:7},{n:"Trigone",s:"△",a:120,o:8},{n:"Opposition",s:"☍",a:180,o:8}];
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const sign=lon=>{const l=norm(lon),i=Math.floor(l/30);return{i,name:signs[i][0],symbol:signs[i][1],degree:l-i*30};};
  const deg=x=>Number.isFinite(x)?`${x.toFixed(2)}°`:"—";
  const dateLocal=d=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);
  function parseBirth(local,offset,zone){
    if(window.Z28Time?.parseCivil && zone) return window.Z28Time.parseCivil(local,zone);
    const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local||"");
    if(!m)return new Date(NaN);
    const a=m.slice(1).map(Number);
    return new Date(Date.UTC(a[0],a[1]-1,a[2],a[3],a[4])-Number(offset)*60000);
  }
  function ectLongitude(A,body,date){
    if(body===A.Body.Sun) return norm(A.SunPosition(date).elon);
    const eqj=A.GeoVector(body,date,true);
    const ect=A.RotateVector(A.Rotation_EQJ_ECT(date),eqj);
    return norm(A.SphereFromVector(ect).lon);
  }
  function pos(name,date,obs){
    const A=globalThis.Astronomy,B=A.Body[name],lon=ectLongitude(A,B,date),eq=A.Equator(B,date,obs,true,true),hor=A.Horizon(date,obs,eq.ra,eq.dec,"normal");
    return{name,lon,sign:sign(lon),ra:eq.ra,dec:eq.dec,az:hor.azimuth,alt:hor.altitude};
  }
  function angles(date,lat,lon){const A=globalThis.Astronomy,st=norm(A.SiderealTime(date)*15+lon),eps=A.e_tilt(A.MakeTime(date)).tobl,t=st*Math.PI/180,e=eps*Math.PI/180,p=Number(lat)*Math.PI/180;return{mc:norm(Math.atan2(Math.sin(t)*Math.cos(e),Math.cos(t))*180/Math.PI),asc:norm(Math.atan2(-Math.cos(t),Math.sin(t)*Math.cos(e)+Math.tan(p)*Math.sin(e))*180/Math.PI)};}
  const angle=(a,b)=>{const d=Math.abs(norm(a)-norm(b));return Math.min(d,360-d);};
  function houses(asc){const start=sign(asc).i;return Array.from({length:12},(_,i)=>{const si=(start+i)%12;return{house:i+1,name:signs[si][0],symbol:signs[si][1]};});}
  const house=(lon,asc)=>((sign(lon).i-sign(asc).i+12)%12)+1;
  function calcAspects(ps,ang){const pts=ps.map(p=>({label:labels[p.name],lon:p.lon})).concat([{label:"Ascendant",lon:ang.asc},{label:"Milieu du Ciel",lon:ang.mc}]),out=[];for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const d=angle(pts[i].lon,pts[j].lon);for(const a of aspectsDef){const orb=Math.abs(d-a.a);if(orb<=a.o){out.push({...a,p1:pts[i].label,p2:pts[j].label,orb});break;}}}return out.sort((a,b)=>a.orb-b.orb);}
  function render(){const root=$("#app");if(!root)return;let s={};try{s=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(_){}const off=Number.isFinite(s.offset)?s.offset:0;root.innerHTML=`<h2>Profil personnalisé</h2><p class="lead">Données de naissance, thème astronomique et analyse du profil.</p><div class="card"><h3>Données de naissance</h3><div class="toolbar"><input id="pName" placeholder="Nom / prénom" value="${esc(s.name||"")}"><input id="pBirth" type="datetime-local" value="${esc(s.local||"")}"><input id="pOffset" type="number" step="30" min="-840" max="840" value="${esc(off)}" placeholder="UTC (minutes)"><input id="pLat" type="number" step="any" min="-90" max="90" value="${esc(s.lat??"")}" placeholder="Latitude"><input id="pLon" type="number" step="any" min="-180" max="180" value="${esc(s.lon??"")}" placeholder="Longitude"><input id="pElev" type="number" step="1" min="0" value="${esc(s.elev??0)}" placeholder="Altitude (m)"></div><div class="toolbar"><button class="primary" id="pCalc">Calculer</button><button class="secondary" id="pNow">Maintenant</button><button class="secondary" id="pSave">Enregistrer</button></div><p class="small muted">Le calcul astronomique utilise un instant UTC. Le fuseau IANA, lorsqu'il est renseigné, est prioritaire sur un décalage fixe.</p><p id="pStatus" class="small muted"></p></div><div id="pTheme"></div><div class="notice"><b>Cadre méthodologique :</b> les positions sont astronomiques ; les maisons, aspects et lectures zodiacales sont ensuite présentés comme convention astrologique symbolique et non scientifique.</div>`;$("#pNow").onclick=()=>$("#pBirth").value=dateLocal(new Date());$("#pSave").onclick=save;$("#pCalc").onclick=calculate;if(s.local&&s.lat!==undefined&&s.lon!==undefined)calculate();}
  function read(){const local=$("#pBirth").value,offset=Number($("#pOffset").value),zone=window.Z28Location?.load?.()?.timezone||"",birth=parseBirth(local,offset,zone),lat=Number($("#pLat").value),lon=Number($("#pLon").value),elev=Number($("#pElev").value||0);if(!globalThis.Astronomy)throw Error("Le moteur astronomique n'est pas chargé.");if(!Number.isFinite(birth.getTime()))throw Error("Date et heure invalides.");if(!Number.isFinite(offset)||offset<-840||offset>840)throw Error("Décalage UTC invalide.");if(!Number.isFinite(lat)||lat<-90||lat>90)throw Error("Latitude invalide.");if(!Number.isFinite(lon)||lon<-180||lon>180)throw Error("Longitude invalide.");if(!Number.isFinite(elev)||elev<0)throw Error("Altitude invalide.");return{local,offset,zone,birth,lat,lon,elev};}
  function save(){try{const v=read();localStorage.setItem(KEY,JSON.stringify({name:$("#pName").value.trim(),...v,birth:v.birth.toISOString()}));$("#pStatus").textContent="Profil enregistré sur cet appareil.";}catch(e){$("#pStatus").textContent=e.message;}}
  function calculate(){const out=$("#pTheme");try{const v=read(),A=globalThis.Astronomy,obs=new A.Observer(v.lat,v.lon,v.elev),ps=bodies.map(b=>pos(b,v.birth,obs)),ang=angles(v.birth,v.lat,v.lon),asc=sign(ang.asc),mc=sign(ang.mc),hs=houses(ang.asc),as=calcAspects(ps,ang);out.innerHTML=`<div class="grid" style="margin-top:14px"><div class="card"><h3>☀️ Soleil</h3><div class="kpi">${ps[0].sign.symbol} ${ps[0].sign.name}</div><p>${deg(ps[0].lon)}</p></div><div class="card"><h3>🌙 Lune</h3><div class="kpi">${ps[1].sign.symbol} ${ps[1].sign.name}</div><p>${deg(ps[1].lon)}</p></div><div class="card"><h3>Ascendant</h3><div class="kpi">${asc.symbol} ${asc.name}</div><p>${deg(ang.asc)}</p></div><div class="card"><h3>Milieu du Ciel</h3><div class="kpi">${mc.symbol} ${mc.name}</div><p>${deg(ang.mc)}</p></div></div><div class="card" style="margin-top:14px"><h3>Positions et maisons</h3><div class="table-wrap"><table><thead><tr><th>Corps</th><th>Longitude ECT géocentrique</th><th>Signe</th><th>Maison</th><th>Azimut</th><th>Altitude</th></tr></thead><tbody>${ps.map(p=>`<tr><td>${glyphs[p.name]} ${labels[p.name]}</td><td>${deg(p.lon)}</td><td>${p.sign.symbol} ${p.sign.name} ${deg(p.sign.degree)}</td><td>${house(p.lon,ang.asc)}</td><td>${deg(p.az)}</td><td>${deg(p.alt)}</td></tr>`).join("")}</tbody></table></div></div><div class="grid wide" style="margin-top:14px"><div class="card"><h3>Maisons en signes entiers</h3><p class="small muted">Convention explicitement choisie pour cette version.</p><div class="table-wrap"><table><thead><tr><th>Maison</th><th>Signe</th></tr></thead><tbody>${hs.map(h=>`<tr><td>${h.house}</td><td>${h.symbol} ${h.name}</td></tr>`).join("")}</tbody></table></div></div><div class="card"><h3>Aspects majeurs</h3>${as.length?as.map(a=>`<p><b>${a.p1} ${a.s} ${a.p2}</b><br><span class="small muted">${a.n} · orbe ${a.orb.toFixed(2)}°</span></p>`).join(""):"<p class='muted'>Aucun aspect dans les orbes configurées.</p>"}</div></div><div class="card" style="margin-top:14px"><h3>Horodatage</h3><p class="small muted">Heure civile : ${esc(v.local)} · Fuseau : ${esc(v.zone||"non renseigné")} · UTC${v.offset>=0?"+":""}${(v.offset/60).toFixed(1)} · instant transmis : ${esc(v.birth.toISOString())}</p></div>`;}catch(e){out.innerHTML=`<div class="card"><h3>Calcul impossible</h3><p>${esc(e.message)}</p></div>`;}}
  function hook(){document.querySelectorAll('.nav[data-view="profile"]').forEach(b=>{if(b.dataset.pHook2)return;b.dataset.pHook2="1";b.addEventListener("click",()=>setTimeout(render,0));});}
  hook();new MutationObserver(hook).observe(document.documentElement,{subtree:true,childList:true});
})();
