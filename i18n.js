/* Internationalisation foundation — FR / AR / EN.
 * The scientific/traditional distinction and reference data are not translated here.
 * Language choice is stored locally and Arabic activates RTL.
 */
(() => {
  const KEY = "z28_language";
  const SUPPORTED = ["fr", "ar", "en"];
  const TEXT = {
    fr: {
      eyebrow: "RÉFÉRENTIEL FINAL", subtitle: "Abjad Maghrébin · 12 signes · 28 lettres · cycles lunaires",
      loaded: "● Référentiel chargé", astronomy: "Astronomie : données techniques séparées",
      home: "Accueil", letters: "28 lettres", abjad: "Calcul Abjad", elements: "Éléments", zodiac: "12 signes",
      planets: "Planètes", correspondences: "Correspondances", moon: "Phases lunaires", astronomyNav: "Astronomie",
      lunarDays: "28 jours lunaires", profile: "Profil / Thème natal", sources: "Sources", method: "Méthode",
      reference: "État du référentiel", footer: "Les interprétations astrologiques sont traditionnelles/symboliques et non scientifiques.",
      language: "Langue"
    },
    ar: {
      eyebrow: "المرجع النهائي", subtitle: "حساب الجُمّل المغربي · 12 برجًا · 28 حرفًا · الدورات القمرية",
      loaded: "● المرجع محمّل", astronomy: "الفلك: بيانات تقنية منفصلة",
      home: "الرئيسية", letters: "28 حرفًا", abjad: "حساب الجُمّل", elements: "العناصر", zodiac: "12 برجًا",
      planets: "الكواكب", correspondences: "المقابلات", moon: "أطوار القمر", astronomyNav: "الفلك",
      lunarDays: "28 يومًا قمريًا", profile: "الملف / الخريطة", sources: "المصادر", method: "المنهجية",
      reference: "حالة المرجع", footer: "التفسيرات الفلكية التنجيمية تقليدية/رمزية وليست علمية.",
      language: "اللغة"
    },
    en: {
      eyebrow: "FINAL REFERENCE", subtitle: "Maghrébin Abjad · 12 signs · 28 letters · lunar cycles",
      loaded: "● Reference loaded", astronomy: "Astronomy: technical data kept separate",
      home: "Home", letters: "28 letters", abjad: "Abjad calculator", elements: "Elements", zodiac: "12 signs",
      planets: "Planets", correspondences: "Correspondences", moon: "Lunar phases", astronomyNav: "Astronomy",
      lunarDays: "28 lunar days", profile: "Profile / Natal chart", sources: "Sources", method: "Method",
      reference: "Reference status", footer: "Astrological interpretations are traditional/symbolic and non-scientific.",
      language: "Language"
    }
  };
  function get(){ const v=localStorage.getItem(KEY); return SUPPORTED.includes(v)?v:"fr"; }
  function apply(lang=get()){
    if(!SUPPORTED.includes(lang)) lang="fr";
    localStorage.setItem(KEY,lang);
    document.documentElement.lang=lang;
    document.documentElement.dir=lang==="ar"?"rtl":"ltr";
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const key=el.dataset.i18n; if(TEXT[lang][key]) el.textContent=TEXT[lang][key];
    });
    const select=document.querySelector("#languageSelect"); if(select) select.value=lang;
  }
  window.Z28I18n={get,apply,supported:SUPPORTED,text:TEXT};
  document.addEventListener("DOMContentLoaded",()=>{
    const select=document.querySelector("#languageSelect");
    if(select) select.addEventListener("change",()=>apply(select.value));
    apply();
  });
})();
