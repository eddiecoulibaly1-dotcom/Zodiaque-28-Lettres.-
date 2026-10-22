# Zodiaque & 28 Lettres

Application autonome fondée sur le référentiel **Abjad Maghrébin**, les 28 lettres arabes, le zodiaque et les cycles lunaires.

## État actuel

**Version 1.1.0 — profil astronomique ajouté.**

Le dépôt contient maintenant :

- référentiel Abjad Maghrébin verrouillé ;
- classification élémentaire 7 / 7 / 7 / 7 ;
- 12 signes, modalités et planètes ;
- calculateur Abjad ;
- phases et structure lunaire ;
- calculs astronomiques dans le navigateur avec Astronomy Engine 2.1.19 ;
- positions du Soleil, de la Lune et des planètes ;
- lever/coucher et prochains quartiers lunaires ;
- profil de naissance avec Soleil, Lune, Ascendant et Milieu du Ciel ;
- séparation explicite entre calcul astronomique et interprétation astrologique ;
- conservation locale des données de profil dans le navigateur ;
- PWA / service worker.

## Règles fondamentales

Aucune correspondance lettre → signe → planète n'est inventée. Lorsqu'une correspondance n'est pas présente et sourcée dans le référentiel, l'application indique qu'elle est non définie.

Les interprétations astrologiques sont présentées comme **traditionnelles/symboliques et non scientifiques**.

## Astronomie

La page **Astronomie** accepte une date/heure et des coordonnées géographiques pour calculer les positions célestes, l'azimut, l'altitude, les événements lunaires et les informations de lever/coucher.

La page **Profil** accepte les données de naissance et calcule les principales coordonnées utilisées par le profil astrologique. Voir `documentation/ASTRONOMIE_PROFIL.md`.

## Dépendance

`package.json` référence `astronomy-engine` version `2.1.19`. Le chargement navigateur actuel utilise la distribution navigateur de cette même version.

## Utilisation

Ouvrir `index.html` depuis un hébergement HTTPS ou un serveur local. Pour une expérience PWA complète, utiliser un hébergement HTTPS.
