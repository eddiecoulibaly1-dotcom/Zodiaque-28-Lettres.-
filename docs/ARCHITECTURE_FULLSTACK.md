# Zodiaque & 28 Lettres — architecture full-stack cible

## Décisions
- Dépôt canonique : `eddiecoulibaly1-dotcom/Zodiaque-28-Lettres.-`.
- Conserver le référentiel Abjad Maghrébin, le moteur Astronomy Engine 2.1.19 et les modules de calcul existants tant que les tests ne justifient pas de changement.
- Vercel : hébergement web/PWA et déploiements liés à Git.
- Supabase : Auth et PostgreSQL pour les comptes et profils sauvegardés.
- GitHub Actions : validation obligatoire avant toute publication.
- Migration développée sur une branche dédiée, sans remplacement immédiat de la version actuellement publiée.

## Périmètre V1
1. Création de compte par e-mail/mot de passe, vérification d’e-mail, connexion, déconnexion et réinitialisation du mot de passe.
2. Espace personnel avec nom d’affichage et langue préférée.
3. Créer, consulter, modifier et supprimer des profils sauvegardés.
4. Sauvegarder les entrées utiles au thème natal : nom, date/heure de naissance, fuseau IANA, coordonnées et libellé du lieu.
5. Enregistrer un instantané JSON des résultats du thème afin de conserver ce qui a été calculé, sans prétendre qu'il est recalculé automatiquement à chaque évolution du moteur.
6. PWA installable et fonctionnement local des fonctions de calcul ; la connexion réseau est nécessaire pour authentification et synchronisation.

## Sécurité
- Utiliser uniquement la clé Supabase publishable côté navigateur ; ne jamais exposer une clé secret/service_role.
- RLS activée sur chaque table exposée.
- Chaque politique exige que `auth.uid() = user_id`; les politiques UPDATE possèdent USING et WITH CHECK.
- Aucun profil sauvegardé accessible anonymement.
- Les données de naissance et les notes sont privées, supprimables par leur propriétaire.
- Secrets Vercel configurés dans le tableau de bord, jamais commités dans Git.
- Configurer les URL de redirection Auth pour l'URL de production et les URL de prévisualisation nécessaires.

## Données
- `profiles`: préférences et nom d'affichage associés à l'identité Auth.
- `saved_profiles`: profils de naissance possédés par un utilisateur, coordonnées, fuseau et instantané de calcul.
- Les tables utilisent des clés UUID, des contraintes sur les coordonnées et des politiques RLS de propriété.

## Déploiement et stratégie de migration
1. Garder `main` et GitHub Pages comme version de référence tant que la version Vercel n'a pas passé les tests.
2. Développer sur `feature/full-stack-auth`.
3. Initialiser un projet Supabase dédié à Zodiaque, sans réutiliser les bases DJAWA ou ELELY BIO FERME.
4. Appliquer et vérifier la migration SQL dans le projet dédié.
5. Ajouter le client Supabase avec des dépendances versionnées et les variables d'environnement publiques nécessaires.
6. Ajouter les écrans d'authentification et les opérations CRUD des profils.
7. Créer le projet Vercel lié au dépôt, configurer les variables, puis tester un déploiement Preview.
8. Exécuter les tests de régression du référentiel, du moteur astronomique, de l'Abjad, de la PWA, de l'authentification et de l'isolation RLS entre deux utilisateurs.
9. Ne promouvoir en production qu'après tests sur Android. Conserver un plan de retour à la version précédente.

## Variables d'environnement
- `VITE_SUPABASE_URL`: URL du projet Supabase (publique).
- `VITE_SUPABASE_PUBLISHABLE_KEY`: clé publishable (publique).
- Ne jamais créer de variable `VITE_*` contenant une clé secrète : les variables préfixées VITE sont intégrées au code navigateur.

## Contrôle des coûts
- Commencer par les offres gratuites lorsqu'elles sont disponibles.
- Le devis actuel retourné pour créer un projet Supabase dans l'organisation existante est de 0 USD/mois ; vérifier les limites d'usage et les conditions de pause avant mise en production.
- L'espace Vercel connecté est sur un plan Pro ; ne pas présumer que l'hébergement Vercel de cette équipe est gratuit. Vérifier la facturation ou choisir explicitement un espace Free avant le déploiement.
- Ne pas créer de branches Supabase de développement facturables ni activer de fonctions payantes sans accord explicite.

## Acceptation
- Deux utilisateurs de test ne peuvent ni lire ni modifier les profils de l'autre.
- Inscription, confirmation e-mail, connexion, déconnexion et récupération de mot de passe fonctionnent.
- Un utilisateur peut sauvegarder puis recharger son thème natal après reconnexion.
- Les tests du référentiel et du moteur astronomique passent sans modification involontaire.
- L'application ne se bloque pas au chargement sur Android et fonctionne localement pour les fonctions hors connexion prises en charge.
