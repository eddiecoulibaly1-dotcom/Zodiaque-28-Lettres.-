/* Normalisation orthographique explicite pour le calcul Abjad Maghrébin.
 * Variantes d'alif (أ إ آ ٱ) → ا ; alif maqṣūra ى → ي.
 * Les hamza portées par و/ي et la tāʾ marbūṭa ة ne sont PAS converties
 * automatiquement : elles restent non référencées afin de ne pas inventer une règle.
 */
(() => {
  const MARKS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/u;
  const SKIP = /[\s\p{P}\p{S}]/u;
  const MAP = Object.freeze({ "أ":"ا", "إ":"ا", "آ":"ا", "ٱ":"ا", "ى":"ي" });
  function normalizeLetter(value) {
    const ch = String(value ?? "").normalize("NFC");
    if (!ch || MARKS.test(ch) || ch === "ـ" || SKIP.test(ch)) return null;
    return MAP[ch] || ch;
  }
  window.Z28AbjadNormalization = Object.freeze({ normalizeLetter });
})();
