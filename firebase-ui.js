import {
  auth,
  registerWithEmail,
  loginWithEmail,
  logout,
  requestPasswordReset,
  resendVerificationEmail,
  refreshEmailVerification,
  observeAuth,
  saveBirthProfile,
  listBirthProfiles,
  getBirthProfile,
  deleteBirthProfile
} from "./firebase-client.js";

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

let active = false;
let busy = false;
let currentProfiles = [];
let editingId = null;
let authUnsubscribe = null;

function addNavigation() {
  const nav = document.querySelector("#sidebar nav");
  if (!nav || document.querySelector('[data-view="cloud-profiles"]')) return;
  const button = document.createElement("button");
  button.className = "nav";
  button.dataset.view = "cloud-profiles";
  button.innerHTML = '☁ <span>Compte / Mes profils</span>';
  button.addEventListener("click", () => render());
  nav.appendChild(button);
}

function setActiveNavigation() {
  document.querySelectorAll(".nav").forEach(button => button.classList.toggle("active", button.dataset.view === "cloud-profiles"));
  document.querySelector("#sidebar")?.classList.remove("open");
}

function status(message, kind = "notice") {
  const node = document.querySelector("#firebaseStatus");
  if (!node) return;
  node.className = kind;
  node.textContent = message;
}

function accountView(user) {
  if (!user) return `
    <h2>Compte et profils sauvegardés</h2>
    <p class="lead">Crée un compte pour retrouver tes profils de naissance depuis tes appareils.</p>
    <div class="grid wide">
      <section class="card">
        <h3>Connexion</h3>
        <form id="firebaseLogin">
          <label for="loginEmail">Adresse e-mail</label>
          <input id="loginEmail" type="email" autocomplete="email" required>
          <label for="loginPassword">Mot de passe</label>
          <input id="loginPassword" type="password" autocomplete="current-password" minlength="6" required>
          <div class="toolbar"><button class="primary" type="submit">Se connecter</button><button class="secondary" id="resetPassword" type="button">Mot de passe oublié</button></div>
        </form>
      </section>
      <section class="card">
        <h3>Créer un compte</h3>
        <form id="firebaseRegister">
          <label for="registerName">Nom d'affichage (facultatif)</label>
          <input id="registerName" autocomplete="name" maxlength="100">
          <label for="registerEmail">Adresse e-mail</label>
          <input id="registerEmail" type="email" autocomplete="email" required>
          <label for="registerPassword">Mot de passe (12 caractères minimum, majuscule, minuscule, chiffre et symbole)</label>
          <input id="registerPassword" type="password" autocomplete="new-password" minlength="12" required>
          <button class="primary" type="submit">Créer mon compte</button>
        </form>
      </section>
    </div>
    <div id="firebaseStatus" class="notice" role="status">Une confirmation sera envoyée à l'adresse e-mail lors de l'inscription.</div>`;

  if (user && !user.emailVerified) return `
    <h2>Confirme ton adresse e-mail</h2>
    <p class="lead">Un lien de confirmation a été envoyé à <b>${esc(user.email)}</b>.</p>
    <section class="card"><p>Tu dois confirmer cette adresse avant de consulter ou sauvegarder tes profils. Ouvre le lien reçu, puis reviens ici.</p>
      <div class="toolbar"><button id="refreshEmailVerification" class="primary" type="button">J’ai confirmé mon adresse</button>
      <button id="resendVerification" class="secondary" type="button">Renvoyer l’e-mail</button>
      <button id="firebaseLogout" class="secondary" type="button">Se déconnecter</button></div></section>
    <div id="firebaseStatus" class="notice" role="status">La confirmation est obligatoire pour accéder aux profils cloud.</div>`;

  return `
    <h2>Compte et profils sauvegardés</h2>
    <p class="lead">Connecté en tant que <b>${esc(user.email)}</b> · e-mail confirmé.</p>
    <div class="card">
      <div class="detail-head"><div><h3>Mes profils de naissance</h3><p class="muted small">Les profils sont privés et liés à ce compte.</p></div><button id="firebaseLogout" class="secondary" type="button">Se déconnecter</button></div>
      <div id="firebaseProfilesList" class="grid wide" style="margin-top:14px">${busy ? "Chargement…" : renderProfileCards()}</div>
    </div>
    <section class="card" style="margin-top:16px">
      <h3 id="profileEditorTitle">${editingId ? "Modifier un profil" : "Ajouter un profil"}</h3>
      <form id="firebaseProfileForm">
        <div class="toolbar">
          <input id="cloudLabel" maxlength="100" placeholder="Nom du profil (ex. Mon thème natal)" required>
          <input id="cloudName" maxlength="160" placeholder="Nom de la personne">
        </div>
        <div class="toolbar">
          <label>Date de naissance<input id="cloudBirthDate" type="date" required></label>
          <label>Heure locale<input id="cloudBirthTime" type="time" required></label>
          <label>Fuseau horaire IANA<input id="cloudTimeZone" placeholder="Africa/Abidjan" required></label>
        </div>
        <div class="toolbar">
          <label>Latitude<input id="cloudLatitude" type="number" step="any" min="-90" max="90" placeholder="5.36"></label>
          <label>Longitude<input id="cloudLongitude" type="number" step="any" min="-180" max="180" placeholder="-3.99"></label>
          <input id="cloudPlace" maxlength="200" placeholder="Lieu de naissance">
        </div>
        <label for="cloudNotes">Notes personnelles (facultatif)</label>
        <textarea id="cloudNotes" rows="3" maxlength="3000" placeholder="Notes liées à ce profil"></textarea>
        <label for="cloudSnapshot">Instantané JSON du thème (facultatif)</label>
        <textarea id="cloudSnapshot" rows="3" placeholder="Colle ici un instantané JSON si tu en as un"></textarea>
        <div class="toolbar"><button class="primary" type="submit">${editingId ? "Enregistrer les modifications" : "Sauvegarder le profil"}</button><button class="secondary" id="cancelEdit" type="button">Effacer le formulaire</button></div>
      </form>
    </section>
    <div id="firebaseStatus" class="notice" role="status">Les profils seront sauvegardés dans ton compte Firebase.</div>`;
}

