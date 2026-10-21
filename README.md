# Zodiaque & 28 Lettres — Version finale

Application web autonome d'exploration du zodiaque, de l'Abjad Maghrébin, des 28 lettres arabes et des référentiels symboliques configurables.

## Statut

**Version : 3.0.0-final**

Cette version constitue la **base définitive à remplir** : l'architecture, le socle Abjad et la classification élémentaire sont séparés, documentés et testés.

### Socle verrouillé
- 28 lettres arabes
- Abjad Maghrébin
- valeurs exactes, notamment `س=300`, `ص=60`, `ض=90`, `خ=600`, `ش=1000`, `ق=100`
- 7 lettres par élément
- aucune correspondance inventée

### Modules
- 12 signes du zodiaque
- 28 lettres
- calcul Abjad
- analyse élémentaire
- correspondances configurables
- phases lunaires
- cycle symbolique de 28 jours
- méthode et limites
- PWA / fonctionnement GitHub Pages

## Remplissage

Le référentiel se complète uniquement dans le dossier `referentiel/`.
Consulter `documentation/GUIDE_REMPLISSAGE.md`.

## Validation

```bash
node tests/validate_reference.mjs
node tests/validate_structure.mjs
```

## Important

L'astrologie et les correspondances symboliques sont présentées comme des systèmes traditionnels/symboliques, pas comme des faits scientifiques.

Les fonctions astronomiques de haute précision ne sont pas revendiquées tant qu'un moteur astronomique spécialisé n'est pas intégré.

## Licence

À définir par le propriétaire du projet.
