# Zodiaque & 28 Lettres — architecture full-stack cible

## Décisions actuelles
- Dépôt canonique : `eddiecoulibaly1-dotcom/Zodiaque-28-Lettres.-`.
- Conserver le référentiel Abjad Maghrébin, le moteur Astronomy Engine 2.1.19 et les modules existants.
- Firebase Authentication + Cloud Firestore pour les comptes et profils sauvegardés.
- Vercel reste l'hébergement envisagé pour la PWA ; vérifier les coûts du plan associé avant tout déploiement.
- GitHub Pages / `main` reste la version de référence jusqu'à validation de la nouvelle version.
- Développement sur `feature/full-stack-auth`.

## Périmètre V1
1. Inscription par e-mail/mot de passe, confirmation d’e-mail, connexion, déconnexion et réinitialisation du mot de passe.
2. Espace personnel et profils astrologiques sauvegardés.
3. Créer, consulter, modifier et supprimer un profil de naissance.
4. Conserver nom, date/heure de naissance, fuseau IANA, coordonnées, lieu, notes et instantané JSON du calcul.
5. Maintenir le calcul local/PWA hors connexion ; le réseau est requis pour Auth et la synchronisation Firestore.

## Structure Firestore
- Collection utilisateur : `users/{uid}/profiles/{profileId}`.
- Champs autorisés dans un profil : `label`, `name`, `birthDate`, `birthTime`, `timeZone`, `latitude`, `longitude`, `place`, `calculationSnapshot`, `notes`, `createdAt`, `updatedAt`.
- Les règles Firestore doivent vérifier que `request.auth != null` et `request.auth.uid == uid` pour chaque opération.
- Les règles publiées dans Firebase doivent correspondre exactement à ce chemin et aux champs envoyés par le client.
- Tester l’isolation avec deux comptes distincts avant la production.

## Sécurité
- La configuration Firebase Web est prévue pour le navigateur ; elle n’est pas une clé Admin. Les règles Firestore et Firebase Authentication assurent l’autorisation.
- Ne jamais publier de clé privée, de clé de compte de service ou de secret Admin.
- N’autoriser aucune lecture/écriture anonyme des profils.
- Vérifier les domaines autorisés, les modèles d’e-mail et les paramètres de confirmation d’adresse dans Firebase Authentication.
- Les règles actuelles sont un premier contrôle ; elles doivent être testées et révisées pour les validations de types, longueurs et plages de coordonnées avant production.
- Ne pas activer les sauvegardes planifiées ni le forfait Blaze sans accord explicite.

## Intégration actuelle
- `firebase-client.js` contient le client modulaire Firebase et les opérations Auth/CRUD initiales.
- `docs/FIREBASE_SETUP.md` documente la configuration et les précautions.
- Le module client n’est pas encore branché aux écrans existants. Il faut connecter l’interface dans une étape distincte sans remplacer le moteur astronomique.
- La migration SQL Supabase ajoutée précédemment est un artefact historique de la première option ; elle n’est pas utilisée par la solution Firebase.

## Déploiement et coûts
1. Ne pas modifier `main` ni la version GitHub Pages avant validation.
2. Compléter l’interface Auth/profils sur la branche de développement.
3. Exécuter les tests existants du référentiel, de l’Abjad, de l’astronomie, de la localisation et de la PWA.
4. Tester création/connexion/réinitialisation et CRUD Firestore avec deux utilisateurs.
5. Vérifier les quotas Spark et les conditions actuelles de Firebase.
6. Vérifier la facturation Vercel : l’espace connecté précédemment indiqué est sur un plan Pro, donc ne pas supposer que l’hébergement y sera gratuit.
7. Déployer une Preview, vérifier sur Android et ne promouvoir qu’après validation.

## Critères d’acceptation
- Deux utilisateurs ne peuvent ni lire ni modifier les profils de l’autre.
- Inscription, confirmation d’e-mail, connexion, déconnexion et réinitialisation fonctionnent.
- Un utilisateur peut sauvegarder puis recharger son profil après reconnexion.
- Les tests du référentiel et du moteur astronomique passent sans régression.
- L’application reste utilisable hors connexion pour les fonctions locales prises en charge.
