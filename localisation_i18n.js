/* Synchronise le panneau de localisation avec le sélecteur FR/AR/EN. */
(() => {
  const refresh=()=>{const p=document.querySelector("#z28LocationPanel");if(p&&window.Z28Location?.render){p.remove();window.Z28Location.render();}};
  document.addEventListener("DOMContentLoaded",()=>{
    new MutationObserver((list)=>{if(list.some(m=>m.type==="attributes"&&m.attributeName==="lang"))refresh();}).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
  });
})();
