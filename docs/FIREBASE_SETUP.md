# Firebase — Zodiaque & 28 Lettres

## Projet configuré
- Firebase project ID: `zodiaque-28-lettres`
- Web app ID: `1:841356010743:web:cd9bef534da6d106df9ff2`
- Auth: activer le fournisseur **Adresse e-mail/Mot de passe** dans Firebase Console.
- Firestore: base `(default)`, édition Standard, règles en mode production.

## Client web
`firebase-client.js` expose les fonctions de compte et de profils :
- `registerWithEmail(email, password, displayName)`
- `loginWithEmail(email, password)`
- `logout()`
- `requestPasswordReset(email)`
- `observeAuth(callback)`
- `saveBirthProfile(profile, profileId?)`
- `listBirthProfiles()`
- `getBirthProfile(profileId)`
- `deleteBirthProfile(profileId)`

Le module utilise le SDK Firebase modulaire via les modules CDN officiels pour rester compatible avec le site statique existant. L'interface est branchée par `firebase-ui.js` et propose inscription, connexion, déconnexion, réinitialisation du mot de passe et gestion des profils.

## Schéma Firestore
Les profils sont stockés sous `users/{uid}/profiles/{profileId}`. Les règles doivent autoriser uniquement `request.auth.uid == uid` et limiter les champs aux champs du profil.

## Sécurité
- La configuration Firebase Web (dont `apiKey`) est destinée à être intégrée au client web ; ce n'est pas une clé Admin.
- Ne jamais ajouter de clé de compte de service, de clé privée, ni de SDK Admin dans le navigateur ou dans Git.
- Firestore Rules et Authentication assurent le contrôle d'accès ; une API key ne protège pas les données.
- Les règles publiées doivent correspondre au chemin `users/{uid}/profiles/{profileId}`.
- Avant production, tester avec deux comptes distincts que chaque compte ne voit que ses propres profils.
- N'activer ni sauvegardes planifiées ni forfait Blaze sans accord explicite. Vérifier les quotas Spark et les conditions actuelles de Firebase.

## Étapes restantes
1. Brancher l'interface de compte et de profils à ce module.
2. Vérifier la confirmation e-mail, la connexion, la déconnexion et la réinitialisation du mot de passe.
3. Tester le CRUD et l'isolation entre deux utilisateurs.
4. Exécuter toute la suite de tests du référentiel et du moteur astronomique.
5. Déployer uniquement une preview Vercel après vérification du coût du plan associé.
