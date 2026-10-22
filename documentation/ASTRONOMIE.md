# Couche astronomique — Zodiaque & 28 Lettres

## Principe

Cette couche calcule des données astronomiques techniques et les garde séparées des interprétations astrologiques traditionnelles/symboliques.

Le moteur retenu est **Astronomy Engine 2.1.19**. Sa documentation officielle indique qu’il calcule les positions du Soleil, de la Lune et des planètes, les coordonnées équatoriales/écliptiques/horizontales, les levers/couchers et les phases lunaires. Le projet annonce une précision cible de l’ordre de ±1 minute d’arc et des validations contre NOVAS et JPL Horizons.

## Données calculées dans l’application

- longitude écliptique apparente des corps supportés ;
- ascension droite et déclinaison ;
- azimut et altitude lorsque la position de l’observateur est fournie ;
- distance en unités astronomiques et magnitude apparente lorsque disponibles ;
- lever/coucher ;
- angle de phase lunaire et fraction éclairée ;
- prochains quartiers lunaires ;
- âge lunaire astronomique, basé en priorité sur la dernière nouvelle Lune exacte ;
- constellation astronomique lorsque le moteur fournit la fonction correspondante ;
- conversion de longitude vers le zodiaque tropical uniquement comme découpage mathématique de 12 secteurs de 30°.

## Temps

Astronomy Engine effectue ses calculs en UTC. L’application conserve séparément l’heure civile saisie et le décalage UTC du lieu de naissance. Une date JavaScript doit donc représenter correctement l’instant UTC avant calcul.

## Localisation

Les coordonnées géographiques servent aux calculs topocentriques et à l’horizon local. Aucune localisation précise n’est déduite automatiquement : l’utilisateur peut fournir latitude, longitude et altitude.

## Limites

- Le moteur astronomique ne constitue pas une preuve scientifique de l’astrologie.
- Les signes astrologiques, maisons et aspects utilisés dans le profil sont une couche d’interprétation distincte.
- Les maisons entières du profil sont une convention explicitement choisie ; elles ne sont pas présentées comme universelles.
- Aucune correspondance lettre → signe → planète n’est déduite par cette couche.

## Dépendance actuelle

Le runtime navigateur Astronomy Engine est actuellement chargé depuis une URL CDN épinglée à la version **2.1.19** dans `index.html`. Le code applicatif est déjà isolé dans `astronomy.js` afin de permettre une future bascule vers une copie locale sans modifier les modules métier.
