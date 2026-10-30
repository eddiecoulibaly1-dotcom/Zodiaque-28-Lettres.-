import fs from "node:fs";
import assert from "node:assert/strict";

const client = fs.readFileSync("firebase-client.js", "utf8");
const ui = fs.readFileSync("firebase-ui.js", "utf8");
const rules = fs.readFileSync("firestore.rules", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const sw = fs.readFileSync("sw.js", "utf8");

for (const feature of [
  "createUserWithEmailAndPassword",
  "signInWithEmailAndPassword",
  "sendEmailVerification",
  "sendPasswordResetEmail",
  "onAuthStateChanged",
  "saveBirthProfile",
  "listBirthProfiles",
  "deleteBirthProfile"
]) assert.ok(client.includes(feature), `Firebase client missing: ${feature}`);

assert.ok(client.includes('"users", uid, "profiles"'), "Firestore collection path mismatch.");
assert.ok(ui.includes('data-view="cloud-profiles"'), "Account navigation missing.");
assert.ok(ui.includes('id="firebaseProfileForm"'), "Cloud profile form missing.");
assert.ok(html.includes('src="./firebase-ui.js"'), "Firebase UI module is not loaded.");
assert.ok(sw.includes('"./firebase-client.js", "./firebase-ui.js"'), "Firebase modules are missing from PWA asset list.");
assert.ok(rules.includes("request.auth.uid == uid"), "Firestore owner-only rule missing.");
assert.ok(rules.includes("match /users/{uid}/profiles/{profileId}"), "Firestore profile match missing.");
assert.ok(rules.includes("allow read, delete: if isOwner(uid)"), "Firestore read/delete ownership rule missing.");
assert.ok(rules.includes("allow create: if isOwner(uid) && validProfile(request.resource.data)"), "Firestore create validation missing.");
assert.ok(!client.includes("serviceAccount") && !client.includes("private_key"), "Admin credentials must never be present in client code.");

console.log("OK — Firebase Auth, interface, Firestore path and owner-only rules are structurally validated.");

assert.ok(client.includes("if (!user.emailVerified)"), "Unverified users must be blocked from profile access.");
assert.ok(rules.includes("request.auth.token.email_verified == true"), "Firestore must require a verified email.");
assert.ok(ui.includes("password.length >= 12"), "Strong password length policy missing.");
assert.ok(ui.includes("/[A-Z]/.test(password)") && ui.includes("/[a-z]/.test(password)") && ui.includes("/[0-9]/.test(password)") && ui.includes("/[^A-Za-z0-9]/.test(password)"), "Strong password complexity checks missing.");
assert.ok(ui.includes("id=\"refreshEmailVerification\"") && ui.includes("id=\"resendVerification\""), "Email verification recovery controls missing.");
