# Profil personnalisé — version 1.3.0

## Objectif
Réunir dans une même fiche :
- données de naissance ;
- positions astronomiques du Soleil, de la Lune et des planètes ;
- Ascendant et Milieu du Ciel ;
- maisons en signes entiers, explicitement choisies comme convention de lecture ;
- aspects majeurs avec orbes explicites ;
- analyse Abjad Maghrébin du nom ou d'un texte arabe ;
- répartition élémentaire des lettres.

## Abjad
Le profil charge `referentiel/lettres.json` directement avant le calcul. Les valeurs utilisées sont exclusivement les valeurs `abjad_maghribi` du référentiel. Les caractères non référencés sont signalés et ne sont pas convertis arbitrairement.

## Dominances
Deux indicateurs sont présentés séparément :
1. dominance par nombre de lettres par élément ;
2. dominance par somme des valeurs Abjad par élément.

Ils ne sont pas fusionnés en une prétendue « dominance » unique.

## Correspondances
Le profil ne fabrique aucune correspondance lettre → signe → planète. Si une correspondance n'est pas définie dans le référentiel, elle reste indéfinie.

## Astronomie / astrologie
Les positions célestes et coordonnées d'observation sont des calculs astronomiques. Les maisons, aspects et interprétations sont des conventions de lecture astrologique et sont présentés comme traditionnels/symboliques, non comme des résultats scientifiques.

## Heure et lieu
L'heure civile et le décalage UTC sont saisis séparément. La position géographique est saisie en latitude, longitude et altitude. L'application ne déduit pas un lieu ou un fuseau sans donnée explicite.
