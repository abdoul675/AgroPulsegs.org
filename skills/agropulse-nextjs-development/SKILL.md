---
name: agropulse-nextjs-development
description: Implémenter les pages Next.js AgroPulse, leur navigation FR/EN et leur connexion aux contenus Strapi dans le périmètre demandé.
---

# Développement Next.js AgroPulse

Lire le contexte du workspace dans `docs/PROJECT_CONTEXT.md` et les documents courants de `docs/README.md`. Identifier d’abord l’application et ses versions réellement présentes : `public/` est historiquement un aperçu statique, pas une application Next.js déjà migrée.

Conserver les maquettes et contenus approuvés ; développer le parcours demandé sans refonte globale implicite. Associer les traductions par identité métier et locale, conserver la page équivalente et traiter les URL historiques si elles changent.

Lire Strapi côté serveur avec des permissions minimales. Les clés de CMS, de preview et d’envoi ne passent jamais dans le bundle navigateur. Séparer données publiées et brouillons ainsi que leurs caches ; une requête publique ne choisit pas librement son statut de publication.

La preview vérifie secret, document, locale et destination autorisée avant d’activer le mode brouillon. Un cache ou une redirection ne doit pas rendre un brouillon accessible publiquement. Vérifier les API de preview de la version Next.js retenue dans la documentation officielle.

Prévoir les états absent, chargement, erreur et campagne fermée. Ne pas transformer une image, un quiz ou une animation en preuve de fonctionnement agricole. Ne pas simuler l’envoi des formulaires par une confirmation de réception.

Contrôler le parcours modifié en FR/EN, mobile et clavier. Une construction réussie ne démontre pas la réception d’un message ni le bon contrôle des droits. Rapporter les vérifications effectuées et les limites concrètes.
