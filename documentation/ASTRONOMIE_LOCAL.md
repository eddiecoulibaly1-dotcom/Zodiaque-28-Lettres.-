# Runtime astronomique local

## État

Le projet doit fonctionner sans CDN au moment de l'exécution. Le moteur Astronomy Engine est donc prévu pour être copié dans `vendor/astronomy/astronomy.browser.min.js` et chargé localement par `index.html`.

## Version épinglée

Astronomy Engine **2.1.19**.

Source officielle : https://github.com/cosinekitty/astronomy

## Procédure de validation

Après présence du fichier local :

1. vérifier que `vendor/astronomy/astronomy.browser.min.js` est non vide ;
2. vérifier que `index.html` ne référence plus de CDN Astronomy Engine ;
3. vérifier que `Astronomy` est disponible avant le chargement des modules astronomiques ;
4. exécuter les tests astronomiques ;
5. tester le profil avec une date, une heure UTC, latitude et longitude connues.

Le téléchargement automatique par GitHub Actions n'est pas considéré comme une validation du moteur tant que le fichier n'a pas effectivement été produit dans le dépôt.
