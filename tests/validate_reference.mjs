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
console.log("OK — référentiel final validé.");
