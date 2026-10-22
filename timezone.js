/* Temps civil / fuseau IANA — Zodiaque & 28 Lettres.
 * Convertit une heure civile locale en UTC en utilisant le fuseau IANA
 * à la date concernée. Les règles historiques/DST sont donc fournies par
 * l'implémentation Intl du navigateur, sans décalage fixe inventé.
 */
(() => {
  const validZone = zone => {
    try { new Intl.DateTimeFormat("en-US", { timeZone: zone }).format(); return true; }
    catch (_) { return false; }
  };

  const offsetFor = (date, zone) => {
    const d = date instanceof Date ? date : new Date(date);
    if (!Number.isFinite(d.getTime())) throw new Error("Date invalide.");
    if (!validZone(zone)) throw new Error("Fuseau horaire IANA invalide.");
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone, year:"numeric", month:"2-digit", day:"2-digit",
      hour:"2-digit", minute:"2-digit", second:"2-digit", hourCycle:"h23"
    }).formatToParts(d);
    const p = {};
    for (const x of parts) if (x.type !== "literal") p[x.type] = x.value;
    const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
    return Math.round((asUTC - d.getTime()) / 60000);
  };

  const parseCivil = (value, zone) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value || "");
    if (!m) return new Date(NaN);
    const a = m.slice(1).map(Number);
    const civilAsUTC = new Date(Date.UTC(a[0], a[1]-1, a[2], a[3], a[4]));
    const offset = offsetFor(civilAsUTC, zone);
    return new Date(civilAsUTC.getTime() - offset * 60000);
  };

  window.Z28Time = { validZone, offsetFor, parseCivil };
})();
