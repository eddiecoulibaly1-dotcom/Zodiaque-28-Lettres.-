/* Astronomy Engine integration.
   Astronomy Engine is loaded globally by index.html.
   This file only adapts its API to the application's data model. */

const BODY_NAMES = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];

export function engineReady(){
  return typeof globalThis.Astronomy !== "undefined";
}

function assertEngine(){
  if(!engineReady()) throw new Error("Le moteur astronomique n'est pas chargé. Vérifiez la connexion au CDN Astronomy Engine.");
}

function body(name){
  assertEngine();
  return globalThis.Astronomy.Body[name];
}

export function observer(latitude, longitude, elevation=0){
  assertEngine();
  return new globalThis.Astronomy.Observer(Number(latitude), Number(longitude), Number(elevation)||0);
}

export function bodyPosition(name, date, obs){
  assertEngine();
  const B=body(name);
  const lon=globalThis.Astronomy.EclipticLongitude(B,date);
  const eq=globalThis.Astronomy.Equator(B,date,obs,true,true);
  const hor=globalThis.Astronomy.Horizon(date,obs,eq.ra,eq.dec,"normal");
  const illum=globalThis.Astronomy.Illumination(B,date);
  return {
    body:name,
    eclipticLongitude: normalize(lon),
    rightAscension:eq.ra,
    declination:eq.dec,
    azimuth:hor.azimuth,
    altitude:hor.altitude,
    distanceAU:illum.distance,
    magnitude:illum.mag
  };
}

export function sunPosition(date, obs){
  const p=bodyPosition("Sun",date,obs);
  return p;
}

export function moonPosition(date, obs){
  const p=bodyPosition("Moon",date,obs);
  const illum=globalThis.Astronomy.Illumination(globalThis.Astronomy.Body.Moon,date);
  const phase=globalThis.Astronomy.MoonPhase(date);
  return {...p, phaseAngle:phase, illuminationFraction:illum.phase_fraction};
}

export function allPlanetPositions(date,obs){
  return BODY_NAMES.map(n=>n==="Sun"?sunPosition(date,obs):n==="Moon"?moonPosition(date,obs):bodyPosition(n,date,obs));
}

export function riseSet(name,date,obs){
  const B=body(name);
  const rise=globalThis.Astronomy.SearchRiseSet(B,obs,+1,date,2,0);
  const set=globalThis.Astronomy.SearchRiseSet(B,obs,-1,date,2,0);
  return {rise: rise?.date ?? null, set: set?.date ?? null};
}

export function moonPhase(date){
  assertEngine();
  return normalize(globalThis.Astronomy.MoonPhase(date));
}

export function nextMoonQuarters(date,count=4){
  assertEngine();
  const out=[];
  let q=globalThis.Astronomy.SearchMoonQuarter(date);
  for(let i=0;i<count && q;i++){
    out.push({quarter:q.quarter,date:q.time.date});
    q=globalThis.Astronomy.NextMoonQuarter(q);
  }
  return out;
}

export function constellation(bodyName,date){
  assertEngine();
  const B=body(bodyName);
  const eq=globalThis.Astronomy.Equator(B,date,null,true,true);
  return globalThis.Astronomy.EquatorFromVector
    ? null
    : null;
}

export function normalize(x){ return ((Number(x)%360)+360)%360; }

export function tropicalSign(longitude){
  const signs=[
    ["Aries","♈"],["Taurus","♉"],["Gemini","♊"],["Cancer","♋"],
    ["Leo","♌"],["Virgo","♍"],["Libra","♎"],["Scorpio","♏"],
    ["Sagittarius","♐"],["Capricorn","♑"],["Aquarius","♒"],["Pisces","♓"]
  ];
  const lon=normalize(longitude);
  const index=Math.floor(lon/30);
  return {id:signs[index][0].toLowerCase(),name:signs[index][0],symbol:signs[index][1],degree:lon-index*30};
}

export function ageDays(date){
  // Astronomical lunar age measured from the latest exact new moon.
  assertEngine();
  const now=new Date(date);
  const phase=moonPhase(now);
  const daysSinceNew=phase/360*29.530588853;
  return daysSinceNew;
}
