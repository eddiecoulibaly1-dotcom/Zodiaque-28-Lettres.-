import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../abjad_normalisation.js", import.meta.url), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context);
const normalize = context.window.Z28AbjadNormalization.normalizeLetter;

assert.equal(normalize("أ"), "ا");
assert.equal(normalize("إ"), "ا");
assert.equal(normalize("آ"), "ا");
assert.equal(normalize("ٱ"), "ا");
assert.equal(normalize("ى"), "ي");
assert.equal(normalize("س"), "س");
assert.equal(normalize("ؤ"), "ؤ", "La hamza sur waw ne doit pas être convertie sans règle documentée.");
assert.equal(normalize("ئ"), "ئ", "La hamza sur ya ne doit pas être convertie sans règle documentée.");
assert.equal(normalize("ة"), "ة", "La ta marbuta reste non référencée.");
assert.equal(normalize("َ"), null, "Les signes diacritiques sont ignorés.");
assert.equal(normalize("ـ"), null, "Le tatweel est ignoré.");
assert.equal(normalize(" "), null);
assert.equal(normalize("،"), null);
console.log("OK — normalisation arabe explicite, contrôlée et sans conversions implicites.");
