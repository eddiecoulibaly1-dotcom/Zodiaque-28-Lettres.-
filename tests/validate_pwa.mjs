import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const app = fs.readFileSync("app.js", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.webmanifest", "utf8"));
const sw = fs.readFileSync("sw.js", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

if (!/navigator\.serviceWorker\.register\(["']\.\/sw\.js["']/.test(app)) {
  throw new Error("app.js doit enregistrer le service worker local.");
}
if (/navigator\.serviceWorker\.register/.test(index)) {
  throw new Error("index.html ne doit pas enregistrer une seconde fois le service worker.");
}
if (!index.includes('href="manifest.webmanifest"')) {
  throw new Error("index.html doit déclarer le manifeste PWA.");
}
if (manifest.start_url !== "./" || manifest.scope !== "./") {
  throw new Error("Le manifeste PWA doit utiliser le périmètre local de l'application.");
}
if (!manifest.icons?.some(icon => icon.src === "icon.svg" && icon.type === "image/svg+xml")) {
  throw new Error("Le manifeste PWA doit déclarer l'icône locale SVG.");
}
if (manifest.lang !== "fr" || manifest.dir !== "ltr") {
  throw new Error("Les métadonnées linguistiques PWA doivent être explicites.");
}
if (!sw.includes(`zodiaque-28-lettres-${pkg.version}`)) {
  throw new Error(`Le cache du service worker doit correspondre à la version ${pkg.version}.`);
}
if (!sw.includes("./vendor/astronomy/astronomy.browser.min.js")) {
  throw new Error("Le cache hors ligne doit inclure le runtime astronomique local.");
}
if (!sw.includes("./abjad_normalisation.js") || !sw.includes("./profil_synthese.js") || !sw.includes("./application_ui.js")) {
  throw new Error("Le cache hors ligne doit inclure les modules du parcours de profil et Abjad.");
}
if (!sw.includes("./referentiel/reference-manifest.json")) {
  throw new Error("Le cache hors ligne doit inclure le manifeste du référentiel.");
}
console.log(`OK — PWA, service worker et cache versionné validés pour ${pkg.version}.`);
