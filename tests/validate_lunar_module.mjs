import fs from "node:fs";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const module = fs.readFileSync(new URL("module_lunaire_unifie.js", root), "utf8");
const index = fs.readFileSync(new URL("index.html", root), "utf8");
const days = JSON.parse(fs.readFileSync(new URL("referentiel/jours_lunaires.json", root), "utf8"));

assert.ok(module.includes("Astronomy"), "Le module doit utiliser le moteur astronomique.");
assert.ok(module.includes("SearchMoonQuarter"), "Les quartiers lunaires doivent être calculés.");
assert.ok(module.includes("SearchRiseSet"), "Le lever/coucher lunaire doit être calculable.");
assert.ok(module.includes("Aucune signification universelle"), "Le module ne doit pas inventer une interprétation des 28 jours.");
assert.ok(module.includes("structure symbolique"), "La séparation symbolique doit être explicite.");
assert.ok(index.includes("module_lunaire_unifie.js"), "Le module lunaire unifié doit être chargé.");
assert.equal(days.lunar_cycle_days.length, 28, "Le référentiel doit contenir exactement 28 jours.");
assert.ok(days.warning.includes("signification") || days.warning.includes("universelle"), "Le référentiel doit porter son avertissement méthodologique.");
console.log("OK — module lunaire unifié : astronomie, 28 jours symboliques et séparation méthodologique validés.");
