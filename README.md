# Zodiaque & 28 Lettres

Application fondée sur le référentiel **Abjad Maghrébin**, les 28 lettres arabes, le zodiaque et les cycles lunaires.

## État actuel

**Version 1.5.15 — PWA hors ligne renforcée, service worker enregistré, manifeste PWA complet, validation astronomique renforcée, longitudes géocentriques ECT, gestion IANA/DST du temps natal, thème natal visuel et recherche locale de lieux.**

Le dépôt contient notamment :

- référentiel Abjad Maghrébin verrouillé ;
- classification élémentaire 7 / 7 / 7 / 7 ;
- 12 signes, modalités et planètes ;
- calculateur Abjad avec normalisation orthographique arabe explicite (variantes d'alif et alif maqṣūra) ;
- conservation comme caractères non référencés des graphies hamzées et de la tāʾ marbūṭa, faute de règle validée ;
- parcours de synthèse du profil relié au calcul Abjad ;
- phases et structure lunaire ;
- calculs astronomiques avec Astronomy Engine 2.1.19 ;
- runtime Astronomy Engine préparé localement à partir du package npm épinglé ;
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
- PWA / service worker enregistré et cache versionné ;
- diagnostic visible de l'installation Android et des ressources hors connexion ;
- icônes d'installation dédiées 192 × 192 et 512 × 512 ;
- repli sur la page d'accueil mise en cache lors d'une navigation hors connexion.

## Astronomie

La page **Astronomie** affiche les positions techniques. Les longitudes du thème natal sont géocentriques et exprimées dans l'écliptique vrai de la date (ECT). Le Soleil utilise `SunPosition`; les autres corps sont convertis depuis `GeoVector` vers ECT. Les coordonnées horizontales ne sont calculées que lorsqu'un observateur est explicitement défini.

Le moteur de production est Astronomy Engine **2.1.19** et le runtime navigateur est préparé localement à partir du package npm épinglé. L'application ne fabrique ni ne simule de données astronomiques.

## Localisation et heure

Le module sépare lieu descriptif, coordonnées, fuseau IANA, heure civile et instant UTC. Les règles historiques/DST sont fournies par `Intl`. Les heures civiles inexistantes ou ambiguës lors d'une transition sont signalées plutôt que résolues silencieusement.

## Thème natal

Le profil astronomique utilise les longitudes géocentriques ECT, puis applique séparément les conventions astrologiques symboliques pour les signes, maisons et aspects. Aucune correspondance aux 28 lettres n'est ajoutée par le moteur.

## PWA

Le manifeste définit explicitement la langue, le sens d'interface, le périmètre, l'icône et les métadonnées d'installation. Le service worker est enregistré au chargement de l'application et utilise un cache versionné contenant le runtime astronomique local et les référentiels nécessaires au fonctionnement hors ligne.

## Règles fondamentales

Aucune correspondance lettre → signe → planète n'est inventée. Lorsqu'une correspondance n'est pas présente et sourcée dans le référentiel, l'application indique qu'elle est non définie.

Les interprétations astrologiques sont présentées comme **traditionnelles/symboliques et non scientifiques**.

## Validation

`npm run validate` prépare le runtime Astronomy Engine local à partir de la version 2.1.19 puis vérifie le référentiel, la structure, le profil astronomique, les longitudes géocentriques ECT, l'analyse Abjad, la roue visuelle, la localisation, les fuseaux IANA/DST, le module lunaire, le runtime local, la PWA et la syntaxe des modules JavaScript.
