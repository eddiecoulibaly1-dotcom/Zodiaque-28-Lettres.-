# Runtime astronomique local

## Architecture retenue

L'application ne charge aucun moteur astronomique depuis un CDN d'exécution. `index.html` charge exclusivement `vendor/astronomy/astronomy.browser.min.js`.

Le fichier n'est pas maintenu comme un artefact manuel : il est produit de manière déterministe à partir du package npm officiel épinglé, afin d'éviter les divergences entre développement, validation et GitHub Pages.

## Version épinglée

Astronomy Engine **2.1.19**.

Source officielle : https://github.com/cosinekitty/astronomy

## Préparation locale

Après `npm install`, exécuter :

```bash
npm run prepare:runtime
```

La commande :

1. copie `node_modules/astronomy-engine/source/js/astronomy.browser.min.js` vers `vendor/astronomy/astronomy.browser.min.js` ;
2. vérifie que le fichier est non vide et expose `globalThis.Astronomy` ;
3. calcule son SHA-256 dans `vendor/astronomy/SHA256SUMS` ;
4. écrit la provenance dans `vendor/astronomy/README.md`.

`npm run validate` prépare automatiquement ce runtime avant les tests.

## GitHub Pages

`.github/workflows/pages.yml` installe la version épinglée puis exécute la même préparation avant de publier l'artefact Pages. Ainsi, le site déployé contient bien le runtime local et ne dépend d'aucun CDN d'exécution.

## Validation

Les tests contrôlent notamment :

- présence et non-vacuité du runtime ;
- SHA-256 et provenance ;
- absence de secours CDN dans `index.html` ;
- séparation entre calcul astronomique technique et interprétation astrologique symbolique ;
- longitudes géocentriques dans l'écliptique vrai de la date (ECT) ;
- positions, phases, quartiers lunaires, lever/coucher et profil natal.

Aucune donnée astronomique n'est simulée pour masquer l'absence du moteur.
