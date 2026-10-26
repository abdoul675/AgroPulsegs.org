---
name: agropulse-deployment
description: Préparer ou mettre en œuvre Docker Compose, GitHub Actions et les procédures de déploiement et restauration AgroPulse sur une cible autorisée.
---

# Déploiement AgroPulse

Lire le contexte, le cadrage L3 et les contraintes réelles de l’hébergement. La planification des coûts relève du cadrage ; ce skill traite la configuration et l’opération demandées. OVHcloud reste une proposition tant qu’une cible n’est pas commandée et identifiée.

Conditionner séparément frontend, CMS et base selon le découpage retenu. Construire des images identifiables par version ou commit, préserver les volumes base et médias et ne pas exposer PostgreSQL sur l’interface publique. Les secrets sont injectés par environnement, pas inclus dans l’image ou le dépôt.

Configurer GitHub Actions avec les permissions nécessaires au job, protéger les secrets de déploiement des contributions non fiables et distinguer contrôle, construction et promotion. Un push ne doit pas provoquer une production non prévue par le workflow convenu.

Préproduction et production ne partagent pas leurs données privées ou jetons. Préparer HTTPS, contrôle de santé, sauvegarde indépendante et procédure de retour arrière ; tenir compte des migrations et ne pas annoncer qu’une ancienne image restaure la base.

Avant une publication autorisée, identifier cible, artefact, configuration et sauvegarde. Après opération, vérifier état réel du site et parcours activés. Ne pas annoncer une mise en ligne sur le seul succès d’un job CI.

Ne pas acheter, publier ni transférer des documents ou secrets vers une destination inconnue. L’autorisation porte sur la cible et le contenu demandés ; une erreur ne permet pas un changement implicite de serveur, de dépôt ou de périmètre. Pour Windows, privilégier les scripts PowerShell ou Node compatibles avec le workspace.
