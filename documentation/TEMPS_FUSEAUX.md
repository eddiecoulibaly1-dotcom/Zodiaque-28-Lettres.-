# Temps civil, fuseaux IANA et DST

## Version 1.5.11

Le thème natal distingue explicitement :

1. **heure civile saisie** : date et heure affichées sur l'horloge locale du lieu de naissance ;
2. **fuseau IANA** : par exemple `Africa/Abidjan`, `Europe/Paris` ou `America/New_York` ;
3. **décalage UTC à la date exacte** : valeur calculée pour cette naissance ;
4. **instant UTC** transmis au moteur astronomique ;
5. **coordonnées géographiques** : latitude, longitude et altitude, indépendantes du fuseau.

## Règles historiques et heure d'été

`timezone.js` utilise `Intl.DateTimeFormat` avec le fuseau IANA à la date concernée. Les règles historiques et DST disponibles dans l'environnement JavaScript sont donc utilisées, sans décalage fixe inventé.

## Transitions DST

Une heure civile peut être **inexistante** lors du passage à l'heure d'été ou **ambiguë** lors du retour à l'heure standard. Le convertisseur ne prétend pas choisir silencieusement entre plusieurs instants : ces cas sont signalés pour validation manuelle.

La conversion normale effectue une vérification aller-retour : heure civile → candidat UTC → heure civile. Si le résultat ne correspond pas exactement à la saisie, la conversion est refusée.

## Astronomie

Le profil astronomique corrigé transmet au moteur un instant UTC. Les longitudes natales sont géocentriques dans l'écliptique vrai de la date (ECT), conformément à la séparation entre calcul astronomique et interprétation astrologique.

## Validation

Les tests couvrent :

- Côte d'Ivoire sans DST ;
- New York en hiver et en été ;
- Paris en hiver et en été ;
- un cas historique de New York ;
- présence du calcul IANA centralisé ;
- validation de l'architecture des longitudes géocentriques ECT ;
- synchronisation du module lunaire avec les coordonnées actuelles du profil.

Les interprétations astrologiques restent traditionnelles/symboliques et non scientifiques.
