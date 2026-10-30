import json, pathlib, hashlib
R=pathlib.Path(__file__).resolve().parents[1]
load=lambda p: json.loads((R/p).read_text(encoding="utf-8"))
L=load("referentiel/lettres.json")["letters"]
E=load("referentiel/elements.json")["elements"]
Z=load("referentiel/zodiaque.json")["signs"]
P=load("referentiel/planetes.json")["planets"]
C=load("referentiel/correspondances.json")["records"]
COS=load("referentiel/spheres_cosmologiques.json")
SOURCES=load("referentiel/sources.json")["sources"]
assert len(L)==28 and len({x["letter"] for x in L})==28
expected={"ا":1,"ب":2,"ج":3,"د":4,"ه":5,"و":6,"ز":7,"ح":8,"ط":9,"ي":10,"ك":20,"ل":30,"م":40,"ن":50,"س":300,"ع":70,"ف":80,"ص":60,"ض":90,"ق":100,"ر":200,"ش":1000,"ت":400,"ث":500,"خ":600,"ذ":700,"ظ":800,"غ":900}
assert {x["letter"]:x["abjad_maghribi"] for x in L}==expected
for e in E: assert len(e["letters"])==7
assert sorted(sum((e["letters"] for e in E),[]))==sorted(expected)
assert len(Z)==12 and len(P)==10 and len(C)==28
assert all(c["status"]=="undefined" and c["zodiac_sign_id"] is None and c["planet_id"] is None for c in C)
assert "SRC_GARDINER_2017" in {s["id"] for s in SOURCES}
assert "SRC_GARDINER_2017" in COS["source_ids"]
letter_by_id={x["id"]:x["letter"] for x in L}
expected_spheres=[
    ("Intellect",["ا","ع"]),("Kursi (Trône / Piédestal)",["ب","ف"]),
    ("Saturne",["ج","د"]),("Jupiter",["د","ق"]),("Mars",["ه","ر"]),
    ("Soleil",["و","س"]),("Vénus",["ز","ت"]),("Mercure",["ح","ث"]),
    ("Lune",["ط","خ"]),("Feu",["ي","ذ"]),("Air",["ك","ز"]),
    ("Eau",["ل","غ"]),("Terre",["م","ش"]),("Table préservée",["ص"]),
    ("Calame divin",["ن"])
]
assert len(COS["spheres"])==len(expected_spheres)
for sphere,(name,letters) in zip(COS["spheres"],expected_spheres):
    assert sphere["name_fr"]==name
    assert [letter_by_id[x] for x in sphere["letter_ids"]]==letters
assigned=[letter_by_id[x] for sphere in COS["spheres"] for x in sphere["letter_ids"]]
assert len(assigned)==28
assert sorted(x for x in set(assigned) if assigned.count(x)>1)==["د","ز"]
assert sorted(letter_by_id[x] for x in COS["not_assigned_in_this_diagram"])==["ض","ظ"]
print("OK — dossier de référence final cohérent.")
