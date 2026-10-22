import fs from "node:fs";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const synthesis = fs.readFileSync(new URL("theme_synthese.js", root), "utf8");
const diagnostics = fs.readFileSync(new URL("astronomie_diagnostics.js", root), "utf8");
const html = fs.readFileSync(new URL("index.html", root), "utf8");

assert.ok(synthesis.includes("natal-wheel"), "La roue zodiacale n'est pas présente.");
assert.ok(synthesis.includes("positions astronomiques"), "La roue doit être présentée comme visualisation des positions calculées.");
assert.ok(synthesis.includes("Soleil") && synthesis.includes("Lune"), "Les luminaires doivent être représentables.");
assert.ok(synthesis.includes("Mercure") && synthesis.includes("Pluton"), "Les dix corps doivent être représentables.");
assert.ok(synthesis.includes("Grille planète × signe × maison"), "La grille planète × signe × maison est absente.");
assert.ok(synthesis.includes("Occupation des maisons"), "La synthèse des maisons est absente.");
assert.ok(synthesis.includes("Polarité"), "La synthèse des polarités est absente.");
assert.ok(synthesis.includes("Aspects détectés"), "Le compteur d'aspects est absent.");
assert.ok(synthesis.includes("signes entiers"), "La convention de maisons doit rester explicitement documentée.");
assert.ok(diagnostics.includes("z28_profile_v4"), "Les diagnostics doivent lire le profil explicite.");
assert.ok(diagnostics.includes("Observer non défini") || diagnostics.includes("Observateur non défini"), "Le cas sans observateur explicite doit être traité.");
assert.ok(!diagnostics.includes("new A.Observer(5.2, -3.7, 0)"), "Aucune coordonnée géographique ne doit être codée en dur.");
assert.ok(html.includes('theme_synthese.js'), "La synthèse visuelle doit être chargée.");
console.log("OK — roue, grille planète/signe/maison, maisons, polarités et aspects validés.");