function renderProfileCards() {
  if (!currentProfiles.length) return '<div class="empty">Aucun profil sauvegardé pour le moment.</div>';
  return currentProfiles.map(profile => `
    <article class="card">
      <h3>${esc(profile.label || "Profil sans nom")}</h3>
      <p>${esc(profile.name || "Nom non renseigné")}</p>
      <p class="small muted">${esc(profile.birthDate || "Date inconnue")} ${esc(profile.birthTime || "")}</p>
      <p class="small muted">${esc(profile.place || "")} ${esc(profile.timeZone || "")}</p>
      <div class="toolbar">
        <button class="secondary" type="button" data-edit-profile="${esc(profile.id)}">Modifier</button>
        <button class="secondary" type="button" data-delete-profile="${esc(profile.id)}">Supprimer</button>
      </div>
    </article>`).join("");
}

async function refreshProfiles() {
  const list = document.querySelector("#firebaseProfilesList");
  if (!auth.currentUser || !list) return;
  list.innerHTML = '<p class="muted">Chargement des profils…</p>';
  try {
    currentProfiles = await listBirthProfiles();
    if (document.querySelector("#firebaseProfilesList")) {
      document.querySelector("#firebaseProfilesList").innerHTML = renderProfileCards();
      bindProfileCardActions();
    }
  } catch (error) {
    status(error.message || "Impossible de charger les profils.", "warning");
  }
}

function bindAuthForms() {
  document.querySelector("#firebaseLogin")?.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy) return;
    busy = true;
    try {
      await loginWithEmail(document.querySelector("#loginEmail").value, document.querySelector("#loginPassword").value);
      status("Connexion réussie.", "success");
    } catch (error) {
      status(friendlyError(error), "warning");
    } finally { busy = false; }
  });

  document.querySelector("#firebaseRegister")?.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy) return;
    busy = true;
    try {
      const password = document.querySelector("#registerPassword").value;
      if (!isStrongPassword(password)) {
        status("Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un symbole.", "warning");
        return;
      }
      await registerWithEmail(
        document.querySelector("#registerEmail").value,
        password,
        document.querySelector("#registerName").value
      );
      status("Compte créé. Consulte ta boîte e-mail pour confirmer l'adresse.", "success");
    } catch (error) {
      status(friendlyError(error), "warning");
    } finally { busy = false; }
  });

  document.querySelector("#resetPassword")?.addEventListener("click", async () => {
    const email = document.querySelector("#loginEmail")?.value.trim();
    if (!email) return status("Saisis d'abord ton adresse e-mail dans le formulaire de connexion.", "warning");
    try {
      await requestPasswordReset(email);
      status("Si cette adresse correspond à un compte, un e-mail de réinitialisation a été envoyé.", "success");
    } catch (error) { status(friendlyError(error), "warning"); }
  });
}

function isStrongPassword(password) {
  return password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
}

function friendlyError(error) {
  const messages = {
    "auth/email-already-in-use": "Cette adresse e-mail possède déjà un compte.",
    "auth/invalid-email": "L'adresse e-mail n'est pas valide.",
    "auth/weak-password": "Choisis un mot de passe plus robuste, d'au moins 6 caractères.",
    "auth/invalid-credential": "E-mail ou mot de passe incorrect.",
    "auth/too-many-requests": "Trop de tentatives. Réessaie plus tard.",
    "auth/network-request-failed": "Connexion Internet indisponible. Réessaie lorsque le réseau fonctionne."
  };
  return messages[error?.code] || error?.message || "Une erreur est survenue. Réessaie.";
}

