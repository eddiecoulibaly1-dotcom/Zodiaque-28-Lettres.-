# Runtime astronomique local

## État

La migration vers un runtime local est engagée. `index.html` tente désormais en premier `vendor/astronomy/astronomy.browser.min.js`. Tant que ce fichier n'est pas effectivement présent dans le dépôt, un secours CDN 2.1.19 permet de conserver l'application fonctionnelle. Ce secours sera retiré après validation du fichier local.

## Version épinglée

Astronomy Engine **2.1.19**.

Source officielle : https://github.com/cosinekitty/astronomy

## Production du fichier local

Le workflow `.github/workflows/vendor-astronomy.yml` prépare le runtime à partir de la version npm épinglée. La présence réelle du fichier dans GitHub reste le critère de validation ; l'existence du workflow seule ne suffit pas.

## Validation finale obligatoire

Après présence de `vendor/astronomy/astronomy.browser.min.js` :

1. vérifier que le fichier est non vide ;
2. calculer et conserver son SHA-256 ;
3. vérifier qu'il expose bien `globalThis.Astronomy` dans le navigateur ;
4. vérifier que `index.html` peut fonctionner sans réseau ;
5. supprimer le secours CDN de `index.html` ;
6. exécuter les tests astronomiques et de profil ;
7. contrôler les positions, phases, lever/coucher et calculs du thème sur des cas de référence.

Aucune donnée astronomique ne doit être simulée pour masquer l'absence du moteur.
