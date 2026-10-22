/* Localisation et gestion horaire — Zodiaque & 28 Lettres.
 * La géolocalisation est toujours déclenchée par une action explicite de l'utilisateur.
 * Aucun lieu n'est déduit automatiquement et aucune API externe n'est requise.
 * Les coordonnées restent distinctes du fuseau horaire et de l'heure civile.
 */
(() => {
  const LOCATION_KEY="z28_location_v1";
  const $=s=>document.querySelector(s);
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const T={
    fr:{title:"Localisation et fuseau horaire",lead:"Lieu de naissance, coordonnées et fuseau horaire sont gérés séparément pour éviter toute confusion entre heure civile, UTC et position géographique.",city:"Ville",country:"Pays",tz:"Fuseau horaire IANA",lat:"Latitude",lon:"Longitude",elev:"Altitude (m)",detectTZ:"Détecter le fuseau du navigateur",geo:"Utiliser ma position (avec consentement)",apply:"Appliquer au profil",saved:"Localisation enregistrée sur cet appareil.",geoDenied:"La géolocalisation a été refusée ou est indisponible.",geoUnsupported:"La géolocalisation n'est pas disponible dans ce navigateur.",tzInvalid:"Fuseau horaire invalide.",needCoords:"Renseignez des coordonnées valides avant d'appliquer.",manual:"Les champs ville et pays sont descriptifs : aucune adresse n'est déduite des coordonnées.",utc:"Décalage UTC calculé pour la date de naissance",permission:"Votre navigateur demandera explicitement l'autorisation d'accéder à la position.",browserTZ:"Fuseau détecté",noTZ:"Non détecté",profileSync:"Les coordonnées et le décalage UTC sont synchronisés avec le calcul du thème natal."},
    ar:{title:"الموقع والمنطقة الزمنية",lead:"تُدار مدينة الميلاد والإحداثيات والمنطقة الزمنية بشكل منفصل لتجنب الخلط بين الوقت المدني وUTC والموقع الجغرافي.",city:"المدينة",country:"البلد",tz:"المنطقة الزمنية IANA",lat:"خط العرض",lon:"خط الطول",elev:"الارتفاع (م)",detectTZ:"اكتشاف المنطقة الزمنية للمتصفح",geo:"استخدام موقعي (بموافقتي)",apply:"تطبيق على الملف",saved:"تم حفظ الموقع على هذا الجهاز.",geoDenied:"تم رفض تحديد الموقع أو أنه غير متاح.",geoUnsupported:"تحديد الموقع غير متاح في هذا المتصفح.",tzInvalid:"المنطقة الزمنية غير صالحة.",needCoords:"أدخل إحداثيات صحيحة قبل التطبيق.",manual:"حقلا المدينة والبلد وصفيان: لا يتم استنتاج عنوان من الإحداثيات.",utc:"إزاحة UTC المحسوبة لتاريخ الميلاد",permission:"سيطلب المتصفح إذنًا صريحًا للوصول إلى الموقع.",browserTZ:"المنطقة المكتشفة",noTZ:"غير مكتشفة",profileSync:"تتم مزامنة الإحداثيات وإزاحة UTC مع حساب الخريطة الولادية."},
    en:{title:"Location and time zone",lead:"Birthplace, coordinates and time zone are managed separately to avoid confusing civil time, UTC and geographic position.",city:"City",country:"Country",tz:"IANA time zone",lat:"Latitude",lon:"Longitude",elev:"Elevation (m)",detectTZ:"Detect browser time zone",geo:"Use my location (with consent)",apply:"Apply to profile",saved:"Location saved on this device.",geoDenied:"Geolocation was denied or is unavailable.",geoUnsupported:"Geolocation is not available in this browser.",tzInvalid:"Invalid time zone.",needCoords:"Enter valid coordinates before applying.",manual:"City and country are descriptive fields: no address is inferred from coordinates.",utc:"UTC offset calculated for birth date",permission:"Your browser will explicitly ask for permission to access your location.",browserTZ:"Detected zone",noTZ:"Not detected",profileSync:"Coordinates and UTC offset are synchronized with the natal-chart calculation."}
  };
  const lang=()=>window.Z28I18n?.get?.()||document.documentElement.lang||"fr";
  const t=k=>T[lang()]?.[k]??T.fr[k]??k;
  const load=()=>{try{return JSON.parse(localStorage.getItem(LOCATION_KEY)||"{}")}catch(_){return {}}};
  const save=v=>localStorage.setItem(LOCATION_KEY,JSON.stringify(v));
  const validTZ=zone=>window.Z28Time?.validZone(zone) ?? (()=>{try{new Intl.DateTimeFormat("en-US",{timeZone:zone}).format();return true}catch(_){return false;}})();
  const resolveCivil=(value,zone)=>window.Z28Time?.parseCivil?.(value,zone)||new Date(NaN);
  const offsetFor=(date,zone)=>window.Z28Time?.offsetFor(date,zone) ?? (()=>{throw Error(t("tzInvalid"));})();
  function birthDate(){const v=$("#pBirth")?.value||"";const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(v);if(!m)return null;const a=m.slice(1).map(Number);return new Date(Date.UTC(a[0],a[1]-1,a[2],a[3],a[4]));}
  function updateOffset(){
    const zone=$("#z28Timezone")?.value?.trim(),local=$("#pBirth")?.value||"",out=$("#z28UtcOffset"); if(!zone||!local){if(out)out.textContent="";return;}
    try{const instant=resolveCivil(local,zone);if(!Number.isFinite(instant.getTime()))throw Error(t("tzInvalid"));const off=offsetFor(instant,zone),h=off/60;if($("#pOffset"))$("#pOffset").value=off;if(out)out.textContent=`${t("utc")} : UTC${off>=0?"+":""}${h.toFixed(1)}`;}catch(e){if(out)out.textContent=e.message;}
  }
  function render(){
    const root=$("#app"); if(!root||!$("#pLat"))return;
    if($("#z28LocationPanel"))return;
    const s=load();
    const panel=document.createElement("section"); panel.id="z28LocationPanel"; panel.className="card z28-location-panel";
    panel.innerHTML=`<h3>${esc(t("title"))}</h3><p class="small muted">${esc(t("lead"))}</p><div class="toolbar"><input id="z28City" value="${esc(s.city||"")}" placeholder="${esc(t("city"))}"><input id="z28Country" value="${esc(s.country||"")}" placeholder="${esc(t("country"))}"><input id="z28Timezone" value="${esc(s.timezone||"")}" placeholder="Africa/Abidjan"><input id="z28Lat" type="number" step="any" min="-90" max="90" value="${esc(s.lat??"")}" placeholder="${esc(t("lat"))}"><input id="z28Lon" type="number" step="any" min="-180" max="180" value="${esc(s.lon??"")}" placeholder="${esc(t("lon"))}"><input id="z28Elev" type="number" step="1" min="0" value="${esc(s.elev??0)}" placeholder="${esc(t("elev"))}"></div><div class="toolbar"><button class="secondary" id="z28DetectTZ">${esc(t("detectTZ"))}</button><button class="secondary" id="z28Geo">${esc(t("geo"))}</button><button class="primary" id="z28Apply">${esc(t("apply"))}</button></div><p id="z28UtcOffset" class="small muted"></p><p class="tiny muted">${esc(t("manual"))} ${esc(t("permission"))}</p><p id="z28LocationStatus" class="small muted">${esc(t("profileSync"))}</p>`;
    const first=root.querySelector("#pBirth")?.closest(".card"); if(first)first.before(panel); else root.prepend(panel);
    $("#z28DetectTZ").onclick=()=>{const zone=Intl.DateTimeFormat().resolvedOptions().timeZone;if(zone){$("#z28Timezone").value=zone;updateOffset();}};
    $("#z28Geo").onclick=()=>{
      if(!navigator.geolocation){$("#z28LocationStatus").textContent=t("geoUnsupported");return;}
      $("#z28LocationStatus").textContent=t("permission");
      navigator.geolocation.getCurrentPosition(pos=>{ $("#z28Lat").value=pos.coords.latitude.toFixed(6); $("#z28Lon").value=pos.coords.longitude.toFixed(6); $("#z28Elev").value=Number.isFinite(pos.coords.altitude)?Math.max(0,Math.round(pos.coords.altitude)):0; const zone=Intl.DateTimeFormat().resolvedOptions().timeZone; if(zone)$("#z28Timezone").value=zone; updateOffset(); $("#z28LocationStatus").textContent=t("saved"); },()=>{$("#z28LocationStatus").textContent=t("geoDenied");},{enableHighAccuracy:false,maximumAge:300000,timeout:10000});
    };
    $("#z28Timezone").addEventListener("input",updateOffset); $("#pBirth")?.addEventListener("change",updateOffset);
    $("#z28Apply").onclick=()=>{
      const lat=Number($("#z28Lat").value),lon=Number($("#z28Lon").value),elev=Number($("#z28Elev").value||0),timezone=$("#z28Timezone").value.trim(),local=$("#pBirth")?.value||"";
      if(!Number.isFinite(lat)||lat<-90||lat>90||!Number.isFinite(lon)||lon<-180||lon>180){$("#z28LocationStatus").textContent=t("needCoords");return;}
      if(!validTZ(timezone)){$("#z28LocationStatus").textContent=t("tzInvalid");return;}
      let offset=0;if(local){const instant=resolveCivil(local,timezone);if(!Number.isFinite(instant.getTime())){$("#z28LocationStatus").textContent=t("tzInvalid");return;}offset=offsetFor(instant,timezone);}
      $("#pLat").value=lat;$("#pLon").value=lon;$("#pElev").value=Math.max(0,elev);$("#pOffset").value=offset;
      const value={city:$("#z28City").value.trim(),country:$("#z28Country").value.trim(),timezone,lat,lon,elev:Math.max(0,elev),offset,updatedAt:new Date().toISOString()}; save(value); $("#z28LocationStatus").textContent=t("saved"); if($("#pStatus"))$("#pStatus").textContent=t("profileSync");
    };
    updateOffset();
  }
  function refresh(){if($("#pLat"))render();}
  const observer=new MutationObserver(refresh);
  document.addEventListener("DOMContentLoaded",()=>{const root=$("#app");if(root)observer.observe(root,{childList:true,subtree:true});setTimeout(refresh,0);});
  window.addEventListener("z28:languagechange",()=>{const p=$("#z28LocationPanel");if(p){p.remove();render();}});
  window.Z28Location={load,offsetFor,render};
})();
