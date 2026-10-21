# Zodiaque & 28 Lettres — V2 contrôlée

Cette version remplace le premier prototype après audit. Elle est conçue pour être remplie une fois avec un référentiel validé, sans inventer les correspondances manquantes.

## Ce qui est contrôlé automatiquement
- exactement 28 lettres ;
- Abjad Maghrébin uniquement ;
- valeurs obligatoires, notamment : س=300, ص=60, ض=90, خ=600, ش=1000, ق=100 ;
- exactement 7 lettres par élément ;
- une seule appartenance élémentaire par lettre ;
- correspondances lettre↔zodiaque et lettre↔planète laissées `null` tant qu'elles ne sont pas validées ;
- 28 jours lunaires présents, mais leurs significations restent vides tant qu'elles ne sont pas fournies.

## Fichiers
- `index.html` : structure de l'application.
- `styles.css` : interface responsive.
- `app.js` : logique de l'application et validation au démarrage.
- `data/referentiel.json` : source de vérité à remplir/valider.
- `tests/validate.mjs` : test automatisé du référentiel.
- `manifest.webmanifest`, `sw.js`, `icon.svg` : base PWA hors `file://`.

## Lancer
Pour une utilisation simple : ouvrir `index.html`.
Pour le mode PWA/service worker : servir le dossier via HTTP(S), par exemple avec un serveur local.

## Test
Avec Node.js :
`node tests/validate.mjs`

## Important
Cette V2 n'affirme pas que les calculs astronomiques simplifiés sont de précision professionnelle. Pour une version de production, le moteur astronomique doit être remplacé par une bibliothèque/éphéméride dédiée. De même, l'ascendant, les maisons, les aspects et les positions planétaires précises ne sont pas inventés dans cette version.

## Remplissage définitif
Le seul fichier de données à compléter en priorité est `data/referentiel.json`. Ne pas modifier les valeurs Abjad ni les groupes élémentaires sans validation explicite. Les champs `zodiac_sign_id`, `planet_id`, `symbolic_meaning`, `keywords` et `source` doivent être remplis uniquement avec les correspondances/sources validées du projet.
