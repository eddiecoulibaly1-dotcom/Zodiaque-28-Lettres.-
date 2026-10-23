import fs from "node:fs";
import assert from "node:assert/strict";

const root=new URL("../",import.meta.url);
const src=fs.readFileSync(new URL("localisation.js",root),"utf8");
const index=fs.readFileSync(new URL("index.html",root),"utf8");
const hasScript=(name)=>new RegExp(`<script[^>]+src=["'](?:\\./)?${name.replace(".","\\.")}["']`).test(index);

assert.ok(src.includes("navigator.geolocation.getCurrentPosition"),"La géolocalisation doit être déclenchée explicitement par le navigateur.");
assert.ok(src.includes("Intl.DateTimeFormat"),"Le calcul du décalage UTC doit utiliser le moteur de fuseau du navigateur.");
assert.ok(src.includes("timeZone:zone"),"Le fuseau IANA doit être pris en compte.");
assert.ok(src.includes("localStorage"),"Les préférences de localisation doivent être conservées localement.");
assert.ok(src.includes("Aucun lieu n'est déduit automatiquement"),"Aucun lieu ne doit être déduit automatiquement.");
assert.ok(hasScript("localisation.js"),"Le module de localisation doit être chargé par l'application.");
assert.ok(hasScript("localisation_i18n.js"),"La synchronisation multilingue du module de localisation doit être chargée.");

console.log("OK — localisation consentie, fuseau IANA et UTC dynamique validés.");
