/* Recherche locale de lieux et sélection de fuseaux IANA.
 * Le catalogue est volontairement fini et explicite : aucune adresse n'est géocodée,
 * aucune position n'est déduite et aucun service distant n'est appelé.
 */
(() => {
  const DATA_URL="referentiel/lieux.json";
  const $=s=>document.querySelector(s);
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const lang=()=>window.Z28I18n?.get?.()||document.documentElement.lang||"fr";
  const T={fr:{search:"Rechercher une ville",placeholder:"Ville, pays ou fuseau IANA…",results:"Résultats",none:"Aucun lieu du catalogue ne correspond.",catalog:"Catalogue local de lieux de référence",zoneList:"Fuseaux IANA disponibles dans ce navigateur",selected:"Sélectionner"},ar:{search:"البحث عن مدينة",placeholder:"مدينة أو بلد أو منطقة زمنية IANA…",results:"النتائج",none:"لا يوجد مكان مطابق في الكتالوج.",catalog:"كتالوج محلي للأماكن المرجعية",zoneList:"مناطق IANA الزمنية المتاحة في هذا المتصفح",selected:"اختيار"},en:{search:"Search for a city",placeholder:"City, country or IANA time zone…",results:"Results",none:"No matching place in the catalog.",catalog:"Local reference place catalog",zoneList:"IANA time zones available in this browser",selected:"Select"}};
  const t=k=>T[lang()]?.[k]??T.fr[k]??k;
  let locations=[];
  async function load(){if(locations.length)return locations;const r=await fetch(DATA_URL,{cache:"no-cache"});if(!r.ok)throw Error("Catalogue de lieux indisponible.");locations=(await r.json()).locations||[];return locations;}
  function zones(){try{return typeof Intl.supportedValuesOf==="function"?Intl.supportedValuesOf("timeZone"):[];}catch(_){return[];}}
  function renderResults(q){const out=$("#z28PlaceResults");if(!out)return;const needle=(q||"").trim().toLocaleLowerCase();const rows=locations.filter(x=>!needle||[x.city,x.country,x.country_code,x.timezone].join(" ").toLocaleLowerCase().includes(needle)).slice(0,12);out.innerHTML=rows.length?rows.map(x=>`<button type="button" class="z28-place-result" data-place="${esc(x.id)}"><strong>${esc(x.city)}</strong><span>${esc(x.country)} · ${esc(x.timezone)}</span><small>${x.latitude.toFixed(4)}, ${x.longitude.toFixed(4)}</small></button>`).join(""):`<p class="tiny muted">${esc(t("none"))}</p>`;out.querySelectorAll("[data-place]").forEach(b=>b.onclick=()=>select(b.dataset.place));}
  function select(id){const x=locations.find(v=>v.id===id);if(!x)return;$("#z28City").value=x.city;$("#z28Country").value=x.country;$("#z28Timezone").value=x.timezone;$("#z28Lat").value=x.latitude;$("#z28Lon").value=x.longitude;$("#z28Elev").value=x.elevation_m;$("#z28PlaceSearch").value=x.city;$("#z28PlaceResults").innerHTML=`<p class="success small">${esc(t("selected"))} : <b>${esc(x.city)}, ${esc(x.country)}</b> · ${esc(x.timezone)}</p>`;$("#z28Timezone")?.dispatchEvent(new Event("input",{bubbles:true}));}
  async function enhance(){const panel=$("#z28LocationPanel");if(!panel||$("#z28PlaceSearch"))return;try{await load();const box=document.createElement("div");box.className="z28-place-search";box.innerHTML=`<h4>${esc(t("search"))}</h4><input id="z28PlaceSearch" type="search" autocomplete="off" placeholder="${esc(t("placeholder"))}"><div id="z28PlaceResults" class="z28-place-results"></div><p class="tiny muted">${esc(t("catalog"))} · ${locations.length} entrées.</p>`;panel.insertBefore(box,panel.querySelector(".toolbar"));const tz=$("#z28Timezone");if(tz&&zones().length){tz.setAttribute("list","z28TimezoneList");const dl=document.createElement("datalist");dl.id="z28TimezoneList";zones().forEach(z=>{const o=document.createElement("option");o.value=z;dl.appendChild(o);});panel.appendChild(dl);}
      $("#z28PlaceSearch").addEventListener("input",e=>renderResults(e.target.value));
      renderResults("");
    }catch(e){const p=document.createElement("p");p.className="warning small";p.textContent=e.message;panel.appendChild(p);}}
  function watch(){enhance();}
  document.addEventListener("DOMContentLoaded",()=>{const root=$("#app");if(root)new MutationObserver(watch).observe(root,{childList:true,subtree:true});setTimeout(enhance,0);});
  window.addEventListener("z28:languagechange",()=>{const p=$("#z28LocationPanel");if(p){p.querySelector(".z28-place-search")?.remove();enhance();}});
  window.Z28LocationPlaces={load,search:q=>locations.filter(x=>[x.city,x.country,x.timezone].join(" ").toLowerCase().includes(String(q||"").toLowerCase()))};
})();
