import fs from 'node:fs';

const source = fs.readFileSync(new URL('../astronomy.js', import.meta.url), 'utf8');
const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

const requiredExports = [
  'engineReady',
  'observer',
  'bodyPosition',
  'sunPosition',
  'moonPosition',
  'allPlanetPositions',
  'riseSet',
  'moonPhase',
  'nextMoonQuarters',
  'lunarAgeDays',
  'ageDays',
  'constellation',
  'normalize',
  'tropicalSign'
];

for (const name of requiredExports) {
  if (!new RegExp(`export function ${name}\\s*\\(`).test(source)) {
    throw new Error(`Export astronomique manquant: ${name}`);
  }
}

if (!source.includes('Astronomy.Constellation')) throw new Error('La constellation astronomique doit utiliser le moteur, pas une valeur fictive.');
if (!source.includes('Astronomy.GeoVector')) throw new Error('La constellation doit partir des coordonnées géocentriques.');
if (!source.includes('q.quarter===0')) throw new Error('L’âge lunaire doit rechercher la dernière nouvelle Lune exacte.');
if (!source.includes('29.530588853')) throw new Error('La durée synodique de repli doit être explicitement documentée.');
if (!source.includes('calculation')) throw new Error('Le module doit rester centré sur le calcul astronomique.');
if (!index.includes('astronomy-engine@2.1.19/astronomy.browser.min.js')) throw new Error('La version du moteur astronomique doit rester épinglée à 2.1.19 tant que le runtime local n’est pas intégré.');

console.log('OK — contrat de l’adaptateur astronomique validé.');
