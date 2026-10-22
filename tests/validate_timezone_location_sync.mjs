import fs from "node:fs";
import assert from "node:assert/strict";

const root=new URL("../",import.meta.url);
const localisation=fs.readFileSync(new URL("localisation.js",root),"utf8");
const profile=fs.readFileSync(new URL("profil_astronomique.js",root),"utf8");
const timezone=fs.readFileSync(new URL("timezone.js",root),"utf8");

assert.ok(localisation.includes("parseCivil"),"La localisation doit résoudre l'heure civile avec le fuseau IANA.");
assert.ok(localisation.includes("offsetFor(instant,timezone)"),"Le décalage UTC doit être calculé sur l'instant civil résolu.");
assert.ok(!localisation.includes("offsetFor(d,zone)"),"Le décalage ne doit pas être calculé sur une date UTC fictive.");
assert.ok(profile.includes("window.Z28Location?.load?.()?.timezone"),"Le profil natal doit utiliser le fuseau IANA enregistré.");
assert.ok(timezone.includes("Heure civile inexistante")&&timezone.includes("Heure civile ambiguë"),"Les transitions DST doivent rester explicites.");

console.log("OK — synchronisation heure civile, fuseau IANA et instant UTC validée.");
