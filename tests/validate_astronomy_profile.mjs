import fs from "node:fs";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const html = fs.readFileSync(new URL("index.html", root), "utf8");
const profile = fs.readFileSync(new URL("profil.js", root), "utf8");
const adapter = fs.readFileSync(new URL("astronomy.js", root), "utf8");

assert.ok(html.includes("astronomy-engine@2.1.19/astronomy.browser.min.js"), "Astronomy Engine 2.1.19 absent de index.html");
assert.ok(html.includes('src="profil.js"'), "profil.js absent de index.html");
assert.ok(profile.includes("SiderealTime"), "Temps sidéral absent du calcul des angles");
assert.ok(profile.includes("e_tilt"), "Obliquité vraie absente du calcul des angles");
assert.ok(profile.includes("wholeSignHouses"), "Maisons en signes entiers absentes");
assert.ok(profile.includes("calculateAspects"), "Calcul des aspects absent");
assert.ok(profile.includes("conjonction") && profile.includes("opposition"), "Aspects majeurs incomplets");
assert.ok(profile.includes("pOffset"), "Décalage UTC de l'heure civile absent");
assert.ok(profile.includes("Sun") && profile.includes("Moon") && profile.includes("Mercury"), "Corps principaux absents");
assert.ok(adapter.includes("SearchRiseSet") && adapter.includes("SearchMoonQuarter"), "Fonctions astronomiques attendues absentes");

console.log("OK — thème natal, angles, maisons, aspects et fuseau UTC référencés.");
