import json, pathlib, hashlib
R=pathlib.Path(__file__).resolve().parents[1]
load=lambda p: json.loads((R/p).read_text(encoding="utf-8"))
L=load("referentiel/lettres.json")["letters"]
E=load("referentiel/elements.json")["elements"]
Z=load("referentiel/zodiaque.json")["signs"]
P=load("referentiel/planetes.json")["planets"]
C=load("referentiel/correspondances.json")["records"]
assert len(L)==28 and len({x["letter"] for x in L})==28
expected={"ا":1,"ب":2,"ج":3,"د":4,"ه":5,"و":6,"ز":7,"ح":8,"ط":9,"ي":10,"ك":20,"ل":30,"م":40,"ن":50,"س":300,"ع":70,"ف":80,"ص":60,"ض":90,"ق":100,"ر":200,"ش":1000,"ت":400,"ث":500,"خ":600,"ذ":700,"ظ":800,"غ":900}
assert {x["letter"]:x["abjad_maghribi"] for x in L}==expected
for e in E: assert len(e["letters"])==7
assert sorted(sum((e["letters"] for e in E),[]))==sorted(expected)
assert len(Z)==12 and len(P)==10 and len(C)==28
assert all(c["status"]=="undefined" and c["zodiac_sign_id"] is None and c["planet_id"] is None for c in C)
print("OK — dossier de référence final cohérent.")
