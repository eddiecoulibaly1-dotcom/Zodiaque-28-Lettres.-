import fs from "node:fs";
import assert from "node:assert/strict";

const readJson = path => JSON.parse(fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
const letters = readJson("referentiel/lettres.json").letters;
const ref = readJson("referentiel/correspondances_traditionnelles.json");

const authoritative = new Set(letters.map(x => x.letter));
assert.equal(letters.length, 28, "Le référentiel doit contenir 28 lettres.");

assert.equal(ref.solar_letters.length, 14, "Il faut 14 lettres solaires.");
assert.equal(ref.lunar_letters.length, 14, "Il faut 14 lettres lunaires.");
assert.equal(new Set(ref.solar_letters).size, 14, "Les lettres solaires doivent être uniques.");
assert.equal(new Set(ref.lunar_letters).size, 14, "Les lettres lunaires doivent être uniques.");
assert.equal(ref.solar_letters.filter(x => ref.lunar_letters.includes(x)).length, 0, "Une lettre ne peut pas être solaire et lunaire dans cette couche.");

for (const letter of [...ref.solar_letters, ...ref.lunar_letters]) {
  assert(authoritative.has(letter), `Lettre non présente dans le référentiel autoritatif: ${letter}`);
}

assert.equal(ref.letter_mansion_zodiac.length, 28, "Il faut une entrée de demeure pour chacune des 28 lettres.");
const mansionPositions = ref.letter_mansion_zodiac.map(x => x.position);
assert.deepEqual([...new Set(mansionPositions)].sort((a,b) => a-b), Array.from({length:28}, (_,i) => i+1), "Les positions des demeures doivent couvrir 1 à 28 sans doublon.");
assert.equal(new Set(ref.letter_mansion_zodiac.map(x => x.letter)).size, 28, "Les lettres des demeures doivent être uniques.");
for (const row of ref.letter_mansion_zodiac) {
  assert(authoritative.has(row.letter), `Lettre de demeure inconnue: ${row.letter}`);
  assert(row.mansion && row.mansion_ar, `Demeure incomplète pour ${row.letter}`);
  assert(Array.isArray(row.zodiac_segments) && row.zodiac_segments.length > 0, `Secteur zodiacal absent pour ${row.letter}`);
  assert(row.source, `Source absente pour ${row.letter}`);
}

assert.equal(ref.seven_planetary_letters.length, 7, "Il faut exactement 7 lettres planétaires classiques dans cette table.");
assert.equal(new Set(ref.seven_planetary_letters.map(x => x.letter)).size, 7, "Les lettres planétaires doivent être uniques.");
for (const row of ref.seven_planetary_letters) {
  assert(authoritative.has(row.letter), `Lettre planétaire inconnue: ${row.letter}`);
  assert(row.planet && row.day && row.tradition, `Attribution planétaire incomplète pour ${row.letter}`);
}

for (const source of ref.sources) {
  assert(source.url && /^https?:\/\//.test(source.url), `URL de source invalide: ${source.id || source.title}`);
}

console.log("OK — couche des correspondances traditionnelles validée : 28 demeures, 14 solaires, 14 lunaires, 7 lettres planétaires, sans doublon ni lettre étrangère au référentiel.");
