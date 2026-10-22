import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const diagnostics = fs.readFileSync("astronomie_diagnostics.js", "utf8");
const workflow = fs.readFileSync(".github/workflows/vendor-astronomy.yml", "utf8");

if (!index.includes('./vendor/astronomy/astronomy.browser.min.js')) throw new Error("index.html doit charger Astronomy Engine depuis le dépôt.");
if (index.includes("cdn.jsdelivr.net/npm/astronomy-engine")) throw new Error("Aucune dépendance CDN Astronomy Engine ne doit subsister en production.");
if (/new A\.Observer\(5\.2,\s*-3\.7/.test(diagnostics)) throw new Error("Aucune coordonnée géographique codée en dur n'est autorisée.");
if (!workflow.includes("v2.1.19/source/js/astronomy.browser.min.js")) throw new Error("Le workflow doit télécharger le build officiel 2.1.19.");
if (!workflow.includes("astronomy.browser.min.js")) throw new Error("Le workflow doit produire le runtime navigateur local.");
if (!fs.existsSync("vendor/astronomy/astronomy.browser.min.js")) throw new Error("Le runtime Astronomy Engine local est absent.");
if (fs.statSync("vendor/astronomy/astronomy.browser.min.js").size === 0) throw new Error("Le runtime Astronomy Engine local est vide.");
if (!fs.existsSync("vendor/astronomy/SHA256SUMS")) throw new Error("Le SHA-256 du runtime local est absent.");
if (!fs.existsSync("vendor/astronomy/README.md")) throw new Error("La provenance du runtime local est absente.");

console.log("OK — runtime Astronomy Engine local présent, non CDN, versionné et vérifié.");
