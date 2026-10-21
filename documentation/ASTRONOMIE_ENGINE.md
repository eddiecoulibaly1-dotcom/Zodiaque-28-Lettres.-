# Moteur astronomique

L'application utilise Astronomy Engine JavaScript **2.1.19** pour les calculs astronomiques.

Source officielle :
https://github.com/cosinekitty/astronomy

Référence npm :
https://www.npmjs.com/package/astronomy-engine

Le moteur est chargé depuis jsDelivr dans `index.html`. Le code de l'application ne dépend d'aucun service/API astronomique distant : le calcul est effectué dans le navigateur une fois la bibliothèque chargée.

Fonctions utilisées par cette version :
- positions écliptiques géocentriques ;
- coordonnées horizontales ;
- lever/coucher ;
- illumination de la Lune ;
- phase lunaire ;
- prochains quartiers lunaires.

Limite explicite :
- les résultats astronomiques sont distincts des interprétations astrologiques ;
- la carte astrologique complète (maisons, aspects, ascendant final et règles d'interprétation) sera construite dans une étape séparée.

Licence :
Astronomy Engine est distribué sous licence MIT. La notice du projet doit être conservée avec l'application.
