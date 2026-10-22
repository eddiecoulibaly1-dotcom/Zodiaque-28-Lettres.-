/* Temps civil / fuseau IANA — Zodiaque & 28 Lettres.
 * Conversion locale -> UTC fondée sur les règles IANA exposées par Intl.
 * Les heures ambiguës/inexistantes lors d'un changement DST sont rejetées.
 */
(() => {
  const validZone=zone=>{try{new Intl.DateTimeFormat("en-US",{timeZone:zone}).format();return true;}catch(_){return false;}};
  const partsAt=(date,zone)=>{const p=new Intl.DateTimeFormat("en-US",{timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(date),o={};for(const x of p)if(x.type!=="literal")o[x.type]=x.value;return o;};
  const offsetFor=(date,zone)=>{const d=date instanceof Date?date:new Date(date);if(!Number.isFinite(d.getTime()))throw new Error("Date invalide.");if(!validZone(zone))throw new Error("Fuseau horaire IANA invalide.");const p=partsAt(d,zone),asUTC=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);return Math.round((asUTC-d.getTime())/60000);};
  const civilParts=value=>{const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value||"");if(!m)return null;const a=m.slice(1).map(Number);const d=new Date(Date.UTC(a[0],a[1]-1,a[2],a[3],a[4]));if(d.getUTCFullYear()!==a[0]||d.getUTCMonth()!==a[1]-1||d.getUTCDate()!==a[2]||d.getUTCHours()!==a[3]||d.getUTCMinutes()!==a[4])return null;return a;};
  const sameCivil=(date,value,zone)=>{const p=partsAt(date,zone),a=civilParts(value);return !!a&&+p.year===a[0]&&+p.month===a[1]&&+p.day===a[2]&&+p.hour===a[3]&&+p.minute===a[4]};
  const parseCivil=(value,zone)=>{
    const a=civilParts(value);if(!a||!validZone(zone))return new Date(NaN);
    const civilAsUTC=new Date(Date.UTC(a[0],a[1]-1,a[2],a[3],a[4]));
    const probes=[civilAsUTC.getTime()-86400000,civilAsUTC.getTime()-43200000,civilAsUTC.getTime(),civilAsUTC.getTime()+43200000,civilAsUTC.getTime()+86400000];
    const offsets=[...new Set(probes.map(ms=>offsetFor(new Date(ms),zone)))];
    const candidates=[];
    for(const offset of offsets){const candidate=new Date(civilAsUTC.getTime()-offset*60000);if(sameCivil(candidate,value,zone)&&!candidates.some(x=>x.getTime()===candidate.getTime()))candidates.push(candidate);}
    if(candidates.length===1)return candidates[0];
    if(candidates.length===0)throw new Error("Heure civile inexistante pour ce fuseau à cette date; vérifiez la date ou le décalage UTC.");
    throw new Error("Heure civile ambiguë pour ce fuseau à cette date; vérifiez le décalage UTC.");
  };
  window.Z28Time={validZone,offsetFor,parseCivil};
})();
