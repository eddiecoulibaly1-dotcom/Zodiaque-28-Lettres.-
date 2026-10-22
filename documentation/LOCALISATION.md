# Localisation et gestion horaire

## Principe

La localisation du profil distingue quatre notions :

1. **Lieu descriptif** : ville et pays saisis par l'utilisateur.
2. **Position géographique** : latitude, longitude et altitude.
3. **Fuseau horaire** : identifiant IANA, par exemple `Africa/Abidjan`.
4. **Heure civile de naissance** et son **décalage UTC** calculé pour la date concernée.

Cette séparation évite de confondre le jour civil, l'heure locale, UTC et la position géographique.

## Géolocalisation

La géolocalisation du navigateur n'est jamais lancée automatiquement. Elle n'est exécutée qu'après action explicite sur **« Utiliser ma position (avec consentement) »** et reste soumise à l'autorisation du navigateur.

Aucune adresse ni ville n'est déduite automatiquement des coordonnées. Les champs ville/pays restent descriptifs.

## Fuseau horaire

Le module utilise les identifiants IANA et `Intl.DateTimeFormat` du navigateur. Le décalage UTC est recalculé pour la date/heure de naissance, ce qui permet de respecter les changements saisonniers d'un fuseau lorsqu'ils existent.

## Intégration au thème natal

Après application, latitude, longitude, altitude et décalage UTC sont synchronisés avec les champs du profil existant. Le moteur astronomique reçoit ensuite une date convertie en UTC et un observateur explicite.

Les calculs astronomiques restent séparés des interprétations astrologiques traditionnelles/symboliques.
