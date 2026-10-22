/* Temps civil / fuseau IANA — Zodiaque & 28 Lettres.
 * Conversion locale -> UTC fondée sur les règles IANA exposées par Intl.
 * Les heures ambiguës/inexistantes lors d'un changement DST ne sont pas
 * silencieusement présentées comme certaines.
 */
(() => {
  const validZone=zone=>{try{new Intl.DateTimeFormat("en-US",{timeZone:zone}).format();return true;}catch(_){return false;}};
  const partsAt=(date,zone)=>{const p=new Intl.DateTimeFormat("en-US",{timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(date),o={};for(const x of p)if(x.type!=="literal")o[x.type]=x.value;return o;};
  const offsetFor=(date,zone)=>{const d=date instanceof Date?date:new Date(date);if(!Number.isFinite(d.getTime()))throw new Error("Date invalide.");if(!validZone(zone))throw new Error("Fuseau horaire IANA invalide.");const p=partsAt(d,zone),asUTC=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);return Math.round((asUTC-d.getTime())/60000);};
  const civilParts=value=>{const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value||"");if(!m)return null;return m.slice(1).map(Number);};
  const sameCivil=(date,value,zone)=>{const p=partsAt(date,zone),a=civilParts(value);return !!a&&+p.year===a[0]&&+p.month===a[1]&&+p.day===a[2]&&+p.hour===a[3]&&+p.minute===a[4]};
  const parseCivil=(value,zone)=>{const a=civilParts(value);if(!a||!validZone(zone))return new Date(NaN);const civilAsUTC=new Date(Date.UTC(a[0],a[1]-1,a[2],a[3],a[4]));let offset=offsetFor(civilAsUTC,zone),candidate=new Date(civilAsUTC.getTime()-offset*60000),offset2=offsetFor(candidate,zone);if(offset2!==offset){candidate=new Date(civilAsUTC.getTime()-offset2*60000);offset=offset2;}if(!sameCivil(candidate,value,zone))throw new Error("Heure civile inexistante ou ambiguë pour ce fuseau à cette date; vérifiez le décalage UTC.");return candidate;};
  window.Z28Time={validZone,offsetFor,parseCivil};
})();
