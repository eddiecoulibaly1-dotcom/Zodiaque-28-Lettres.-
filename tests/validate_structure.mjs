import fs from "node:fs";
import assert from "node:assert/strict";
const root = new URL("../", import.meta.url);
const required = [
"index.html","app.js","styles.css","sw.js","manifest.webmanifest","icon.svg",
"referentiel/lettres.json","referentiel/zodiaque.json","referentiel/planetes.json",
"referentiel/correspondances.json","referentiel/phases_lunaires.json",
"referentiel/jours_lunaires.json","referentiel/sources.json",
"referentiel/reference-manifest.json","README.md",
"documentation/GUIDE_REMPLISSAGE.md","documentation/REGLES_FONDAMENTALES.md",
"documentation/ARCHITECTURE.md","documentation/LIMITES_ASTRONOMIQUES.md"
];
for(const p of required) assert.ok(fs.existsSync(new URL(p,root)),`Fichier manquant: ${p}`);
console.log("OK — structure finale complète.");
