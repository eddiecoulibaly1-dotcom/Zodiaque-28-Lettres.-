import fs from "node:fs";
import assert from "node:assert/strict";
import * as Astronomy from "astronomy-engine";

globalThis.Astronomy=Astronomy;
const root=new URL("../",import.meta.url);
const adapterSource=fs.readFileSync(new URL("../astronomy.js",root),"utf8");
const profile=fs.readFileSync(new URL("../profil_astronomique.js",root),"utf8");
const index=fs.readFileSync(new URL("../index.html",root),"utf8");
const A=await import("../astronomy.js");

assert.ok(adapterSource.includes("SunPosition"),"Le Soleil doit utiliser SunPosition pour sa longitude géocentrique.");
assert.ok(adapterSource.includes("GeoVector")&&adapterSource.includes("Rotation_EQJ_ECT")&&adapterSource.includes("SphereFromVector"),"Les autres corps doivent être convertis en longitude géocentrique ECT.");
assert.ok(!profile.includes("A.EclipticLongitude(B,date)"),"Le profil natal ne doit plus utiliser EclipticLongitude pour les longitudes géocentriques.");
assert.ok(profile.includes("GeoVector")&&profile.includes("Rotation_EQJ_ECT"),"Le profil natal doit calculer les longitudes géocentriques ECT.");
assert.ok(index.includes("profil_astronomique.js"),"Le profil astronomique corrigé doit être chargé.");

const seasons=Astronomy.Seasons(2024);
const targets=[["marche",seasons.mar_equinox,0],["solstice nord",seasons.jun_solstice,90],["septembre",seasons.sep_equinox,180],["solstice sud",seasons.dec_solstice,270]];
const circular=(x,y)=>Math.abs(((x-y+540)%360)-180);
for(const [label,event,target] of targets){const p=A.sunPosition(event.date);assert.ok(circular(p.elon,target)<0.01,`${label}: longitude solaire ${p.elon}°`);}

const observer=A.observer(5.2,-3.7,0);
const sample=new Date("2024-07-01T09:00:00Z");
for(const body of ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"]){const p=A.bodyPosition(body,sample,observer);assert.ok(Number.isFinite(p.eclipticLongitude)&&p.eclipticLongitude>=0&&p.eclipticLongitude<360,`${body}: longitude invalide`);assert.ok(Number.isFinite(p.rightAscension),`${body}: RA invalide`);}
const quarters=A.nextMoonQuarters(sample,4);assert.equal(quarters.length,4,"Quatre quartiers lunaires attendus");for(const q of quarters)assert.ok(q.date instanceof Date&&Number.isFinite(q.date.getTime()),"Date de quartier lunaire invalide");
const rs=A.riseSet("Sun",sample,observer);assert.ok(rs.rise instanceof Date&&rs.set instanceof Date,"Lever/coucher solaire non calculable");

console.log("OK — références astronomiques 2024, longitudes géocentriques ECT, positions planétaires, quartiers lunaires et lever/coucher validés.");
