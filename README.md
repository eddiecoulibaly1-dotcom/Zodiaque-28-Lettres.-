# Zodiaque & 28 Lettres

Application fondée sur le référentiel **Abjad Maghrébin**, les 28 lettres arabes, le zodiaque et les cycles lunaires.

## État actuel

**Version 1.5.9 — thème natal visuel, internationalisation FR/AR/EN, localisation horaire et recherche locale de lieux.**

Le dépôt contient notamment :

- référentiel Abjad Maghrébin verrouillé ;
- classification élémentaire 7 / 7 / 7 / 7 ;
- 12 signes, modalités et planètes ;
- calculateur Abjad ;
- phases et structure lunaire ;
- calculs astronomiques avec Astronomy Engine 2.1.19 ;
- positions du Soleil, de la Lune et des planètes ;
- lever/coucher et prochains quartiers lunaires ;
- profil de naissance avec Soleil, Lune, Ascendant et Milieu du Ciel ;
- maisons en signes entiers, explicitement configurées ;
- aspects majeurs avec orbes explicites ;
- synthèse symbolique des éléments et modalités ;
- roue zodiacale visuelle basée uniquement sur les longitudes calculées ;
- diagnostic astronomique sans coordonnées géographiques codées en dur ;
- analyse Abjad des noms/textes arabes ;
- séparation explicite entre calcul astronomique et interprétation astrologique ;
- localisation du profil avec ville/pays, coordonnées, altitude et fuseau IANA ;
- catalogue local de lieux de référence avec recherche ville/pays/fuseau ;
- liste des fuseaux IANA disponibles dans le navigateur ;
- géolocalisation uniquement après consentement explicite du navigateur ;
- calcul du décalage UTC pour la date de naissance ;
- interface FR / العربية / EN avec RTL arabe ;
- conservation locale des données de profil dans le navigateur ;
- PWA / service worker.

## Règles fondamentales

Aucune correspondance lettre → signe → planète n'est inventée. Lorsqu'une correspondance n'est pas présente et sourcée dans le référentiel, l'application indique qu'elle est non définie.

Les interprétations astrologiques sont présentées comme **traditionnelles/symboliques et non scientifiques**.

## Astronomie

La page **Astronomie** affiche les positions techniques. Les coordonnées horizontales (azimut/altitude) ne sont calculées que lorsqu'un observateur a été explicitement défini dans le profil ; aucun lieu n'est déduit automatiquement.

Le chargement du moteur privilégie désormais `vendor/astronomy/astronomy.browser.min.js`. Un secours CDN reste temporairement présent uniquement tant que le fichier local n'est pas effectivement produit et validé dans le dépôt. Le CDN sera retiré dès que le runtime local sera vérifié.

## Localisation et heure

Le module de localisation sépare le lieu descriptif, la position géographique, le fuseau horaire IANA, l'heure civile de naissance et son décalage UTC. La géolocalisation n'est jamais activée automatiquement. La recherche de lieux reste locale et contrôlée dans `referentiel/lieux.json`. Voir `documentation/LOCALISATION.md`.

## Thème natal

Le profil accepte date/heure civile, décalage UTC, latitude, longitude et altitude. Il calcule les dix corps principaux, Ascendant, Milieu du Ciel, maisons en signes entiers et aspects majeurs. La roue zodiacale est une représentation visuelle de ces positions calculées ; elle n'ajoute aucune correspondance aux 28 lettres.

## 28 lettres

Le système fondateur utilise exclusivement l'Abjad Maghrébin et la classification élémentaire officielle du projet. Les correspondances traditionnelles sont conservées dans une couche distincte et ne sont jamais déduites par le moteur.

## Validation

`npm run validate` vérifie le référentiel, la structure, le profil, l'analyse Abjad, la roue visuelle, la localisation, le catalogue de lieux et la syntaxe des modules JavaScript.
