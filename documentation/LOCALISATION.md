# Localisation et gestion horaire

## Principe

La localisation du profil distingue quatre notions :

1. **Lieu descriptif** : ville et pays saisis par l'utilisateur.
2. **Position géographique** : latitude, longitude et altitude.
3. **Fuseau horaire** : identifiant IANA, par exemple `Africa/Abidjan`.
4. **Heure civile de naissance** et son **décalage UTC** calculé pour la date concernée.

Cette séparation évite de confondre le jour civil, l'heure locale, UTC et la position géographique.

## Recherche de lieux

`referentiel/lieux.json` fournit un **catalogue local initial de villes de référence**. La recherche est effectuée dans ce catalogue, sans géocodage distant et sans déduction d'adresse.

Chaque entrée fournit :

- ville ;
- pays et code pays ;
- latitude ;
- longitude ;
- altitude de référence ;
- fuseau horaire IANA.

Les coordonnées sont des coordonnées de référence de ville et ne constituent jamais une adresse personnelle. Le catalogue est extensible et doit rester explicite et contrôlé.

Le champ de fuseau accepte également les valeurs IANA reconnues par `Intl.supportedValuesOf("timeZone")` lorsqu'elles sont disponibles dans le navigateur.

## Géolocalisation

La géolocalisation du navigateur n'est jamais lancée automatiquement. Elle n'est exécutée qu'après action explicite sur **« Utiliser ma position (avec consentement) »** et reste soumise à l'autorisation du navigateur.

Aucune adresse ni ville n'est déduite automatiquement des coordonnées.

## Fuseau horaire

Le module utilise les identifiants IANA et `Intl.DateTimeFormat` du navigateur. Le décalage UTC est recalculé pour la date/heure de naissance, ce qui permet de respecter les changements saisonniers d'un fuseau lorsqu'ils existent.

## Intégration au thème natal

Après sélection ou saisie, latitude, longitude, altitude et décalage UTC sont synchronisés avec les champs du profil existant. Le moteur astronomique reçoit ensuite une date convertie en UTC et un observateur explicite.

Les calculs astronomiques restent séparés des interprétations astrologiques traditionnelles/symboliques.
