import fs from "node:fs";
import assert from "node:assert/strict";
const root=new URL("../",import.meta.url);
const required=[
"index.html","app.js","astronomy.js","profil.js","styles.css","sw.js","manifest.webmanifest","icon.svg","README.md","FINAL_MANIFEST.json","VERSION",
"referentiel/lettres.json","referentiel/elements.json","referentiel/modalites.json","referentiel/zodiaque.json",
"referentiel/planetes.json","referentiel/phases_lunaires.json","referentiel/jours_lunaires.json",
"referentiel/correspondances.json","referentiel/sources.json","referentiel/reference-manifest.json",
"documentation/REGLES_DEFINITIVES.md","documentation/DICTIONNAIRE_DONNEES.md","documentation/PERIMETRE_FINAL.md","documentation/THEME_NATAL.md"
];
for(const p of required) assert.ok(fs.existsSync(new URL(p,root)),`Fichier manquant: ${p}`);
const app=fs.readFileSync(new URL("app.js",root),"utf8");
const profile=fs.readFileSync(new URL("profil.js",root),"utf8");
const version=fs.readFileSync(new URL("VERSION",root),"utf8").trim();
assert.ok(app.includes("abjad_maghribi"),"L'application doit utiliser la clé Abjad Maghribi.");
assert.equal(version,"1.2.0","VERSION doit être 1.2.0.");
assert.ok(profile.includes("wholeSignHouses") && profile.includes("calculateAspects"),"Le thème natal doit inclure maisons et aspects.");
console.log("OK — structure 1.2.0, profil astronomique et thème natal présents.");
