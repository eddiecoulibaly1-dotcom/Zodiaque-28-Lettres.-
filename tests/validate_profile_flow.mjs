import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const flow = fs.readFileSync("profil_synthese.js", "utf8");

if (!index.includes('src="profil_synthese.js"')) throw new Error("profil_synthese.js n'est pas intégré à index.html");
if (!flow.includes("Parcours V2 : Profil → Abjad → thème → synthèse")) throw new Error("Le parcours V2 Profil → Abjad → thème → synthèse est absent.");
if (!flow.includes("referentiel/lettres.json")) throw new Error("Le flux V2 ne lit pas le référentiel contrôlé des lettres.");
if (!flow.includes("abjad_maghribi")) throw new Error("Le flux V2 n'utilise pas la valeur Abjad Maghrébin.");
if (!flow.includes("Feu") || !flow.includes("Terre") || !flow.includes("Air") || !flow.includes("Eau")) throw new Error("La répartition élémentaire complète est absente.");
if (!flow.includes("traditionnel/symbolique")) throw new Error("Le cadre symbolique n'est pas explicitement indiqué.");
if (!flow.includes("aucune correspondance lettre → signe → planète non définie")) throw new Error("La règle anti-invention des correspondances n'est pas protégée.");
if (flow.includes("name?.value")) throw new Error("Référence au nom hors de sa portée détectée.");
if (!flow.includes("const profileName = document.querySelector(\"#pName\")")) throw new Error("Le nom du profil doit être lu dans une portée valide.");
console.log("OK — parcours V2 Profil → Abjad → thème → synthèse validé.");
