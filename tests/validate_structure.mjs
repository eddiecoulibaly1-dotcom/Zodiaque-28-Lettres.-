import fs from "node:fs";
import assert from "node:assert/strict";
const root=new URL("../",import.meta.url);
const required=[
"index.html","app.js","styles.css","sw.js","manifest.webmanifest","icon.svg","README.md",
"referentiel/lettres.json","referentiel/elements.json","referentiel/modalites.json","referentiel/zodiaque.json",
"referentiel/planetes.json","referentiel/phases_lunaires.json","referentiel/jours_lunaires.json",
"referentiel/correspondances.json","referentiel/sources.json","referentiel/reference-manifest.json",
"documentation/REGLES_DEFINITIVES.md","documentation/DICTIONNAIRE_DONNEES.md","documentation/PERIMETRE_FINAL.md"
];
for(const p of required) assert.ok(fs.existsSync(new URL(p,root)),`Fichier manquant: ${p}`);
const app=fs.readFileSync(new URL("app.js",root),"utf8");
assert.ok(app.includes("abjad_maghribi"),"L'application doit utiliser la clé Abjad Maghribi.");
console.log("OK — pack de construction complet.");
