const CACHE="zodiaque-28-lettres-v3-final";
const ASSETS=["./","./index.html","./styles.css","./app.js","./manifest.webmanifest","./icon.svg",
"./referentiel/lettres.json","./referentiel/zodiaque.json","./referentiel/planetes.json",
"./referentiel/correspondances.json","./referentiel/phases_lunaires.json","./referentiel/jours_lunaires.json",
"./referentiel/sources.json","./referentiel/reference-manifest.json"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
   const copy=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return r;
 }).catch(()=>cached)));
});