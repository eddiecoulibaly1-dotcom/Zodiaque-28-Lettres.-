import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const ui = fs.readFileSync("application_ui.js", "utf8");
const app = fs.readFileSync("app.js", "utf8");

if (!index.includes('src="application_ui.js"')) {
  throw new Error("application_ui.js n'est pas intégré à index.html");
}
if (!ui.includes("productQuickActions")) {
  throw new Error("La couche UI produit ne contient pas le parcours rapide.");
}
if (!ui.includes('data-product-go="${view}"')) {
  throw new Error("Les actions rapides ne sont pas reliées aux vues de navigation.");
}
if (!ui.includes("Astronomie technique · astrologie symbolique")) {
  throw new Error("Le cadre méthodologique du profil n'est pas affiché.");
}

console.log("OK — couche UI produit intégrée et contrôlée.");

if (!index.includes('data-view="cosmology"')) {
  throw new Error("La navigation doit exposer les sphères cosmologiques.");
}
if (!app.includes('cosmology:"referentiel/spheres_cosmologiques.json"') ||
    !app.includes("function viewCosmology()") ||
    !app.includes("function cosmologyRows(")) {
  throw new Error("La vue consultable des sphères cosmologiques n'est pas reliée au référentiel.");
}
if (!app.includes("cosmologicalForLetter(l.id)")) {
  throw new Error("Les fiches lettres doivent afficher leurs sphères cosmologiques.");
}
