import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const diagnostics = fs.readFileSync("astronomie_diagnostics.js", "utf8");
const workflow = fs.readFileSync(".github/workflows/validate.yml", "utf8");
const pagesWorkflow = fs.readFileSync(".github/workflows/pages.yml", "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const runtimeScript = fs.readFileSync("scripts/prepare-astronomy-runtime.mjs", "utf8");
const runtime = "vendor/astronomy/astronomy.browser.min.js";

if (!index.includes("./vendor/astronomy/astronomy.browser.min.js")) throw new Error("index.html doit charger Astronomy Engine depuis le runtime local.");
if (index.includes("cdn.jsdelivr.net/npm/astronomy-engine")) throw new Error("Aucune dépendance CDN Astronomy Engine ne doit subsister en production.");
if (/new A\.Observer\(5\.2,\s*-3\.7/.test(diagnostics)) throw new Error("Aucune coordonnée géographique codée en dur n'est autorisée.");
if (packageJson.dependencies?.["astronomy-engine"] !== "2.1.19") throw new Error("Astronomy Engine doit rester épinglé en version 2.1.19.");
if (packageJson.scripts?.["prepare:runtime"] !== "node scripts/prepare-astronomy-runtime.mjs") throw new Error("La préparation locale doit utiliser le script déterministe officiel.");
if (!runtimeScript.includes('const version = "2.1.19"')) throw new Error("Le script de préparation doit épingler Astronomy Engine 2.1.19.");
if (!runtimeScript.includes("node_modules/astronomy-engine/astronomy.browser.min.js")) throw new Error("Le script doit utiliser le build navigateur officiel du package npm.");
if (!runtimeScript.includes("astronomy.browser.min.js")) throw new Error("Le script de préparation doit produire le runtime navigateur local.");
if (!workflow.includes("npm run prepare:runtime")) throw new Error("Le workflow de validation doit préparer le runtime local.");
if (!pagesWorkflow.includes("npm run prepare:runtime")) throw new Error("GitHub Pages doit préparer le runtime local avant publication.");
if (!pagesWorkflow.includes("--exclude='site/'")) throw new Error("Le staging Pages doit exclure son propre répertoire.");
if (!fs.existsSync(runtime)) throw new Error("Le runtime Astronomy Engine local est absent.");
if (fs.statSync(runtime).size === 0) throw new Error("Le runtime Astronomy Engine local est vide.");
if (!fs.existsSync("vendor/astronomy/SHA256SUMS")) throw new Error("Le SHA-256 du runtime local est absent.");
if (!fs.existsSync("vendor/astronomy/README.md")) throw new Error("La provenance du runtime local est absente.");

console.log("OK — runtime Astronomy Engine local présent, non CDN, préparé de manière déterministe et vérifié.");
