# Correspondances traditionnelles — lettres, demeures lunaires, zodiaque et planètes

Cette couche documente les correspondances symboliques traditionnelles utilisées par l'application. Elle est volontairement séparée du référentiel Abjad Maghrébin et des calculs astronomiques.

## 1. Lettres solaires / lettres lunaires

La distinction **solaire/lunaire** est d'abord une distinction linguistique : elle concerne l'assimilation ou la prononciation du lām de l'article défini `al-`.

- Solaires : ت ث د ذ ر ز س ش ص ض ط ظ ل ن
- Lunaires : ا ب ج ح خ ع غ ف ق ك م ه و ي

Dans l'application, cette distinction ne sera donc pas utilisée pour prétendre que les lettres solaires « appartiennent au Soleil » ou que les lettres lunaires « appartiennent à la Lune » au sens astronomique.

## 2. 28 lettres et 28 demeures lunaires

La tradition du **Shams al-Ma'arif** associe les 28 lettres aux 28 manāzil al-qamar. La séquence retenue ici est celle allant de `ا` (Alif) à `غ` (Ghayn).

Chaque demeure couvre environ `360° / 28 = 12°51′26″` de longitude écliptique. Comme 28 ne divise pas 360° par 12 signes, certaines demeures traversent une frontière entre deux signes. L'application conservera donc les **segments zodiacaux réels de la demeure**, plutôt que de forcer une seule étiquette lorsque la demeure est partagée entre deux signes.

## 3. Lettres et planètes

La tradition des sept lettres de l'Ism al-A'zam fournit une correspondance directe entre **7 lettres** et les **7 planètes classiques** :

| Jour | Planète | Lettre |
|---|---|---|
| Dimanche | Soleil | ف |
| Lundi | Lune | ج |
| Mardi | Mars | ش |
| Mercredi | Mercure | ث |
| Jeudi | Jupiter | ظ |
| Vendredi | Vénus | خ |
| Samedi | Saturne | ز |

Point essentiel : cette table ne donne pas, à elle seule, une planète directe pour chacune des 28 lettres. Les 21 autres lettres restent donc `undefined` dans cette couche tant qu'une source précise ne fournit pas une attribution compatible.

## 4. Règle de rigueur du projet

L'application distinguera toujours :

1. **Astronomie** : positions calculées du Soleil, de la Lune et des planètes.
2. **Astrologie** : interprétation symbolique/traditionnelle de ces positions.
3. **Science des lettres** : correspondances historiques/ésotériques documentées.
4. **Abjad Maghrébin** : système numérique verrouillé du projet.

Aucune correspondance lettre → signe ou lettre → planète ne sera déduite par simple analogie.

## Sources de travail

- Ahmed Belhâj Ait Wârhame, *Relation entre la lettre et l'astrologie*, Horizons Maghrébins, 1998, pp. 242–249, Persée.
- Ahmad al-Būnī, *Shams al-Ma'arif* — tradition des manāzil al-qamar et des sept lettres/planètes, documentée par les références secondaires indiquées dans `referentiel/correspondances_traditionnelles.json`.
- Référentiel de comparaison : *Manāzil al-Qamar — The 28 Lunar Mansions & the Arabic Letters*, qui distingue explicitement la séquence al-Būnī des attributions propres à Ibn 'Arabī.

**Statut :** couche traditionnelle symbolique, non scientifique.
