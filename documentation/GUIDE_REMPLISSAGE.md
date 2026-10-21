# Guide de remplissage

## Ce que vous pouvez compléter
1. `referentiel/zodiaque.json` : descriptions, mots-clés, symbolisme et sources.
2. `referentiel/planetes.json` : descriptions et sources.
3. `referentiel/correspondances.json` : uniquement les correspondances explicitement validées.
4. `referentiel/phases_lunaires.json` : descriptions sourcées.
5. `referentiel/jours_lunaires.json` : significations symboliques sourcées.
6. `referentiel/sources.json` : bibliographie et références.

## Ce qu'il ne faut pas modifier sans décision de gouvernance
`referentiel/lettres.json` constitue le socle fondamental : 28 lettres, valeurs Abjad et éléments.
Toute modification de ce fichier doit être considérée comme une modification majeure du référentiel et être accompagnée d'une nouvelle validation des tests.

## Après chaque remplissage
Exécuter :

```bash
node tests/validate_reference.mjs
node tests/validate_structure.mjs
```

Puis vérifier l'application dans un navigateur.

## GitHub Pages
Le projet est prévu pour fonctionner sans backend sur GitHub Pages.
Les fichiers JSON sont chargés localement par l'application.
L'ouverture directe en `file://` peut être bloquée par les règles du navigateur ; utiliser GitHub Pages ou un petit serveur HTTP local.

## Principe de sécurité intellectuelle
Ne jamais remplacer une donnée manquante par une supposition. Une donnée inconnue reste inconnue jusqu'à validation.
