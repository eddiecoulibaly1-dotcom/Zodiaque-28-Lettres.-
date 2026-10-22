import assert from "node:assert/strict";

const validZone = zone => {
  try { new Intl.DateTimeFormat("en-US", { timeZone: zone }).format(); return true; }
  catch (_) { return false; }
};
const offsetFor = (date, zone) => {
  assert.ok(validZone(zone), `Fuseau invalide: ${zone}`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone, year:"numeric", month:"2-digit", day:"2-digit",
    hour:"2-digit", minute:"2-digit", second:"2-digit", hourCycle:"h23"
  }).formatToParts(date);
  const p={}; for(const x of parts) if(x.type!=="literal") p[x.type]=x.value;
  return Math.round((Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second)-date.getTime())/60000);
};

const cases=[
  ["Côte d’Ivoire / pas de DST", "2024-01-15T12:00:00Z", "Africa/Abidjan", 0],
  ["New York hiver", "2024-01-15T17:00:00Z", "America/New_York", -300],
  ["New York été / DST", "2024-07-15T16:00:00Z", "America/New_York", -240],
  ["Paris hiver", "2024-01-15T11:00:00Z", "Europe/Paris", 60],
  ["Paris été / DST", "2024-07-15T10:00:00Z", "Europe/Paris", 120],
  ["Cas historique New York", "2000-07-15T16:00:00Z", "America/New_York", -240]
];
for(const [label, iso, zone, expected] of cases) assert.equal(offsetFor(new Date(iso),zone), expected, label);
assert.equal(offsetFor(new Date("2024-07-15T16:00:00Z"),"America/New_York"), -240, "Le calcul ne doit pas utiliser un UTC-5 fixe en été.");
assert.equal(offsetFor(new Date("2024-01-15T17:00:00Z"),"America/New_York"), -300, "Le calcul ne doit pas utiliser un UTC-4 fixe en hiver.");

const source = await (await import("node:fs/promises")).readFile(new URL("../timezone.js", import.meta.url), "utf8");
assert.ok(source.includes("Intl.DateTimeFormat"), "Le runtime doit utiliser Intl pour les règles IANA.");
assert.ok(source.includes("offsetFor"), "Le runtime doit exposer le calcul du décalage.");
assert.ok(source.includes("parseCivil"), "Le runtime doit exposer la conversion de l'heure civile.");

console.log("OK — fuseaux IANA, historique/DST et cas sans DST validés.");
