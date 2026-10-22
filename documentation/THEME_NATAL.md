# Thème natal — version 1.2.0

## Objectif

Cette version transforme le profil de naissance en un module de thème natal structuré, tout en séparant strictement :

- **astronomie** : positions et coordonnées calculées par Astronomy Engine ;
- **astrologie** : maisons, aspects et interprétations, présentés comme conventions traditionnelles/symboliques.

Astronomy Engine fournit notamment les positions du Soleil, de la Lune et des planètes, les coordonnées horizontales et les calculs de lever/coucher. Il est utilisable côté navigateur. Voir la documentation officielle du projet Astronomy Engine.

## Entrée temporelle

Le formulaire demande :

1. date et heure civile de naissance ;
2. décalage UTC en minutes ;
3. latitude ;
4. longitude ;
5. altitude.

Le décalage UTC est séparé de l'heure civile afin que le résultat ne dépende pas du fuseau horaire du téléphone ou de l'ordinateur utilisé pour saisir la naissance.

Exemple : Côte d'Ivoire = UTC+00:00, donc `0` minute.

## Angles

L'Ascendant et le Milieu du Ciel sont calculés à partir du temps sidéral local et de l'obliquité vraie fournis par Astronomy Engine.

Ils constituent des coordonnées astronomiques utilisées ensuite comme points de départ pour la lecture astrologique.

## Maisons

La version 1.2.0 utilise **les signes entiers (Whole Sign Houses)**.

Ce choix est volontaire et explicite :

- maison 1 = signe de l'Ascendant ;
- chaque maison suivante correspond au signe suivant ;
- chaque maison couvre 30°.

Ce n'est pas présenté comme le seul système de maisons possible. Une version future pourra ajouter Placidus ou d'autres systèmes si une méthode de référence est choisie pour le projet.

## Aspects

La version 1.2.0 calcule les cinq aspects majeurs suivants :

| Aspect | Angle | Orbe initiale |
|---|---:|---:|
| Conjonction | 0° | 8° |
| Sextile | 60° | 6° |
| Carré | 90° | 7° |
| Trigone | 120° | 8° |
| Opposition | 180° | 8° |

Ces valeurs sont des **paramètres de lecture astrologique configurables**. Elles ne doivent pas être confondues avec des mesures astronomiques ou des correspondances issues du référentiel des 28 lettres.

Les aspects sont recherchés entre les dix corps principaux du thème et avec l'Ascendant/Milieu du Ciel lorsque l'écart entre les longitudes respecte l'orbe configurée.

## Règle fondamentale des 28 lettres

Le calcul du thème natal ne crée aucune nouvelle correspondance :

- aucune lettre n'est automatiquement attribuée à un signe ;
- aucune lettre n'est automatiquement attribuée à une planète ;
- aucune signification symbolique absente du référentiel n'est déduite des positions planétaires.

Si une correspondance n'existe pas dans le référentiel, l'application doit continuer à l'afficher comme indéfinie.

## Limites

Le module ne prétend pas produire une vérité scientifique sur l'astrologie. Il fournit des calculs astronomiques et une structure de lecture astrologique traditionnelle/symbolique.

Le système de maisons et les orbes d'aspects sont maintenant explicitement configurés afin d'éviter les hypothèses cachées.
