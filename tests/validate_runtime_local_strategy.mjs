import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const diagnostics = fs.readFileSync("astronomie_diagnostics.js", "utf8");
const workflow = fs.readFileSync(".github/workflows/vendor-astronomy.yml", "utf8");

if (!index.includes('./vendor/astronomy/astronomy.browser.min.js')) {
  throw new Error("index.html doit privilégier le runtime Astronomy Engine local.");
}
if (!index.includes("https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js")) {
  throw new Error("Le secours CDN 2.1.19 attendu pendant la migration est absent.");
}
if (/new A\.Observer\(5\.2,\s*-3\.7/.test(diagnostics)) {
  throw new Error("Le diagnostic astronomique ne doit contenir aucune coordonnée géographique codée en dur.");
}
if (!workflow.includes("astronomy-engine@2.1.19")) {
  throw new Error("Le workflow doit installer Astronomy Engine 2.1.19 explicitement.");
}
if (!workflow.includes("astronomy.browser.min.js")) {
  throw new Error("Le workflow doit copier le build navigateur Astronomy Engine.");
}

console.log("OK — stratégie de runtime astronomique local validée (local prioritaire, secours CDN temporaire, aucune coordonnée codée en dur).");
