# Temps civil, fuseaux IANA et DST

## Version 1.5.10

Le thème natal distingue désormais explicitement :

1. **heure civile saisie** : la date et l'heure affichées sur l'horloge locale du lieu de naissance ;
2. **fuseau IANA** : par exemple `Africa/Abidjan`, `Europe/Paris` ou `America/New_York` ;
3. **décalage UTC à la date exacte** : valeur calculée pour cette naissance, et non une constante supposée ;
4. **instant UTC** transmis au moteur astronomique ;
5. **coordonnées géographiques** : latitude, longitude et altitude, indépendantes du fuseau.

## Règles historiques et heure d'été

Le calcul horaire utilise `Intl.DateTimeFormat` avec le fuseau IANA à la date concernée. Cela permet de tenir compte des changements historiques de décalage et de l'heure d'été lorsque l'environnement JavaScript fournit les données IANA correspondantes.

Aucun `UTC+X` fixe n'est déduit d'une ville. Par exemple, une zone qui passe de l'heure standard à l'heure d'été peut avoir deux décalages différents au cours de la même année.

## Limite importante : heure locale ambiguë

Lors d'un retour à l'heure standard, une heure civile peut exister deux fois. Une saisie de type `02:30` peut alors correspondre à deux instants UTC différents. À l'inverse, lors d'un passage à l'heure d'été, certaines heures civiles n'existent pas.

L'application conserve le décalage UTC calculé avec la localisation sélectionnée et affiche séparément l'heure civile. Pour les cas historiques ou de transition DST où l'heure locale est ambiguë, une validation manuelle du décalage reste recommandée avant d'utiliser le thème comme référence archivistique.

## Validation

Les tests couvrent notamment :

- Côte d'Ivoire, sans changement DST ;
- New York en hiver et en été ;
- Paris en hiver et en été ;
- un cas historique de New York ;
- séparation entre lieu, fuseau et coordonnées ;
- présence du calcul IANA centralisé ;
- synchronisation du module lunaire avec les noms de champs actuels du profil.

Le calcul astronomique reste distinct de l'interprétation astrologique traditionnelle/symbolique.
