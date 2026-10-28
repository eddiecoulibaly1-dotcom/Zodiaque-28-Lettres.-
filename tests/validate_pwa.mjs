import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const app = fs.readFileSync("app.js", "utf8");
const pwa = fs.readFileSync("pwa.js", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.webmanifest", "utf8"));
const sw = fs.readFileSync("sw.js", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = fs.readFileSync("VERSION", "utf8").trim();
const finalManifest = JSON.parse(fs.readFileSync("FINAL_MANIFEST.json", "utf8"));
const readme = fs.readFileSync("README.md", "utf8");

if (!app.includes('navigator.serviceWorker.register("./sw.js")')) {
  throw new Error("app.js doit enregistrer le service worker local.");
}
if (index.includes("navigator.serviceWorker.register")) {
  throw new Error("index.html ne doit pas enregistrer une seconde fois le service worker.");
}
if (!index.includes('href="manifest.webmanifest"')) throw new Error("index.html doit déclarer le manifeste PWA.");
if (manifest.start_url !== "./" || manifest.scope !== "./") throw new Error("Le manifeste PWA doit utiliser le périmètre local de l'application.");
if (manifest.lang !== "fr" || manifest.dir !== "ltr") throw new Error("Les métadonnées linguistiques PWA doivent être explicites.");
if (!manifest.icons?.some(icon => icon.src === "icons/icon-192.svg" && icon.sizes === "192x192") ||
    !manifest.icons?.some(icon => icon.src === "icons/icon-512.svg" && icon.sizes === "512x512")) {
  throw new Error("Le manifeste doit déclarer les icônes locales 192 et 512 px.");
}
if (pkg.version !== version || finalManifest.version !== pkg.version) throw new Error("package.json, VERSION et FINAL_MANIFEST.json doivent partager la même version.");
if (!index.includes(`Application ${pkg.version}`)) throw new Error("Le pied de page doit afficher la version de l'application.");
if (!readme.includes(`Version ${pkg.version}`)) throw new Error("Le README doit documenter la version courante.");
if (!sw.includes(`zodiaque-28-lettres-${pkg.version}`)) throw new Error(`Le cache du service worker doit correspondre à la version ${pkg.version}.`);
if (!index.includes('src="./pwa.js"') || !sw.includes('"./pwa.js"')) throw new Error("Le diagnostic PWA doit être chargé et pré-caché.");
if (!sw.includes('"./vendor/astronomy/astronomy.browser.min.js"')) throw new Error("Le runtime astronomique local doit être pré-caché.");
if (!sw.includes('"./referentiel/reference-manifest.json"')) throw new Error("Le manifeste du référentiel doit être pré-caché.");
if (!sw.includes('event.request.mode === "navigate"') || !sw.includes('new URL("./index.html", self.registration.scope)')) {
  throw new Error("Le service worker doit restituer le shell HTML lors d'une navigation hors connexion.");
}
if (!sw.includes("await cache.add(path)") || !sw.includes("Ressource non mise en cache") || !sw.includes("__z28_cache_report__.json")) {
  throw new Error("L'installation doit tolérer une ressource manquante et enregistrer un rapport de cache.");
}
if (!pwa.includes("Ressources manquantes") || !pwa.includes("cache incomplet") && !pwa.includes("Cache incomplet")) {
  throw new Error("Le diagnostic doit signaler les ressources manquantes.");
}

const parseAssetList = (source, marker) => {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Liste de ressources absente : ${marker}`);
  const tail = source.slice(start);
  const body = tail.slice(tail.indexOf("[") + 1, tail.indexOf("]"));
  return [...body.matchAll(/"([^"]+)"/g)].map(match => match[1]);
};
const cachedAssets = parseAssetList(sw, "const ASSETS");
const checkedAssets = parseAssetList(pwa, "const REQUIRED");
for (const path of checkedAssets) {
  if (!cachedAssets.includes(path)) throw new Error(`La ressource contrôlée n'est pas déclarée dans le cache : ${path}`);
}
const missingFiles = cachedAssets
  .filter(path => path !== "./" && path !== "./vendor/astronomy/astronomy.browser.min.js")
  .filter(path => !fs.existsSync(path.replace(/^\.\//, "")));
if (missingFiles.length) throw new Error("Ressources de cache absentes du dépôt : " + missingFiles.join(", "));
if (!fs.existsSync("vendor/astronomy/astronomy.browser.min.js")) throw new Error("Le runtime astronomique doit être préparé avant la validation PWA.");
console.log(`OK — PWA ${pkg.version} : versions synchronisées, ${cachedAssets.length} ressources déclarées et diagnostic hors ligne exhaustif.`);
