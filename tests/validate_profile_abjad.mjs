import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('referentiel/lettres.json', 'utf8'));
const letters = data.letters;
if (!Array.isArray(letters) || letters.length !== 28) throw new Error('Le référentiel doit contenir exactement 28 lettres.');
if (letters.some(l => !Number.isFinite(Number(l.abjad_maghribi)))) throw new Error('Chaque lettre doit avoir une valeur Abjad Maghrébin numérique.');
if (letters.some(l => !['Feu','Terre','Air','Eau'].includes(l.element))) throw new Error('Élément de lettre invalide.');
const groups = Object.fromEntries(['Feu','Terre','Air','Eau'].map(e => [e, letters.filter(l => l.element === e)]));
for (const [element, rows] of Object.entries(groups)) if (rows.length !== 7) throw new Error(`${element}: ${rows.length} lettres au lieu de 7.`);
const values = letters.map(l => Number(l.abjad_maghribi));
if (new Set(values).size !== 28) throw new Error('Les 28 valeurs Abjad doivent être uniques.');
console.log('OK — profil Abjad : 28 lettres, valeurs numériques uniques et 7 lettres par élément.');
