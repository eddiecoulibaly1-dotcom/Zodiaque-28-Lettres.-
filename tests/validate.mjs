import fs from "node:fs";
const r=JSON.parse(fs.readFileSync("data/referentiel.json","utf8"));
const expected={"ا":1,"ب":2,"ج":3,"د":4,"ه":5,"و":6,"ز":7,"ح":8,"ط":9,"ي":10,"ك":20,"ل":30,"م":40,"ن":50,"س":300,"ع":70,"ف":80,"ص":60,"ض":90,"ق":100,"ر":200,"ش":1000,"ت":400,"ث":500,"خ":600,"ذ":700,"ظ":800,"غ":900};
const errors=[];
if(r.letters.length!==28) errors.push("28 letters expected");
for(const [k,v] of Object.entries(expected)) if(r.abjad[k]!==v) errors.push(`Abjad ${k}=${v} expected`);
for(const [e,ls] of Object.entries(r.elements)){if(ls.length!==7) errors.push(`${e}: 7 letters expected`);for(const l of ls){const row=r.letters.find(x=>x.letter===l);if(!row||row.element!==e) errors.push(`element mismatch ${l}`)}}
if(new Set(Object.values(r.abjad)).size!==28) errors.push("Abjad values must be unique");
const all=Object.values(r.elements).flat();
if(all.length!==28 || new Set(all).size!==28) errors.push("Each letter must occur exactly once in elements");
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
console.log("OK — référentiel Abjad et classification élémentaire validés.");