function fillEditor(profile) {
  editingId = profile?.id || null;
  document.querySelector("#profileEditorTitle").textContent = editingId ? "Modifier un profil" : "Ajouter un profil";
  const fields = {
    cloudLabel: profile?.label,
    cloudName: profile?.name,
    cloudBirthDate: profile?.birthDate,
    cloudBirthTime: profile?.birthTime,
    cloudTimeZone: profile?.timeZone || "Africa/Abidjan",
    cloudLatitude: profile?.latitude,
    cloudLongitude: profile?.longitude,
    cloudPlace: profile?.place,
    cloudNotes: profile?.notes
  };
  Object.entries(fields).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.value = value ?? "";
  });
  document.querySelector("#cloudSnapshot").value = profile?.calculationSnapshot ? JSON.stringify(profile.calculationSnapshot, null, 2) : "";
}

function bindProfileCardActions() {
  document.querySelectorAll("[data-edit-profile]").forEach(button => button.addEventListener("click", async () => {
    try {
      const profile = await getBirthProfile(button.dataset.editProfile);
      if (!profile) return status("Profil introuvable.", "warning");
      fillEditor(profile);
      document.querySelector("#firebaseProfileForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) { status(friendlyError(error), "warning"); }
  }));
  document.querySelectorAll("[data-delete-profile]").forEach(button => button.addEventListener("click", async () => {
    const id = button.dataset.deleteProfile;
    if (!confirm("Supprimer définitivement ce profil sauvegardé ?")) return;
    try {
      await deleteBirthProfile(id);
      currentProfiles = currentProfiles.filter(profile => profile.id !== id);
      document.querySelector("#firebaseProfilesList").innerHTML = renderProfileCards();
      bindProfileCardActions();
      status("Profil supprimé.", "success");
    } catch (error) { status(friendlyError(error), "warning"); }
  }));
}

function bindProfileForm() {
  document.querySelector("#firebaseProfileForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    let snapshot = {};
    const rawSnapshot = document.querySelector("#cloudSnapshot").value.trim();
    if (rawSnapshot) {
      try { snapshot = JSON.parse(rawSnapshot); }
      catch { return status("L'instantané du thème doit être un JSON valide.", "warning"); }
    }
    const latitude = document.querySelector("#cloudLatitude").value;
    const longitude = document.querySelector("#cloudLongitude").value;
    const profile = {
      label: document.querySelector("#cloudLabel").value,
      name: document.querySelector("#cloudName").value,
      birthDate: document.querySelector("#cloudBirthDate").value,
      birthTime: document.querySelector("#cloudBirthTime").value,
      timeZone: document.querySelector("#cloudTimeZone").value.trim(),
      latitude: latitude === "" ? null : Number(latitude),
      longitude: longitude === "" ? null : Number(longitude),
      place: document.querySelector("#cloudPlace").value,
      notes: document.querySelector("#cloudNotes").value,
      calculationSnapshot: snapshot
    };
    try {
      await saveBirthProfile(profile, editingId);
      currentProfiles = await listBirthProfiles();
      document.querySelector("#firebaseProfilesList").innerHTML = renderProfileCards();
      bindProfileCardActions();
      fillEditor(null);
      status("Profil sauvegardé dans ton compte.", "success");
    } catch (error) { status(friendlyError(error), "warning"); }
  });
  document.querySelector("#cancelEdit")?.addEventListener("click", () => fillEditor(null));
}

function bindSignedInView() {
  document.querySelector("#resendVerification")?.addEventListener("click", async () => {
    try { const verified = await resendVerificationEmail(); status(verified ? "Adresse déjà confirmée." : "Nouvel e-mail de confirmation envoyé.", "success"); }
    catch (error) { status(friendlyError(error), "warning"); }
  });
  document.querySelector("#refreshEmailVerification")?.addEventListener("click", async () => {
    try { const user = await refreshEmailVerification(); if (user?.emailVerified) render(); else status("Confirmation non détectée. Ouvre le lien reçu puis réessaie.", "warning"); }
    catch (error) { status(friendlyError(error), "warning"); }
  });
  document.querySelector("#firebaseLogout")?.addEventListener("click", async () => {
    try { await logout(); status("Déconnexion réussie.", "success"); }
    catch (error) { status(friendlyError(error), "warning"); }
  });
  bindProfileForm();
  bindProfileCardActions();
  fillEditor(null);
  refreshProfiles();
}

function render() {
  active = true;
  setActiveNavigation();
  const app = document.querySelector("#app");
  if (!app) return;
  app.innerHTML = '<div class="card"><h2>Chargement du compte…</h2></div>';
  const user = auth.currentUser;
  app.innerHTML = accountView(user);
  if (user) bindSignedInView();
  else bindAuthForms();
}

function onAuthChanged(user) {
  if (!active) return;
  const app = document.querySelector("#app");
  if (!app) return;
  app.innerHTML = accountView(user);
  if (user) bindSignedInView();
  else bindAuthForms();
}

function boot() {
  addNavigation();
  if (!authUnsubscribe) authUnsubscribe = observeAuth(onAuthChanged);
  document.querySelector("#mobileMenu")?.addEventListener("click", () => {});
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
else boot();
