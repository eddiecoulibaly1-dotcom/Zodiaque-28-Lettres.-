# Architecture

## Racine
- `index.html` : point d'entrée GitHub Pages.
- `app.js` : logique d'interface.
- `styles.css` : interface responsive.
- `sw.js` : cache PWA.
- `manifest.webmanifest` : métadonnées PWA.
- `icon.svg` : icône.

## Référentiel
Le code applicatif ne doit pas devenir le lieu de stockage des données symboliques.
Les données sont séparées dans `referentiel/`.

- `lettres.json` : socle Abjad + éléments.
- `zodiaque.json` : 12 signes.
- `planetes.json` : planètes.
- `correspondances.json` : ponts lettre/signe/planète.
- `phases_lunaires.json` : phases.
- `jours_lunaires.json` : cycle symbolique de 28 jours.
- `sources.json` : sources.
- `reference-manifest.json` : version et empreintes SHA-256.

## Tests
Les tests Node valident les invariants fondamentaux et la structure.
