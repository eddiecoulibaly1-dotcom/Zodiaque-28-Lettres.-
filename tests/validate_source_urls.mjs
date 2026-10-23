import fs from "node:fs";

const sources = JSON.parse(fs.readFileSync("referentiel/sources.json", "utf8"));
const traditional = JSON.parse(fs.readFileSync("referentiel/correspondances_traditionnelles.json", "utf8"));

function checkUrl(value, label) {
  if (!value) return;
  let url;
  try { url = new URL(value, "https://local.invalid"); } catch { throw new Error(`URL invalide : ${label}`); }
  const isLocal = value.startsWith("./") || value.startsWith("/");
  if (!isLocal && url.protocol !== "https:") throw new Error(`URL non sûre : ${label}`);
}

for (const s of sources.sources ?? []) checkUrl(s.url, `source ${s.id}`);
for (const s of traditional.sources ?? []) checkUrl(s.url, `source traditionnelle ${s.id ?? s.title}`);

console.log("OK — URLs des sources validées (HTTPS ou ressources locales).");
