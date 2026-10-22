# Astronomie et profil de naissance

## Principe

Le projet sépare explicitement :

- **astronomie** : calcul numérique des positions et coordonnées célestes ;
- **astrologie** : interprétation traditionnelle/symbolique appliquée ensuite aux résultats.

## Moteur

L'application utilise **Astronomy Engine 2.1.19** dans le navigateur. Le dépôt conserve également `package.json` avec cette dépendance pour la reproductibilité du projet.

Le moteur fournit notamment les positions du Soleil, de la Lune et des planètes, les coordonnées équatoriales/horizontales et les recherches de lever/coucher et de phases lunaires.

## Profil actuel

Le module `profil.js` calcule à partir de :

- date et heure locales de naissance ;
- latitude ;
- longitude ;
- altitude.

Il affiche :

- Soleil : longitude et signe tropical ;
- Lune : longitude et signe tropical ;
- Ascendant : longitude et signe tropical ;
- Milieu du Ciel : longitude et signe tropical ;
- positions de Soleil, Lune, Mercure, Vénus, Mars, Jupiter, Saturne, Uranus, Neptune et Pluton ;
- ascension droite, déclinaison, azimut et altitude pour chaque corps.

## Données non inventées

Le module ne fabrique aucune correspondance lettre → signe → planète. Les correspondances absentes restent celles du référentiel, conformément aux règles définitives du projet.

Les maisons astrologiques détaillées, les aspects et les interprétations personnalisées ne sont ajoutés que lorsqu'une méthode de calcul et/ou une source est explicitement définie dans le projet.

## Vie privée

Les données du formulaire de profil sont enregistrées uniquement dans le `localStorage` du navigateur. Aucune géolocalisation automatique n'est activée par ce module.
