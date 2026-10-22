import fs from "node:fs";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const moduleSource = fs.readFileSync(new URL("profil_abjad.js", root), "utf8");
const index = fs.readFileSync(new URL("index.html", root), "utf8");

assert.ok(index.includes('src="./profil_abjad.js"'), "Le module Abjad du profil doit être chargé.");
assert.ok(moduleSource.includes('referentiel/lettres.json'), "Le module doit utiliser le référentiel contrôlé des lettres.");
assert.ok(moduleSource.includes("abjad_maghribi"), "Le calcul doit utiliser la valeur Abjad Maghrébin du référentiel.");
assert.ok(moduleSource.includes("l.element"), "La répartition doit utiliser l'élément du référentiel.");
assert.ok(moduleSource.includes("Aucune correspondance lettre → signe → planète n'est déduite"), "Le module doit interdire les correspondances inventées.");
assert.equal((moduleSource.match(/ELEMENTS = \["Feu", "Terre", "Air", "Eau"\]/g) || []).length, 1);

console.log("OK — module Abjad du profil contrôlé et intégré.");
