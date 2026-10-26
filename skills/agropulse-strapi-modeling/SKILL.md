---
name: agropulse-strapi-modeling
description: Concevoir ou revoir les contenus Strapi, relations FR/EN, permissions et parcours de publication du site AgroPulse.
---

# Modèle Strapi AgroPulse

Lire `docs/PROJECT_CONTEXT.md`, le cadrage L3 puis la dernière spécification du modèle et des droits indiqués dans `docs/README.md`. Les JSON de conception éventuels ne sont pas des schémas Strapi exécutables tant que cela n’est pas explicite.

Pour chaque champ, distinguer type, traduction, relation, caractère requis à la publication et caractère privé. Les champs indispensables à publier ne doivent pas rendre impossible un brouillon incomplet sans décision consciente de conception. Vérifier les possibilités de la version Strapi réellement retenue.

Créer des rôles AgroPulse explicites : Éditeur sans publication, Publicateur avec publication, Administrateur technique avec gestion des accès. Le rôle Strapi par défaut nommé Editor permet de publier : ne pas l’assimiler à l’Éditeur AgroPulse. Les rôles d’administration et ceux des visiteurs API sont deux mécanismes distincts.

Le public ne crée ni ne modifie les contenus. Brouillons, données de contact/candidature, preuves d’autorisation et jetons ne doivent pas être exposés dans les réponses, relations ou médias publics. Un champ masqué dans le formulaire d’administration n’est pas nécessairement privé côté API ; tester ce qui est sérialisé. Un média téléversé peut être accessible avant publication : ne pas y placer de dossier privé.

La prévisualisation utilise un accès contrôlé côté serveur et le document/locale demandé. Distinguer Preview gratuit et Live Preview payant dans la documentation officielle actuelle. Ne pas supposer Review Workflows, Audit Logs ou Content History inclus dans Community.

Avant de déclarer la configuration réussie, vérifier publication interdite à l’éditeur, lecture des brouillons interdite au public, traduction équivalente, relations publiées et campagne fermée. En conception seule, livrer les règles et scénarios sans prétendre les avoir exécutés.
