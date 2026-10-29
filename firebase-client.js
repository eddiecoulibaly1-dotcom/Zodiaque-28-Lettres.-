// Firebase client for the static/PWA application.
// Firebase Web configuration is public by design; access is enforced by Auth and Firestore Rules.
// Keep this file free of service-account keys or Admin SDK credentials.
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDnVLRTyGJ5Ub4PJGUqaXVZ3_Al1iV-mO4",
  authDomain: "zodiaque-28-lettres.firebaseapp.com",
  projectId: "zodiaque-28-lettres",
  storageBucket: "zodiaque-28-lettres.firebasestorage.app",
  messagingSenderId: "841356010743",
  appId: "1:841356010743:web:cd9bef534da6d106df9ff2",
  measurementId: "G-TJ9QS4EY9Z"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

function requireUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("Vous devez être connecté pour accéder à vos profils.");
  return user;
}

function userProfilesCollection(uid = requireUser().uid) {
  return collection(db, "users", uid, "profiles");
}

export async function registerWithEmail(email, password, displayName = "") {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName.trim()) {
    await updateProfile(credential.user, { displayName: displayName.trim() });
  }
  await sendEmailVerification(credential.user);
  return credential.user;
}

export async function loginWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}

export async function requestPasswordReset(email) {
  await sendPasswordResetEmail(auth, email.trim());
}

export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function saveBirthProfile(profile, profileId = null) {
  const user = requireUser();
  const payload = {
    label: String(profile.label ?? "Mon profil").trim().slice(0, 100),
    name: String(profile.name ?? "").trim().slice(0, 160),
    birthDate: String(profile.birthDate ?? ""),
    birthTime: String(profile.birthTime ?? ""),
    timeZone: String(profile.timeZone ?? ""),
    latitude: profile.latitude == null ? null : Number(profile.latitude),
    longitude: profile.longitude == null ? null : Number(profile.longitude),
    place: String(profile.place ?? "").trim().slice(0, 200),
    calculationSnapshot: profile.calculationSnapshot ?? {},
    notes: String(profile.notes ?? "").slice(0, 3000),
    updatedAt: serverTimestamp()
  };

  if (payload.latitude !== null && (!Number.isFinite(payload.latitude) || payload.latitude < -90 || payload.latitude > 90)) {
    throw new Error("La latitude doit être comprise entre -90 et 90.");
  }
  if (payload.longitude !== null && (!Number.isFinite(payload.longitude) || payload.longitude < -180 || payload.longitude > 180)) {
    throw new Error("La longitude doit être comprise entre -180 et 180.");
  }

  if (profileId) {
    const ref = doc(db, "users", user.uid, "profiles", profileId);
    const existing = await getDoc(ref);
    if (!existing.exists()) throw new Error("Profil introuvable.");
    await updateDoc(ref, payload);
    return profileId;
  }

  payload.createdAt = serverTimestamp();
  const created = await addDoc(userProfilesCollection(user.uid), payload);
  return created.id;
}

export async function listBirthProfiles() {
  const user = requireUser();
  const result = await getDocs(query(userProfilesCollection(user.uid), orderBy("updatedAt", "desc")));
  return result.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }));
}

export async function getBirthProfile(profileId) {
  const user = requireUser();
  const snapshot = await getDoc(doc(db, "users", user.uid, "profiles", profileId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function deleteBirthProfile(profileId) {
  const user = requireUser();
  await deleteDoc(doc(db, "users", user.uid, "profiles", profileId));
}
