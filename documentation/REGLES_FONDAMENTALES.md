# Règles fondamentales — Zodiaque & 28 Lettres

## 1. Abjad obligatoire
Le projet utilise exclusivement l'**Abjad Maghrébin** défini dans `referentiel/lettres.json`.

Valeurs verrouillées :

`ا=1 ب=2 ج=3 د=4 ه=5 و=6 ز=7 ح=8 ط=9 ي=10 ك=20 ل=30 م=40 ن=50 س=300 ع=70 ف=80 ص=60 ض=90 ق=100 ر=200 ش=1000 ت=400 ث=500 خ=600 ذ=700 ظ=800 غ=900`

## 2. Classification élémentaire obligatoire
- Feu : ا، ه، ط، م، ف، س، ذ
- Terre : ب، و، ي، ن، ض، ت، ظ
- Air : ج، ز، ك، ص، ق، ث، غ
- Eau : د، ح، ل، ع، ر، خ، ش

Chaque lettre appartient à un seul élément.

## 3. Interdiction d'invention
Aucune correspondance lettre ↔ signe ou lettre ↔ planète ne doit être inventée.
Si elle n'est pas définie et sourcée, conserver `null` et le statut `undefined`.

## 4. Distinction science / symbolisme
Les calculs astronomiques sont techniques lorsqu'un moteur approprié est utilisé.
Les interprétations astrologiques, traditionnelles ou symboliques doivent être présentées comme telles et non comme des faits scientifiques.

## 5. Lune
Le jour lunaire symbolique sur 28 jours est distinct de la date civile et de l'âge astronomique réel de la Lune.
