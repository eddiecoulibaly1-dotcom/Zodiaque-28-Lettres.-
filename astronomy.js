/* Astronomy Engine integration.
   Geocentric ecliptic coordinates are calculated in ECT (true ecliptic of date).
   This adapter keeps factual astronomy separate from traditional/symbolic astrology.
*/
const BODY_NAMES=["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
const SYNODIC_MONTH_DAYS=29.530588853;
export function engineReady(){return typeof globalThis.Astronomy!=="undefined";}
function assertEngine(){if(!engineReady())throw new Error("Le moteur astronomique n'est pas chargé. Vérifiez le chargement d'Astronomy Engine.");}
function body(name){assertEngine();const B=globalThis.Astronomy.Body?.[name];if(B===undefined)throw new Error(`Corps astronomique non supporté : ${name}`);return B;}
function asDate(value){const d=value instanceof Date?new Date(value.getTime()):new Date(value);if(!Number.isFinite(d.getTime()))throw new Error("Date astronomique invalide.");return d;}
export function observer(latitude,longitude,elevation=0){assertEngine();const lat=Number(latitude),lon=Number(longitude),elev=Number(elevation)||0;if(!Number.isFinite(lat)||lat<-90||lat>90)throw new Error("Latitude invalide.");if(!Number.isFinite(lon)||lon<-180||lon>180)throw new Error("Longitude invalide.");if(!Number.isFinite(elev))throw new Error("Altitude invalide.");return new globalThis.Astronomy.Observer(lat,lon,elev);}
function eclipticLongitude(name,date){const A=globalThis.Astronomy,B=body(name);if(name==="Sun")return normalize(A.SunPosition(date).elon);const eqj=A.GeoVector(B,date,true);const ect=A.RotateVector(A.Rotation_EQJ_ECT(date),eqj);return normalize(A.SphereFromVector(ect).lon);}
function geocentricEquator(name,date){const A=globalThis.Astronomy,B=body(name),eqj=A.GeoVector(B,date,true);return A.EquatorFromVector(eqj);}
export function bodyPosition(name,date,obs){assertEngine();const when=asDate(date),B=body(name),eq=obs?A().Equator(B,when,obs,true,true):geocentricEquator(name,when),hor=obs?globalThis.Astronomy.Horizon(when,obs,eq.ra,eq.dec,"normal"):null,illum=globalThis.Astronomy.Illumination(B,when);return{body:name,date:when.toISOString(),eclipticLongitude:eclipticLongitude(name,when),rightAscension:eq.ra,declination:eq.dec,azimuth:hor?.azimuth??null,altitude:hor?.altitude??null,distanceAU:illum?.distance??null,magnitude:illum?.mag??null};}
function A(){return globalThis.Astronomy;}
export function sunPosition(date,obs){return bodyPosition("Sun",date,obs);}
export function moonPosition(date,obs){assertEngine();const when=asDate(date),p=bodyPosition("Moon",when,obs),illum=globalThis.Astronomy.Illumination(globalThis.Astronomy.Body.Moon,when),phase=globalThis.Astronomy.MoonPhase(when);return{...p,phaseAngle:normalize(phase),illuminationFraction:illum.phase_fraction};}
export function allPlanetPositions(date,obs){return BODY_NAMES.map(name=>name==="Sun"?sunPosition(date,obs):name==="Moon"?moonPosition(date,obs):bodyPosition(name,date,obs));}
export function riseSet(name,date,obs){assertEngine();if(!obs)throw new Error("Un observateur est requis pour calculer lever/coucher.");const when=asDate(date),B=body(name),rise=globalThis.Astronomy.SearchRiseSet(B,obs,+1,when,2,0),set=globalThis.Astronomy.SearchRiseSet(B,obs,-1,when,2,0);return{rise:rise?.date??null,set:set?.date??null};}
export function moonPhase(date){assertEngine();return normalize(globalThis.Astronomy.MoonPhase(asDate(date)));}
export function nextMoonQuarters(date,count=4){assertEngine();const out=[];let q=globalThis.Astronomy.SearchMoonQuarter(asDate(date));for(let i=0;i<count&&q;i++){out.push({quarter:q.quarter,date:q.time.date});q=globalThis.Astronomy.NextMoonQuarter(q);}return out;}
export function lunarAgeDays(date){assertEngine();const when=asDate(date),start=new Date(when.getTime()-40*86400000);let q=globalThis.Astronomy.SearchMoonQuarter(start),lastNew=null;for(let i=0;i<8&&q;i++){if(q.time.date>when)break;if(q.quarter===0)lastNew=q.time.date;q=globalThis.Astronomy.NextMoonQuarter(q);}if(lastNew)return Math.max(0,(when-lastNew)/86400000);return moonPhase(when)/360*SYNODIC_MONTH_DAYS;}
export function ageDays(date){return lunarAgeDays(date);}
export function constellation(bodyName,date){assertEngine();const when=asDate(date),B=body(bodyName),eqj=globalThis.Astronomy.EquatorFromVector(globalThis.Astronomy.GeoVector(B,when,true));return globalThis.Astronomy.Constellation(eqj.ra,eqj.dec);}
export function normalize(x){return((Number(x)%360)+360)%360;}
export function tropicalSign(longitude){const signs=[["Aries","♈"],["Taurus","♉"],["Gemini","♊"],["Cancer","♋"],["Leo","♌"],["Virgo","♍"],["Libra","♎"],["Scorpio","♏"],["Sagittarius","♐"],["Capricorn","♑"],["Aquarius","♒"],["Pisces","♓"]],lon=normalize(longitude),index=Math.floor(lon/30);return{id:signs[index][0].toLowerCase(),name:signs[index][0],symbol:signs[index][1],degree:lon-index*30};}
