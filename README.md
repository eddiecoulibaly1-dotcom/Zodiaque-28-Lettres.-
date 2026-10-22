# Zodiaque & 28 Lettres

Application fondée sur le référentiel **Abjad Maghrébin**, les 28 lettres arabes, le zodiaque et les cycles lunaires.

## État actuel

**Version 1.5.11 — validation astronomique renforcée, longitudes géocentriques ECT, gestion IANA/DST du temps natal, thème natal visuel et recherche locale de lieux.**

Le dépôt contient notamment :

- référentiel Abjad Maghrébin verrouillé ;
- classification élémentaire 7 / 7 / 7 / 7 ;
- 12 signes, modalités et planètes ;
- calculateur Abjad ;
- phases et structure lunaire ;
- calculs astronomiques avec Astronomy Engine 2.1.19 ;
- longitudes géocentriques dans l'écliptique vrai de la date (ECT) ;
- positions du Soleil, de la Lune et des planètes ;
- lever/coucher et prochains quartiers lunaires ;
- profil de naissance avec Soleil, Lune, Ascendant et Milieu du Ciel ;
- maisons en signes entiers, explicitement configurées ;
- aspects majeurs avec orbes explicites ;
- synthèse symbolique des éléments et modalités ;
- roue zodiacale visuelle basée uniquement sur les longitudes calculées ;
- diagnostic astronomique sans coordonnées géographiques codées en dur ;
- localisation du profil avec ville/pays, coordonnées, altitude et fuseau IANA ;
- catalogue local de lieux de référence avec recherche ville/pays/fuseau ;
- conversion centralisée heure civile → UTC avec règles historiques/DST ;
- refus explicite des heures civiles inexistantes ou ambiguës dans le convertisseur IANA ;
- module lunaire unifié synchronisé avec les coordonnées du profil ;
- interface FR / العربية / EN avec RTL arabe ;
- PWA / service worker.

## Astronomie

La page **Astronomie** affiche les positions techniques. Les longitudes du thème natal sont géocentriques et exprimées dans l'écliptique vrai de la date (ECT). Le Soleil utilise `SunPosition`; les autres corps sont convertis depuis `GeoVector` vers ECT. Les coordonnées horizontales ne sont calculées que lorsqu'un observateur est explicitement défini.

Le chargement du moteur privilégie `vendor/astronomy/astronomy.browser.min.js`. Un secours CDN reste temporairement présent tant que le fichier local n'est pas effectivement produit et validé.

## Localisation et heure

Le module sépare lieu descriptif, coordonnées, fuseau IANA, heure civile et instant UTC. Les règles historiques/DST sont fournies par `Intl`. Les heures civiles inexistantes ou ambiguës lors d'une transition sont signalées plutôt que résolues silencieusement.

## Thème natal

Le profil astronomique utilise les longitudes géocentriques ECT, puis applique séparément les conventions astrologiques symboliques pour les signes, maisons et aspects. Aucune correspondance aux 28 lettres n'est ajoutée par le moteur.

## Règles fondamentales

Aucune correspondance lettre → signe → planète n'est inventée. Lorsqu'une correspondance n'est pas présente et sourcée dans le référentiel, l'application indique qu'elle est non définie.

Les interprétations astrologiques sont présentées comme **traditionnelles/symboliques et non scientifiques**.

## Validation

`npm run validate` vérifie le référentiel, la structure, le profil astronomique, les longitudes géocentriques ECT, l'analyse Abjad, la roue visuelle, la localisation, les fuseaux IANA/DST, le module lunaire et la syntaxe des modules JavaScript.
