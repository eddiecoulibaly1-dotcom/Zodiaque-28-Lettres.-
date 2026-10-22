/* Synchronise le panneau de localisation avec le sélecteur FR/AR/EN et le profil. */
(() => {
  const wire=()=>{const b=document.querySelector("#z28Apply");if(!b||b.dataset.persistWired)return;b.dataset.persistWired="1";b.addEventListener("click",()=>setTimeout(()=>document.querySelector("#pSave")?.click(),0));};
  const refresh=()=>{const p=document.querySelector("#z28LocationPanel");if(p&&window.Z28Location?.render){p.remove();window.Z28Location.render();}wire();};
  document.addEventListener("DOMContentLoaded",()=>{
    const root=document.querySelector("#app");
    if(root)new MutationObserver(()=>wire()).observe(root,{childList:true,subtree:true});
    new MutationObserver((list)=>{if(list.some(m=>m.type==="attributes"&&m.attributeName==="lang"))refresh();}).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
    wire();
  });
})();
