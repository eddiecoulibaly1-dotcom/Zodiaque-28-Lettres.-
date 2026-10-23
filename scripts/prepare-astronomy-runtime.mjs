import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const version = "2.1.19";
const source = path.resolve("node_modules/astronomy-engine/astronomy.browser.min.js");
const targetDir = path.resolve("vendor/astronomy");
const target = path.join(targetDir, "astronomy.browser.min.js");

if (!fs.existsSync(source)) {
  throw new Error(`Astronomy Engine ${version} est absent. Exécutez d'abord npm install.`);
}

const sourceBytes = fs.readFileSync(source);
if (sourceBytes.length === 0) throw new Error("Le runtime Astronomy Engine source est vide.");
const sourceText = sourceBytes.toString("utf8");
if (!/\.Astronomy=[A-Za-z_$]/.test(sourceText)) {
  throw new Error("Le build navigateur Astronomy Engine ne semble pas exposer globalThis.Astronomy.");
}

fs.mkdirSync(targetDir, { recursive: true });
fs.copyFileSync(source, target);
const sha256 = crypto.createHash("sha256").update(sourceBytes).digest("hex");
fs.writeFileSync(path.join(targetDir, "SHA256SUMS"), `${sha256}  astronomy.browser.min.js\n`, "utf8");
fs.writeFileSync(
  path.join(targetDir, "README.md"),
  `# Astronomy Engine — runtime local\n\nVersion épinglée : **astronomy-engine@${version}**\n\nProjet amont : https://github.com/cosinekitty/astronomy\nFichier source officiel : \\`source/js/astronomy.browser.min.js\\`\n\nLe runtime navigateur est préparé localement à partir du package npm officiel épinglé. GitHub Pages prépare la même copie avant publication. L'application ne dépend pas d'un CDN d'exécution. Les calculs astronomiques restent séparés de la couche d'interprétation astrologique traditionnelle/symbolique.\n`,
  "utf8"
);

console.log(`OK — Astronomy Engine ${version} préparé localement (${sha256}).`);
