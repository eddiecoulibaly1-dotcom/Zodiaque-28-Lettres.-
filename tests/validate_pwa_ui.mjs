import fs from "node:fs";
const ui = fs.readFileSync("pwa.js", "utf8");
const sw = fs.readFileSync("sw.js", "utf8");
const index = fs.readFileSync("index.html", "utf8");
for (const token of ["beforeinstallprompt", "appinstalled", "checkOffline", "serviceWorker.getRegistration", "mode hors connexion"]) {
  if (!ui.includes(token)) throw new Error(`Le diagnostic PWA ne couvre pas : ${token}`);
}
if (!index.includes('src="./pwa.js"')) throw new Error("pwa.js n'est pas intégré à index.html.");
if (!sw.includes("./pwa.js")) throw new Error("pwa.js n'est pas pré-caché.");
if (!sw.includes('event.request.mode === "navigate"')) throw new Error("Le repli de navigation hors connexion est absent.");
console.log("OK — diagnostic d'installation Android et contrôle du cache hors connexion validés.");
