import fs from "node:fs";
import assert from "node:assert/strict";
const root=new URL("../",import.meta.url);
const data=JSON.parse(fs.readFileSync(new URL("referentiel/lieux.json",root),"utf8"));
const src=fs.readFileSync(new URL("localisation_lieux.js",root),"utf8");
const index=fs.readFileSync(new URL("index.html",root),"utf8");
const hasScript=(name)=>new RegExp(`<script[^>]+src=["'](?:\\./)?${name.replace(".","\\.")}["']`).test(index);
assert.ok(Array.isArray(data.locations)&&data.locations.length>=20,"Le catalogue doit contenir au moins 20 lieux.");
const ids=new Set();
for(const x of data.locations){
  assert.ok(x.id&&x.city&&x.country&&x.country_code&&x.timezone,"Champs de lieu manquants.");
  assert.equal(ids.has(x.id),false,`Identifiant de lieu dupliqué: ${x.id}`); ids.add(x.id);
  assert.ok(Number.isFinite(x.latitude)&&x.latitude>=-90&&x.latitude<=90,`Latitude invalide: ${x.city}`);
  assert.ok(Number.isFinite(x.longitude)&&x.longitude>=-180&&x.longitude<=180,`Longitude invalide: ${x.city}`);
  assert.ok(Number.isFinite(x.elevation_m)&&x.elevation_m>=0,`Altitude invalide: ${x.city}`);
  assert.doesNotThrow(()=>new Intl.DateTimeFormat("en-US",{timeZone:x.timezone}),`Fuseau IANA invalide: ${x.timezone}`);
}
assert.ok(src.includes("referentiel/lieux.json"),"Le moteur doit charger le catalogue local.");
assert.ok(src.includes("Intl.supportedValuesOf(\"timeZone\")"),"Le sélecteur doit exploiter les fuseaux IANA disponibles.");
assert.ok(!src.includes("nominatim")&&!src.includes("geocode"),"Aucun géocodage distant ne doit être introduit dans ce module.");
assert.ok(hasScript("localisation_lieux.js"),"Le module de recherche de lieux doit être chargé.");
console.log(`OK — catalogue de ${data.locations.length} lieux, coordonnées bornées et fuseaux IANA validés.`);
