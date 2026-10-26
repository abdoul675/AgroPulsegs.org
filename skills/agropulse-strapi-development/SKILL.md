---
name: agropulse-strapi-development
description: Réaliser un pilote ou une implémentation Strapi AgroPulse avec modèles, rôles et validations conformes à la conception retenue.
---

# Développement Strapi AgroPulse

Lire le contexte, le cadrage L3 et le modèle de contenus et droits courants dans `docs/README.md`. Les fichiers JSON de conception portent `runtimeSchema: false` : les traduire en schémas effectifs, sans les copier comme configuration exécutable.

Vérifier les versions compatibles avec Node.js, PostgreSQL et les extensions nécessaires avant de les verrouiller. Strapi fournit son propre backend ; ajouter Express seulement pour une responsabilité justifiée. En pilote, utiliser des données fictives et un environnement isolé.

Implémenter les comptes administratifs natifs et les rôles AgroPulse. L’Éditeur ne publie pas et ne modifie pas les dates ou l’état d’ouverture des campagnes. Ne pas reprendre aveuglément le rôle standard Editor. Vérifier les droits par API aussi bien que par interface.

Préserver les brouillons incomplets tout en contrôlant les prérequis de publication. Déterminer les points d’extension réellement adaptés à la version Strapi et tester leurs effets sur les différentes voies d’écriture ; ne pas supposer qu’une règle d’interface protège l’API.

Le public ne reçoit ni jetons, dossiers privés, preuves d’autorisation ni brouillons à travers les champs ou relations peuplées. Ne pas utiliser les médias publics pour des dossiers confidentiels. Les lectures de campagne et contrôles de dépôt doivent utiliser la version publiée.

Pour une migration, identifier données persistantes, sauvegarde et effet du retour arrière. Ne pas réinitialiser une base existante pour corriger une erreur. Livrer la configuration, les contrôles réellement exécutés et les conditions non satisfaites, sans déclarer le CMS finalisé sur la seule base d’un démarrage.
