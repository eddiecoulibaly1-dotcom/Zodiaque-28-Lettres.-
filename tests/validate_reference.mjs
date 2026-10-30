import fs from "node:fs";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const read = p => JSON.parse(fs.readFileSync(new URL(p, root), "utf8"));
const letters = read("referentiel/lettres.json").letters;
const corr = read("referentiel/correspondances.json").records;

assert.equal(letters.length, 28, "Il faut exactement 28 lettres.");

const expected = {
"ا":1,"ب":2,"ج":3,"د":4,"ه":5,"و":6,"ز":7,"ح":8,"ط":9,"ي":10,
"ك":20,"ل":30,"م":40,"ن":50,"س":300,"ع":70,"ف":80,"ص":60,"ض":90,
"ق":100,"ر":200,"ش":1000,"ت":400,"ث":500,"خ":600,"ذ":700,"ظ":800,"غ":900
};
const elements = {
"Feu":"ا ه ط م ف س ذ".split(" "),
"Terre":"ب و ي ن ض ت ظ".split(" "),
"Air":"ج ز ك ص ق ث غ".split(" "),
"Eau":"د ح ل ع ر خ ش".split(" ")
};
const seen = new Set();
for(const l of letters){
  assert.equal(l.abjad_maghribi, expected[l.letter], `Valeur incorrecte pour ${l.letter}`);
  assert.ok(l.letter && l.id && l.element, "Champ fondamental manquant.");
  assert.equal(seen.has(l.letter), false, `Lettre dupliquée: ${l.letter}`);
  seen.add(l.letter);
}
assert.equal(seen.size,28);
for(const [el, arr] of Object.entries(elements)){
  assert.equal(arr.length,7,`${el} doit contenir 7 lettres.`);
  for(const ch of arr){
    const rec=letters.find(x=>x.letter===ch);
    assert.ok(rec,`Lettre absente: ${ch}`);
    assert.equal(rec.element,el,`Élément incorrect pour ${ch}`);
  }
}
assert.equal(corr.length,28,"Il faut 28 entrées de correspondances.");
for(const c of corr){
  assert.ok(["undefined","validated","provisional"].includes(c.status));
  if(c.status==="undefined"){
    assert.equal(c.zodiac_sign_id,null);
    assert.equal(c.planet_id,null);
  }
}

const cosmology = read("referentiel/spheres_cosmologiques.json");
const sources = read("referentiel/sources.json").sources;
const letterById = new Map(letters.map(l => [l.id, l.letter]));
const sourceIds = new Set(sources.map(s => s.id));

assert.ok(sourceIds.has("SRC_GARDINER_2017"), "Source Gardiner 2017 absente.");
assert.ok(cosmology.source_ids.includes("SRC_GARDINER_2017"), "La table cosmologique doit référencer Gardiner 2017.");

const expectedSpheres = [
  ["Intellect", ["ا", "ع"]],
  ["Kursi (Trône / Piédestal)", ["ب", "ف"]],
  ["Saturne", ["ج", "د"]],
  ["Jupiter", ["د", "ق"]],
  ["Mars", ["ه", "ر"]],
  ["Soleil", ["و", "س"]],
  ["Vénus", ["ز", "ت"]],
  ["Mercure", ["ح", "ث"]],
  ["Lune", ["ط", "خ"]],
  ["Feu", ["ي", "ذ"]],
  ["Air", ["ك", "ز"]],
  ["Eau", ["ل", "غ"]],
  ["Terre", ["م", "ش"]],
  ["Table préservée", ["ص"]],
  ["Calame divin", ["ن"]]
];

assert.equal(cosmology.spheres.length, expectedSpheres.length, "Nombre de sphères cosmologiques incorrect.");
for (let i = 0; i < expectedSpheres.length; i++) {
  const [name, expectedLetters] = expectedSpheres[i];
  const actual = cosmology.spheres[i];
  assert.equal(actual.name_fr, name, `Ordre ou nom de sphère incorrect à la position ${i + 1}.`);
  const actualLetters = actual.letter_ids.map(id => {
    assert.ok(letterById.has(id), `Identifiant de lettre inconnu : ${id}`);
    return letterById.get(id);
  });
  assert.deepEqual(actualLetters, expectedLetters, `Attribution cosmologique incorrecte pour ${name}.`);
}

const allAssigned = cosmology.spheres.flatMap(s => s.letter_ids.map(id => letterById.get(id)));
const counts = new Map();
for (const letter of allAssigned) counts.set(letter, (counts.get(letter) || 0) + 1);
assert.equal(allAssigned.length, 28, "Le diagramme doit comporter 28 positions de lettres.");
assert.deepEqual(
  [...counts.entries()].filter(([, count]) => count > 1).sort(),
  [["د", 2], ["ز", 2]],
  "Les seules répétitions attendues sont د et ز."
);
assert.deepEqual(
  cosmology.not_assigned_in_this_diagram.map(id => letterById.get(id)).sort(),
  ["ض", "ظ"].sort(),
  "Les lettres non attribuées dans ce diagramme doivent être ض et ظ."
);
assert.equal(cosmology.rules.distinct_from_weekday_rulership, true);
assert.equal(cosmology.rules.preserve_source_duplicates, true);

console.log("OK — référentiel final validé.");
